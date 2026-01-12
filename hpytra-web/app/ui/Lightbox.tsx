"use client";

import PhotoCarousel from "./PhotoCarousel";
import lighboxStyles from "./lightbox.module.css";

export default function Lightbox({ photos, photoName, startIndex, onClose }) {
  return (
    <div className={lighboxStyles["lightbox-overlay"]} onClick={onClose}>
      <button className={lighboxStyles["lightbox-close"]} onClick={onClose}>
        ✕
      </button>

      <div
        className={lighboxStyles["lightbox-content"]}
        onClick={(e) => e.stopPropagation()}
      >
        <PhotoCarousel
          photos={photos}
          photoName={photoName}
          startIndex={startIndex}
        />
      </div>
    </div>
  );
}
