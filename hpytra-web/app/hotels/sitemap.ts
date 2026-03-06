import type { MetadataRoute } from "next";
import { fetchHotelsLatestUpdatedAt } from "@/app/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const hotels = await fetchHotelsLatestUpdatedAt();

    return hotels.map((hotel) => ({
      url: `https://www.hpytra.com/hotels/${hotel.slug}`,
      lastModified: hotel.updated_at ? new Date(hotel.updated_at) : undefined,
    }));
  } catch (err) {
    console.error("sitemap hotels error:", err);

    return [];
  }
}
