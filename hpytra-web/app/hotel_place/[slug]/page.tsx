import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Fragment } from "react";
import hotelPlaceStyles from "./hotel-place.module.css";
import { getGroupedLabels } from "@/app/lib/getGroupedLabels";
import { getIncludedPlaceSlugs } from "@/app/lib/getIncludedPlaceSlugs";
import { calcPageUpdatedAt } from "@/app/lib/calcPageUpdatedAt";
import {
  getPlaces,
  getLabelsForHotelPlacePage,
  getPlaceDetailsBySlug,
  getHotelsByPlace,
} from "@/app/lib/getDbData";
import labelGroups from "@/data/label-groups.json";
/*import DisplayKlook from "@/app/ui/DisplayKlook";*/
import DisplayKkdayClient from "@/app/ui/DisplayKkdayClient";

import dynamic from "next/dynamic";
const LabelFilterHotelList = dynamic(
  () => import("@/app/ui/LabelFilterHotelList")
);

export default async function HotelPlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { currentPlaceDetails, hotelsForPlace, places, pageUpdatedAt } =
    await loadHotelPlacePageAndMetadataData(slug);

  const currentPlace = places.find((place) => place.slug === slug);

  const parentPlace =
    places.find((place) => place.slug === currentPlace.parent_slug) || null;

  const labels = await getLabelsForHotelPlacePage();
  const labelsForPlace = getLabelsForHotels({ hotelsForPlace, labels });

  const updatedDate = new Date(pageUpdatedAt).toLocaleDateString("en-CA", {
    timeZone: "Asia/Taipei",
  });

  return (
    <>
      <section className="page__hero">
        <Image
          src={`/banner/banner-${slug}.jpg`}
          alt={`${slug} Banner`}
          quality={40}
          fill
          priority
          sizes="100vw"
        />
      </section>

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
          <span>{currentPlace.name}</span>
        </nav>

        <aside className="toc-sidebar">
          <h2 className="toc-sidebar-title">文章目錄</h2>
          <div className="toc-sidebar-content">
            <DisplayPlaceToc name={currentPlace.name} />
          </div>
        </aside>

        <article>
          <section
            id="place-introduction"
            className={hotelPlaceStyles["place-introduction"]}
          >
            <time dateTime={updatedDate}>更新時間：{updatedDate}</time>
            <h1>{currentPlaceDetails?.title}</h1>
            <hr className="section-divider-style1" />
            <DisplayContent content={currentPlaceDetails?.content ?? []} />
          </section>

          <nav className="toc" aria-label="文章目錄">
            <h2 className="toc-title">文章目錄：</h2>
            <DisplayPlaceToc name={currentPlace.name} />
          </nav>

          <section id="hotel-list">
            <h2>★ {currentPlace.name}住宿推薦清單</h2>
            <hr className="section-divider-style1" />
            <div className="section-map-search">
              <h3 id="map-search" className="text-center">
                <Link
                  href={`/map?place=${currentPlace.slug}`}
                  target="_blank"
                  className="btn btn-primary"
                  prefetch={false}
                >
                  地圖找房
                </Link>
              </h3>
            </div>

            {/*進階篩選 + Hotel List */}
            <LabelFilterHotelList
              hotelsForPlace={hotelsForPlace}
              labelsForPlace={labelsForPlace}
              places={places}
              labels={labels}
            />
          </section>

          <section id="place-featured">
            <h2>★ {currentPlace.name}住宿推薦精選</h2>
            <hr className="section-divider-style1" />
            <div className={hotelPlaceStyles["place-featured-content"]}>
              <DisplayPlaceFeatured
                currentPlace={currentPlace}
                hotelsForPlace={hotelsForPlace}
                labelsForPlace={labelsForPlace}
              />
            </div>
          </section>

          <section id="place-summary">
            <h2>★【統整】{currentPlace.name}住宿特色</h2>
            <hr className="section-divider-style1" />
            <DisplayPlaceSummaryTable
              currentPlace={currentPlace}
              hotelsForPlace={hotelsForPlace}
              labelsForPlace={labelsForPlace}
            />
          </section>

          <section id="place-discounts">
            <h2>★【優惠】住宿・景點門票・套票・交通</h2>
            <hr className="section-divider-style1" />
            <DisplayKkdayClient placeSlug={slug} pageSlug={slug} />
            {/*<DisplayKkday placeSlug={slug} pageSlug={slug} />*/}
            {/*<DisplayKlook placeSlug={slug} pageSlug={slug} />*/}
          </section>

          <section id="nearby-places">
            <h2>★ 附近景點住宿推薦</h2>
            <hr className="section-divider-style1" />
            <DisplayNearbyPlaces
              places={places}
              currentPlace={currentPlace}
              parentPlace={parentPlace}
            />
          </section>
        </article>
      </main>

      {/* JSON-LD 文章 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: currentPlaceDetails?.title,
            description: currentPlaceDetails?.seo_description,

            image: {
              "@type": "ImageObject",
              url: `https://hyptra.com/banner/banner-${slug}.jpg`,
              width: 1920,
              height: 640,
            },

            dateModified: new Date(pageUpdatedAt).toISOString(),

            articleSection: currentPlace.name,
            keywords: (currentPlaceDetails?.seo_keywords ?? []).join(", "),

            author: {
              "@type": "Organization",
              name: "幸福旅行站",
              url: "https://hyptra.com",
            },
            publisher: {
              "@type": "Organization",
              name: "幸福旅行站",
              url: "https://hyptra.com",
              logo: {
                "@type": "ImageObject",
                url: "https://hyptra.com/logo.png",
                width: 486,
                height: 486,
              },
            },

            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://hyptra.com/hotel_place/${slug}`,
            },

            url: `https://hyptra.com/hotel_place/${slug}`,
            genre: "旅遊住宿推薦",
            inLanguage: "zh-TW",
            about: {
              "@type": "Thing",
              name: currentPlace.name,
            },
          }),
        }}
      />

      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "首頁",
                item: "https://hyptra.com/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "旅遊住宿推薦",
                item: "https://hyptra.com/hotel_place",
              },
              ...(parentPlace
                ? [
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: parentPlace.name,
                      item: `https://hyptra.com/hotel_place/${parentPlace.slug}`,
                    },
                    {
                      "@type": "ListItem",
                      position: 4,
                      name: currentPlace.name,
                      item: `https://hyptra.com/hotel_place/${currentPlace.slug}`,
                    },
                  ]
                : [
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: currentPlace.name,
                      item: `https://hyptra.com/hotel_place/${currentPlace.slug}`,
                    },
                  ]),
            ],
          }),
        }}
      />

      {/* JSON-LD 評分 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CreativeWorkSeries",
            name: currentPlaceDetails?.title,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.9",
              bestRating: "5",
              ratingCount: "5296",
            },
            author: {
              "@type": "Organization",
              name: "幸福旅行站",
              url: "https://hyptra.com",
            },
          }),
        }}
      />
    </>
  );
}

/*----- 載入頁面與 Metadata 所需的資料 -----*/
async function loadHotelPlacePageAndMetadataData(placeSlug) {
  const places = await getPlaces();

  /*----- 取得 Place + 子 Places -----*/
  const includedPlaceSlugs = getIncludedPlaceSlugs(places, placeSlug);
  const [currentPlaceDetails, hotelsForPlace] = await Promise.all([
    getPlaceDetailsBySlug(placeSlug),
    getHotelsByPlace(includedPlaceSlugs),
  ]);

  const pageUpdatedAt = calcPageUpdatedAt(currentPlaceDetails, hotelsForPlace);

  return {
    currentPlaceDetails,
    hotelsForPlace,
    places,
    pageUpdatedAt,
  };
}

/*----- 文章內容 Data Type -----*/
type ContentBlock =
  | {
      type: "intro";
      text: string[];
    }
  | {
      type: "section";
      title?: string;
      link?: string;
      intro?: string;
      entries: {
        title: string;
        text: string;
      }[];
    }
  | {
      type: "note";
      text: string;
    };

type ContentProps = {
  content: ContentBlock[];
};

/*----- Render 文章內容 -----*/
function DisplayContent({ content }: ContentProps) {
  return (
    <>
      {content.map((block, idx) => {
        switch (block.type) {
          case "intro":
            return (
              <Fragment key={idx}>
                {block.text.map((text, i) => (
                  <p key={i}>{text}</p>
                ))}
              </Fragment>
            );

          case "section":
            return (
              <div
                key={idx}
                className={hotelPlaceStyles["place-introduction-section"]}
              >
                {block.title && (
                  <h2>
                    {block.link ? (
                      <a href={block.link}>★{block.title}</a>
                    ) : (
                      <>★{block.title}</>
                    )}
                  </h2>
                )}
                {block.intro && <p>{block.intro}</p>}
                {block.entries.length > 0 && (
                  <>
                    {block.entries.map((entry, i) => (
                      <div
                        key={i}
                        className={hotelPlaceStyles["place-introduction-entry"]}
                      >
                        <h3>◆ {entry.title}</h3>
                        <p>{entry.text}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            );

          case "note":
            return <p key={idx}>※{block.text}</p>;

          default:
            return null;
        }
      })}
    </>
  );
}
/*----- Render 文章目錄 -----*/
function DisplayPlaceToc({ name }) {
  return (
    <ol className="toc-list">
      <li>
        <Link href="#place-introduction">{name}住宿介紹</Link>
      </li>
      <li>
        <Link href="#hotel-list">{name}住宿推薦清單</Link>
        <ul className="toc-sublist">
          <li>
            <Link href="#map-search">地圖找房</Link>
          </li>
          <li>
            <Link href="#hotel-filter">進階篩選</Link>
          </li>
        </ul>
      </li>
      <li>
        <Link href="#place-featured">{name}住宿推薦精選</Link>
      </li>
      <li>
        <Link href="#place-summary">【統整】{name}住宿特色</Link>
      </li>
      <li>
        <Link href="#place-discounts">【優惠】住宿・景點門票・套票・交通</Link>
      </li>
      <li>
        <Link href="#nearby-places">附近景點住宿</Link>
      </li>
    </ol>
  );
}

/*----- 取得所有 Hotels 有使用到的 Labels（去除重複） -----*/
function getLabelsForHotels({ hotelsForPlace, labels }) {
  const allLabels = hotelsForPlace.flatMap((hotel) => hotel.labels);

  const uniqueLabels = [...new Set(allLabels)];

  const sortedLabelObjects = uniqueLabels
    .map((slug) => labels.find((label) => label.slug === slug))
    .filter(Boolean)
    .toSorted((a, b) => a.order_index - b.order_index);

  return sortedLabelObjects;
}

/*----- Render 住宿推薦精選 -----*/
function DisplayPlaceFeatured({
  currentPlace,
  hotelsForPlace,
  labelsForPlace,
}) {
  const featuredLabels = labelsForPlace.filter(
    (label) => label.featured === true
  );
  const groupedLabels = getGroupedLabels(featuredLabels);

  /* 平價住宿篩選 */
  const lowPriceHotels = hotelsForPlace
    .filter((hotel) => hotel.price_quad_room < 6000)
    .toSorted((a, b) => a.price_quad_room - b.price_quad_room)
    .slice(0, 10);

  return (
    <>
      {Object.entries(groupedLabels).map(([category, categoryLabels]) => {
        if (categoryLabels.length === 0) return null;
        return (
          <Fragment key={category}>
            <h3 key={category}>{`◎ ${labelGroups[category]}：`}</h3>
            {categoryLabels.map((label) => {
              const hotelsForPlaceIncludeLabel = hotelsForPlace.filter(
                (hotel) => hotel.labels.includes(label.slug)
              );
              return (
                <Fragment key={label.slug}>
                  <h4>
                    ◆ {label.featured_prefix ? currentPlace.name : ""}「
                    {label.name}」{label.featured_suffix}
                  </h4>
                  <p>{label.description}</p>
                  <p>
                    推薦{label.name}
                    {label.featured_suffix}：
                    <HotelLinkList hotels={hotelsForPlaceIncludeLabel} />
                  </p>
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
      <h3>{`◎ ${currentPlace.name}「平價」住宿：`}</h3>
      <p>平價住宿提供經濟實惠的選擇，讓您在舒適的環境中，享受高CP值的住宿。</p>
      <p>
        推薦平價住宿：
        <HotelLinkList hotels={lowPriceHotels} />
      </p>
    </>
  );
}

/*----- Render Hotel 連結 List -----*/
function HotelLinkList({ hotels }) {
  return hotels.map((hotel, idx) => (
    <Fragment key={hotel.slug}>
      {idx > 0 && "、"}
      <Link href={`/hotels/${hotel.slug}`} prefetch={false}>
        {hotel.name}
      </Link>
    </Fragment>
  ));
}

/*----- Render 住宿特色統整 -----*/
function DisplayPlaceSummaryTable({
  currentPlace,
  hotelsForPlace,
  labelsForPlace,
}) {
  return (
    <table className={hotelPlaceStyles["place-summary-table"]}>
      <caption className="hidden">{currentPlace.name}住宿特色統整</caption>
      <thead>
        <tr>
          <th>住宿特色</th>
          <th>{currentPlace.name}住宿</th>
        </tr>
      </thead>
      <tbody>
        {labelsForPlace.map((label) => {
          const hotelsForPlaceIncludeLabel = hotelsForPlace.filter((hotel) =>
            hotel.labels.includes(label.slug)
          );

          return (
            <tr key={label.slug}>
              <td>{label.name}</td>
              <td>
                <HotelLinkList hotels={hotelsForPlaceIncludeLabel} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/*----- Render 附近景點住宿推薦 -----*/
function DisplayNearbyPlaces({ places, currentPlace, parentPlace }) {
  let nearbyPlaces: typeof places = [];

  if (parentPlace) {
    /* Place 為「子層 Place」： 顯示「同縣市其他 Places」 + 「縣市層級 Place」*/
    const siblingPlaces = places.filter(
      (place) =>
        place.parent_slug === currentPlace.parent_slug &&
        place.slug !== currentPlace.slug
    );
    nearbyPlaces = [...siblingPlaces, parentPlace];
  } else {
    /* Place 為「縣市層級 Place」： 顯示「子 Places」*/
    nearbyPlaces = places.filter(
      (place) => place.parent_slug === currentPlace.slug
    );
  }

  return (
    <div className="grid-primary">
      {nearbyPlaces.map((place) => (
        <PlaceItem key={place.slug} place={place} />
      ))}
    </div>
  );
}

function PlaceItem({ place }) {
  return (
    <div className={hotelPlaceStyles["place-item"]}>
      <div className={hotelPlaceStyles["place-item-photo"]}>
        <Link
          href={`/hotel_place/${place.slug}`}
          target="_blank"
          className={hotelPlaceStyles["place-item-photo-link"]}
          prefetch={false}
        >
          <Image
            src={`/banner/banner-${place.slug}.jpg`}
            alt={place.name}
            quality={20}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </Link>
      </div>

      <h3>
        <Link
          href={`/hotel_place/${place.slug}`}
          target="_blank"
          prefetch={false}
        >
          【{place.name}住宿推薦】
        </Link>
      </h3>
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

  const { currentPlaceDetails, pageUpdatedAt } =
    await loadHotelPlacePageAndMetadataData(slug);

  if (!currentPlaceDetails) {
    return;
  }

  return {
    title: currentPlaceDetails.title,
    description: currentPlaceDetails.seo_description,
    keywords: currentPlaceDetails.seo_keywords,

    openGraph: {
      title: currentPlaceDetails.title,
      description: currentPlaceDetails.seo_description,
      images: [
        {
          url: `/banner/banner-${slug}.jpg`,
          width: 1920,
          height: 640,
          alt: "幸福旅行站 - 親子家庭度假去",
        },
      ],
      modifiedTime: new Date(pageUpdatedAt).toISOString(),
    },
  };
}
