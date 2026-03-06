"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import HotelStats from "@/app/ui/HotelStats";
import mapSearchViewStyles from "./mapSearchView.module.css";
import { fetchHotelsMapByPlace } from "@/app/lib/api";

export default function MapSearchView({ placesAndMapCenters, labels }) {
  /* 將 Places 依照 Parent Place 分組  */
  const { parentPlaces, groupedPlaces } = getGroupedPlaces(placesAndMapCenters);

  const defaultCenter = {
    slug: "taiwan",
    name: "台灣",
    map_center_lat: 23.8,
    map_center_lng: 120.9,
    map_zoom: 7,
  };

  const [selectedParentPlace, setSelectedParentPlace] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(defaultCenter);
  const [hotelsByPlace, setHotelsByPlace] = useState([]);

  function handleParentClick(parent) {
    setSelectedParentPlace(parent);
    setSelectedPlace(parent);
  }

  const [lockedHotel, setLockedHotel] = useState(null);
  const [hoverHotel, setHoverHotel] = useState(null);

  /* 依照 URL 參數，顯示該 Place 地圖 */
  const searchParams = useSearchParams();
  const queryPlaceSlug = searchParams.get("place");
  useEffect(() => {
    if (!queryPlaceSlug) return;

    const queryPlace = placesAndMapCenters.find(
      (place) => place.slug === queryPlaceSlug,
    );
    if (!queryPlace) return;

    setSelectedPlace(queryPlace);

    const parent =
      parentPlaces.find((place) => place.slug === queryPlace.parent_slug) ||
      queryPlace;
    setSelectedParentPlace(parent);
  }, [queryPlaceSlug, placesAndMapCenters, parentPlaces]);

  /* 取得所選 Place (含子層級) 的 Hotels */
  useEffect(() => {
    if (!selectedPlace || selectedPlace.slug === defaultCenter.slug) return;

    let cancelled = false;

    async function loadHotelsByPlace() {
      try {
        const hotels = await fetchHotelsMapByPlace(selectedPlace.slug);

        if (!cancelled) {
          setHotelsByPlace(hotels);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("loadHotelsForPlace error:", err);
          setHotelsByPlace([]);
        }
      }
    }

    loadHotelsByPlace();

    return () => {
      cancelled = true;
    };
  }, [selectedPlace, defaultCenter.slug]);

  const centerLat =
    selectedPlace?.map_center_lat ?? defaultCenter.map_center_lat;
  const centerLng =
    selectedPlace?.map_center_lng ?? defaultCenter.map_center_lng;
  const zoom = selectedPlace?.map_zoom ?? defaultCenter.map_zoom;

  return (
    <>
      <nav className={mapSearchViewStyles["map-filter-place"]}>
        {/* Render 縣市層級 Places */}
        {parentPlaces.map((parent) => (
          <button
            key={parent.slug}
            onClick={() => handleParentClick(parent)}
            className={`btn btn-secondary${
              selectedParentPlace?.slug === parent.slug ? " active" : ""
            }
              `}
          >
            {parent.name}
          </button>
        ))}
      </nav>

      {/* Render 子層級 Places */}
      {selectedParentPlace &&
        groupedPlaces[selectedParentPlace.slug] &&
        groupedPlaces[selectedParentPlace.slug].length > 0 && (
          <nav className={mapSearchViewStyles["map-filter-subplace"]}>
            {groupedPlaces[selectedParentPlace.slug].map((child) => (
              <button
                key={child.slug}
                onClick={() => setSelectedPlace(child)}
                className={`btn btn-tertiary${
                  selectedPlace?.slug === child.slug ? " active" : ""
                }`}
              >
                {child.name}
              </button>
            ))}
          </nav>
        )}

      {/* Render Google Map */}
      <section className={mapSearchViewStyles["map-view"]}>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY}>
          <Map
            key={selectedPlace.slug}
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
            defaultZoom={zoom}
            defaultCenter={{
              lat: centerLat,
              lng: centerLng,
            }}
            mapTypeControl={true}
            zoomControl={true}
            fullscreenControl={true}
            gestureHandling={"auto"}
            language={"zh-TW"}
            style={{ width: "100%", height: "100%" }}
          >
            {/* 標記該 Place 的 Hotels */}
            {hotelsByPlace.map((hotel) => {
              return (
                <HotelMarker
                  key={hotel.slug}
                  hotel={hotel}
                  lockedHotel={lockedHotel}
                  setLockedHotel={setLockedHotel}
                  hoverHotel={hoverHotel}
                  setHoverHotel={setHoverHotel}
                  labels={labels}
                />
              );
            })}
          </Map>
        </APIProvider>
      </section>
    </>
  );
}

/*----- 標記個別 Hotel -----*/
function HotelMarker({
  hotel,
  lockedHotel,
  setLockedHotel,
  hoverHotel,
  setHoverHotel,
  labels,
}) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const isLocked = lockedHotel === hotel.slug;
  const isHovered = hoverHotel === hotel.slug && !lockedHotel;

  function lockInfoWindow() {
    setLockedHotel(hotel.slug);
    setHoverHotel(null);
  }

  return (
    <>
      <AdvancedMarker
        position={{
          lat: hotel.coordinates_lat,
          lng: hotel.coordinates_lng,
        }}
        ref={markerRef}
        onMouseEnter={() => !lockedHotel && setHoverHotel(hotel.slug)}
        onMouseLeave={() => !lockedHotel && setHoverHotel(null)}
        onClick={lockInfoWindow}
      >
        <Image src="/logo.png" alt={hotel.name} width={32} height={32} />
      </AdvancedMarker>

      {(isHovered || isLocked) && (
        <InfoWindow anchor={marker} disableAutoPan={!lockedHotel}>
          <button
            className={mapSearchViewStyles["google-infowindow-close"]}
            onClick={() => {
              setLockedHotel(null);
              setHoverHotel(null);
            }}
          >
            ✕
          </button>
          <div className={mapSearchViewStyles["google-hotel-content"]}>
            <div className={mapSearchViewStyles["google-hotel-photo-main"]}>
              <Link
                href={`/hotels/${hotel.slug}`}
                target="_blank"
                prefetch={false}
              >
                <img src={hotel.photo_main} alt={hotel.name} />
              </Link>
            </div>
            <div className={mapSearchViewStyles["google-hotel-info"]}>
              <h3>
                <Link
                  href={`/hotels/${hotel.slug}`}
                  target="_blank"
                  prefetch={false}
                >
                  {hotel.name}
                </Link>
              </h3>
              <ul className={mapSearchViewStyles["google-hotel-info-list"]}>
                <HotelStats
                  hotel={hotel}
                  labels={labels}
                  clickLoc={`${hotel.place_slug}_${hotel.slug}_map-ref-price`}
                />
              </ul>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
}

/*----- 將 Places 依照 Parent Place 分組 -----*/
function getGroupedPlaces(placesAndMapCenters) {
  const parentPlaces = placesAndMapCenters.filter(
    (place) => place.parent_slug === null,
  );

  const groupedPlaces = {};

  parentPlaces.forEach((parent) => {
    const children = placesAndMapCenters.filter(
      (child) => child.parent_slug === parent.slug,
    );

    groupedPlaces[parent.slug] = children;
  });

  return { parentPlaces, groupedPlaces };
}
