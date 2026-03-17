import factory
from decimal import Decimal

from accommodations.models import Place, PlaceDetail, Label, Hotel


class PlaceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Place

    name = factory.Sequence(lambda n: f"Place {n}")
    slug = factory.Sequence(lambda n: f"place-{n}")
    parent_slug = None
    order_index = factory.Sequence(int)
    is_active = True


class PlaceDetailFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PlaceDetail

    place = factory.SubFactory(PlaceFactory)
    title = factory.Faker("sentence", nb_words=4)
    content = factory.LazyFunction(
        lambda: [{"type": "intro", "text": ["test content"]}]
    )
    is_active = True


class LabelFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Label

    name = factory.Sequence(lambda n: f"Label {n}")
    slug = factory.Sequence(lambda n: f"label-{n}")
    category = "facility"
    order_index = factory.Sequence(int)
    is_active = True


class HotelFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Hotel

    name = factory.Sequence(lambda n: f"Hotel {n}")
    slug = factory.Sequence(lambda n: f"hotel-{n}")
    place = factory.SubFactory(PlaceFactory)
    order_index = factory.Sequence(int)

    address = factory.Sequence(lambda n: f"臺北市大安區測試路{n}號")
    phone = "02-12345678"
    website = factory.Sequence(lambda n: f"https://example{n}.com")
    labels = factory.LazyFunction(list)

    coordinates_lat = Decimal("25.033000")
    coordinates_lng = Decimal("121.565400")
    google_rating = Decimal("4.5")

    price_double_room = 3000
    price_quad_room = 4800

    agoda_slug = factory.Sequence(lambda n: f"123{n}")

    photo_main = "https://example.com/main.jpg"
    photo_1 = "https://example.com/photo_1.jpg"
    photo_2 = "https://example.com/photo_2.jpg"

    is_active = True
