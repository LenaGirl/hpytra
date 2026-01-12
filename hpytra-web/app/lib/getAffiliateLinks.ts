export function getAgodaUrl({ agodaSlug }: { agodaSlug: string }): string {
  return `https://www.agoda.com/partners/partnersearch.aspx?pcs=1&cid=1931147&hid=${agodaSlug}`;
}

export function getBookingUrl({
  bookingSlug,
  clickLoc,
}: {
  bookingSlug: string;
  clickLoc: string;
}): string {
  return `https://affone.site/track/clicks/3455/c627c2bc990426def88fec23d62e9743206c49df2aabebf70365b713210652aa8272f4?subid_1=${clickLoc}&t=https%253A%252F%252Fwww.booking.com%252Fhotel%252Ftw%252F${bookingSlug}.html`;
}

export function getKlookUrl({ klookSlug }: { klookSlug: string }): string {
  return `https://www.klook.com/zh-TW/hotels/detail/${klookSlug}/?aid=69454`;
}

export function getKkdayUrl({ kkdaySlug }: { kkdaySlug: string }): string {
  return `https://www.kkday.com/zh-tw/product/${kkdaySlug}?cid=20010`;
}
