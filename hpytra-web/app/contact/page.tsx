import Image from "next/image";
import { Metadata } from "next";

export default function ContactPage() {
  return (
    <>
      <section className="page__hero">
        <Image
          src="/banner/banner-contact.jpg"
          alt="聯絡我們Banner"
          className="page__hero-image"
          quality={40}
          fill
          priority
        />
        <div className="hero-overlay" />
        <div className="page__hero-content">
          <h1>聯 絡 我 們</h1>
        </div>
      </section>
      <main>
        <section></section>
      </main>
    </>
  );
}
export const metadata: Metadata = {
  title: "關於我們",
};
