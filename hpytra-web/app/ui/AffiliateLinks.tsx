import Link from "next/link";
import Image from "next/image";
import {
  getAgodaUrl,
  getBookingUrl,
  getKlookUrl,
  getKkdayUrl,
} from "@/app/lib/getAffiliateLinks";
import affiliateLinksStyles from "./affiliateLinks.module.css";

export default function AffiliateLinks({ hotel, clickLoc, styleType }) {
  const renderContent = (platform) => {
    switch (styleType) {
      case "rectangle":
        return (
          <Image
            src={`/affiliate/${platform}.png`}
            alt={platform}
            width={90}
            height={30}
          />
        );
      case "circle":
        return (
          <Image
            src={`/affiliate/${platform}-circle.png`}
            alt={platform}
            width={40}
            height={40}
          />
        );

      case "text":
      default:
        return <u>{platform}</u>;
    }
  };

  return (
    <>
      {hotel.agoda_slug && (
        <Link
          className={affiliateLinksStyles["affiliate-link"]}
          href={getAgodaUrl({
            agodaSlug: hotel.agoda_slug,
          })}
          target="_blank"
          prefetch={false}
        >
          {renderContent("Agoda")}
        </Link>
      )}
      {hotel.booking_slug && (
        <Link
          className={affiliateLinksStyles["affiliate-link"]}
          href={getBookingUrl({
            bookingSlug: hotel.booking_slug,
            clickLoc: clickLoc,
          })}
          target="_blank"
          prefetch={false}
        >
          {renderContent("Booking")}
        </Link>
      )}
      {hotel.klook_slug && (
        <Link
          className={affiliateLinksStyles["affiliate-link"]}
          href={getKlookUrl({
            klookSlug: hotel.klook_slug,
          })}
          target="_blank"
          prefetch={false}
        >
          {renderContent("Klook")}
        </Link>
      )}
      {hotel.kkday_slug && (
        <Link
          className={affiliateLinksStyles["affiliate-link"]}
          href={getKkdayUrl({
            kkdaySlug: hotel.kkday_slug,
          })}
          target="_blank"
          prefetch={false}
        >
          {renderContent("Kkday")}
        </Link>
      )}
    </>
  );
}
