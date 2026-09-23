# Deployment Guide — Mr. Whiz Logistics

Public website (Next.js) + admin dashboard + FastAPI backend + PostgreSQL,
deployed with Docker Compose behind nginx with HTTPS.

Everything runs on one domain:

| Path         | Serves                                   |
| ------------ | ---------------------------------------- |
| `/`          | Public marketing site (Next.js)          |
| `/login`     | Admin sign-in                            |
| `/dashboard` | Admin dashboard                          |
| `/api/*`     | FastAPI backend                          |
| `/uploads/*` | Images uploaded from the dashboard       |
| `/docs`      | API docs (login-protected)               |
| `/admin`     | SQLAdmin DB UI (login-protected)         |

---

## 0. What you need before starting

- A server (Ubuntu 22.04+ recommended) with root/sudo and at least 2 GB RAM.
- A domain name pointed at the server's public IP (an `A` record for
  `example.com` and, if you want it, `www`).
- Ports **80** and **443** open in the firewall / security group.

Replace `example.com` with your real domain everywhere below.

---

## 1. Install Docker on the server

```bash
ssh root@YOUR_SERVER_IP

curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
docker --version && docker compose version
```

---

## 2. Get the code onto the server

```bash
mkdir -p /var/www/mrwhizz
git clone <YOUR_REPO_URL> /var/www/mrwhizz
cd /var/www/mrwhizz
```

If you are not deploying from git, copy the project up instead:

```bash
# run this on your local machine
ssh root@YOUR_SERVER_IP 'mkdir -p /var/www/mrwhizz'
rsync -av --exclude node_modules --exclude .next --exclude venv \
      --exclude .env ./ root@YOUR_SERVER_IP:/var/www/mrwhizz/
```

---

## 3. Create the environment file

```bash
cp .env.prod.example .env
openssl rand -hex 32      # copy this into SECRET_KEY
nano .env
```

Fill in every `CHANGE_ME`:

```ini
POSTGRES_USER=mrwhiz
POSTGRES_PASSWORD=<long random password>
POSTGRES_DB=truck_dispatch

SECRET_KEY=<the 64-char hex you just generated>
ACCESS_TOKEN_EXPIRE_MINUTES=720

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<strong password you will log in with>

CORS_ORIGINS=https://example.com,https://www.example.com
NEXT_PUBLIC_API_URL=https://example.com
```

Two things people get wrong here:

- **`NEXT_PUBLIC_API_URL` is baked into the JavaScript bundle at build time.**
  Changing it later means rebuilding the frontend image, not just restarting it.
- **`CORS_ORIGINS` must not be `*` in production.** Browsers reject credentialed
  requests against a wildcard origin, and the dashboard would stop working.

```bash
chmod 600 .env
```

---

## 4. Point nginx at your domain

```bash
sed -i 's/example\.com/YOURDOMAIN.com/g' nginx/default.conf
grep server_name nginx/default.conf     # confirm it looks right
```

---

## 5. Issue the TLS certificate

nginx will not start without a certificate, so get one first using a temporary
HTTP-only server.

```bash
mkdir -p nginx/certbot/www nginx/certbot/conf

docker run --rm -p 80:80 \
  -v "$PWD/nginx/certbot/www:/var/www/certbot" \
  -v "$PWD/nginx/certbot/conf:/etc/letsencrypt" \
  certbot/certbot certonly --standalone \
  -d example.com -d www.example.com \
  --email you@example.com --agree-tos --no-eff-email
```

Confirm it landed:

```bash
ls nginx/certbot/conf/live/example.com/
# expect: fullchain.pem  privkey.pem  ...
```

> Dropping `www`? Then also remove `-d www.example.com` above **and** the
> `www.example.com` entries in `nginx/default.conf`, or nginx will fail to start.

---

## 6. Build and start everything

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

First build takes a few minutes. Then check:

```bash
docker compose -f docker-compose.prod.yml ps        # all should be "Up"
docker compose -f docker-compose.prod.yml logs -f backend
```

> `backend/.dockerignore` and `frontend/.dockerignore` keep `node_modules`,
> `.next`, the virtualenv and the `.cursor` folder out of the build context.
> Without them the frontend context is ~710 MB instead of ~5 MB, and the build
> spends minutes just uploading files to the daemon. Do not delete them.

The backend creates all tables and seeds the initial content on first boot.
You should see `Seed data loaded from frontend content.` in its logs.

### Existing host nginx / multi-site server

If ports 80 and 443 are already owned by nginx on the host, do not start the
bundled nginx container. Use the host override, which publishes the backend on
`127.0.0.1:8002` and the frontend on `127.0.0.1:3003`:

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.host.yml \
  up -d --build
```

Install the included host nginx site after replacing the example domain:

```bash
sed 's/example\.com/YOURDOMAIN.com/g' nginx/host.conf.example \
  > /etc/nginx/sites-available/mrwhizz
ln -s /etc/nginx/sites-available/mrwhizz /etc/nginx/sites-enabled/mrwhizz
nginx -t
systemctl reload nginx
certbot --nginx -d YOURDOMAIN.com -d www.YOURDOMAIN.com
```

For later deployments on this type of server, always include both Compose
files so the bundled proxy remains disabled.

---

## 7. Verify the deployment

```bash
curl -I  https://example.com                 # 200, public site
curl -s  https://example.com/api/            # API health JSON
curl -s  https://example.com/api/public/faqs # seeded content
curl -s -o /dev/null -w '%{http_code}\n' \
     https://example.com/api/contact-us      # 401 = auth is enforced
```

Then in a browser:

1. Open `https://example.com/login`
2. Sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`
3. You land on `/dashboard` with live counts
4. Walk the sidebar: Leads, Services, FAQs, Teams, Testimonials, Rentals,
   Blog, Messages, Settings
5. Create, edit and delete one record (a testimonial is the quickest) to
   confirm writes and image uploads reach the database

---

## 8. Set up certificate renewal

Let's Encrypt certificates last 90 days.

```bash
crontab -e
```

Add:

```cron
0 3 * * 1 cd /var/www/mrwhizz && docker run --rm \
  -v "$PWD/nginx/certbot/www:/var/www/certbot" \
  -v "$PWD/nginx/certbot/conf:/etc/letsencrypt" \
  certbot/certbot renew --webroot -w /var/www/certbot --quiet \
  && docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## 9. Back up the database

```bash
mkdir -p /var/backups/mrwhizz
crontab -e
```

```cron
0 2 * * * docker exec mrwhiz-db pg_dump -U mrwhiz truck_dispatch \
  | gzip > /var/backups/mrwhizz/db-$(date +\%F).sql.gz

# keep 30 days
0 4 * * * find /var/backups/mrwhizz -name 'db-*.sql.gz' -mtime +30 -delete
```

Restore:

```bash
gunzip -c /var/backups/mrwhizz/db-2026-09-23.sql.gz \
  | docker exec -i mrwhiz-db psql -U mrwhiz -d truck_dispatch
```

Uploaded images live in the `uploads` Docker volume. Back that up too:

```bash
docker run --rm -v mrwhizz_uploads:/data -v /var/backups/mrwhizz:/backup \
  alpine tar czf /backup/uploads-$(date +%F).tar.gz -C /data .
```

---

## Day-two operations

**Deploy a code change**

```bash
cd /var/www/mrwhizz
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

**Change the API URL or any `NEXT_PUBLIC_*` value**

```bash
nano .env
docker compose -f docker-compose.prod.yml up -d --build frontend   # rebuild required
```

**Logs**

```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

**Add another admin user** — Dashboard → Settings → Admin users → Add user.
(Self-registration at `/register` deliberately requires an existing admin
session, so nobody can create themselves an admin account from the internet.)

**Open a database shell**

```bash
docker exec -it mrwhiz-db psql -U mrwhiz -d truck_dispatch
```

---

## Schema changes

This project has no migration tool. `Base.metadata.create_all()` runs on every
boot, which **creates missing tables but never alters existing ones**.

A fresh deployment is therefore always correct. But if you later add a column to
a model on a database that already has that table, apply it by hand:

```bash
docker exec -i mrwhiz-db psql -U mrwhiz -d truck_dispatch -c \
  "ALTER TABLE hotshot_cards ADD COLUMN IF NOT EXISTS page_heading VARCHAR(200);"
```

If you expect frequent schema changes, adding Alembic is worth the hour it takes.

---

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Dashboard loads but every list is empty and the console shows CORS errors | `CORS_ORIGINS` does not include the exact scheme + host you browse to | Fix `.env`, then `up -d backend` |
| Login works, then every request 401s | `SECRET_KEY` changed since the token was issued | Sign out and back in |
| Frontend calls `localhost:8000` in production | `NEXT_PUBLIC_API_URL` was not set at **build** time | `up -d --build frontend` |
| nginx exits at start | Certificate path or `server_name` does not match the issued domain | Check `nginx/certbot/conf/live/<domain>/` and `nginx/default.conf` |
| Uploaded images 404 after a redeploy | `uploads` volume not mounted | Confirm the `uploads:` volume in `docker-compose.prod.yml` |
| `502 Bad Gateway` | Backend or frontend container is unhealthy | `docker compose -f docker-compose.prod.yml ps` and read that container's logs |

---

## Security checklist before going live

- [ ] `SECRET_KEY` is a freshly generated random value, not the dev default
- [ ] `ADMIN_PASSWORD` changed from `admin1234`
- [ ] `POSTGRES_PASSWORD` is strong, and Postgres is **not** published to the host
- [ ] `CORS_ORIGINS` lists your real origins, not `*`
- [ ] HTTPS works and HTTP redirects to it
- [ ] `.env` is `chmod 600` and not committed
- [ ] Database backups are running and you have restored one at least once
- [ ] Consider restricting `/docs` and `/admin` by IP in `nginx/default.conf`
