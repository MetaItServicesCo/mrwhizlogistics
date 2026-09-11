from sqladmin import Admin, ModelView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from app.core.security import create_access_token, verify_password
from app.database import SessionLocal
from app.models.contact_us import ContactInquiry
from app.models.content_block import ContentBlock
from app.models.faq import FAQ, FAQCategory
from app.models.page import Page
from app.models.quote import QuoteRequest
from app.models.service_option import ServiceOption
from app.models.seo import SEO
from app.models.service import Service
from app.models.site_setting import SiteSetting
from app.models.subscriber import Subscriber
from app.models.testimonial import Testimonial
from app.models.truck_type import TruckType
from app.models.user import User
# --- NEW TRUCK MODELS IMPORTS ---
from app.models.hotshot import Hotshot
from app.models.box_truck import BoxTruck
from app.models.semi_truck import SemiTruck
from app.models.blog import Blog, BlogComment


class AdminAuth(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = str(form.get("username") or "")
        password = str(form.get("password") or "")
        db = SessionLocal()
        try:
            user = (
                db.query(User)
                .filter((User.email == username) | (User.username == username))
                .first()
            )
            if not user or not user.is_active:
                return False
            if not verify_password(password, user.hashed_password):
                return False
            token = create_access_token({"sub": str(user.id), "role": user.role})
            request.session.update({"token": token})
            return True
        finally:
            db.close()

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> RedirectResponse | bool:
        token = request.session.get("token")
        if not token:
            return RedirectResponse(request.url_for("admin:login"), status_code=302)
        return True


class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.username, User.email, User.role, User.is_active]
    column_searchable_list = [User.email, User.username]
    form_excluded_columns = [User.hashed_password, User.created_at]
    name = "Admin User"
    name_plural = "Admin Users"
    icon = "fa-solid fa-user-shield"


class PageAdmin(ModelView, model=Page):
    column_list = [Page.id, Page.title, Page.slug, Page.is_active, Page.sort_order]
    column_searchable_list = [Page.title, Page.slug]
    name_plural = "Pages"
    icon = "fa-solid fa-file"


class SEOAdmin(ModelView, model=SEO):
    column_list = [SEO.id, SEO.page_id, SEO.meta_title]
    icon = "fa-solid fa-magnifying-glass"


class ServiceAdmin(ModelView, model=Service):
    column_list = [Service.id, Service.title, Service.slug, Service.category, Service.is_active]
    column_searchable_list = [Service.title, Service.slug]
    icon = "fa-solid fa-truck"


class FAQCategoryAdmin(ModelView, model=FAQCategory):
    column_list = [
        FAQCategory.id,
        FAQCategory.name,
        FAQCategory.icon,
        FAQCategory.display_order,
        FAQCategory.is_active,
    ]
    column_searchable_list = [FAQCategory.name]
    name = "FAQ Category"
    name_plural = "FAQ Categories"
    icon = "fa-solid fa-folder-tree"


class FAQAdmin(ModelView, model=FAQ):
    column_list = [FAQ.id, FAQ.category_id, FAQ.question, FAQ.display_order, FAQ.is_active]
    column_searchable_list = [FAQ.question]
    icon = "fa-solid fa-circle-question"


class TestimonialAdmin(ModelView, model=Testimonial):
    column_list = [Testimonial.id, Testimonial.name, Testimonial.role, Testimonial.rating]
    icon = "fa-solid fa-star"


class TruckTypeAdmin(ModelView, model=TruckType):
    column_list = [
        TruckType.id,
        TruckType.name,
        TruckType.category,
        TruckType.sort_order,
        TruckType.is_active,
    ]
    column_searchable_list = [TruckType.name]
    name = "Truck Type"
    name_plural = "Truck Types"
    icon = "fa-solid fa-truck-ramp-box"


class ServiceOptionAdmin(ModelView, model=ServiceOption):
    column_list = [
        ServiceOption.id,
        ServiceOption.name,
        ServiceOption.sort_order,
        ServiceOption.is_active,
    ]
    column_searchable_list = [ServiceOption.name]
    name = "Service Option"
    name_plural = "Service Options"
    icon = "fa-solid fa-list-check"


class ContactAdmin(ModelView, model=ContactInquiry):
    column_list = [
        ContactInquiry.id,
        ContactInquiry.full_name,
        ContactInquiry.email,
        ContactInquiry.service_needed,
        ContactInquiry.status,
        ContactInquiry.created_at,
    ]
    can_create = False
    icon = "fa-solid fa-envelope"


class QuoteAdmin(ModelView, model=QuoteRequest):
    column_list = [
        QuoteRequest.id,
        QuoteRequest.name,
        QuoteRequest.email,
        QuoteRequest.selected_service,
        QuoteRequest.status,
        QuoteRequest.created_at,
    ]
    can_create = False
    icon = "fa-solid fa-file-invoice"


class SubscriberAdmin(ModelView, model=Subscriber):
    column_list = [Subscriber.id, Subscriber.email, Subscriber.is_active, Subscriber.created_at]
    icon = "fa-solid fa-at"


class ContentBlockAdmin(ModelView, model=ContentBlock):
    column_list = [ContentBlock.id, ContentBlock.key, ContentBlock.title, ContentBlock.is_active]
    icon = "fa-solid fa-layer-group"


class SettingAdmin(ModelView, model=SiteSetting):
    column_list = [SiteSetting.id, SiteSetting.key, SiteSetting.label, SiteSetting.value]
    icon = "fa-solid fa-gear"


# --- NEW TRUCK ADMIN VIEWS ---
class HotshotAdmin(ModelView, model=Hotshot):
    column_list = [Hotshot.id, Hotshot.card_number, Hotshot.title, Hotshot.slug]
    column_searchable_list = [Hotshot.title, Hotshot.slug]
    name = "Hotshot Service"
    name_plural = "Hotshot Services"
    icon = "fa-solid fa-truck-fast"


class BoxTruckAdmin(ModelView, model=BoxTruck):
    column_list = [BoxTruck.id, BoxTruck.card_number, BoxTruck.title, BoxTruck.slug]
    column_searchable_list = [BoxTruck.title, BoxTruck.slug]
    name = "Box Truck Service"
    name_plural = "Box Truck Services"
    icon = "fa-solid fa-truck-ramp-box"


class SemiTruckAdmin(ModelView, model=SemiTruck):
    column_list = [SemiTruck.id, SemiTruck.card_number, SemiTruck.title, SemiTruck.slug]
    column_searchable_list = [SemiTruck.title, SemiTruck.slug]
    name = "Semi Truck Service"
    name_plural = "Semi Truck Services"
    icon = "fa-solid fa-truck-moving"


class BlogAdmin(ModelView, model=Blog):
    column_list = [Blog.id, Blog.card_id, Blog.title, Blog.category_tag, Blog.publish_date]
    form_excluded_columns = ["comments"]
    name = "Blog Post"
    name_plural = "Blog Posts"
    icon = "fa-solid fa-newspaper"

class BlogCommentAdmin(ModelView, model=BlogComment):
    column_list = [BlogComment.id, BlogComment.blog_id, BlogComment.name, BlogComment.email, BlogComment.created_at]
    name = "Blog Comment"
    name_plural = "Blog Comments"
    icon = "fa-solid fa-comments"

def setup_admin(app) -> Admin:
    authentication_backend = AdminAuth(secret_key=app.state.secret_key)
    admin = Admin(app, app.state.engine, authentication_backend=authentication_backend)
    for view in (
        UserAdmin,
        PageAdmin,
        SEOAdmin,
        ServiceAdmin,
        FAQCategoryAdmin,
        FAQAdmin,
        TestimonialAdmin,
        TruckTypeAdmin,
        ServiceOptionAdmin,
        ContactAdmin,
        QuoteAdmin,
        SubscriberAdmin,
        ContentBlockAdmin,
        SettingAdmin,
        HotshotAdmin,
        BoxTruckAdmin,
        SemiTruckAdmin,
    ):
        admin.add_view(view)
    return admin