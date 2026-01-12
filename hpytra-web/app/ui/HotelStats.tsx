import Link from "next/link";
import HotelLabels from "@/app/ui/HotelLabels";
import {
  getAgodaUrl,
  getBookingUrl,
  getKlookUrl,
  getKkdayUrl,
} from "@/app/lib/getAffiliateLinks";

export default function HotelStats({ hotel, labels, clickLoc }) {
  const referencePriceUrl = ({
    agodaSlug,
    bookingSlug,
    klookSlug,
    kkdaySlug,
    clickLoc,
  }) => {
    let url = "";
    if (agodaSlug) {
      url = getAgodaUrl({ agodaSlug });
    } else if (bookingSlug) {
      url = getBookingUrl({ bookingSlug, clickLoc });
    } else if (klookSlug) {
      url = getKlookUrl({ klookSlug });
    } else if (kkdaySlug) {
      url = getKkdayUrl({ kkdaySlug });
    }

    return url;
  };

  return (
    <>
      {/* Hotel Google 評分 */}
      <li>
        <a
          href={`https://www.google.com/maps/?q=${hotel.name}`}
          target="_blank"
        >
          <span className="text-strong">Google評分：</span>
          <span className="text-highlight text-strong">
            {hotel.google_rating.toFixed(1)}
          </span>
        </a>
      </li>

      {/* Hotel 參考價格 */}
      <li>
        <Link
          href={referencePriceUrl({
            agodaSlug: hotel.agoda_slug,
            bookingSlug: hotel.booking_slug,
            klookSlug: hotel.klook_slug,
            kkdaySlug: hotel.kkday_slug,
            clickLoc: clickLoc,
          })}
        >
          <span className="text-strong">參考價格：</span>
        </Link>
        {hotel.price_double_room && (
          <>
            雙人房{" "}
            <span className="text-highlight text-strong">
              ${new Intl.NumberFormat("zh-TW").format(hotel.price_double_room)}
            </span>
          </>
        )}

        {hotel.price_double_room && hotel.price_quad_room && " / "}

        {hotel.price_quad_room && (
          <>
            四人房{" "}
            <span className="text-highlight text-strong">
              ${new Intl.NumberFormat("zh-TW").format(hotel.price_quad_room)}
            </span>
          </>
        )}
      </li>

      {/* Hotel 標籤 */}
      <HotelLabels hotel={hotel} labels={labels} />
    </>
  );
}
