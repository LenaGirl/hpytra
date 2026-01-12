import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import HotelList from "@/app/ui/HotelList";
import { calcPageUpdatedAt } from "@/app/lib/calcPageUpdatedAt";
import {
  getLabels,
  getLabelBySlug,
  getPlaces,
  getHotelsByLabel,
} from "@/app/lib/getDbData";
import DisplayKkdayClient from "@/app/ui/DisplayKkdayClient";

export default async function HotelLabelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { currentLabel, hotelsForLabel, currentYear, pageUpdatedAt } =
    await loadHotelLabelPageAndMetadataData(slug);

  const [labels, places] = await Promise.all([getLabels(), getPlaces()]);

  const updatedDate = new Date(pageUpdatedAt).toLocaleDateString("en-CA", {
    timeZone: "Asia/Taipei",
  });

  return (
    <>
      <section className="page__hero">
        <Image
          src={`/banner/banner-hpytra.jpg`}
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
          {" > "}
          <span>{currentLabel.name}</span>
        </nav>
        <article>
          <section className="introduction">
            <time dateTime={updatedDate}>更新時間：{updatedDate}</time>
            <h1>
              【{currentYear}
              {currentLabel.name}】住宿推薦
            </h1>
            <hr className="section-divider-style1" />
            <p>{currentLabel.description}</p>
          </section>
          <section>
            <h2>★{currentLabel.name}住宿推薦清單</h2>
            <hr className="section-divider-style1" />
            <HotelList
              filteredHotels={hotelsForLabel}
              places={places}
              labels={labels}
            />
          </section>
          <section>
            <h2>★【優惠】住宿・景點門票・套票・交通</h2>
            <hr className="section-divider-style1" />
            <DisplayKkdayClient placeSlug="taiwan" pageSlug={slug} />
          </section>
        </article>
      </main>

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
              {
                "@type": "ListItem",
                position: 3,
                name: currentLabel.name,
                item: `https://hyptra.com/hotel_label/${slug}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}

/*----- 載入頁面與 Metadata 所需的資料 -----*/
async function loadHotelLabelPageAndMetadataData(labelSlug) {
  const [currentLabel, hotelsForLabel] = await Promise.all([
    getLabelBySlug(labelSlug),
    getHotelsByLabel(labelSlug),
  ]);

  const currentYear = new Date().getFullYear();

  const pageUpdatedAt = calcPageUpdatedAt(currentLabel, hotelsForLabel);

  return {
    currentLabel,
    hotelsForLabel,
    currentYear,
    pageUpdatedAt,
  };
}

/*----- Metadata -----*/
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { currentLabel, currentYear, pageUpdatedAt } =
    await loadHotelLabelPageAndMetadataData(slug);

  return {
    title: `【${currentYear}${currentLabel.name}】住宿推薦`,
    description: currentLabel.description,
    keywords: [`${currentLabel.name}住宿`, `${currentLabel.name}住宿推薦`],
    openGraph: {
      title: `【${currentYear}${currentLabel.name}】住宿推薦`,
      description: currentLabel.description,
      modifiedTime: new Date(pageUpdatedAt).toISOString(),
    },
  };
}
