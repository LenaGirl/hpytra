import Link from "next/link";
import type { Metadata } from "next";
import hotelsStyles from "./hotels.module.css";
import HotelStats from "@/app/ui/HotelStats";
import AffiliateLinks from "@/app/ui/AffiliateLinks";
import HotelPhotosRealsLocation from "@/app/ui/HotelPhotosRealsLocation";
import HotelItem from "@/app/ui/HotelItem";
import {
  getPlaces,
  getLabels,
  getHotelBySlug,
  getHotelsByPlace,
} from "@/app/lib/getDbData";
import DisplayKkdayClient from "@/app/ui/DisplayKkdayClient";
import DisplayKlookClient from "@/app/ui/DisplayKlookClient";

export default async function HotelsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { currentHotel, places, labels, currentPlace, parentPlace } =
    await loadHotelsPageAndMetadataData(slug);

  const hotelsByPlace = await getHotelsByPlace([currentHotel.place_slug]);

  const updatedDate = new Date(currentHotel.updated_at).toLocaleDateString(
    "en-CA",
    { timeZone: "Asia/Taipei" }
  );

  return (
    <>
      <main>
        <nav className="breadcrumb">
          <Link href="/" prefetch={false}>
            首頁
          </Link>
          {" > "}
          旅遊住宿推薦
          {parentPlace && (
            <>
              {" > "}
              <Link href={`/hotel_place/${parentPlace.slug}`} prefetch={false}>
                {parentPlace.name}
              </Link>
            </>
          )}
          {" > "}
          <Link href={`/hotel_place/${currentPlace.slug}`} prefetch={false}>
            {currentPlace.name}
          </Link>
          {" > "}
          <span>{currentHotel.name}</span>
        </nav>

        <aside className="toc-sidebar">
          <h2 className="toc-sidebar-title">目錄</h2>
          <div className="toc-sidebar-content">
            <DisplayHotelToc currentHotel={currentHotel} />
          </div>
        </aside>

        <article>
          <time dateTime={updatedDate}>更新時間：{updatedDate}</time>

          <section className={hotelsStyles["hotel-content"]} id="hotel-content">
            <div className={hotelsStyles["hotel-photo-main"]}>
              <img src={currentHotel.photo_1} alt={currentHotel.name} />
            </div>

            <div className={hotelsStyles["hotel-info"]}>
              <h1>{currentHotel.name}</h1>
              <ul className={hotelsStyles["hotel-info-list"]}>
                <HotelStats
                  hotel={currentHotel}
                  labels={labels}
                  clickLoc={`${currentHotel.place_slug}_${currentHotel.slug}_hotel-info-ref-price`}
                />
                <li>
                  <span className="text-strong">地址：</span>
                  {currentHotel.address}
                </li>
                <li>
                  <span className="text-strong">電話：</span>
                  {currentHotel.phone}
                </li>
                {currentHotel.website && (
                  <li>
                    <Link
                      href={currentHotel.website}
                      target="_blank"
                      prefetch={false}
                    >
                      <span className="text-strong">官方網站連結</span>
                    </Link>
                  </li>
                )}
                <li>
                  <span className="text-strong">訂房連結：</span>
                  <AffiliateLinks
                    hotel={currentHotel}
                    clickLoc={`${currentHotel.place_slug}_${currentHotel.slug}_hotel-info`}
                    styleType={"text"}
                  />
                </li>
              </ul>
            </div>
          </section>

          {/* 照片、實景、位置 Section */}
          <HotelPhotosRealsLocation hotel={currentHotel} />

          <section
            className={`${hotelsStyles["hotel-affiliate-links"]} text-center`}
            id="hotel-affiliate-links"
          >
            <h2>☆ 訂房連結</h2>
            <hr className="section-divider-style2" />
            <div className={hotelsStyles["hotel-affiliate-links-box"]}>
              <AffiliateLinks
                hotel={currentHotel}
                clickLoc={`${currentHotel.place_slug}_${currentHotel.slug}_hotel-affiliate-links`}
                styleType={"rectangle"}
              />
            </div>
          </section>

          <section id="hotel-discounts">
            <h2>★【優惠】住宿・景點門票・套票・交通</h2>
            <hr className="section-divider-style1" />
            <DisplayKkdayClient
              placeSlug={currentHotel.place_slug}
              pageSlug={slug}
            />
            <DisplayKlookClient
              placeSlug={currentHotel.place_slug}
              pageSlug={slug}
            />
          </section>

          <section id="hotel-nearby-hotels">
            <h2>★ 附近住宿推薦</h2>
            <hr className="section-divider-style1" />
            <DisplayNearbyHotels
              currentHotel={currentHotel}
              places={places}
              labels={labels}
              hotelsByPlace={hotelsByPlace}
            />
          </section>
        </article>
      </main>

      <div className={hotelsStyles["hotel-affiliate-links-float"]}>
        <AffiliateLinks
          hotel={currentHotel}
          clickLoc={`${currentHotel.place_slug}_${currentHotel.slug}_hotel-affiliate-links-float`}
          styleType={"circle"}
        />
      </div>
    </>
  );
}

/*----- 載入頁面與 Metadata 所需的資料 -----*/
async function loadHotelsPageAndMetadataData(hotelSlug) {
  const currentHotel = await getHotelBySlug(hotelSlug);

  const [places, labels] = await Promise.all([getPlaces(), getLabels()]);

  const currentPlace = places.find(
    (place) => place.slug === currentHotel.place_slug
  );
  const parentPlace = places.find(
    (place) => place.slug === currentPlace.parent_slug
  );

  return {
    currentHotel,
    places,
    labels,
    currentPlace,
    parentPlace,
  };
}

/*----- Render 目錄 -----*/
function DisplayHotelToc({ currentHotel }) {
  return (
    <ol className="toc-list">
      <li>
        <Link href="#hotel-content">住宿資訊</Link>
      </li>
      <li>
        <Link href="#hotel-photos">照片</Link>
      </li>
      {currentHotel.real_1 && (
        <li>
          <Link href="#hotel-reals">實景</Link>
        </li>
      )}
      <li>
        <Link href="#hotel-location">位置</Link>
      </li>
      <li>
        <Link href="#hotel-affiliate-links">訂房連結</Link>
      </li>
      <li>
        <Link href="#hotel-discounts">【優惠】住宿・景點門票・套票・交通</Link>
      </li>
      <li>
        <Link href="#hotel-nearby-hotels">附近住宿推薦</Link>
      </li>
    </ol>
  );
}

/*----- Render 附近住宿推薦 -----*/
function DisplayNearbyHotels({ currentHotel, places, labels, hotelsByPlace }) {
  const currentHotelIndex = hotelsByPlace.findIndex(
    (hotel) => hotel.slug === currentHotel.slug
  );

  /* 在 Current Hotel 的前後各5個 Hotels 裡，隨機取 3 個 Hotels */
  const rangeStart = Math.max(0, currentHotelIndex - 5);
  const rangeEnd = Math.min(hotelsByPlace.length - 1, currentHotelIndex + 5);
  const rangeHotels = hotelsByPlace
    .slice(rangeStart, rangeEnd + 1)
    .filter((hotel) => hotel.slug !== currentHotel.slug);
  const nearbyHotels = rangeHotels
    .toSorted(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <div className="grid-primary">
      {nearbyHotels.map((hotel) => (
        <HotelItem
          key={hotel.slug}
          hotel={hotel}
          displayPlace={false}
          places={places}
          labels={labels}
        />
      ))}
    </div>
  );
}

/*----- Metadata -----*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { currentHotel, currentPlace, labels } =
    await loadHotelsPageAndMetadataData(slug);

  const labelNames: string[] =
    currentHotel.labels
      ?.map((labelSlug) => {
        const matchedLabel = labels.find((label) => label.slug === labelSlug);
        return matchedLabel?.name;
      })
      .filter(Boolean) ?? [];
  const labelText = labelNames.join("、");

  const hotelDescription = `${currentHotel.name}位於${currentPlace.name}，是一間高CP值的優質住宿選擇，不論是親子出遊或輕旅行都相當合適，是規劃${currentPlace.name}住宿時值得細細品味的理想選擇。住宿特色：${labelText}`;

  return {
    title: currentHotel.name,
    description: hotelDescription,
    keywords: [currentHotel.name, ...labelNames],
    openGraph: {
      title: currentHotel.name,
      description: hotelDescription,
      modifiedTime: new Date(currentHotel.updated_at).toISOString(),
    },
  };
}
