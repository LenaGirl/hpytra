import Link from "next/link";
import { Fragment } from "react";
import { getGroupedLabels } from "@/app/lib/getGroupedLabels";
import { labelGroups } from "@/data/labelGroups";
import hotelLabelsStyles from "./hotelLabels.module.css";

export default function HotelLabels({ hotel, labels }) {
  if (hotel.labels.length === 0) {
    return null;
  }

  /* 取得 Hotel Labels 物件 */
  const sortedLabels = hotel.labels
    .map((hotelLabelSlug) =>
      labels.find((label) => label.slug === hotelLabelSlug),
    )
    .filter(Boolean)
    .toSorted((a, b) => a.order_index - b.order_index);

  /* 將 Hotel Labels 歸類 */
  const groupedLabels = getGroupedLabels(sortedLabels);

  return (
    <li>
      <span className="text-strong">住宿標籤：</span>

      <ul className={hotelLabelsStyles["hotel-info-list-labels"]}>
        {/* 顯示各分類 Labels */}
        {Object.entries(groupedLabels).map(([category, labels]) => {
          if (labels.length === 0) return null;
          return (
            <li key={category}>
              {`${labelGroups[category]}：`}
              {labels.map((label, index) => (
                <Fragment key={label.slug}>
                  {index > 0 && "、"}
                  <Link href={`/hotel_label/${label.slug}`} prefetch={false}>
                    {label.name}
                  </Link>
                </Fragment>
              ))}
            </li>
          );
        })}
      </ul>
    </li>
  );
}
