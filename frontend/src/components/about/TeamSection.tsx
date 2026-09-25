"use client";

import { motion } from "motion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import XIcon from "@mui/icons-material/X";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

const LIME = "#c8ff00";
const EASE = [0.22, 1, 0.36, 1] as const;

export type Member = {
  name: string;
  role: string;
  image?: string;
  socials?: {
    linkedin?: string;
    facebook?: string;
    x?: string;
    email?: string;
  };
};

// 👇 apne asli team + photos daalein (public/images/team/ mein)
const TEAM: Member[] = [
  {
    name: "Somaiya Akter",
    role: "Founder & CEO",
    image: "/images/blog/pic7.webp",
    socials: {
      linkedin: "#",
      facebook: "#",
      x: "#",
      email: "mailto:info@company.com",
    },
  },
  {
    name: "Duhan Homenth",
    role: "Operations Director",
    image: "/images/blog/pic8.webp",
    socials: {
      linkedin: "#",
      facebook: "#",
      x: "#",
      email: "mailto:info@company.com",
    },
  },
  {
    name: "Monio Roman",
    role: "Head of Dispatch",
    image: "/images/blog/pic9.webp",
    socials: {
      linkedin: "#",
      facebook: "#",
      x: "#",
      email: "mailto:info@company.com",
    },
  },
  {
    name: "Saad Alam",
    role: "Fleet Manager",
    image: "/images/blog/pic10.webp",
    socials: {
      linkedin: "#",
      facebook: "#",
      x: "#",
      email: "mailto:info@company.com",
    },
  },
];

function MemberCard({ m }: { m: Member }) {
  const socials = [
    { key: "linkedin", href: m.socials?.linkedin, Icon: LinkedInIcon },
    { key: "facebook", href: m.socials?.facebook, Icon: FacebookRoundedIcon },
    { key: "x", href: m.socials?.x, Icon: XIcon },
    { key: "email", href: m.socials?.email, Icon: EmailRoundedIcon },
  ].filter((s) => s.href);

  return (
    <Box
      component={motion.div}
      variants={{
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
      }}
      sx={{
        position: "relative",
        borderRadius: "20px",
        overflow: "hidden",
        bgcolor: "#101010",
        border: "1px solid rgba(255,255,255,0.08)",
        transition:
          "transform .4s ease, border-color .4s ease, box-shadow .4s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          borderColor: `${LIME}55`,
          boxShadow: "0 24px 55px rgba(0,0,0,0.5)",
        },
        "&:hover .tm-photo": {
          transform: "scale(1.07)",
          filter: "grayscale(0)",
        },
        "&:hover .tm-social": { opacity: 1, transform: "translateY(0)" },
        "&:hover .tm-role": { color: LIME },
        "&:hover .tm-bar": { transform: "scaleX(1)" },
      }}
    >
      {/* photo */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 300, sm: 280, md: 300 },
          overflow: "hidden",
        }}
      >
        <Box
          className="tm-photo"
          sx={{
            position: "absolute",
            inset: 0,
            transition:
              "transform .6s cubic-bezier(.2,.8,.2,1), filter .5s ease",
            filter: "grayscale(0.35)",
            ...(m.image
              ? {
                  backgroundImage: `url(${m.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                }
              : { background: "linear-gradient(150deg, #26301a, #0a0a0a)" }),
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, transparent 55%, rgba(16,16,16,0.95) 100%)",
          }}
        />
      </Box>

      {/* info */}
      <Box
        sx={{
          position: "relative",
          textAlign: "center",
          px: 2.5,
          pb: 3,
          pt: 2,
        }}
      >
        <Typography
          sx={{ fontWeight: 800, fontSize: "1.15rem", color: "#fff", mb: 0.4 }}
        >
          {m.name}
        </Typography>
        <Typography
          className="tm-role"
          sx={{
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: "rgba(255,255,255,0.55)",
            transition: "color .3s",
            mb: 2,
          }}
        >
          {m.role}
        </Typography>

        {/* socials — reveal on hover */}
        <Box
          className="tm-social"
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            opacity: { xs: 1, md: 0 },
            transform: { xs: "none", md: "translateY(8px)" },
            transition: "opacity .35s ease, transform .35s ease",
          }}
        >
          {socials.map(({ key, href, Icon }) => (
            <Box
              key={key}
              component="a"
              href={href}
              aria-label={key}
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(255,255,255,0.06)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all .25s",
                "&:hover": {
                  bgcolor: LIME,
                  color: "#0a0a0a",
                  borderColor: LIME,
                  transform: "translateY(-3px)",
                },
                "& svg": { fontSize: 16 },
              }}
            >
              <Icon />
            </Box>
          ))}
        </Box>

        {/* bottom accent bar */}
        <Box
          className="tm-bar"
          aria-hidden
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 3,
            background: `linear-gradient(90deg, ${LIME}, #00e5ff)`,
            transform: "scaleX(0)",
            transformOrigin: "center",
            transition: "transform .4s ease",
          }}
        />
      </Box>
    </Box>
  );
}

export default function TeamSection({ members = TEAM }: { members?: Member[] }) {
  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        bgcolor: "#0a0a0a",
        color: "#fff",
        px: { xs: 3, sm: 4, md: 6, lg: 8 },
        py: { xs: 8, md: 13 },
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 680,
          height: 340,
          background:
            "radial-gradient(ellipse, rgba(200,255,0,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* header */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 780,
          mx: "auto",
          mb: { xs: 5, md: 8 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              mb: 2,
            }}
          >
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
            <Typography
              component="p"
              sx={{
                color: LIME,
                letterSpacing: 3,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Our Team
            </Typography>
            <Box sx={{ width: 28, height: 2, bgcolor: LIME, opacity: 0.7 }} />
          </Box>
          <Typography
            component="h2"
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.5px",
              fontSize: { xs: "2rem", sm: "2.7rem", md: "3.4rem" },
              background: `linear-gradient(90deg, #ffffff, ${LIME}, #00e5ff, #ffffff)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              animation: "teamShimmer 6s linear infinite",
              "@keyframes teamShimmer": {
                to: { backgroundPosition: "200% center" },
              },
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          >
            Meet the people behind the wheel
          </Typography>
        </motion.div>
      </Box>

      {/* grid */}
      <Box
        component={motion.div}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.1 } },
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-90px" }}
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(4,1fr)",
          },
          gap: { xs: 3, md: 3 },
          alignItems: "stretch",
        }}
      >
        {members.map((m) => (
          <MemberCard key={m.name} m={m} />
        ))}
      </Box>
    </Box>
  );
}
