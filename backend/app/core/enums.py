from enum import Enum


class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor"


class InquiryStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUOTED = "quoted"
    CLOSED = "closed"


class ServiceCategory(str, Enum):
    HOT_SHOT = "Hot Shot"
    BOX_TRUCK = "Box Truck"
    SEMI_TRUCK = "Semi Truck"


class FaqCategory(str, Enum):
    HOT_SHOT = "Hot Shot Trucking"
    BOX_TRUCK = "Box Truck"
    SEMI_TRUCK = "Semi-Truck"
    GENERAL = "General FAQ"


class ContentBlockKey(str, Enum):
    HERO = "hero"
    DISPATCH = "dispatch"
    FLEET = "fleet"
    PROCESS = "process"
    CASES = "cases"
    CONTACT = "contact"
    TESTIMONIALS = "testimonials"
    FAQ = "faq"
