import { apiFetchAuth } from "@/app/lib/apiClient";
import { HotelItem } from "@/app/lib/api";

export async function getMyFavorites(): Promise<HotelItem[]> {
  return apiFetchAuth("/api/favorites/");
}

export async function getFavoriteStatusByHotels(
  hotelSlugs: string[],
): Promise<string[]> {
  return apiFetchAuth<string[]>("/api/favorites/status/by-hotels/", {
    method: "POST",
    body: JSON.stringify({
      hotel_slugs: hotelSlugs,
    }),
  });
}

export async function addFavorite(hotelSlug: string) {
  await apiFetchAuth(`/api/favorites/toggle/${hotelSlug}/`, {
    method: "POST",
  });
}

export async function removeFavorite(hotelSlug: string) {
  await apiFetchAuth(`/api/favorites/toggle/${hotelSlug}/`, {
    method: "DELETE",
  });
}
