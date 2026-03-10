import { apiFetchAuth } from "@/app/lib/apiClient";
import { PaginatedResponse } from "@/app/lib/api";

export async function getMyFavorites(
  page: number = 1,
): Promise<PaginatedResponse> {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", page.toString());
  }
  return apiFetchAuth(`/api/favorites/?${params.toString()}`);
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
