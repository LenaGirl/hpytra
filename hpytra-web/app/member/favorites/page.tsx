"use client";

import { useEffect, useState } from "react";
import { getMyFavorites } from "@/app/lib/favorites";
import HotelItem from "@/app/ui/HotelItem";
import { fetchPlacesLite, fetchLabelsLite } from "@/app/lib/api";

export default function FavoritesPage() {
  const [data, setData] = useState([]);
  const [message, setMessage] = useState<string | null>(null);
  const [places, setPlaces] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    getMyFavorites()
      .then((res) => {
        setData(res);
        if (res.length === 0) {
          setMessage("您還沒有收藏任何住宿，快去找找喜歡的地方吧！");
        }
      })
      .catch(() => {
        setMessage("目前無法載入收藏清單，請稍後再試一次。");
      });
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    Promise.all([fetchPlacesLite(), fetchLabelsLite()]).then(
      ([placesRes, labelsRes]) => {
        setPlaces(placesRes);
        setLabels(labelsRes);
      },
    );
  }, [data.length]);

  return (
    <>
      <h1>收藏清單</h1>
      <p>{message}</p>
      {data.length > 0 && places.length > 0 && labels.length > 0 && (
        <div className="grid-primary">
          {data.map((hotel) => (
            <HotelItem
              key={hotel.slug}
              hotel={hotel}
              displayPlace={true}
              places={places}
              labels={labels}
              isMember="true"
              initialIsFavorited="true"
              redirectPath="/member/favorites"
              openInNewTab={true}
            />
          ))}
        </div>
      )}
    </>
  );
}
