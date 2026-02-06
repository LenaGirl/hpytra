"use client";

import { Suspense } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import HotelItemCollection from "@/app/ui/HotelItemCollection";

export default function HotelList({ hotels, places, labels }) {
  /*--- 分頁相關 ---*/
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const PAGE_SIZE = 24;

  const currentPage = Number(searchParams.get("page")) || 1;
  const totalPages = Math.ceil(hotels.length / PAGE_SIZE);

  /* 當前分頁的 Hotels */
  const paginatedHotels = hotels.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  /* 切換分頁 */
  const changePage = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    replace(`${pathname}?${params.toString()}#hotel-list`);
  };

  return (
    <>
      {/* Hotels 清單 */}

      <div className="grid-primary">
        <Suspense fallback={null}>
          <HotelItemCollection
            hotels={paginatedHotels}
            displayPlace={false}
            places={places}
            labels={labels}
          />
        </Suspense>
        {paginatedHotels.length === 0 && <p>沒有符合的住宿。</p>}
      </div>

      {/* 頁碼 */}
      {hotels.length > PAGE_SIZE && (
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
