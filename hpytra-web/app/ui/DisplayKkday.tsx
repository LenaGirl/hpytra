"use client";

import Script from "next/script";
import kkdayGroups from "@/data/kkday-groups.json";

export default function DisplayKkday({ placeSlug, pageSlug }) {
  const defaultOID = "3500"; //taiwan

  const dataOID =
    Object.keys(kkdayGroups).find((oid) =>
      kkdayGroups[oid].includes(placeSlug)
    ) || defaultOID;

  return (
    <>
      <div
        className="kkday-product-media"
        data-oid={dataOID}
        data-amount="6"
        data-origin="https://kkpartners.kkday.com"
      ></div>
      <Script
        key={pageSlug}
        src={`https://kkpartners.kkday.com/iframe.init.1.0.js`}
        strategy="lazyOnload"
      />
    </>
  );
}
