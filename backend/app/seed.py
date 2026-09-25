from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.content_block import ContentBlock
from app.models.faq import FAQ, FAQCategory
from app.models.page import Page
from app.models.seo import SEO
from app.models.service import Service
from app.models.site_setting import SiteSetting
from app.models.testimonial import Testimonial
from app.models.service_option import ServiceOption
from app.models.truck_type import TruckType
from app.models.hotshot import Hotshot
from app.models.box_truck import BoxTruck
from app.models.semi_truck import SemiTruck
from app.models.seed_run import SeedRun

SEED_VERSION = "cms-content-v2"

HOT_SHOT_OPTIONS = [
    {
        "title": "Truck & Trailers",
        "label": "NATIONWIDE",
        "description": "Flexible truck and trailer transportation for regional and cross-country freight.",
        "icon": "truck",
    },
    {
        "title": "Sprinter Van with Lifters",
        "label": "EXPEDITED",
        "description": "Fast and flexible transportation for smaller nationwide shipments.",
        "icon": "bolt",
    },
    {
        "title": "16 Feet Enclosed Trailer",
        "label": "ENCLOSED",
        "description": "Enclosed transportation for freight requiring protection throughout long-distance travel.",
        "icon": "inventory",
    },
    {
        "title": "24 Feet Enclosed Trailer",
        "label": "LARGE ENCLOSED",
        "description": "Higher-capacity enclosed transportation for larger regional and nationwide shipments.",
        "icon": "inventory",
    },
    {
        "title": "40 Feet Flat Bed",
        "label": "LONG HAUL",
        "description": "Large open-deck capacity for equipment, machinery and oversized commercial freight.",
        "icon": "construction",
    },
    {
        "title": "20 Feet Flat Bed",
        "label": "FLATBED",
        "description": "Flexible flatbed transportation for regional and long-distance equipment and material loads.",
        "icon": "construction",
    },
]

SERVICES = [
    {
        "slug": "truck-trailers",
        "number": "01",
        "title": "Truck & Trailers",
        "badge": "CRITICAL PARTS DELIVERY",
        "image": "/images/Hotshot/truck-and-trailer/2.png",
        "short_description": "Reliable expedited transportation for critical replacement parts and components when minimizing downtime matters.",
        "description": [
            "When equipment or production operations are interrupted, getting the right replacement part to the right location is essential.",
            "We coordinate pickup, routing and delivery around your required timeline.",
            "From industrial components to machinery parts, our team provides responsive dispatch support.",
        ],
        "features": [
            {"title": "Responsive Pickup", "description": "Coordinate pickup quickly around your shipment requirements.", "icon": "bolt"},
            {"title": "Direct Delivery", "description": "Move critical parts directly toward their destination.", "icon": "truck"},
            {"title": "24/7 Dispatch", "description": "Access responsive transportation support when urgent freight requirements arise.", "icon": "clock"},
        ],
        "stats": [{"value": "24/7", "label": "Dispatch Support"}, {"value": "50", "label": "States Covered"}],
        "options": HOT_SHOT_OPTIONS,
        "category": "Hot Shot",
        "icon": "truck",
        "nav_href": "/hot-shot/truck-trailers",
        "sort_order": 1,
    },
    {
        "slug": "sprinter-van-with-lifters",
        "number": "02",
        "title": "Sprinter Van with Lifters",
        "badge": "DEADLINE-DRIVEN FREIGHT",
        "image": "/images/Hotshot/Sprinter-van/1.png",
        "short_description": "Dedicated transportation solutions for shipments that must meet specific pickup and delivery schedules.",
        "description": [
            "Some freight has a defined delivery requirement that cannot be overlooked.",
            "We coordinate transportation according to the specific requirements of your shipment and delivery window.",
        ],
        "features": [
            {"title": "Dedicated Driver", "description": "Focused transportation attention throughout the move.", "icon": "truck"},
            {"title": "Scheduled Windows", "description": "Plan around required pickup and delivery timeframes.", "icon": "clock"},
        ],
        "stats": [{"value": "24/7", "label": "Dispatch"}, {"value": "50", "label": "States"}],
        "options": HOT_SHOT_OPTIONS,
        "category": "Hot Shot",
        "icon": "van",
        "nav_href": "/hot-shot/sprinter-van-with-lifters",
        "sort_order": 2,
    },
    {
        "slug": "16-feet-enclosed-trailer",
        "number": "03",
        "title": "16 Feet Enclosed Trailer",
        "badge": "INDUSTRIAL SITE DELIVERY",
        "image": "/images/Hotshot/16-feet-enclosed-trailer/truck-with-mock-up-space-ads.jpg",
        "short_description": "Dependable transportation for construction, oilfield and industrial freight delivered directly to project locations.",
        "description": ["Construction, oilfield and industrial freight delivered to specialized locations."],
        "features": [{"title": "Remote-Site Delivery", "description": "Construction sites, oilfield locations and industrial facilities.", "icon": "location"}],
        "stats": [{"value": "DIRECT", "label": "Site Delivery"}],
        "options": HOT_SHOT_OPTIONS,
        "category": "Hot Shot",
        "icon": "trailer",
        "nav_href": "/hot-shot/16-feet-enclosed-trailer",
        "sort_order": 3,
    },
    {
        "slug": "24-feet-enclosed-trailer",
        "number": "04",
        "title": "24 Feet Enclosed Trailer",
        "badge": "SMALL LOAD • FAST DELIVERY",
        "image": "/images/Hotshot/24-feet-flat-bed/24.png",
        "short_description": "Flexible transportation for single pallets and smaller shipments that require dependable and timely delivery.",
        "description": ["Not every shipment requires a full truckload."],
        "features": [{"title": "Pallet-Level Loads", "description": "Single pallets and smaller palletized shipments.", "icon": "inventory"}],
        "stats": [{"value": "1+", "label": "Pallet Loads"}],
        "options": HOT_SHOT_OPTIONS,
        "category": "Hot Shot",
        "icon": "trailer",
        "nav_href": "/hot-shot/24-feet-enclosed-trailer",
        "sort_order": 4,
    },
    {
        "slug": "40-feet-flat-bed",
        "number": "05",
        "title": "40 Feet Flat Bed",
        "badge": "KEEPING SHELVES MOVING",
        "image": "/images/Hotshot/40-feet-enclosed-trailer/40.png",
        "short_description": "Reliable transportation for expedited inventory replenishment, store transfers and time-sensitive retail shipments.",
        "description": ["Retail operations depend on consistent inventory availability."],
        "features": [{"title": "Store-to-Store", "description": "Move inventory between retail locations.", "icon": "store"}],
        "stats": [{"value": "50", "label": "States"}],
        "options": HOT_SHOT_OPTIONS,
        "category": "Hot Shot",
        "icon": "truck",
        "nav_href": "/hot-shot/40-feet-flat-bed",
        "sort_order": 5,
    },
    {
        "slug": "20-feet-flat-bed",
        "number": "06",
        "title": "20 Feet Flat Bed",
        "badge": "ALL 50 STATES",
        "image": "/images/Hotshot/20-feet-flat-bed/20.png",
        "short_description": "Flexible regional and long-distance transportation for freight moving across all 50 states.",
        "description": ["Reliable nationwide transportation for regional, long-distance and cross-country shipments."],
        "features": [{"title": "All 50 States", "description": "Nationwide transportation coverage.", "icon": "globe"}],
        "stats": [{"value": "50", "label": "States"}],
        "options": HOT_SHOT_OPTIONS,
        "category": "Hot Shot",
        "icon": "truck",
        "nav_href": "/hot-shot/20-feet-flat-bed",
        "sort_order": 6,
    },
    {
        "slug": "16-feet-box-truck",
        "number": "01",
        "title": "16 Feet Box Truck",
        "badge": "LOCAL & REGIONAL",
        "image": "/images/BoxTruck/16-feet-box-truck/half_side_view_box_truck_isolated_on_background.jpg",
        "short_description": "Medium-capacity enclosed box truck for local and regional freight.",
        "description": ["Enclosed cargo protection for commercial deliveries."],
        "features": [{"title": "Weather Protection", "description": "Enclosed cargo area for rain, snow and dust.", "icon": "inventory"}],
        "stats": [{"value": "16'", "label": "Box Length"}],
        "options": [],
        "category": "Box Truck",
        "icon": "truck",
        "nav_href": "/box-truck/16ft-box-truck",
        "sort_order": 10,
    },
    {
        "slug": "26-feet-box-truck",
        "number": "02",
        "title": "26 Feet Box Truck",
        "badge": "HIGH CAPACITY",
        "image": None,
        "short_description": "Large box truck for heavier commercial loads.",
        "description": ["High-capacity commercial moving and scheduled freight."],
        "features": [{"title": "Commercial Freight", "description": "Warehouses, retailers and manufacturers.", "icon": "truck"}],
        "stats": [{"value": "26'", "label": "Box Length"}],
        "options": [],
        "category": "Box Truck",
        "icon": "truck",
        "nav_href": "/box-truck/26ft-box-truck",
        "sort_order": 11,
    },
    {
        "slug": "reefer-trailer",
        "number": "01",
        "title": "Reefer Trailer (Fridge)",
        "badge": "TEMPERATURE CONTROLLED",
        "image": "/images/Semi-truck/reefer/das.jpeg",
        "short_description": "Temperature-controlled freight throughout the journey.",
        "description": ["Dependable refrigerated transportation for cold-chain cargo."],
        "features": [{"title": "Cold Chain", "description": "Consistent temperature control.", "icon": "clock"}],
        "stats": [{"value": "COLD", "label": "Chain Ready"}],
        "options": [],
        "category": "Semi Truck",
        "icon": "trailer",
        "nav_href": "/semi-truck/reefer-trailer",
        "sort_order": 20,
    },
    {
        "slug": "dry-van",
        "number": "02",
        "title": "Dry Van",
        "badge": "GENERAL FREIGHT",
        "image": "/images/Semi-truck/dryvan/5.jpeg",
        "short_description": "Standard enclosed semi trailer for general commercial freight.",
        "description": ["Versatile dry van transportation for packaged products and everyday freight."],
        "features": [{"title": "Secure Cargo", "description": "Enclosed hauling for general cargo.", "icon": "inventory"}],
        "stats": [{"value": "FTL", "label": "Full Loads"}],
        "options": [],
        "category": "Semi Truck",
        "icon": "trailer",
        "nav_href": "/semi-truck/dry-van",
        "sort_order": 21,
    },
    {
        "slug": "flat-bed",
        "number": "03",
        "title": "Flat Bed",
        "badge": "OPEN DECK",
        "image": "/images/Semi-truck/flatbed/ssjfksd.jpeg",
        "short_description": "Open trailer for oversized equipment, machinery and construction materials.",
        "description": ["Flexible flatbed transportation for open-deck freight."],
        "features": [{"title": "Oversized Loads", "description": "Equipment and open-deck freight.", "icon": "construction"}],
        "stats": [{"value": "OPEN", "label": "Deck"}],
        "options": [],
        "category": "Semi Truck",
        "icon": "truck",
        "nav_href": "/semi-truck/flat-bed",
        "sort_order": 22,
    },
]

# (category_name, question, answer)
FAQS = [
    ("Hot Shot Trucking", "What is Hot Shot trucking?", "Hot Shot trucking is a fast and flexible freight transportation service designed for smaller, time-sensitive loads that don't require a full-size semi-truck."),
    ("Hot Shot Trucking", "What type of freight can you transport with Hot Shot trucks?", "We can handle equipment, machinery, construction materials, automotive parts, agricultural equipment, and other suitable freight."),
    ("Hot Shot Trucking", "How quickly can Hot Shot freight be delivered?", "Delivery time depends on the pickup location, destination, load size, and route."),
    ("Hot Shot Trucking", "Do you offer same-day Hot Shot delivery?", "Yes, same-day and expedited delivery may be available depending on shipment details and driver availability."),
    ("Hot Shot Trucking", "What size loads can a Hot Shot truck handle?", "Capacity depends on the truck and trailer configuration. Contact us with dimensions and weight."),
    ("Hot Shot Trucking", "Do you provide expedited Hot Shot transportation?", "Yes. We offer expedited transportation options for customers who need freight moved quickly."),
    ("Box Truck", "What is Box Truck transportation?", "Box truck transportation is ideal for smaller and medium-sized shipments in an enclosed cargo area."),
    ("Box Truck", "What types of freight can be transported in a Box Truck?", "General freight, retail goods, furniture, packaged products, equipment, and supplies."),
    ("Box Truck", "Are Box Trucks suitable for local deliveries?", "Yes. Box trucks are an excellent option for local, regional, and scheduled delivery services."),
    ("Box Truck", "Can you handle commercial and business deliveries?", "Yes. We serve businesses, warehouses, retailers, manufacturers, and contractors."),
    ("Box Truck", "Do Box Trucks protect freight from weather?", "Yes. The enclosed cargo area helps protect shipments from rain, snow, and dust."),
    ("Box Truck", "Can I use a Box Truck for expedited delivery?", "Depending on availability and shipment requirements, expedited Box Truck delivery can be arranged."),
    ("Semi-Truck", "What is Semi-Truck transportation?", "Semi-truck transportation is designed for larger and heavier freight that requires a tractor-trailer."),
    ("Semi-Truck", "What types of freight can you transport with Semi-Trucks?", "Palletized goods, machinery, equipment, construction materials, and other large shipments."),
    ("Semi-Truck", "Do you offer long-distance Semi-Truck transportation?", "Yes. Semi-trucks are well suited for regional and long-distance freight."),
    ("Semi-Truck", "Can you transport full truckload (FTL) shipments?", "Yes. We can provide FTL solutions based on freight requirements and destination."),
    ("Semi-Truck", "How do I know if I need a Semi-Truck?", "A Semi-Truck is generally right when the shipment is too large or heavy for Hot Shot or Box Truck."),
    ("Semi-Truck", "Do you provide reliable freight delivery?", "Yes. Our goal is dependable transportation, professional service, and on-time delivery."),
    ("General FAQ", "How do I get a quote for my shipment?", "Contact us with pickup, delivery, freight type, dimensions, weight, and preferred date."),
]

# FAQ category tab metadata (icon + order). FAQS ke category naam inhi keys se match hone chahiye.
FAQ_CATEGORY_META = {
    "Hot Shot Trucking": {"icon": "truck-fast", "order": 1},
    "Box Truck": {"icon": "box", "order": 2},
    "Semi-Truck": {"icon": "truck", "order": 3},
    "General FAQ": {"icon": "help", "order": 4},
}

# quote form "Select Service" dropdown (Hot Shot / Box Truck / Semi Truck)
SERVICE_OPTIONS = [
    ("Hot Shot", 1),
    ("Box Truck", 2),
    ("Semi Truck", 3),
]

# contact form "Choose your truck or trailer" dropdown
# (name, category, description, icon, sort_order)
TRUCK_TYPES = [
    ("Truck & Trailers", "Hot Shot", "Flexible truck and trailer hauling", "truck", 1),
    ("Sprinter Van with Lifters", "Hot Shot", "Compact hauling with lift equipment", "van", 2),
    ("16 Feet Enclosed Trailer", "Hot Shot", "Enclosed trailer for protected loads", "trailer", 3),
    ("24 Feet Enclosed Trailer", "Hot Shot", "Extended enclosed cargo capacity", "trailer", 4),
    ("40 Feet Flat Bed", "Hot Shot", "Large flatbed for oversized freight", "truck", 5),
    ("20 Feet Flat Bed", "Hot Shot", "Flatbed hauling for general freight", "truck", 6),
    ("16 Feet Box Truck", "Box Truck", "Medium-capacity enclosed box truck", "truck", 10),
    ("26 Feet Box Truck", "Box Truck", "Large box truck for heavier loads", "truck", 11),
    ("Reefer Trailer (Fridge)", "Semi Truck", "Temperature-controlled freight", "trailer", 20),
    ("Dry Van", "Semi Truck", "Standard enclosed semi trailer", "trailer", 21),
    ("Flat Bed", "Semi Truck", "Open trailer for large freight", "truck", 22),
]

TESTIMONIALS = [
    {
        "quote": "Mr. Whiz Logistics has made our transportation process much easier. Their team is responsive, professional, and always keeps us updated from pickup through delivery.",
        "name": "James Carter",
        "role": "Logistics Manager, WestPoint Freight",
        "rating": 5,
        "initials": "JC",
        "accent": "linear-gradient(135deg, #c8ff00, #7fb800)",
        "sort_order": 1,
    },
    {
        "quote": "We needed a reliable Hot Shot carrier for an urgent shipment, and Mr. Whiz Logistics delivered exactly what they promised.",
        "name": "Emily Thompson",
        "role": "Operations Manager, Summit Supply Co.",
        "rating": 5,
        "initials": "ET",
        "accent": "linear-gradient(135deg, #00e5ff, #0088aa)",
        "sort_order": 2,
    },
    {
        "quote": "The driver arrived on time, handled our equipment carefully, and completed the delivery without any issues.",
        "name": "Robert Williams",
        "role": "Fleet Coordinator, Prime Industrial",
        "rating": 5,
        "initials": "RW",
        "accent": "linear-gradient(135deg, #ff4dd8, #aa2288)",
        "sort_order": 3,
    },
    {
        "quote": "From booking to final delivery, the entire experience was smooth and professional.",
        "name": "Sarah Mitchell",
        "role": "Supply Chain Manager, BlueLine Distribution",
        "rating": 5,
        "initials": "SM",
        "accent": "linear-gradient(135deg, #ffb340, #cc7700)",
        "sort_order": 4,
    },
    {
        "quote": "We've worked with several transportation providers, but Mr. Whiz Logistics has consistently provided excellent service.",
        "name": "Daniel Brooks",
        "role": "Operations Director, NorthStar Logistics",
        "rating": 5,
        "initials": "DB",
        "accent": "linear-gradient(135deg, #a78bfa, #6d28d9)",
        "sort_order": 5,
    },
]


def _upsert_by(db: Session, model, field: str, value, defaults: dict):
    row = db.query(model).filter(getattr(model, field) == value).first()
    if row:
        return row
    row = model(**defaults)
    db.add(row)
    return row


def seed(db: Session | None = None) -> None:
    close = False
    if db is None:
        db = SessionLocal()
        close = True
    try:
        # Uvicorn runs multiple workers in production. Serialize seed work at
        # the database level so two worker startups cannot insert the same
        # default rows concurrently. The lock is released on commit/rollback.
        if db.bind is not None and db.bind.dialect.name == "postgresql":
            db.execute(text("SELECT pg_advisory_xact_lock(8597002)"))

        if db.query(SeedRun).filter(SeedRun.key == SEED_VERSION).first():
            return

        home = _upsert_by(
            db,
            Page,
            "slug",
            "home",
            {
                "title": "Home",
                "slug": "home",
                "page_type": "home",
                "content": "Fast, reliable trucking that moves your freight from pickup to delivery without the hassle",
                "is_active": True,
                "sort_order": 1,
            },
        )
        db.flush()
        if not db.query(SEO).filter(SEO.page_id == home.id).first():
            db.add(
                SEO(
                    page_id=home.id,
                    meta_title="Mr. Whiz Logistics | Trucking & Hot Shot",
                    meta_description="Fast, reliable trucking for Hot Shot, Box Truck, and Semi-Truck freight.",
                    canonical_url="/",
                )
            )

        for data in SERVICES:
            existing = db.query(Service).filter(Service.slug == data["slug"]).first()
            if not existing:
                db.add(Service(**data, is_active=True))

        # The public truck pages were originally backed by TypeScript constants,
        # while the dashboard writes to three dedicated CMS tables. Backfill the
        # dedicated tables once so those tables can become the authoritative
        # source without dropping the original catalog. Existing slugs are never
        # overwritten, preserving all administrator edits made before migration.
        page_copy = {
            "Hot Shot": (Hotshot, "Hot Shot", "Choose the right Hot Shot service"),
            "Box Truck": (BoxTruck, "Box Truck", "Choose the right box truck"),
            "Semi Truck": (SemiTruck, "Semi Truck", "Choose the right semi truck"),
        }
        for data in SERVICES:
            model, page_heading, page_subheading = page_copy[data["category"]]
            if db.query(model).filter(model.slug == data["slug"]).first():
                continue

            feature_titles = [item["title"] for item in data.get("features", [])]
            values = {
                "page_heading": page_heading,
                "page_subheading": page_subheading,
                "card_number": data.get("number") or "",
                "category_tag": data.get("badge") or data["category"],
                "title": data["title"],
                "short_description": data.get("short_description") or "",
                "card_image": data.get("image") or "/images/breadcumb.jpg",
                "features": feature_titles,
                "detail_heading": data["title"],
                "detail_image": data.get("image"),
                "detail_paragraphs": data.get("description") or [],
                "slug": data["slug"],
                "meta_title": data["title"],
                "meta_description": data.get("short_description"),
                "canonical_url": data.get("nav_href"),
            }

            if model is SemiTruck:
                stats = {
                    item.get("label", "").lower(): item.get("value")
                    for item in data.get("stats", [])
                }
                values.update(
                    trailer_length=stats.get("trailer length")
                    or stats.get("deck length"),
                    max_payload=stats.get("max payload"),
                    cargo_type=stats.get("cargo type")
                    or stats.get("cargo space")
                    or stats.get("load type"),
                )

            db.add(model(**values))

        # --- Quote form dropdown options (Hot Shot / Box Truck / Semi Truck) ---
        for name, order in SERVICE_OPTIONS:
            exists = db.query(ServiceOption).filter(ServiceOption.name == name).first()
            if not exists:
                db.add(ServiceOption(name=name, sort_order=order, is_active=True))

        # --- Contact form truck-type dropdown options ---
        for name, category, description, icon, order in TRUCK_TYPES:
            exists = db.query(TruckType).filter(TruckType.name == name).first()
            if not exists:
                db.add(
                    TruckType(
                        name=name,
                        category=category,
                        description=description,
                        icon=icon,
                        sort_order=order,
                        is_active=True,
                    )
                )

        # --- FAQ categories (tabs) + questions ---
        faq_cat_objs: dict[str, FAQCategory] = {}
        for name, meta in FAQ_CATEGORY_META.items():
            cat = db.query(FAQCategory).filter(FAQCategory.name == name).first()
            if not cat:
                cat = FAQCategory(
                    name=name,
                    icon=meta["icon"],
                    display_order=meta["order"],
                    is_active=True,
                )
                db.add(cat)
                db.flush()  # cat.id available for FAQ.category_id
            faq_cat_objs[name] = cat

        order_by_cat: dict[str, int] = {}
        for category, question, answer in FAQS:
            exists = db.query(FAQ).filter(FAQ.question == question).first()
            if not exists:
                order_by_cat[category] = order_by_cat.get(category, 0) + 1
                db.add(
                    FAQ(
                        category_id=faq_cat_objs[category].id,
                        question=question,
                        answer=answer,
                        is_active=True,
                        display_order=order_by_cat[category],
                    )
                )

        for data in TESTIMONIALS:
            exists = db.query(Testimonial).filter(Testimonial.name == data["name"]).first()
            if not exists:
                db.add(Testimonial(**data, is_active=True))

        blocks = [
            {
                "key": "hero",
                "title": "Hero",
                "subtitle": "Homepage hero sentence",
                "body": {
                    "sentence": "Fast, reliable trucking that moves your freight from pickup to delivery without the hassle",
                    "video": "/video/hero-video.mp4",
                },
            },
            {
                "key": "dispatch",
                "title": "Why Mr. Whiz",
                "subtitle": "Dispatch strengths",
                "body": {
                    "items": [
                        {"n": "01", "title": "Personal Service", "body": "Dedicated support from load planning to final delivery."},
                        {"n": "02", "title": "Flexible Equipment", "body": "The right truck and trailer for your specific freight requirements."},
                        {"n": "03", "title": "Experienced Dispatching", "body": "We coordinate routes, loads, schedules, and communication efficiently."},
                        {"n": "04", "title": "Reliable Transportation", "body": "Professional handling designed to keep your freight moving safely and on schedule."},
                        {"n": "05", "title": "Complete Support", "body": "From paperwork and coordination to delivery updates, we handle the details."},
                        {"n": "06", "title": "Support 24/7", "body": "Our team is available whenever you need assistance with your shipment."},
                    ]
                },
            },
            {
                "key": "fleet",
                "title": "Flexible Equipment. Reliable Delivery.",
                "subtitle": "OUR FLEET",
                "body": {
                    "tiers": [
                        {"label": "Hot Shot", "title": "Fast & Flexible", "items": ["Truck & Trailer", "Sprinter Van", "16' Enclosed", "24' Enclosed", "40' Flatbed", "20' Flatbed"], "featured": False},
                        {"label": "Box Truck", "title": "Commercial Freight", "items": ["16' Box Truck", "26' Box Truck"], "featured": True},
                        {"label": "Semi-Truck", "title": "Full-Size Freight", "items": ["Reefer Trailer", "Dry Van", "Flatbed"], "featured": False},
                    ]
                },
            },
            {
                "key": "process",
                "title": "How it works",
                "body": {
                    "steps": [
                        {"title": "Request & Research", "desc": "Tell us your load details. We research lanes, rates and equipment to find the best match."},
                        {"title": "Plan & Design", "desc": "We create a customized transport plan with the right truck, route, timeline and budget."},
                        {"title": "Get a Quote", "desc": "Receive a clear, all-inclusive quote with no hidden fees or surcharges."},
                        {"title": "Book & Confirm", "desc": "Review terms, SLAs and coverage. Once approved, we lock it in."},
                        {"title": "Transport & Track", "desc": "Live dispatch and real-time tracking keep you updated every mile of the way."},
                        {"title": "On-Time Delivery", "desc": "We deliver safely, on time with proof of delivery and post-haul support."},
                    ]
                },
            },
            {
                "key": "cases",
                "title": "Case show",
                "body": {
                    "cases": [
                        {"label": "Hot Shot", "title": "Fast, flexible freight transportation", "stat": "Time-sensitive freight"},
                        {"label": "Box Truck", "title": "Local & regional freight delivery", "stat": "Local & regional freight"},
                        {"label": "Reefer", "title": "Temperature-controlled freight", "stat": "Temperature-controlled"},
                        {"label": "Dry Van", "title": "General commercial freight", "stat": "General commercial freight"},
                        {"label": "Flatbed", "title": "Oversized & open-deck loads", "stat": "Oversized & open-deck loads"},
                    ]
                },
            },
        ]
        for block in blocks:
            _upsert_by(db, ContentBlock, "key", block["key"], {**block, "is_active": True})

        settings = [
            ("company_name", "Mr. Whiz Logistics", "Company name"),
            ("phone", "(469) 767 8853", "Primary phone"),
            ("email", "dispatch@mrwhizlogistics.com", "Dispatch email"),
            ("hero_video", "/video/hero-video.mp4", "Homepage hero video path"),
        ]
        for key, value, label in settings:
            _upsert_by(
                db,
                SiteSetting,
                "key",
                key,
                {"key": key, "value": value, "label": label},
            )

        db.add(SeedRun(key=SEED_VERSION))
        db.commit()
        print("Seed data loaded from frontend content.")
    except Exception:
        db.rollback()
        raise
    finally:
        if close:
            db.close()


if __name__ == "__main__":
    from app.database import Base, engine
    from app.models import *  # noqa: F401,F403

    Base.metadata.create_all(bind=engine)
    seed()
