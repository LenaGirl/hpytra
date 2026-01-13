import { supabase } from "@/utils/supabase/client";
import { notFound } from "next/navigation";

/*----- Places -----*/
export async function getPlaces() {
  const { data, error } = await supabase
    .from("places")
    .select("name,slug,parent_slug,order_index")
    .order("order_index");

  if (error) {
    console.error("getPlaces error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPlacesAndMapCenters() {
  const { data, error } = await supabase
    .from("places")
    .select(
      "name,slug,parent_slug,order_index,map_center_lat,map_center_lng,map_zoom"
    )
    .order("order_index");

  if (error) {
    console.error("getPlacesAndMapCenters error:", error);
    return [];
  }

  return data ?? [];
}

export async function getPlacesMaxUpdatedAt() {
  const { data, error } = await supabase
    .from("places")
    .select("updated_at")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("getPlacesMaxUpdatedAt error:", error);
    return null;
  }

  return data?.updated_at ?? null;
}

/*----- Place Details -----*/
export async function getPlaceDetailsBySlug(placeSlug: string) {
  const { data, error } = await supabase
    .from("place_details")
    .select("slug,title,content,seo_description,seo_keywords,updated_at")
    .eq("slug", placeSlug)
    .maybeSingle();

  if (error || !data) {
    console.error("getPlaceDetailsBySlug error:", error);
    notFound();
  }

  return data;
}

export async function getPlaceDetailsBySlugForSitemap(placeSlug: string) {
  const { data, error } = await supabase
    .from("place_details")
    .select("slug,updated_at")
    .eq("slug", placeSlug)
    .maybeSingle();

  if (error) {
    console.error("getPlaceDetailsBySlugForSitemap error:", error);
    return null;
  }

  return data;
}

/*----- Labels -----*/
export async function getLabels() {
  const { data, error } = await supabase
    .from("labels")
    .select("name,slug,category,order_index")
    .order("order_index");

  if (error) {
    console.error("getLabels error:", error);
    return [];
  }

  return data ?? [];
}

export async function getLabelsForHotelPlacePage() {
  const { data, error } = await supabase
    .from("labels")
    .select(
      "name,slug,category,order_index,featured,featured_prefix,featured_suffix,description"
    )
    .order("order_index");

  if (error) {
    console.error("getLabelsForHotelPlacePage error:", error);
    return [];
  }

  return data ?? [];
}

export async function getLabelBySlug(labelSlug: string) {
  const { data, error } = await supabase
    .from("labels")
    .select("name,slug,description,updated_at")
    .eq("slug", labelSlug)
    .maybeSingle();

  if (error || !data) {
    console.error("getLabelBySlug error:", error);
    notFound();
  }

  return data;
}

export async function getLabelBySlugForSitemap(labelSlug: string) {
  const { data, error } = await supabase
    .from("labels")
    .select("slug,updated_at")
    .eq("slug", labelSlug)
    .maybeSingle();

  if (error) {
    console.error("getLabelBySlugForSitemap error:", error);
    return null;
  }

  return data;
}

/*----- Hotels -----*/
export async function getHotels() {
  const { data, error } = await supabase
    .from("hotels")
    .select(
      "name,address,phone,website,slug,coordinates_lat,coordinates_lng,google_rating,place_slug,labels,order_index,show_on_homepage,price_double_room,price_quad_room,agoda_slug,booking_slug,klook_slug,kkday_slug,photo_main,photo_1,photo_2,photo_3,photo_4,photo_5,photo_6,photo_7,photo_8,photo_9,photo_10,real_1"
    )
    .order("place_slug")
    .order("order_index");

  if (error) {
    console.error("getHotels error:", error);
    return [];
  }

  return data ?? [];
}

export async function getHotelBySlug(hotelSlug: string) {
  const { data, error } = await supabase
    .from("hotels")
    .select(
      "name,address,phone,website,slug,google_rating,place_slug,labels,order_index,price_double_room,price_quad_room,agoda_slug,booking_slug,klook_slug,kkday_slug,photo_main,photo_1,photo_2,photo_3,photo_4,photo_5,photo_6,photo_7,photo_8,photo_9,photo_10,real_1,real_2,real_3,real_4,real_5,real_6,updated_at"
    )
    .eq("slug", hotelSlug)
    .maybeSingle();

  if (error || !data) {
    console.error("getHotelBySlug error:", error);
    notFound();
  }

  return data;
}

export async function getHotelsByPlace(placeSlug: string[]) {
  if (placeSlug.length === 0) return [];

  const { data, error } = await supabase
    .from("hotels")
    .select(
      "name,slug,google_rating,place_slug,labels,order_index,price_double_room,price_quad_room,agoda_slug,booking_slug,klook_slug,kkday_slug,photo_main,photo_1,photo_2,photo_3,photo_4,photo_5,photo_6,photo_7,photo_8,photo_9,photo_10,real_1,updated_at"
    )
    .in("place_slug", placeSlug)
    .order("order_index");

  if (error) {
    console.error("getHotelsByPlace error:", error);
    return [];
  }

  return data ?? [];
}

export async function getHotelsByPlaceForSitemap(placeSlug: string[]) {
  if (placeSlug.length === 0) return [];

  const { data, error } = await supabase
    .from("hotels")
    .select("slug,place_slug,updated_at")
    .in("place_slug", placeSlug);

  if (error) {
    console.error("getHotelsByPlaceForSitemap error:", error);
    return [];
  }

  return data ?? [];
}

export async function getHotelsByLabel(labelSlug: string) {
  const { data, error } = await supabase
    .from("hotels")
    .select(
      "name,slug,google_rating,place_slug,labels,order_index,price_double_room,price_quad_room,agoda_slug,booking_slug,klook_slug,kkday_slug,photo_main,photo_1,photo_2,photo_3,photo_4,photo_5,photo_6,photo_7,photo_8,photo_9,photo_10,updated_at"
    )
    .contains("labels", [labelSlug])
    .order("order_index");

  if (error) {
    console.error("getHotelsByLabel error:", error);
    return [];
  }

  return data ?? [];
}

export async function getHotelsByLabelForSitemap(labelSlug: string) {
  const { data, error } = await supabase
    .from("hotels")
    .select("slug,updated_at")
    .contains("labels", [labelSlug]);
  if (error) {
    console.error("getHotelsByLabelForSitemap error:", error);
    return [];
  }

  return data ?? [];
}

export async function getHotelsForSitemap() {
  const { data, error } = await supabase
    .from("hotels")
    .select("slug,updated_at")
    .order("slug");

  if (error) {
    console.error("getHotelsForSitemap error:", error);
    return [];
  }

  return data ?? [];
}

export async function getHotelsCount() {
  const { count, error } = await supabase
    .from("hotels")
    .select("slug", { count: "exact", head: true });

  if (error) {
    console.error("getHotelsCount error:", error);
    return 0;
  }

  return count ?? 0;
}
