"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getMyFavorites } from "@/app/lib/favorites";
import HotelList from "@/app/ui/HotelList";
import { fetchPlacesLite, fetchLabelsLite } from "@/app/lib/api";

export default function FavoritesPage() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState<string | null>(null);
  const [places, setPlaces] = useState([]);
  const [labels, setLabels] = useState([]);

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    getMyFavorites(page)
      .then((res) => {
        setData(res);
        if (res.count === 0) {
          setMessage("您還沒有收藏任何住宿，快去找找喜歡的地方吧！");
        }
      })
      .catch(() => {
        setMessage("目前無法載入收藏清單，請稍後再試一次。");
      });
  }, [page]);

  useEffect(() => {
    if (!data || data.count === 0) return;

    Promise.all([fetchPlacesLite(), fetchLabelsLite()]).then(
      ([placesRes, labelsRes]) => {
        setPlaces(placesRes);
        setLabels(labelsRes);
      },
    );
  }, [data]);

  return (
    <>
      <section id="hotel-list">
        <h1>收藏清單</h1>
        <p>{message}</p>
        {data?.count > 0 && places.length > 0 && labels.length > 0 && (
          <HotelList
            hotels={data.results}
            totalHotels={data.count}
            displayPlace={true}
            places={places}
            labels={labels}
            openInNewTab={true}
          />
        )}
      </section>
    </>
  );
}
