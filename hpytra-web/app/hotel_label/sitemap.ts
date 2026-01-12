import { MetadataRoute } from "next";
import {
  getLabels,
  getLabelBySlugForSitemap,
  getHotelsByLabelForSitemap,
} from "@/app/lib/getDbData";
import { calcPageUpdatedAt } from "@/app/lib/calcPageUpdatedAt";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const labels = await getLabels();

  const labelRoutesData = await Promise.allSettled(
    labels.map(async (label) => {
      const [currentLabel, hotelsForLabel] = await Promise.all([
        getLabelBySlugForSitemap(label.slug),
        getHotelsByLabelForSitemap(label.slug),
      ]);

      const lastModified = calcPageUpdatedAt(currentLabel, hotelsForLabel);

      return {
        url: `https://hyptra.com/hotel_label/${label.slug}`,
        lastModified: new Date(lastModified),
      };
    })
  );

  /* 過濾失敗 Label 的 Promise */
  const labelRoutes = labelRoutesData
    .filter(
      (result): result is PromiseFulfilledResult<any> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);

  return labelRoutes;
}
