import { MetadataRoute } from "next";
import { fetchLabelsLite, fetchLabelPageLatestUpdatedAt } from "@/app/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const labels = await fetchLabelsLite();

    const labelRoutesData = await Promise.allSettled(
      labels.map(async (label) => {
        const lastModified = await fetchLabelPageLatestUpdatedAt(label.slug);

        return {
          url: `https://www.hpytra.com/hotel_label/${label.slug}`,
          lastModified: lastModified ? new Date(lastModified) : undefined,
        };
      }),
    );

    /* 過濾失敗 Label 的 Promise */
    const labelRoutes = labelRoutesData
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === "fulfilled",
      )
      .map((result) => result.value);

    return labelRoutes;
  } catch (err) {
    console.error("label sitemap error:", err);
    return [];
  }
}
