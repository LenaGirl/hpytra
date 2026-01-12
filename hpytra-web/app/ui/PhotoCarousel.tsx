"use client";
import { useState, useRef } from "react";
import photoCarouselStyles from "./photoCarousel.module.css";

export default function PhotoCarousel({ photos, photoName, startIndex = 0 }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(startIndex);

  const total = photos.length;

  const goPrev = () => {
    setCurrentPhotoIndex((i) => (i === 0 ? total - 1 : i - 1));
  };

  const goNext = () => {
    setCurrentPhotoIndex((i) => (i === total - 1 ? 0 : i + 1));
  };

  /* 手機裝置 使用滑動方式來觸發 */
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) < 40) return; // 避免太小誤觸
    if (distance > 0) {
      goNext(); // 往左滑 下一張
    } else {
      goPrev(); // 往右滑 上一張
    }
  };

  return (
    <div
      className={photoCarouselStyles["photo-carousel"]}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        className={`${photoCarouselStyles["photo-carousel-arrow"]} ${photoCarouselStyles["prev"]}`}
        onClick={goPrev}
      >
        ❮
      </button>

      <img
        key={currentPhotoIndex}
        className={photoCarouselStyles["photo-carousel-image"]}
        src={photos[currentPhotoIndex]}
        alt={photoName}
        loading="lazy"
        onClick={goNext}
      />

      <button
        className={`${photoCarouselStyles["photo-carousel-arrow"]} ${photoCarouselStyles["next"]}`}
        onClick={goNext}
      >
        ❯
      </button>
    </div>
  );
}
