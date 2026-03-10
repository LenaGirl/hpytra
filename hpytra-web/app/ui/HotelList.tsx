"use client";

import { Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import HotelItemCollection from "@/app/ui/HotelItemCollection";
import { HotelItem, PlaceLite, LabelLite } from "@/app/lib/api";

type HotelListProps = {
  hotels: HotelItem[];
  totalHotels: number;
  displayPlace?: boolean;
  places: PlaceLite[];
  labels: LabelLite[];
  openInNewTab?: boolean;
};

export default function HotelList({
  hotels,
  totalHotels,
  displayPlace = false,
  places,
  labels,
  openInNewTab = false,
}: HotelListProps) {
  /*--- 分頁相關 ---*/
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const PAGE_SIZE = 24;

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(totalHotels / PAGE_SIZE);

  /* 切換分頁 */
  const changePage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    if (pageNumber > 1) {
      params.set("page", pageNumber.toString());
    } else {
      params.delete("page");
    }
    replace(`${pathname}?${params.toString()}#hotel-list`);
  };

  return (
    <>
      {/* Hotels 清單 */}

      <div className="grid-primary">
        <Suspense fallback={null}>
          <HotelItemCollection
            hotels={hotels}
            displayPlace={displayPlace}
            places={places}
            labels={labels}
            openInNewTab={openInNewTab}
          />
        </Suspense>
        {hotels.length === 0 && <p>沒有符合的住宿。</p>}
      </div>

      {/* 頁碼 */}
      {totalPages > 1 && (
        <nav className="pagination">
          {currentPage > 1 && (
            <button
              className="btn btn-pagination"
              onClick={() => changePage(currentPage - 1)}
            >
              « 上一頁
            </button>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => changePage(num)}
              className={`btn btn-pagination ${
                num === currentPage ? "active" : ""
              }`}
            >
              {num}
            </button>
          ))}

          {currentPage < totalPages && (
            <button
              className="btn btn-pagination"
              onClick={() => changePage(currentPage + 1)}
            >
              下一頁 »
            </button>
          )}
        </nav>
      )}
    </>
  );
}
