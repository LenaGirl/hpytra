import Link from "next/link";
import HotelStats from "@/app/ui/HotelStats";
import AffiliateLinks from "@/app/ui/AffiliateLinks";
import PhotoCarousel from "@/app/ui/PhotoCarousel";
import hotelItemStyles from "./hotelItem.module.css";

export default function HotelItem({ hotel, displayPlace, places, labels }) {
  const photos = [
    hotel.photo_main,
    hotel.photo_2,
    hotel.photo_3,
    hotel.photo_4,
    hotel.photo_5,
    hotel.photo_6,
    hotel.photo_7,
    hotel.photo_8,
    hotel.photo_9,
    hotel.photo_10,
  ].filter(Boolean);

  const currentPlace = places.find((place) => place.slug === hotel.place_slug);
  const parentPlace = places.find(
    (place) => place.slug === currentPlace.parent_slug
  );

  return (
    <div className={hotelItemStyles["hotel-item"]}>
      {/* 顯示輪播照片 */}
      <PhotoCarousel photos={photos} photoName={hotel.name} />

      {/* 顯示 Place */}
      {displayPlace && (
        <Link
          className={hotelItemStyles["hotel-item-place"]}
          href={`/hotel_place/${hotel.place_slug}`}
          prefetch={false}
        >
          ◎{parentPlace && parentPlace.name}
          {currentPlace.name}
        </Link>
      )}

      {/* 顯示 Hotel 名稱及基本資料 */}
      <h3>
        <Link href={`/hotels/${hotel.slug}`} prefetch={false}>
          {hotel.name}
        </Link>
      </h3>
      <div className={hotelItemStyles["hotel-item-stats"]}>
        <ul className={hotelItemStyles["hotel-item-stats-list"]}>
          <HotelStats
            hotel={hotel}
            labels={labels}
            clickLoc={`${hotel.place_slug}_${hotel.slug}_hotel-item-ref-price`}
          />
        </ul>
      </div>

      {/* 顯示 Hotel 相關按鈕 */}
      <div className={hotelItemStyles["hotel-item-links"]}>
        <Link
          className="btn btn-secondary"
          href={`/hotels/${hotel.slug}?scroll=photos`}
          prefetch={false}
        >
          更多照片
        </Link>
        {hotel.real_1 && (
          <Link
            className="btn btn-secondary"
            href={`/hotels/${hotel.slug}?scroll=reals`}
            prefetch={false}
          >
            觀看住宿實景
          </Link>
        )}
        <Link
          className="btn btn-secondary"
          href={`/hotels/${hotel.slug}?scroll=location`}
          prefetch={false}
        >
          查看位置
        </Link>

        <span className="btn btn-secondary">
          訂房連結：
          <AffiliateLinks
            hotel={hotel}
            clickLoc={`${hotel.place_slug}_${hotel.slug}_hotel-item`}
            styleType={"text"}
          />
        </span>

        <div className={hotelItemStyles["hotel-item-detailed-btn"]}>
          <Link
            className="btn btn-primary"
            href={`/hotels/${hotel.slug}`}
            prefetch={false}
          >
            詳 細 內 容
          </Link>
        </div>
      </div>
    </div>
  );
}
