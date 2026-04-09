"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const DisplayKkday = dynamic(() => import("@/app/ui/DisplayKkday"), {
  ssr: false,
  loading: () => null,
});

export default function DisplayKkdayClient({ placeSlug, pageSlug }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  /* 延遲兩秒再載入 */
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return shouldLoad ? (
    <DisplayKkday placeSlug={placeSlug} pageSlug={pageSlug} />
  ) : null;
}
