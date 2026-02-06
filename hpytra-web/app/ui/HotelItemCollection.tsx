"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import HotelItem from "@/app/ui/HotelItem";
import { useAuthStore } from "@/app/lib/authStore";
import { getFavoriteStatusByHotels } from "@/app/lib/favorites";

export default function HotelItemCollection({
  hotels,
  displayPlace,
  places,
  labels,
}) {
  const { isAuthenticated } = useAuthStore();
  const [favoriteHotelSlugs, setFavoriteHotelSlugs] = useState<string[]>([]);
  const fetchedRef = useRef(false);

  const hotelItemSlugs = hotels.map((hotel) => hotel.slug);

  useEffect(() => {
    if (!isAuthenticated) return;

    if (fetchedRef.current) return; // 防止重複呼叫

    fetchedRef.current = true;

    const fetchFavorites = async () => {
      try {
        const hotelSlugs = await getFavoriteStatusByHotels(hotelItemSlugs);
        setFavoriteHotelSlugs(hotelSlugs);
      } catch (err) {
        setFavoriteHotelSlugs([]);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, hotelItemSlugs]);

  /* 紀錄目前 URL */
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const redirectPath =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  return (
    <>
      {hotels.map((hotel) => (
        <HotelItem
          key={hotel.slug}
          hotel={hotel}
          displayPlace={displayPlace}
          places={places}
          labels={labels}
          isMember={isAuthenticated}
          initialIsFavorited={favoriteHotelSlugs.includes(hotel.slug)}
          redirectPath={redirectPath}
        />
      ))}
    </>
  );
}
