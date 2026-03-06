import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import "@/app/global.css";
import BackToTop from "@/app/ui/BackToTop";
import HeaderMenu from "@/app/ui/HeaderMenu";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { fetchPlacesLite } from "@/app/lib/api";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let places = [];

  try {
    places = await fetchPlacesLite();
  } catch (err) {
    console.error("places fetch failed", err);
  }

  return (
    <html lang="zh-tw">
      <body>
        <AuthProvider>
          <header>
            <Link href="/" prefetch={false}>
              <Image
                src="/hpytra_logo.png"
                alt="幸福旅行站"
                width={136}
                height={41}
                priority
              />
            </Link>
            <HeaderMenu places={places} />
          </header>
          {children}
          <BackToTop />
          <footer>
            <div className="footer__content">
              <div className="footer__about text-strong">
                <Link href="/" prefetch={false}>
                  <Image
                    src="/hpytra_logo.png"
                    alt="幸福旅行站"
                    width={240}
                    height={72}
                  />
                </Link>
                <p>提供台灣各地優質住宿推薦，</p>
                <p>陪伴您與家人展開幸福旅程。</p>
              </div>
              <div className="footer__disclaimer">
                <p className="text-small">
                  聯盟行銷說明：本站部分連結與商家有聯盟合作，若您點擊購買，我們將獲得微薄佣金支持營運，這不會增加您的購買費用。感謝您的支持！
                </p>
                <p>
                  [
                  <Link href="/affiliate_disclosure" prefetch={false}>
                    免責聲明
                  </Link>
                  ] [
                  <Link href="/privacy_policy" prefetch={false}>
                    隱私權政策
                  </Link>
                  ]
                </p>
              </div>
            </div>
            <div className="footer__copyright">
              <p>Copyright ©幸福旅行站</p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: {
    template: "%s | 幸福旅行站 - 親子家庭度假去",
    default: "幸福旅行站 - 親子家庭度假去",
  },
  description:
    "幸福旅行站提供台灣熱門旅遊景點之優質住宿推薦，包括親子住宿、高CP值住宿、景觀民宿和小木屋等，並提供住宿及景點門票套票等優惠資訊，是親子家庭規劃度假的最佳首選網站。",
  keywords: [
    "台灣住宿",
    "台灣飯店",
    "台灣民宿",
    "台灣住宿推薦",
    "台灣住宿網站",
  ],
  metadataBase: new URL("https://www.hpytra.com"),
  openGraph: {
    title: "幸福旅行站 - 親子家庭度假去",
    description:
      "幸福旅行站提供台灣熱門旅遊景點之優質住宿推薦，是親子家庭規劃度假的最佳首選網站。",
    url: "https://www.hpytra.com",
    siteName: "幸福旅行站",
    images: [
      {
        url: "/banner/banner-hpytra.jpg",
        width: 1200,
        height: 630,
        alt: "幸福旅行站 - 親子家庭度假去",
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
};
