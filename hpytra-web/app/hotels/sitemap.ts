import type { MetadataRoute } from "next";
import { getHotelsForSitemap } from "@/app/lib/getDbData";

const PAGE_SIZE = 200;
const hotels = await getHotelsForSitemap();

export async function generateSitemaps() {
  const total = hotels.length;
  const sitemapCount = Math.ceil(total / PAGE_SIZE);

  return Array.from({ length: sitemapCount }, (_, i) => ({
    id: i,
  }));
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = await Number(props.id);

  const start = id * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  /* 取出當前 Id 的 Hotels */
  const currentIdHotels = hotels.slice(start, end);

  return currentIdHotels.map((hotel) => ({
    url: `https://www.hyptra.com/hotels/${hotel.slug}`,
    lastModified: hotel.updated_at ? new Date(hotel.updated_at) : undefined,
  }));
}
