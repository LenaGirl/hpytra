"use client";

import Script from "next/script";
import klookGroups from "@/data/klook-groups.json";

export default function DisplayKlook({ placeSlug, pageSlug }) {
  const matchedGroup = klookGroups.find((group) =>
    group.slugs.includes(placeSlug)
  );
  if (!matchedGroup) return null;

  return (
    <>
      <div
        className="klk-aff-widget"
        data-adid={matchedGroup.adid}
        data-cid={matchedGroup.cid}
        data-cardh="126"
        data-padding="92"
        data-lgh="470"
        data-edgevalue="655"
        data-tid="21"
        data-amount="6"
        data-prod="dynamic_widget"
      ></div>

      {/* 台北：包含台北市/新北市兩個 Widget */}
      {matchedGroup.adid2 && matchedGroup.cid2 && (
        <div
          className="klk-aff-widget"
          data-adid={matchedGroup.adid2}
          data-cid={matchedGroup.cid2}
          data-cardh="126"
          data-padding="92"
          data-lgh="470"
          data-edgevalue="655"
          data-tid="21"
          data-amount="6"
          data-prod="dynamic_widget"
        ></div>
      )}
      <Script
        key={pageSlug}
        src={`https://affiliate.klook.com/widget/fetch-iframe-init.js`}
        strategy="lazyOnload"
      />
    </>
  );
}
