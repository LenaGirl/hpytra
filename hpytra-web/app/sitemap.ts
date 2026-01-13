import { MetadataRoute } from "next";
import { getHotelsCount, getPlacesMaxUpdatedAt } from "@/app/lib/getDbData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hotelsCount = await getHotelsCount();
  const placesMaxUpdatedAt = await getPlacesMaxUpdatedAt();

  const SITE_URL = "https://www.hyptra.com";
  const staticRoutes = [
    {
      url: SITE_URL,
      lastModified: new Date(placesMaxUpdatedAt),
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date("2025-01-05"),
    },
    {
      url: `${SITE_URL}/map`,
      lastModified: new Date(placesMaxUpdatedAt),
    },
  ];

  const placeRoutesXml = [
    {
      url: `${SITE_URL}/hotel_place/sitemap.xml`,
    },
  ];

  const labelRoutesXml = [
    {
      url: `${SITE_URL}/hotel_label/sitemap.xml`,
    },
  ];

  /* Hotels */
  const PAGE_SIZE = 200;
  const sitemapCount = Math.ceil(hotelsCount / PAGE_SIZE);

  const hotelRoutesXml = Array.from({ length: sitemapCount }, (_, i) => {
    return {
      url: `${SITE_URL}/hotels/${i}.xml`,
    };
  });

  return [
    ...staticRoutes,
    ...placeRoutesXml,
    ...labelRoutesXml,
    ...hotelRoutesXml,
  ];
}
