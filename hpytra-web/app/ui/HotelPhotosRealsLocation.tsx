"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import HotelPhotos from "@/app/ui/HotelPhotos";
import hotelPhotosRealsLocationStyles from "./hotelPhotosRealsLocation.module.css";

export default function HotelPhotosRealsLocation({ hotel }) {
  /*--- 由別的頁面進入後， Scroll 到指定的 Section ---*/
  const searchParams = useSearchParams();

  const photosRef = useRef(null);
  const realsRef = useRef(null);
  const locationRef = useRef(null);

  useEffect(() => {
    const target = searchParams.get("scroll");
    if (!target) return;

    const anchor = {
      photos: photosRef,
      reals: realsRef,
      location: locationRef,
    };

    const timer = setTimeout(() => {
      anchor[target]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <>
      {/* 照片 */}
      <section
        className={`${hotelPhotosRealsLocationStyles["hotel-photos"]} text-center`}
        id="hotel-photos"
        ref={photosRef}
        data-scroll
      >
        <h2>☆ 照片</h2>
        <hr className="section-divider-style2" />
        <HotelPhotos hotel={hotel} />
      </section>

      {/* 實景 */}
      {hotel.real_1 && (
        <section
          className={`${hotelPhotosRealsLocationStyles["hotel-reals"]} text-center`}
          id="hotel-reals"
          ref={realsRef}
          data-scroll
        >
          <h2>☆ 實景</h2>
          <hr className="section-divider-style2" />
          {[...Array(6)].map((_, idx) => {
            const realKey = `real_${idx + 1}`;
            const realUrl = hotel[realKey];

            if (!realUrl) return null;

            return (
              <iframe
                key={realKey}
                src={realUrl}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allow="accelerometer;"
                title={`${hotel.name}實景`}
              ></iframe>
            );
          })}
        </section>
      )}

      {/* 位置 */}
      <section
        className={`${hotelPhotosRealsLocationStyles["hotel-location"]} text-center`}
        id="hotel-location"
        ref={locationRef}
        data-scroll
      >
        <h2>☆ 位置</h2>
        <hr className="section-divider-style2" />
        <iframe
          src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY}&q=${hotel.name}`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${hotel.name}位置`}
        ></iframe>
      </section>
    </>
  );
}
