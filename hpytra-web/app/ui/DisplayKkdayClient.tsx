"use client";

import dynamic from "next/dynamic";

const DisplayKkday = dynamic(() => import("@/app/ui/DisplayKkday"), {
  ssr: false,
  loading: () => null,
});

export default function DisplayKkdayClient({ placeSlug, pageSlug }) {
  return <DisplayKkday placeSlug={placeSlug} pageSlug={pageSlug} />;
}
