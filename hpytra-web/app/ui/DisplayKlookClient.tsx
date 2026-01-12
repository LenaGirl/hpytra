"use client";

import dynamic from "next/dynamic";

const DisplayKlook = dynamic(() => import("@/app/ui/DisplayKlook"), {
  ssr: false,
  loading: () => null,
});

export default function DisplayKlookClient({ placeSlug, pageSlug }) {
  return <DisplayKlook placeSlug={placeSlug} pageSlug={pageSlug} />;
}
