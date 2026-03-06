import { apiFetch, apiFetchOr404 } from "./apiClient";

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

export type HotelItem = {
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

type HotelsLatestUpdatedAt = {
  slug: string;
  updated_at: string;
};

type HotelMap = {
  name: string;
  slug: string;
  coordinates_lat: number | null;
  coordinates_lng: number | null;
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
};

/*---------- Place ----------*/
export async function fetchPlacesLite(): Promise<PlaceLite[]> {
  return apiFetch<PlaceLite[]>("/api/places/");
}

export async function fetchPlacesMap(): Promise<PlaceMap[]> {
  return apiFetch<PlaceMap[]>("/api/places/map/");
}

/*---------- Place Detail ----------*/
export async function fetchPlaceDetail(slug: string): Promise<PlaceDetail> {
  return apiFetchOr404<PlaceDetail>(`/api/places/${slug}/`);
}

export async function fetchPlacePageLatestUpdatedAt(
  slug: string,
): Promise<string> {
  const data = await apiFetch<{ updated_at: string }>(
    `/api/updates/places/${slug}/`,
  );

  return data.updated_at;
}

/*---------- Label ----------*/
export async function fetchLabelsLite(): Promise<LabelLite[]> {
  return apiFetch<LabelLite[]>("/api/labels/");
}

export async function fetchLabelDetail(slug: string): Promise<LabelDetail> {
  return apiFetchOr404<LabelDetail>(`/api/labels/${slug}/`);
}

export async function fetchLabelsByPlace(
  placeSlug: string,
): Promise<LabelsByPlace[]> {
  return apiFetch<LabelsByPlace[]>(`/api/places/${placeSlug}/labels/`);
}

export async function fetchLabelPageLatestUpdatedAt(
  slug: string,
): Promise<string> {
  const data = await apiFetch<{ updated_at: string }>(
    `/api/updates/labels/${slug}/`,
  );

  return data.updated_at;
}

/*---------- Hotel ----------*/
export async function fetchHotelDetail(slug: string): Promise<HotelDetail> {
  return apiFetchOr404<HotelDetail>(`/api/hotels/${slug}/`);
}

export async function fetchNearbyHotels(slug: string): Promise<HotelItem[]> {
  return apiFetch<HotelItem[]>(`/api/hotels/${slug}/nearby/`);
}

export async function fetchTopHotels(): Promise<HotelItem[]> {
  return apiFetch<HotelItem[]>("/api/hotels/top/");
}

export async function fetchHotelsByLabel(
  labelSlug: string,
): Promise<HotelItem[]> {
  return apiFetch<HotelItem[]>(`/api/labels/${labelSlug}/hotels/`);
}

export async function fetchHotelsByPlaceTree(
  placeSlug: string,
): Promise<HotelItem[]> {
  return apiFetch<HotelItem[]>(`/api/places/${placeSlug}/hotels/`);
}

export async function fetchHotelsMapByPlace(
  placeSlug: string,
): Promise<HotelMap[]> {
  return apiFetch<HotelMap[]>(`/api/places/${placeSlug}/hotels/map/`);
}

export async function fetchHotelsLatestUpdatedAt(): Promise<
  HotelsLatestUpdatedAt[]
> {
  return apiFetch<HotelsLatestUpdatedAt[]>("/api/updates/hotels/");
}
