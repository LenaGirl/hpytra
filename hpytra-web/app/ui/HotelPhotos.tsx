"use client";

import { useState } from "react";
import Lightbox from "./Lightbox";
import hotelPhotosStyles from "./hotelPhotos.module.css";

export default function HotelPhotos({ hotel }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(1);

  const allPhotos = [
    hotel.photo_1,
    hotel.photo_2,
    hotel.photo_3,
    hotel.photo_4,
    hotel.photo_5,
    hotel.photo_6,
    hotel.photo_7,
    hotel.photo_8,
    hotel.photo_9,
    hotel.photo_10,
  ];

  return (
    <>
      {/* Render Photo 2 ~ 10 */}
      <div className={hotelPhotosStyles["hotel-photos-grid"]}>
        {allPhotos
          .slice(1)
          .filter(Boolean)
          .map((photoUrl, i) => (
            <div key={i} className={hotelPhotosStyles["hotel-photos-item"]}>
              <img
                src={photoUrl}
                onClick={() => {
                  if (window.innerWidth < 428) return; // 小尺寸裝置無 Lightbox
                  setCurrentPhotoIndex(i + 1); // Photo 2: i=0 , index=1
                  setLightboxOpen(true);
                }}
              />
            </div>
          ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          photos={allPhotos.filter(Boolean)}
          photoName={hotel.name}
          startIndex={currentPhotoIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
