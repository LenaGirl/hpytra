import Link from "next/link";
import Image from "next/image";
import { Fragment } from "react";
import HotelItem from "@/app/ui/HotelItem";
import Tabs from "@/app/ui/Tabs";
import { getPlaces, getLabels, getHotels } from "@/app/lib/getDbData";

export default async function HomePage() {
  const [places, labels, hotels] = await Promise.all([
    getPlaces(),
    getLabels(),
    getHotels(),
  ]);

  return (
    <>
      <section className="homepage__hero">
        <Image
          src="/banner/banner-homepage.jpg"
          alt="幸福旅行站"
          quality={40}
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-overlay" />
        <div className="homepage__hero-content">
          <h1>台灣各地優質住宿推薦</h1>
          <p>生活再忙，也別忘了和家人一同旅遊，創造屬於你們的幸福回憶！</p>
          <p>我們精選適合親子同行的旅宿，</p>
          <p>讓每一次出發，都更貼近家的感覺。</p>
          <p>現在，就是展開幸福旅程的最佳時刻！</p>
        </div>
      </section>
      <main>
        <section>
          <h2 className="text-center">★ 人氣地點住宿</h2>
          <hr className="section-divider-style3" />
          <Tabs
            tabs={[
              {
                tabName: "北部（北北基桃竹）",
                content: <PopularPlace place="tamsui" />,
              },
              {
                tabName: "中部（苗中彰投雲）",
                content: (
                  <>
                    <PopularPlace place="taichung" />
                    <PopularPlace place="miaoli" />
                    <PopularPlace place="sunmoonlake" />
                    <PopularPlace place="cingjing" />
                    <PopularPlace place="xitou" />
                    <PopularPlace place="changhua" />
                  </>
                ),
              },
              {
                tabName: "南部（嘉南高屏）",
                content: (
                  <>
                    <PopularPlace place="kaohsiung" />
                    <PopularPlace place="aniping" />
                  </>
                ),
              },
              {
                tabName: "東部（宜花東）",
                content: (
                  <>
                    <PopularPlace place="yilan" />
                    <PopularPlace place="jiaoxi" />
                    <PopularPlace place="luodong" />
                    <PopularPlace place="yilan-other" />
                    <PopularPlace place="toucheng" />
                    <PopularPlace place="suao" />
                  </>
                ),
              },
            ]}
            defaultActive={1}
          />
        </section>
        <section className="homepage__region-group text-center">
          <h2>★ 依地區找住宿</h2>
          <hr className="section-divider-style3" />
          <DisplayPlaceRegions places={places} />
        </section>
        <section>
          <h2 className="text-center">★ 精選好評住宿</h2>
          <hr className="section-divider-style3" />
          <DisplayTopHotels places={places} labels={labels} hotels={hotels} />
        </section>
      </main>
    </>
  );
}

/*----- 人氣地點住宿 Tab Item -----*/
function PopularPlace({ place }) {
  return (
    <div className="tabs-content-item">
      <Link
        href={`/hotel_place/${place}`}
        className="tabs-content-item-link"
        prefetch={false}
      >
        <Image
          src={`/banner/banner-${place}.jpg`}
          alt={place}
          quality={30}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </Link>
    </div>
  );
}

/*----- 依地區找住宿 -----*/
function DisplayPlaceRegions({ places }) {
  const regionTitles = {
    north: "北部",
    central: "中部",
    south: "南部",
    east: "東部",
  };

  const regions = {
    north: [],
    central: [],
    south: [],
    east: [],
  };

  /* 「縣市層級 Places」 */
  const parentPlaces = places.filter((place) => !place.parent_slug);

  /* 將「縣市層級 Places」 歸類到 「Regions (北中南東部)」 */
  parentPlaces.forEach((place) => {
    const regionName = getRegionName(place.order_index);
    if (regions[regionName]) {
      regions[regionName].push(place);
    }
  });

  return (
    <>
      {/* Render 各 Region 內容*/}
      {Object.entries(regions).map(([region, regionParentPlaces]) => {
        if (regionParentPlaces.length === 0) return null;
        return (
          <Fragment key={region}>
            <h3>☆ {regionTitles[region]}</h3>
            <DisplayPlacesAndChildren
              places={places}
              parentPlaces={regionParentPlaces}
            />
          </Fragment>
        );
      })}
    </>
  );
}
function getRegionName(order) {
  if (order >= 100 && order < 200) return "north";
  if (order >= 200 && order < 300) return "central";
  if (order >= 300 && order < 400) return "south";
  if (order >= 400 && order < 500) return "east";
  return "other";
}
function DisplayPlacesAndChildren({ places, parentPlaces }) {
  {
    /* Render 各「縣市層級 Places」 及「子 Places」 */
  }
  return parentPlaces.map((parentPlace) => {
    const children = places.filter(
      (child) => child.parent_slug === parentPlace.slug
    );
    return (
      <div key={parentPlace.slug} className="homepage__places-row">
        <PlaceButton slug={parentPlace.slug}>{parentPlace.name}</PlaceButton>
        {children.map((child) => (
          <PlaceButton key={child.slug} slug={child.slug}>
            {child.name}
          </PlaceButton>
        ))}
      </div>
    );
  });
}
function PlaceButton({ slug, children }) {
  return (
    <Link
      className="btn btn-primary"
      href={`/hotel_place/${slug}/`}
      prefetch={false}
    >
      {children}
    </Link>
  );
}

/*----- 精選好評住宿 -----*/
function DisplayTopHotels({ places, labels, hotels }) {
  const topHotels = hotels
    .filter((hotel) => hotel.show_on_homepage === true)
    .toSorted(() => Math.random() - 0.5)
    .slice(0, 12);

  return (
    <div className="grid-primary">
      {topHotels.map((hotel) => (
        <HotelItem
          key={hotel.slug}
          hotel={hotel}
          displayPlace={true}
          places={places}
          labels={labels}
        />
      ))}
    </div>
  );
}
