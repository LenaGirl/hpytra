import { authClient } from "@/app/lib/authClient";

export async function getMyFavorites() {
  const res = await authClient.get("/api/favorites/");

  const hotels = res.data.map((hotel: any) => ({
    ...hotel,
    google_rating:
      hotel.google_rating !== null && hotel.google_rating !== ""
        ? Number(hotel.google_rating)
        : null,
  }));

  return hotels;
}

export async function getFavoriteStatusByHotels(
  hotelSlugs: string[],
): Promise<string[]> {
  const res = await authClient.post("/api/favorites/status/by-hotels/", {
    hotel_slugs: hotelSlugs,
  });

  return res.data;
}

export async function addFavorite(hotelSlug: string) {
  await authClient.post(`/api/favorites/toggle/${hotelSlug}/`);
}

export async function removeFavorite(hotelSlug: string) {
  await authClient.delete(`/api/favorites/toggle/${hotelSlug}/`);
}
