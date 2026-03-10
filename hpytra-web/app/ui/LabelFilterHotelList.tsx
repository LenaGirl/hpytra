"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HotelList from "@/app/ui/HotelList";
import labelFilterHotelListStyles from "./labelFilterHotelList.module.css";
import { fetchHotelsByPlaceTree } from "@/app/lib/api";

export default function LabelFilterHotelList({
  placeSlug,
  hotelsByPlace,
  labelsByPlace,
  places,
  labels,
}) {
  /* 抓取 URL 參數 */
  const router = useRouter();
  const searchParams = useSearchParams();
  const labelsParam = searchParams.get("labels");
  const modeParam = searchParams.get("mode");

  /* UI state (user 選擇的篩選條件暫存) */
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<"or" | "and">("or");

  /* 篩選後的 Hotels */
  const [filteredHotels, setFilteredHotels] = useState(hotelsByPlace.results);
  const [totalHotels, setTotalHotels] = useState(hotelsByPlace.count);

  /* URL改變 -> 同步 UI state、fetch hotels */
  useEffect(() => {
    const filteredLabels = labelsParam ? labelsParam.split(",") : [];
    const mode = modeParam === "and" ? "and" : "or";

    /* 同步 UI state */
    setSelectedLabels(filteredLabels);
    setSelectedMode(mode);

    /* fetch hotels */
    async function loadFilteredHotels() {
      const data = await fetchHotelsByPlaceTree(
        placeSlug,
        filteredLabels,
        mode,
      );

      setFilteredHotels(data.results);
      setTotalHotels(data.count);
    }

    loadFilteredHotels();
  }, [labelsParam, modeParam, placeSlug]);

  /* 勾選/取消 Label */
  const handleLabelsChange = (checkboxLabel) => {
    if (!selectedLabels.includes(checkboxLabel)) {
      setSelectedLabels((previousLabels) => [...previousLabels, checkboxLabel]);
    } else {
      setSelectedLabels((previousLabels) =>
        previousLabels.filter((selected) => selected !== checkboxLabel),
      );
    }
  };

  /* 點擊「重設」按鈕 */
  const handleReset = () => {
    setSelectedMode("or");
    setSelectedLabels([]);

    router.push(`/hotel_place/${placeSlug}#hotel-list`);
  };

  /* 點擊「搜尋」按鈕 */
  const handleSubmit = (e) => {
    e.preventDefault();

    const filteredlabels =
      selectedLabels.length > 0 ? selectedLabels.join(",") : undefined;

    /* 建立 URL 參數 */
    const params = new URLSearchParams();
    if (filteredlabels) params.set("labels", filteredlabels);
    if (selectedMode !== "or") params.set("mode", selectedMode);
    const queryString = params.toString();

    router.push(
      `/hotel_place/${placeSlug}${queryString ? `?${queryString}` : ""}#hotel-list`,
    );
  };

  return (
    <>
      <form
        id="hotel-filter"
        className={labelFilterHotelListStyles["filter-form"]}
        onSubmit={handleSubmit}
      >
        <h3>進階篩選</h3>

        {/* Render Labels */}
        {labelsByPlace.map((label) => (
          <label key={label.slug}>
            <input
              type="checkbox"
              checked={selectedLabels.includes(label.slug)}
              onChange={(e) => handleLabelsChange(label.slug)}
            />
            {label.name}{" "}
          </label>
        ))}

        {/* 搜尋模式：聯集/交集 */}
        <div className={labelFilterHotelListStyles["filter-mode"]}>
          <label
            className={
              selectedMode === "or"
                ? labelFilterHotelListStyles["filter-mode-active"]
                : ""
            }
          >
            <input
              type="radio"
              name="search_mode"
              value="or"
              checked={selectedMode === "or"}
              onChange={() => setSelectedMode("or")}
            />
            聯集（OR）
          </label>
          <label
            className={
              selectedMode === "and"
                ? labelFilterHotelListStyles["filter-mode-active"]
                : ""
            }
          >
            <input
              type="radio"
              name="search_mode"
              value="and"
              checked={selectedMode === "and"}
              onChange={() => setSelectedMode("and")}
            />
            交集（AND）
          </label>
        </div>

        {/* 重設/搜尋 按鈕*/}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleReset}
        >
          重 設
        </button>
        <button type="submit" className="btn btn-primary">
          搜 尋
        </button>
      </form>

      {/* Render 篩選後的 Hotel List */}
      <HotelList
        hotels={filteredHotels}
        totalHotels={totalHotels}
        places={places}
        labels={labels}
      />
    </>
  );
}
