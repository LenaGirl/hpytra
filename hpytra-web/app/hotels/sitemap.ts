import type { MetadataRoute } from "next";
import { getHotelsForSitemap } from "@/app/lib/getDbData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hotels = await getHotelsForSitemap();

  return hotels.map((hotel) => ({
    url: `https://www.hyptra.com/hotels/${hotel.slug}`,
    lastModified: hotel.updated_at ? new Date(hotel.updated_at) : undefined,
  }));
}
