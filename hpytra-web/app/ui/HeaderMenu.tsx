"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/app/lib/authStore";
import { logout } from "@/app/lib/auth";
import { memberMenuItems } from "@/data/memberMenuItems";

export default function HeaderMenu({ places }) {
  const router = useRouter();
  const pathname = usePathname();

  /* 會員 */
  const { isAuthenticated } = useAuthStore();
  const handleLogout = async () => {
    const ok = window.confirm("確定要登出嗎？");
    if (!ok) return;
    await logout();
  };

  /* (小尺寸裝置) 控制選單 Open */
  const [openMenu, setOpenMenu] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [openMemberSubmenu, setOpenMemberSubmenu] = useState(false);

  /* (小尺寸裝置) 換頁收合選單 */
  useEffect(() => {
    setOpenMenu(false);
    setOpenSubmenu(null);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  /* (大尺寸裝置) 第三層選單超出視窗底部時，調整為貼齊視窗底部 */
  const handleMouseEnter = (e) => {
    if (window.innerWidth < 1024) return;

    const submenu = e.currentTarget.querySelector(
      ".header__submenu.level-3",
    ) as HTMLElement;
    if (!submenu) return;

    setTimeout(() => {
      const rect = submenu.getBoundingClientRect();
      const originalLeft = rect.left;

      if (rect.bottom > window.innerHeight) {
        submenu.style.left = `${originalLeft}px`;
        submenu.classList.add("is-overflow-bottom");
      } else {
        submenu.classList.remove("is-overflow-bottom");
      }
    }, 0);
  };
  const handleMouseLeave = (e) => {
    e.currentTarget.classList.remove("is-overflow-bottom");
  };

  return (
    <>
      {/* Hamburger */}
      <button
        type="button"
        className="header__hamburger"
        aria-label={openMenu ? "關閉主選單" : "開啟主選單"}
        aria-expanded={openMenu}
        onClick={() => {
          setOpenMenu((prev) => {
            if (prev) {
              setOpenSubmenu(null);
              setOpenMemberSubmenu(false);
            }
            return !prev;
          });
        }}
      >
        {openMenu ? (
          /* 關閉圖示 */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        ) : (
          /* 漢堡圖示 */
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        )}
      </button>

      {/* 主選單 */}
      <nav className={`header__right ${openMenu ? "is-open" : ""}`}>
        <ul className="header__menu">
          <li className="header__menu-item">
            <Link href="/" prefetch={false}>
              首頁
            </Link>
          </li>
          <li className="header__menu-item">
            <Link href="/about" prefetch={false}>
              關於我們
            </Link>
          </li>
          <li className="header__menu-item has-children">
            <div className="header__item-row">
              <Link href="/" prefetch={false}>
                旅遊住宿推薦
              </Link>
              <button
                type="button"
                className="header__submenu-toggle"
                aria-label={openSubmenu ? "收合選單" : "展開選單"}
                aria-expanded={openSubmenu !== null}
                onClick={() => setOpenSubmenu(openSubmenu ? null : "places")}
              >
                <ChevronIcon />
              </button>
            </div>
            <ul className={`header__submenu ${openSubmenu ? "is-open" : ""}`}>
              {/* 第二層「縣市層級 Places」*/}
              {places
                .filter((place) => !place.parent_slug)
                .map((place) => {
                  const children = places.filter(
                    (child) => child.parent_slug === place.slug,
                  );

                  return (
                    <li
                      key={place.slug}
                      className="header__submenu-item"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="header__item-row">
                        <Link
                          href={`/hotel_place/${place.slug}`}
                          prefetch={false}
                        >
                          {place.name}
                        </Link>

                        {children.length > 0 && (
                          <button
                            type="button"
                            className="header__submenu-toggle"
                            aria-expanded={openSubmenu === place.slug}
                            onClick={() =>
                              setOpenSubmenu(
                                openSubmenu === place.slug
                                  ? "places"
                                  : place.slug,
                              )
                            }
                          >
                            <ChevronIcon />
                          </button>
                        )}
                      </div>

                      {/* 第三層「子 Places」*/}
                      {children.length > 0 && (
                        <ul
                          className={`header__submenu level-3 ${
                            openSubmenu === place.slug ? "is-open" : ""
                          }`}
                        >
                          {children.map((child) => (
                            <li
                              key={child.slug}
                              className="header__submenu-item"
                            >
                              <Link
                                href={`/hotel_place/${child.slug}`}
                                prefetch={false}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
            </ul>
          </li>
          <li className="header__menu-item">
            <a href="mailto:happytravellena@gmail.com">聯絡我們</a>
          </li>
          <li className="header__menu-item">
            <Link href="/map" className="btn btn-primary" prefetch={false}>
              地圖找房
            </Link>
          </li>
          {/* 會員專區 */}
          <li className="header__menu-item header__member-space">
            <button
              type="button"
              className="header__member btn-text"
              onClick={() => {
                if (isAuthenticated) {
                  setOpenMemberSubmenu((prev) => {
                    return !prev;
                  });
                } else {
                  router.replace("/login");
                }
              }}
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.75}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
              {!isAuthenticated && <span>登入</span>}
            </button>
            {isAuthenticated && (
              <ul
                className={`header__submenu ${openMemberSubmenu ? "is-open" : ""}`}
              >
                {memberMenuItems.map((item) => (
                  <li key={item.href} className="header__submenu-item">
                    <Link href={item.href} prefetch={false}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="header__submenu-item">
                  <button className="btn-text" onClick={handleLogout}>
                    [ 登出 ]
                  </button>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}
function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m19.5 8.25-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}
