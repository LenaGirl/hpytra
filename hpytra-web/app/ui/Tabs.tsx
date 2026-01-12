"use client";
import { useState } from "react";

export default function Tabs({ tabs, defaultActive = 0 }) {
  const [active, setActive] = useState(defaultActive);

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`btn btn-secondary ${active === index ? "active" : ""}`}
            onClick={() => setActive(index)}
          >
            {tab.tabName}
          </button>
        ))}
      </div>
      <div className="tabs-content grid-secondary">{tabs[active].content}</div>
    </div>
  );
}
