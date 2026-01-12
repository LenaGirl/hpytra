import Image from "next/image";
import { Metadata } from "next";
import "./about.css";

export default function AboutPage() {
  return (
    <>
      <section className="page__hero">
        <Image
          src="/banner/banner-about.jpg"
          alt="關於我們Banner"
          className="page__hero-image"
          quality={40}
          fill
          priority
        />
        <div className="hero-overlay" />
        <div className="page__hero-content">
          <h1>關 於 我 們</h1>
        </div>
      </section>
      <main>
        <section className="about-content">
          <div className="about-photo">
            <Image
              src="/about-family.png"
              alt="關於我們照片"
              width={1200}
              height={800}
              sizes="(max-width: 1023px) 100vw, 50vw"
            />
          </div>
          <div className="about-description">
            <p>
              我熱愛旅行，喜歡親近大自然，旅途中喜歡拍下美麗的風景，回顧這些年來的旅行照片，驚覺我已經走訪了臺灣許多美麗的角落。
            </p>
            <p>
              隨著時間的推移，「我」變成了「我們」，我們家也多了兩個可愛的小寶貝，一家人一起旅行，充滿了幸福的氛圍。兩個小寶貝總是對溫馨舒適的住宿充滿期待，每次入住都興奮不已。
            </p>
            <p>
              然而，我們在尋找理想住宿的過程中，發現住宿資訊較為分散，常常需要花費大量時間來搜尋。我們相信很多人都有相同的困擾，於是，「幸福旅行站」誕生了！網站整合了各類住宿資訊，讓大家更輕鬆地找到理想的住宿，享受幸福的旅行時光。
            </p>
          </div>
        </section>
        <section className="about-message">
          <p>「幸福旅行站」伴隨我們一家人，展開幸福的旅行。</p>
          <p>我們也希望「幸福旅行站」成為您幸福旅途中的夥伴。</p>
          <p>我們誠摯地邀請您，一同用心感受旅行帶來的幸福滋味。</p>
        </section>
      </main>
    </>
  );
}
export const metadata: Metadata = {
  title: "關於我們",
};
