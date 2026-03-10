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
  openInNewTab = false,
}) {
  const { isAuthenticated } = useAuthStore();
  const [favoriteHotelSlugs, setFavoriteHotelSlugs] = useState<string[]>([]);

  const hotelItemSlugs = hotels.map((hotel) => hotel.slug);
  const hotelSlugKey = hotelItemSlugs.join(",");

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchFavorites = async () => {
      try {
        const hotelSlugs = await getFavoriteStatusByHotels(hotelItemSlugs);
        setFavoriteHotelSlugs(hotelSlugs);
      } catch (err) {
        setFavoriteHotelSlugs([]);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, hotelSlugKey]);

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
          openInNewTab={openInNewTab}
        />
      ))}
    </>
  );
}
