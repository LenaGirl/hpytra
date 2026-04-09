"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DisplayKlook = dynamic(() => import("@/app/ui/DisplayKlook"), {
  ssr: false,
  loading: () => null,
});

export default function DisplayKlookClient({ placeSlug, pageSlug }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  /* 延遲兩秒再載入 */
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return shouldLoad ? (
    <DisplayKlook placeSlug={placeSlug} pageSlug={pageSlug} />
  ) : null;
}
