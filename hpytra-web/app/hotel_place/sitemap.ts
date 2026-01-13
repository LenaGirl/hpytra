import { MetadataRoute } from "next";
import {
  getPlaces,
  getPlaceDetailsBySlugForSitemap,
  getHotelsByPlaceForSitemap,
} from "@/app/lib/getDbData";
import { getIncludedPlaceSlugs } from "@/app/lib/getIncludedPlaceSlugs";
import { calcPageUpdatedAt } from "@/app/lib/calcPageUpdatedAt";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const places = await getPlaces();

  const placeRoutesData = await Promise.allSettled(
    places.map(async (place) => {
      const includedPlaceSlugs = getIncludedPlaceSlugs(places, place.slug);
      const [placeDetails, hotelsForPlace] = await Promise.all([
        getPlaceDetailsBySlugForSitemap(place.slug),
        getHotelsByPlaceForSitemap(includedPlaceSlugs),
      ]);

      const lastModified = calcPageUpdatedAt(placeDetails, hotelsForPlace);

      return {
        url: `https://www.hyptra.com/hotel_place/${place.slug}`,
        lastModified: new Date(lastModified),
      };
    })
  );

  /* 過濾失敗 Place 的 Promise */
  const placeRoutes = placeRoutesData
    .filter(
      (result): result is PromiseFulfilledResult<any> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);

  return placeRoutes;
}
