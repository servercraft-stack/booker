import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models.signals import post_save, post_delete
from apps.user.models import User
from apps.apartments.models import (
    Apartment, Amenity, ApartmentPricing, ApartmentAddress,
    ApartmentAvailability, ApartmentRule
)
from apps.notifications.signals import (
    apartment_verified_notification,
    apartment_available_notification,
)


# --- Data pools ---

TITLES = [
    "Cozy Studio in the Heart of the City",
    "Luxury Penthouse with Panoramic Views",
    "Charming Victorian Apartment",
    "Modern Loft with Exposed Brick",
    "Seaside Retreat with Ocean Breeze",
    "Rustic Countryside Cottage",
    "Sleek Downtown Apartment",
    "Bright and Airy Garden Flat",
    "Elegant Duplex Near the Park",
    "Minimalist Urban Studio",
    "Historic Brownstone Apartment",
    "Spacious Family Apartment with Balcony",
    "Bohemian Chic Loft in Arts District",
    "Waterfront Condo with Marina Views",
    "Cosy Attic Apartment with Skylights",
    "Stylish Apartment Above a Bookshop",
    "Renovated Warehouse Apartment",
    "Sunlit Corner Unit with City Views",
    "Quiet Suburban Retreat",
    "Chic Studio Near the Metro",
    "Luxury Suite with Private Rooftop",
    "Lakeside Cabin with Deck",
    "Bright Basement Apartment",
    "Industrial Loft with High Ceilings",
    "Charming Flat Near the Market",
    "Hilltop Villa with Panoramic Terrace",
    "Smart Home Apartment with Tech Features",
    "Family-Friendly Flat Near Schools",
    "Artist's Studio with North Light",
    "Romantic Getaway for Two",
    "Eco-Friendly Apartment with Solar Panels",
    "Penthouse with Infinity Pool Access",
    "Renovated Farmhouse Apartment",
    "Cozy Corner Studio Near University",
    "Luxury Apartment with Home Office",
    "Beachfront Flat with Direct Access",
    "Quiet Retreat in the Mountains",
    "Urban Oasis with Private Garden",
    "Stylish Loft Above the Café",
    "Bright Apartment with Floor-to-Ceiling Windows",
    "Classic Apartment with Period Features",
    "Modern Studio with Murphy Bed",
    "Corner Suite with Wraparound Balcony",
    "Spacious Apartment for Remote Workers",
    "Designer Flat with Art Collection",
    "Secluded Cottage with Hot Tub",
    "Pet-Friendly Apartment with Yard",
    "Top-Floor Apartment with Skyline View",
    "Ground-Floor Flat with Patio",
    "Nautical-Themed Apartment Near the Harbor",
]

DESCRIPTIONS = [
    "A beautifully designed space featuring hardwood floors, large windows that flood the room with natural light, and a fully equipped kitchen with stainless steel appliances. Perfect for couples or solo travelers.",
    "Step into luxury with this stunning penthouse offering floor-to-ceiling windows, designer furnishings, and a private terrace with breathtaking city views. The open-plan living area is perfect for entertaining.",
    "This charming Victorian apartment has been lovingly restored with original features including ornate cornicing, period fireplaces, and rich wooden banisters. A truly unique stay in a historic building.",
    "An impressive loft space with soaring ceilings, exposed brick walls, and industrial-chic fixtures. The open layout features a gourmet kitchen, comfortable sleeping area, and a cozy reading nook.",
    "Wake up to the sound of waves in this peaceful seaside retreat. The apartment features a nautical-inspired décor, a fully equipped kitchen, and a balcony overlooking the garden with glimpses of the ocean.",
    "Escape to the countryside in this rustic cottage surrounded by rolling hills and meadows. Enjoy the wood-burning stove, exposed beams, and a private garden perfect for morning coffee.",
    "A sleek and modern apartment in the heart of the downtown district, featuring minimalist design, smart home technology, and easy access to restaurants, shops, and nightlife.",
    "This bright and airy garden flat opens directly onto a shared courtyard garden. Features include high ceilings, large sash windows, and tasteful furnishings throughout.",
    "An elegant duplex apartment with a spacious living area on the lower level and two generous bedrooms upstairs. The private balcony overlooks the tree-lined park across the street.",
    "Clean lines and thoughtful design define this minimalist urban studio. Every inch of space has been optimised with clever storage solutions, a fold-down desk, and a Murphy bed.",
    "This beautifully preserved brownstone apartment features original hardwood floors, a decorative fireplace, and tall windows that flood the space with light.",
    "A generous family apartment with three bedrooms, a large open-plan kitchen and living area, and a balcony perfect for morning coffee. Located in a quiet, family-friendly neighbourhood.",
    "A creative loft space in the vibrant arts district, featuring eclectic furnishings, an artist's workspace, and walls adorned with local artwork. Walk to galleries, studios, and indie shops.",
    "Wake up to stunning marina views in this contemporary waterfront condo. The apartment features a modern kitchen, floor-to-ceiling windows, and access to the building's fitness centre and pool.",
    "A cosy attic apartment with charming skylights that fill the space with natural light. Features include a compact but well-equipped kitchen, a comfortable sleeping area, and sloped ceilings with character.",
    "This unique apartment sits above a beloved neighbourhood bookshop. Enjoy the literary ambiance, exposed brick, and a private reading corner with curated bookshelves.",
    "A converted warehouse apartment with soaring double-height ceilings, polished concrete floors, and oversized steel-framed windows. The industrial aesthetic is softened with warm textiles and plants.",
    "This sunlit corner unit offers panoramic city views from two aspects. The open-plan layout features a modern kitchen, comfortable living area, and a dedicated workspace.",
    "A peaceful suburban retreat just minutes from the city centre. This well-appointed apartment features a private garden, modern amenities, and a tranquil atmosphere.",
    "A compact and stylish studio steps from the metro station, making it perfect for exploring the city. Features a kitchenette, comfortable bed, and modern bathroom.",
    "Indulge in luxury with this penthouse suite featuring a private rooftop terrace with a jacuzzi, BBQ area, and stunning sunset views over the city skyline.",
    "A charming lakeside cabin with a wraparound deck perfect for alfresco dining. Inside, enjoy the cosy living area with a stone fireplace and lake views from every window.",
    "A welcoming basement apartment with its own private entrance. The space features large egress windows, recessed lighting, and a surprisingly bright and open feel throughout.",
    "This impressive industrial loft features 16-foot ceilings, massive factory windows, and an open floor plan that's perfect for creative professionals and entertainers alike.",
    "A delightful flat steps from the bustling local market. The apartment features vintage touches, a cosy kitchen, and easy access to fresh produce and artisan shops.",
    "Perched on a hillside with sweeping valley views, this villa features a private terrace, an infinity plunge pool, and an open-plan living area that seamlessly connects to the outdoors.",
    "A cutting-edge smart home apartment equipped with voice-controlled lighting, automated blinds, a premium sound system, and high-speed fibre internet throughout.",
    "A spacious, family-friendly flat located near excellent schools, parks, and playgrounds. Features three bedrooms, a large bathroom, and a child-safe balcony.",
    "This artist's studio features beautiful north-facing light, high ceilings, and a spacious open floor plan. Perfect for creative professionals or anyone who loves abundant natural light.",
    "An intimate and romantic studio designed for couples, featuring a king-size bed, a luxurious bathroom with a soaking tub, dimmable lighting, and a private balcony.",
    "An environmentally conscious apartment with solar panels, energy-efficient appliances, a composting system, and natural materials throughout. Green living without compromising comfort.",
    "A luxurious penthouse with access to the building's exclusive infinity pool, rooftop lounge, and concierge service. The apartment features designer finishes and city views.",
    "A lovingly renovated farmhouse apartment with original stone walls, a farmhouse kitchen, and modern comforts discreetly integrated into the historic setting.",
    "A cozy and affordable studio just minutes from the university campus. Ideal for students or visiting academics, with a study desk, fast Wi-Fi, and a kitchenette.",
    "A premium apartment with a dedicated home office space featuring a sit-stand desk, ergonomic chair, and dual-monitor setup. Perfect for remote professionals on extended stays.",
    "A stunning beachfront flat with direct access to the sand. Fall asleep to the sound of waves and wake up to ocean views from the living room and bedroom.",
    "A peaceful mountain retreat surrounded by pine forests and hiking trails. The apartment features a stone fireplace, a well-equipped kitchen, and a deck with mountain views.",
    "An urban oasis featuring a private garden courtyard, mature plants, and a water feature. The apartment interior is light-filled with biophilic design elements throughout.",
    "A stylish loft located above a popular neighbourhood café. Enjoy the aroma of freshly ground coffee each morning and the vibrant street scene below.",
    "Bright and spacious with floor-to-ceiling windows offering sweeping city views. The open-plan layout features polished timber floors and a gourmet kitchen.",
    "A classic apartment showcasing period features including decorative ceiling roses, cornicing, picture rails, and original fireplace surrounds. Period charm meets modern comfort.",
    "A cleverly designed compact studio with a Murphy bed that folds seamlessly into the wall, transforming the sleeping area into a home office or lounge during the day.",
    "A generous corner suite with a wraparound balcony offering views in three directions. The open-plan living area is flooded with light from windows on two walls.",
    "A spacious apartment designed for remote workers, featuring a dedicated office nook with high-speed internet, a second monitor, and excellent acoustics for video calls.",
    "A designer flat curated with original artworks, sculptural furniture, and bold colour palettes. Each room is a visual experience with pieces from local and international artists.",
    "A secluded countryside cottage featuring a private hot tub on the deck, a wood-burning stove, and total privacy surrounded by mature gardens and woodland.",
    "A welcoming pet-friendly apartment with a secure private yard, easy-clean flooring, and nearby walking paths. Dogs and cats are warmly welcomed.",
    "A spectacular top-floor apartment offering unobstructed skyline views from an expansive terrace. The interior features premium finishes and a chef's kitchen.",
    "A comfortable ground-floor flat with a private patio garden, perfect for outdoor dining. The apartment features an accessible layout with no steps and wide doorways.",
    "A nautical-themed apartment located near the historic harbour. Decorated with maritime artefacts, rope details, and ocean-inspired colours. Watch the boats from the window.",
]

AMENITIES_DATA = [
    ("WiFi", "wifi"),
    ("TV", "tv"),
    ("Air conditioning", "snowflake"),
    ("Heating", "thermometer"),
    ("Kitchen", "utensils"),
    ("Washing machine", "tshirt"),
    ("Dryer", "tshirt"),
    ("Iron", "iron"),
    ("Hair dryer", "wind"),
    ("Dishwasher", "glass"),
    ("Microwave", "microwave"),
    ("Coffee maker", "coffee"),
    ("Parking", "car"),
    ("Pool", "swimming-pool"),
    ("Gym", "dumbbell"),
    ("Balcony", "sun"),
    ("Garden", "leaf"),
    ("Hot tub", "hot-tub"),
    ("BBQ grill", "fire"),
    ("Fireplace", "fire"),
    ("EV charger", "bolt"),
    ("Elevator", "arrows-alt-v"),
    ("Self check-in", "key"),
    ("Smoke alarm", "bell"),
    ("First aid kit", "medkit"),
    ("Carbon monoxide alarm", "exclamation-triangle"),
]

RULES_DATA = [
    "No smoking inside the apartment",
    "No parties or events",
    "Pets are not allowed",
    "Quiet hours after 10 PM",
    "No shoes inside please",
    "Maximum occupancy strictly enforced",
    "Please dispose of rubbish properly",
    "No unregistered guests overnight",
    "Keep common areas clean",
    "No loud music after 11 PM",
    "Please treat the space with respect",
    "Lock the door when leaving",
    "Do not move furniture",
    "Report any damage immediately",
    "Check-in is after 3 PM, check-out before 11 AM",
    "No candles or open flames",
    "Use coasters on wooden surfaces",
    "Please strip the beds before checkout",
    "Recycling bins are in the kitchen",
    "The building has a strict no-drugs policy",
]

LOCATIONS = [
    ("United Kingdom", "England", "London", [
        "12 Baker Street", "45 Oxford Street", "78 Camden High Street", "23 King's Road",
        "15 Notting Hill Gate", "90 Shoreditch High Street", "34 Covent Garden", "56 Mayfair Place",
        "11 Soho Square", "67 Greenwich Park", "82 Brixton Road", "19 Chelsea Embankment"
    ]),
    ("United Kingdom", "England", "Manchester", [
        "3 Deansgate", "27 Oxford Road", "14 Northern Quarter", "52 Ancoats Lane"
    ]),
    ("United Kingdom", "Scotland", "Edinburgh", [
        "8 Royal Mile", "41 Grassmarket", "19 New Town Crescent", "63 Leith Walk"
    ]),
    ("United Kingdom", "Wales", "Cardiff", [
        "22 St Mary Street", "7 Bute Terrace"
    ]),
    ("France", "Ile-de-France", "Paris", [
        "15 Rue de Rivoli", "33 Rue Montmartre", "8 Avenue des Champs-Élysées",
        "42 Rue de Belleville", "11 Quai de la Tournelle", "26 Rue Oberkampf"
    ]),
    ("Spain", "Catalonia", "Barcelona", [
        "5 Passeig de Gràcia", "18 La Rambla", "29 Carrer de Mallorca",
        "7 Avinguda Diagonal"
    ]),
    ("Italy", "Lazio", "Rome", [
        "10 Via del Corso", "24 Via Nazionale", "38 Via Veneto"
    ]),
    ("United States", "New York", "New York City", [
        "55 West 46th Street", "120 East 72nd Street", "89 Bleecker Street",
        "34 Bedford Avenue", "167 Perry Street"
    ]),
    ("United States", "California", "San Francisco", [
        "42 Columbus Avenue", "78 Haight Street", "15 Mission Street"
    ]),
    ("Portugal", "Lisbon District", "Lisbon", [
        "9 Rua Augusta", "21 Avenida da Liberdade", "36 Bairro Alto Lane"
    ]),
    ("Germany", "Berlin", "Berlin", [
        "14 Friedrichstraße", "28 Kreuzbergstraße", "50 Kurfürstendamm"
    ]),
    ("Netherlands", "North Holland", "Amsterdam", [
        "6 Prinsengracht", "17 Keizersgracht", "33 Utrechtsestraat"
    ]),
]


class Command(BaseCommand):
    help = "Seed the database with 50 random apartments (no emails sent)"

    def handle(self, *args, **options):
        self.stdout.write("Seeding apartments...")

        # Disconnect notification signals so no emails are sent
        post_save.disconnect(apartment_verified_notification, sender=Apartment)
        post_save.disconnect(apartment_available_notification, sender=ApartmentAvailability)
        self.stdout.write("  Notification signals disconnected (no emails)")

        try:
            self._seed()
        finally:
            # Reconnect signals
            post_save.connect(apartment_verified_notification, sender=Apartment)
            post_save.connect(apartment_available_notification, sender=ApartmentAvailability)
            self.stdout.write("  Notification signals reconnected")

    def _seed(self):
        users = list(User.objects.all())
        if not users:
            self.stdout.write(self.style.ERROR("No users found. Create at least one user first."))
            return

        # Create amenities
        amenities = {}
        for name, icon in AMENITIES_DATA:
            amenity, _ = Amenity.objects.get_or_create(name=name, defaults={"icon": icon})
            amenities[name] = amenity
        self.stdout.write(f"  Created/verified {len(amenities)} amenities")

        # Flatten locations
        all_locations = []
        for country, state, city, streets in LOCATIONS:
            for street in streets:
                all_locations.append((country, state, city, street))

        # Bulk create availability records instead of one-by-one
        availability_bulk = []

        # Generate 50 apartments
        created_count = 0
        for i in range(50):
            user = random.choice(users)
            title = TITLES[i]
            description = random.choice(DESCRIPTIONS)
            property_type = random.choice(["apartment", "room", "entire_home", "studio", "villa"])
            bedrooms = random.randint(1, 5)
            bathrooms = random.randint(1, 3)
            max_guests = random.randint(1, max(bedrooms * 2, 2))

            apartment = Apartment.objects.create(
                host=user,
                title=title,
                description=description,
                property_type=property_type,
                total_bedrooms=bedrooms,
                total_bathrooms=bathrooms,
                max_guests=max_guests,
                is_active=True,
                is_verified=random.choice([True, True, True, False]),  # 75% verified
                image=None,  # Leave blank for user to fill
            )

            # Pricing
            price = Decimal(str(round(random.uniform(45, 450), 2)))
            cleaning = Decimal(str(round(random.uniform(10, 50), 2)))
            service = Decimal(str(round(random.uniform(5, 25), 2)))
            weekend = price * Decimal("1.2") if random.random() > 0.5 else None

            ApartmentPricing.objects.create(
                apartment=apartment,
                price_per_night=price,
                cleaning_fee=cleaning,
                service_fee=service,
                weekend_price=weekend,
                currency=random.choice(["GBP", "USD", "EUR"]),
            )

            # Address
            country, state, city, street = random.choice(all_locations)
            ApartmentAddress.objects.create(
                apartment=apartment,
                country=country,
                state=state,
                city=city,
                street=street,
            )

            # Amenities (random 3-8 per apartment)
            num_amenities = random.randint(3, min(8, len(amenities)))
            selected = random.sample(list(amenities.values()), num_amenities)
            apartment.amenities.set(selected)

            # Rules (random 2-5 per apartment)
            num_rules = random.randint(2, 5)
            selected_rules = random.sample(RULES_DATA, num_rules)
            for rule_text in selected_rules:
                ApartmentRule.objects.create(
                    apartment=apartment,
                    rule_text=rule_text,
                )

            # Availability (next 60 days, ~80% available) - collect for bulk create
            today = timezone.localdate()
            for day_offset in range(60):
                date = today + timezone.timedelta(days=day_offset)
                availability_bulk.append(
                    ApartmentAvailability(
                        apartment=apartment,
                        date=date,
                        is_available=random.random() < 0.8,
                    )
                )

            created_count += 1
            if (i + 1) % 10 == 0:
                self.stdout.write(f"  Created {created_count} apartments...")

        # Bulk create all availability records at once
        ApartmentAvailability.objects.bulk_create(availability_bulk, ignore_conflicts=True)
        self.stdout.write(f"  Bulk created {len(availability_bulk)} availability records")

        self.stdout.write(self.style.SUCCESS(
            f"\nDone! Created {created_count} apartments with amenities, pricing, addresses, rules, and availability."
        ))
