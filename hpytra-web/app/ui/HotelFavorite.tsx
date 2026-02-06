"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import FavoriteButton from "@/app/ui/FavoriteButton";
import {
  getFavoriteStatusByHotels,
  addFavorite,
  removeFavorite,
} from "@/app/lib/favorites";
import { useAuthStore } from "@/app/lib/authStore";

export default function HotelFavorite({ slug }) {
  const { isAuthenticated } = useAuthStore();
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const fetchedRef = useRef(false);

  /* 讀取收藏狀態 */
  useEffect(() => {
    if (!isAuthenticated || !slug) {
      setIsFavorited(false);
      return;
    }

    if (fetchedRef.current) return; // 防止重複呼叫

    fetchedRef.current = true;

    const fetchStatus = async () => {
      try {
        const favoriteSlugs = await getFavoriteStatusByHotels([slug]);
        setIsFavorited(favoriteSlugs.includes(slug));
      } catch (err) {
        setIsFavorited(false);
      }
    };

    fetchStatus();
  }, [isAuthenticated, slug]);

  /* 點擊愛心 */
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
  const onToggle = async () => {
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(fullPath)}`);
    } else {
      if (isFavorited) {
        await removeFavorite(slug);
        setIsFavorited(false);
      } else {
        await addFavorite(slug);
        setIsFavorited(true);
      }
    }
  };

  return (
    <FavoriteButton
      isMember={isAuthenticated}
      isFavorited={isFavorited}
      onToggle={onToggle}
    ></FavoriteButton>
  );
}
