from tests.site_pages_app import make_app as make_base_app
from app.core.rental_content import ensure_rental_content


def make_app():
    app = make_base_app()
    with app.state.test_sessions() as db:
        ensure_rental_content(db)
    return app
