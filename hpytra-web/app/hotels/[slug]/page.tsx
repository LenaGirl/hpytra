import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import hotelsStyles from "./hotels.module.css";
import HotelStats from "@/app/ui/HotelStats";
import AffiliateLinks from "@/app/ui/AffiliateLinks";
import HotelPhotosRealsLocation from "@/app/ui/HotelPhotosRealsLocation";
import HotelItemCollection from "@/app/ui/HotelItemCollection";
import HotelFavorite from "@/app/ui/HotelFavorite";
import DisplayKkdayClient from "@/app/ui/DisplayKkdayClient";
import DisplayKlookClient from "@/app/ui/DisplayKlookClient";
import {
  fetchPlacesLite,
  fetchLabelsLite,
  fetchHotelDetail,
  fetchNearbyHotels,
} from "@/app/lib/api";

export default async function HotelsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lowerSlug = slug.toLowerCase();

  /* 網址包含大寫字母 -> 跳轉到全小寫網址 */
  if (slug !== lowerSlug) {
    redirect(`/hotels/${lowerSlug}`);
  }

  const currentHotel = await fetchHotelDetail(lowerSlug); // 404 則 notFound

  const [places, labels, nearbyHotels] = await Promise.all([
    fetchPlacesLite(),
    fetchLabelsLite(),
    fetchNearbyHotels(lowerSlug),
  ]);

  const currentPlace = places.find(
    (place) => place.slug === currentHotel.place,
  );
  const parentPlace = places.find(
    (place) => place.slug === currentPlace.parent_slug,
  );

  const updatedDate = new Date(currentHotel.updated_at).toLocaleDateString(
    "en-CA",
    { timeZone: "Asia/Taipei" },
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
            <HotelFavorite slug={lowerSlug} />

            <div className={hotelsStyles["hotel-photo-main"]}>
              <img src={currentHotel.photos[0]} alt={currentHotel.name} />
            </div>

            <div className={hotelsStyles["hotel-info"]}>
              <h1>{currentHotel.name}</h1>
              <ul className={hotelsStyles["hotel-info-list"]}>
                <HotelStats
                  hotel={currentHotel}
                  labels={labels}
                  clickLoc={`${currentHotel.place}_${lowerSlug}_hotel-info-ref-price`}
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
                    clickLoc={`${currentHotel.place}_${lowerSlug}_hotel-info`}
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
                clickLoc={`${currentHotel.place}_${lowerSlug}_hotel-affiliate-links`}
                styleType={"rectangle"}
              />
            </div>
          </section>

          <section id="hotel-discounts">
            <h2>★【優惠】住宿・景點門票・套票・交通</h2>
            <hr className="section-divider-style1" />
            <DisplayKkdayClient
              placeSlug={currentHotel.place}
              pageSlug={lowerSlug}
            />
            <DisplayKlookClient
              placeSlug={currentHotel.place}
              pageSlug={lowerSlug}
            />
          </section>

          <section id="hotel-nearby-hotels">
            <h2>★ 附近住宿推薦</h2>
            <hr className="section-divider-style1" />
            <div className="grid-primary">
              <HotelItemCollection
                hotels={nearbyHotels}
                displayPlace={false}
                places={places}
                labels={labels}
              />
            </div>
          </section>
        </article>
      </main>

      <div className={hotelsStyles["hotel-affiliate-links-float"]}>
        <AffiliateLinks
          hotel={currentHotel}
          clickLoc={`${currentHotel.place}_${lowerSlug}_hotel-affiliate-links-float`}
          styleType={"circle"}
        />
      </div>
    </>
  );
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
      {currentHotel.reals[0] && (
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

/*----- Metadata -----*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const lowerSlug = slug.toLowerCase();
  const currentHotel = await fetchHotelDetail(lowerSlug);

  const [places, labels] = await Promise.all([
    fetchPlacesLite(),
    fetchLabelsLite(),
  ]);
  const currentPlace = places.find(
    (place) => place.slug === currentHotel.place,
  );

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
    alternates: {
      canonical: `/hotels/${lowerSlug}`,
    },

    openGraph: {
      title: currentHotel.name,
      description: hotelDescription,
      url: `/hotels/${lowerSlug}`,
      modifiedTime: new Date(currentHotel.updated_at).toISOString(),
    },
  };
}
