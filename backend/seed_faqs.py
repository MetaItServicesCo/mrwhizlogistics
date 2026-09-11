"""
Seed FAQ categories + questions into the database (frontend data ke exact mutabiq).

Run (backend folder me, venv active):
    python seed_faqs.py

Idempotent hai — dobara chalao ge to jo category pehle se hai use skip kar dega.
"""
from app.database import SessionLocal
from app.models.faq import FAQ, FAQCategory

# Har category: name, icon (frontend tab icon key), description, order, faqs[(question, answer)]
DATA = [
    {
        "name": "Hot Shot Trucking",
        "icon": "truck-fast",
        "description": None,
        "order": 1,
        "faqs": [
            (
                "What is Hot Shot trucking?",
                "Hot Shot trucking is a fast and flexible freight transportation service "
                "designed for smaller, time-sensitive loads that don't require a full-size "
                "semi-truck.",
            ),
            (
                "What type of freight can you transport with Hot Shot trucks?",
                "We can handle equipment, machinery, construction materials, automotive "
                "parts, agricultural equipment, and other suitable freight.",
            ),
            (
                "How quickly can Hot Shot freight be delivered?",
                "Hot Shot services are designed for time-sensitive shipments. Delivery time "
                "depends on the pickup location, destination, load size, and route.",
            ),
            (
                "Do you offer same-day Hot Shot delivery?",
                "Yes, same-day and expedited delivery may be available depending on the "
                "shipment details, location, and driver availability.",
            ),
            (
                "What size loads can a Hot Shot truck handle?",
                "Hot Shot capacity depends on the truck and trailer configuration. Contact "
                "us with your freight dimensions and weight so we can determine the "
                "appropriate equipment.",
            ),
            (
                "Do you provide expedited Hot Shot transportation?",
                "Yes. We offer expedited transportation options for customers who need their "
                "freight moved quickly and reliably.",
            ),
        ],
    },
    {
        "name": "Box Truck",
        "icon": "box",
        "description": None,
        "order": 2,
        "faqs": [
            (
                "What is Box Truck transportation?",
                "Box truck transportation is ideal for moving smaller and medium-sized "
                "shipments in an enclosed cargo area, providing protection from weather and "
                "road conditions.",
            ),
            (
                "What types of freight can be transported in a Box Truck?",
                "Box trucks are suitable for general freight, retail goods, furniture, "
                "packaged products, equipment, supplies, and other cargo that fits within "
                "the truck's capacity.",
            ),
            (
                "Are Box Trucks suitable for local deliveries?",
                "Yes. Box trucks are an excellent option for local, regional, and scheduled "
                "delivery services.",
            ),
            (
                "Can you handle commercial and business deliveries?",
                "Yes. We can provide transportation solutions for businesses, warehouses, "
                "retailers, manufacturers, contractors, and other commercial customers.",
            ),
            (
                "Do Box Trucks protect freight from weather?",
                "Yes. The enclosed cargo area helps protect shipments from rain, snow, dust, "
                "and other outdoor conditions.",
            ),
            (
                "Can I use a Box Truck for expedited delivery?",
                "Depending on availability and shipment requirements, expedited Box Truck "
                "delivery can be arranged.",
            ),
        ],
    },
    {
        "name": "Semi-Truck",
        "icon": "truck",
        "description": None,
        "order": 3,
        "faqs": [
            (
                "What is Semi-Truck transportation?",
                "Semi-truck transportation is designed for larger and heavier freight that "
                "requires a tractor-trailer and greater cargo capacity.",
            ),
            (
                "What types of freight can you transport with Semi-Trucks?",
                "We can transport a wide range of commercial freight, including palletized "
                "goods, machinery, equipment, construction materials, and other large "
                "shipments.",
            ),
            (
                "Do you offer long-distance Semi-Truck transportation?",
                "Yes. Semi-trucks are well suited for regional and long-distance freight "
                "transportation.",
            ),
            (
                "Can you transport full truckload (FTL) shipments?",
                "Yes. We can provide transportation solutions for full truckload shipments "
                "based on your freight requirements and destination.",
            ),
            (
                "How do I know if I need a Semi-Truck?",
                "A Semi-Truck is generally the right choice when your shipment is too large, "
                "heavy, or numerous for a Hot Shot or Box Truck. We can help determine the "
                "appropriate equipment for your load.",
            ),
            (
                "Do you provide reliable freight delivery?",
                "Yes. Our goal is to provide dependable transportation, professional "
                "service, and on-time delivery while keeping your freight moving "
                "efficiently.",
            ),
        ],
    },
    {
        "name": "General FAQ",
        "icon": "help",
        "description": None,
        "order": 4,
        "faqs": [
            (
                "How do I get a quote for my shipment?",
                "Simply contact us with your pickup location, delivery location, freight "
                "type, dimensions, weight, and preferred delivery date. Our team can "
                "recommend the right trucking solution and provide a quote.",
            ),
        ],
    },
]


def run() -> None:
    db = SessionLocal()
    try:
        for c in DATA:
            existing = (
                db.query(FAQCategory).filter(FAQCategory.name == c["name"]).first()
            )
            if existing:
                print(f"skip (already exists): {c['name']}")
                continue

            category = FAQCategory(
                name=c["name"],
                icon=c["icon"],
                description=c["description"],
                display_order=c["order"],
                is_active=True,
            )
            db.add(category)
            db.flush()  # taake category.id mil jaye FAQ ke liye

            for i, (question, answer) in enumerate(c["faqs"], start=1):
                db.add(
                    FAQ(
                        category_id=category.id,
                        question=question,
                        answer=answer,
                        display_order=i,
                        is_active=True,
                    )
                )
            print(f"added: {c['name']}  ({len(c['faqs'])} questions)")

        db.commit()
        print("\n FAQ seed complete.")
    except Exception as e:
        db.rollback()
        print(f"\n Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()