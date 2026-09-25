from fastapi import APIRouter

from app.routes.auth import router as auth_router
# Clean single import from contact_us
# from app.routes.contact_us import (
#     contact_us_router,
#     contacts_router,
#     truck_router as truck_types_router,
#     public_router as contacts_public_router,
# )
from app.routes.contact_us import contact_us_router
from app.routes.content_blocks import router as content_blocks_router
from app.routes.dashboard import router as dashboard_router
from app.routes.faqs import router as faqs_router
from app.routes.pages import router as pages_router
from app.routes.public import router as public_router
from app.routes.quote import (
    router as quotes_router,
    service_option_router,
    public_router as quotes_public_router,
)
from app.routes.rental import rental_router
from app.routes.seo import router as seo_router
from app.routes.services import router as services_router
from app.routes.settings import router as settings_router
from app.routes.subscribers import router as subscribers_router
from app.routes.testimonials import router as testimonials_router
from app.routes.users import router as users_router
from app.routes.hotshot import router as hotshot_router
from app.routes.box_truck import router as box_truck_router
from app.routes.semi_truck import router as semi_truck_router
from app.routes.blog import router as blog_router
from app.routes.team import router as team_router
from app.routes.uploads import router as uploads_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(hotshot_router)
router.include_router(box_truck_router)
router.include_router(dashboard_router)
router.include_router(users_router)
router.include_router(pages_router)
router.include_router(seo_router)
router.include_router(services_router)
router.include_router(faqs_router)
router.include_router(testimonials_router)
router.include_router(contact_us_router)
# router.include_router(contacts_router)
# router.include_router(truck_types_router)
# router.include_router(contacts_public_router)
router.include_router(quotes_router)
router.include_router(service_option_router)
router.include_router(quotes_public_router)
router.include_router(subscribers_router)
router.include_router(content_blocks_router)
router.include_router(settings_router)
router.include_router(public_router)
router.include_router(semi_truck_router)
router.include_router(blog_router)
router.include_router(team_router)
router.include_router(rental_router)
router.include_router(uploads_router)
