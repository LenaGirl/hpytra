import { notFound } from "next/navigation";

/*---------- Cache Durations ----------*/
const CACHE = {
  LONG: 60 * 60 * 24, // 24 小時（幾乎不變）
  NORMAL: 60 * 60 * 6, // 6 小時（偶爾更新）
  SHORT: 60 * 10, // 10 分鐘（動態但不即時）
};

/*---------- Type Definitions ----------*/
type PlaceLite = {
  name: string;
  slug: string;
  parent_slug: string | null;
  order_index: number;
};

type PlaceMap = {
  name: string;
  slug: string;
  parent_slug: string | null;
  order_index: number;
  map_center_lat: number | null;
  map_center_lng: number | null;
  map_zoom: number | null;
};

export type ContentBlock =
  | {
      type: "intro";
      text: string[];
    }
  | {
      type: "section";
      title?: string;
      link?: string;
      intro?: string;
      entries: {
        title: string;
        text: string;
      }[];
    }
  | {
      type: "note";
      text: string;
    };

type PlaceDetail = {
  slug: string;
  title: string | null;
  content: ContentBlock[];
  seo_description: string | null;
  seo_keywords: string[] | null;
  updated_at: string;
};

type LabelLite = {
  name: string;
  slug: string;
  category: string | null;
  order_index: number;
};

type LabelDetail = {
  name: string;
  slug: string;
  description: string | null;
  updated_at: string;
};

type LabelsByPlace = {
  name: string;
  slug: string;
  category: string | null;
  order_index: number;
  featured: boolean;
  featured_prefix: boolean;
  featured_suffix: string | null;
  description: string | null;
};

type HotelDetail = {
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  slug: string;
  google_rating: number | null;
  place: string;
  labels: string[] | null;
  order_index: number;
  price_double_room: number | null;
  price_quad_room: number | null;
  agoda_slug: string | null;
  booking_slug: string | null;
  klook_slug: string | null;
  kkday_slug: string | null;
  photo_main: string | null;
  photos: string[];
  reals: string[];
  updated_at: string;
};

type HotelItem = {
  name: string;
  slug: string;
  google_rating: number | null;
  place: string;
  labels: string[] | null;
  order_index: number;
  price_double_room: number | null;
  price_quad_room: number | null;
  agoda_slug: string | null;
  booking_slug: string | null;
  klook_slug: string | null;
  kkday_slug: string | null;
  photo_main: string | null;
  photos: string[];
  real_1: string | null;
};

type HotelLatestUpdatedAt = {
  slug: string;
  updated_at: string;
};

/*---------- Place ----------*/
export async function fetchPlacesLite(): Promise<PlaceLite[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/places/`,
    {
      next: { revalidate: CACHE.LONG },
    },
  );

  if (!res.ok) {
    console.error("fetchPlacesLite api error:", res.status);
    return [];
  }

  return res.json();
}

export async function fetchPlacesMap(): Promise<PlaceMap[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/places/map/`,
    {
      next: { revalidate: CACHE.LONG },
    },
  );

  if (!res.ok) {
    console.error("fetchPlacesMap api error:", res.status);
    return [];
  }

  const data = await res.json();
  const places = data.map((place) => ({
    ...place,
    map_center_lat: toNumber(place.map_center_lat),
    map_center_lng: toNumber(place.map_center_lng),
    map_zoom: toNumber(place.map_zoom),
  }));

  return places;
}

/*---------- Place Detail ----------*/
export async function fetchPlaceDetail(slug: string): Promise<PlaceDetail> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/places/${slug}/`,
    {
      next: { revalidate: CACHE.LONG },
    },
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    console.error("fetchPlaceDetail api error:", res.status);
    throw new Error("Failed to fetch place detail");
  }

  return res.json();
}

export async function fetchPlacePageLatestUpdatedAt(
  slug: string,
): Promise<string | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/places/${slug}/latest-updated-at/`,
    {
      next: { revalidate: CACHE.LONG },
    },
  );

  if (!res.ok) {
    console.error("fetchPlacePageLatestUpdatedAt api error:", res.status);
    return null;
  }

  const data = await res.json();
  return data.updated_at;
}

/*---------- Label ----------*/
export async function fetchLabelsLite(): Promise<LabelLite[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/labels/`,
    {
      next: { revalidate: CACHE.LONG },
    },
  );

  if (!res.ok) {
    console.error("fetchLabelsLite api error:", res.status);
    return [];
  }

  return res.json();
}

export async function fetchLabelDetail(slug: string): Promise<LabelDetail> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/labels/${slug}/`,
    {
      next: { revalidate: CACHE.LONG },
    },
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    console.error("fetchLabelDetail api error:", res.status);
    throw new Error("Failed to fetch label detail");
  }

  return res.json();
}

export async function fetchLabelsByPlace(
  placeSlug: string,
): Promise<LabelsByPlace[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/labels/by-place-tree/${placeSlug}/`,
    {
      next: { revalidate: CACHE.NORMAL },
    },
  );

  if (!res.ok) {
    console.error("fetchLabelsByPlace api error:", res.status);
    return [];
  }

  return res.json();
}

export async function fetchLabelPageLatestUpdatedAt(
  slug: string,
): Promise<string | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/labels/${slug}/latest-updated-at/`,
    {
      next: { revalidate: CACHE.LONG },
    },
  );

  if (!res.ok) {
    console.error("fetchLabelPageLatestUpdatedAt api error:", res.status);
    return null;
  }

  const data = await res.json();
  return data.updated_at;
}

/*---------- Hotel ----------*/
export async function fetchHotelDetail(slug: string): Promise<HotelDetail> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/${slug}/`,
    {
      next: { revalidate: CACHE.NORMAL },
    },
  );

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    console.error("fetchHotelDetail api error:", res.status);
    throw new Error("Failed to fetch hotel detail");
  }

  const data = await res.json();
  const hotelDetail = {
    ...data,
    google_rating: toNumber(data.google_rating),
  };

  return hotelDetail;
}

export async function fetchNearbyHotels(slug: string): Promise<HotelItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/${slug}/nearby/`,
    {
      next: { revalidate: CACHE.NORMAL },
    },
  );

  if (!res.ok) {
    console.error("fetchNearbyHotels api error:", res.status);
    return [];
  }

  const data = await res.json();
  const hotels = data.map((hotel) => ({
    ...hotel,
    google_rating: toNumber(hotel.google_rating),
  }));

  return hotels;
}

export async function fetchTopHotels(): Promise<HotelItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/top/`,
    {
      next: { revalidate: CACHE.SHORT },
    },
  );

  if (!res.ok) {
    console.error("fetchTopHotels api error:", res.status);
    return [];
  }

  const data = await res.json();
  const hotels = data.map((hotel) => ({
    ...hotel,
    google_rating: toNumber(hotel.google_rating),
  }));

  return hotels;
}

export async function fetchHotelsByLabel(
  labelSlug: string,
): Promise<HotelItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/labels/${labelSlug}/`,
    {
      next: { revalidate: CACHE.NORMAL },
    },
  );

  if (!res.ok) {
    console.error("fetchHotelsByLabel api error:", res.status);
    return [];
  }

  const data = await res.json();
  const hotels = data.map((hotel) => ({
    ...hotel,
    google_rating: toNumber(hotel.google_rating),
  }));

  return hotels;
}

export async function fetchHotelsByPlaceTree(
  placeSlug: string,
): Promise<HotelItem[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/by-place-tree/${placeSlug}/`,
    {
      next: { revalidate: CACHE.NORMAL },
    },
  );

  if (!res.ok) {
    console.error("fetchHotelsByPlaceTree api error:", res.status);
    return [];
  }

  const data = await res.json();
  const hotels = data.map((hotel) => ({
    ...hotel,
    google_rating: toNumber(hotel.google_rating),
  }));

  return hotels;
}

export async function fetchHotelsLatestUpdatedAt(): Promise<
  HotelLatestUpdatedAt[]
> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/latest-updated-at/`,
    {
      next: { revalidate: CACHE.LONG },
    },
  );
  if (!res.ok) {
    console.error("fetchHotelsLatestUpdatedAt api error:", res.status);
    return [];
  }
  return res.json();
}

/*---------- Utility Functions ----------*/
function toNumber(value: string | null): number | null {
  return value !== null && value !== "" ? Number(value) : null;
}
