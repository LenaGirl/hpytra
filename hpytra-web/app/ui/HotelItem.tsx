"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HotelStats from "@/app/ui/HotelStats";
import AffiliateLinks from "@/app/ui/AffiliateLinks";
import PhotoCarousel from "@/app/ui/PhotoCarousel";
import FavoriteButton from "@/app/ui/FavoriteButton";
import hotelItemStyles from "./hotelItem.module.css";
import { addFavorite, removeFavorite } from "@/app/lib/favorites";

export default function HotelItem({
  hotel,
  displayPlace,
  places,
  labels,
  isMember,
  initialIsFavorited,
  redirectPath,
  openInNewTab = false,
}) {
  /* 收藏狀態 */
  const [isFavorited, setIsFavorited] = useState<boolean>(initialIsFavorited);
  useEffect(() => {
    setIsFavorited(initialIsFavorited);
  }, [initialIsFavorited]);

  /* 點擊愛心 */
  const router = useRouter();

  const onToggleFavorite = async () => {
    if (!isMember)
      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
    else {
      if (isFavorited) {
        await removeFavorite(hotel.slug);
        setIsFavorited(false);
      } else {
        await addFavorite(hotel.slug);
        setIsFavorited(true);
      }
    }
  };

  const photos = hotel.photos.filter(Boolean);

  const currentPlace = places.find((place) => place.slug === hotel.place);
  const parentPlace = places.find(
    (place) => place.slug === currentPlace.parent_slug,
  );

  return (
    <div className={hotelItemStyles["hotel-item"]}>
      {/* 顯示輪播照片 */}
      <PhotoCarousel photos={photos} photoName={hotel.name} />
      <div className={hotelItemStyles["hotel-item-content"]}>
        {/* 加入收藏 */}
        <FavoriteButton
          isMember={isMember}
          isFavorited={isFavorited}
          onToggle={onToggleFavorite}
        />

        {/* 顯示 Place */}
        {displayPlace && (
          <Link
            className={hotelItemStyles["hotel-item-place"]}
            href={`/hotel_place/${hotel.place}`}
            prefetch={false}
            target={openInNewTab ? "_blank" : "_self"}
          >
            ◎{parentPlace && parentPlace.name}
            {currentPlace.name}
          </Link>
        )}

        {/* 顯示 Hotel 名稱及基本資料 */}
        <h3>
          <Link
            href={`/hotels/${hotel.slug}`}
            prefetch={false}
            target={openInNewTab ? "_blank" : "_self"}
          >
            {hotel.name}
          </Link>
        </h3>
        <div className={hotelItemStyles["hotel-item-stats"]}>
          <ul className={hotelItemStyles["hotel-item-stats-list"]}>
            <HotelStats
              hotel={hotel}
              labels={labels}
              clickLoc={`${hotel.place}_${hotel.slug}_hotel-item-ref-price`}
            />
          </ul>
        </div>

        {/* 顯示 Hotel 相關按鈕 */}
        <div className={hotelItemStyles["hotel-item-links"]}>
          <Link
            className="btn btn-secondary"
            href={`/hotels/${hotel.slug}?scroll=photos`}
            prefetch={false}
            target={openInNewTab ? "_blank" : "_self"}
          >
            更多照片
          </Link>
          {hotel.real_1 && (
            <Link
              className="btn btn-secondary"
              href={`/hotels/${hotel.slug}?scroll=reals`}
              prefetch={false}
              target={openInNewTab ? "_blank" : "_self"}
            >
              觀看住宿實景
            </Link>
          )}
          <Link
            className="btn btn-secondary"
            href={`/hotels/${hotel.slug}?scroll=location`}
            prefetch={false}
            target={openInNewTab ? "_blank" : "_self"}
          >
            查看位置
          </Link>

          <span className="btn btn-secondary">
            訂房連結：
            <AffiliateLinks
              hotel={hotel}
              clickLoc={`${hotel.place}_${hotel.slug}_hotel-item`}
              styleType={"text"}
            />
          </span>

          <div className={hotelItemStyles["hotel-item-detailed-btn"]}>
            <Link
              className="btn btn-primary"
              href={`/hotels/${hotel.slug}`}
              prefetch={false}
              target={openInNewTab ? "_blank" : "_self"}
            >
              詳 細 內 容
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
