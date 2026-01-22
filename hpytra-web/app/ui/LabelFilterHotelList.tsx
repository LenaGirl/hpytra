"use client";

import { useState } from "react";
import HotelList from "@/app/ui/HotelList";
import labelFilterHotelListStyles from "./labelFilterHotelList.module.css";

export default function LabelFilterHotelList({
  hotelsByPlace,
  labelsByPlace,
  places,
  labels,
}) {
  const [submittedLabels, setSubmittedLabels] = useState<string[]>([]);
  const [submittedMode, setSubmittedMode] = useState<"or" | "and">("or");

  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<"or" | "and">(submittedMode);

  /* 篩選 Hotels */
  const filteredHotels = hotelsByPlace.filter((hotel) => {
    if (submittedLabels.length === 0) return true;
    if (submittedMode === "or") {
      return submittedLabels.some((label) => hotel.labels.includes(label));
    } else {
      return submittedLabels.every((label) => hotel.labels.includes(label));
    }
  });

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
    setSubmittedLabels([]);
  };

  /* 點擊「搜尋」按鈕 */
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedMode(selectedMode);
    setSubmittedLabels(selectedLabels);
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
        filteredHotels={filteredHotels}
        places={places}
        labels={labels}
      />
    </>
  );
}
