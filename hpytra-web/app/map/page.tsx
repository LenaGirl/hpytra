import Image from "next/image";
import { Suspense } from "react";
import type { Metadata } from "next";
import MapSearchView from "@/app/ui/MapSearchView";
import { fetchPlacesMap, fetchLabelsLite } from "@/app/lib/api";

export default async function MapPage() {
  let placesAndMapCenters = [];
  let labels = [];

  try {
    [placesAndMapCenters, labels] = await Promise.all([
      fetchPlacesMap(),
      fetchLabelsLite(),
    ]);
  } catch (err) {
    console.error("map page fetch failed", err);
  }

  return (
    <>
      <section className="page__hero">
        <Image
          src="/banner/banner-map.jpg"
          alt="地圖找房Banner"
          className="page__hero-image"
          quality={40}
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-overlay" />
        <div className="page__hero-content">
          <h1>地 圖 找 房</h1>
        </div>
      </section>

      <main>
        <Suspense fallback={<div>Loading map...</div>}>
          <MapSearchView
            placesAndMapCenters={placesAndMapCenters}
            labels={labels}
          />
        </Suspense>
      </main>
    </>
  );
}

export const metadata: Metadata = {
  title: "地圖找房",
};
