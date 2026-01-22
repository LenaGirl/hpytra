import { MetadataRoute } from "next";
import { fetchPlacesLite, fetchPlacePageLatestUpdatedAt } from "@/app/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const places = await fetchPlacesLite();

  const placeRoutesData = await Promise.allSettled(
    places.map(async (place) => {
      const lastModified = await fetchPlacePageLatestUpdatedAt(place.slug);

      return {
        url: `https://www.hpytra.com/hotel_place/${place.slug}`,
        lastModified: new Date(lastModified),
      };
    }),
  );

  /* 過濾失敗 Place 的 Promise */
  const placeRoutes = placeRoutesData
    .filter(
      (result): result is PromiseFulfilledResult<any> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value);

  return placeRoutes;
}
