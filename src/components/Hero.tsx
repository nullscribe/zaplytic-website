import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { Link } from "react-router-dom";

export default function Hero() {
  useGSAP(() => {
    const titleSplit = SplitText.create("#hero-title-start, #hero-title-end", {
      type: "words"
    });
    const subtitleSplit = SplitText.create("#hero-subtitle", { type: "lines" });

    gsap.from(titleSplit.words, {
      x: "random([-1000, 1000])",
      y: "random([-1000, 1000])",
      opacity: 0,
      ease: "power3.inOut",
      duration: 0.7
    });

    gsap.from(subtitleSplit.lines, {
      yPercent: 100,
      opacity: 0,
      stagger: 0.05,
      ease: "expo.inOut",
      duration: 1
    });

    const wordsTimeline = gsap.timeline({ repeat: -1, delay: 0.3 });
    const words: HTMLSpanElement[] = gsap.utils.toArray("#hero-words span");

    words.forEach((word) => {
      wordsTimeline
        .from(word, { y: 80, opacity: 0, duration: 0.5, ease: "power4.inOut" })
        .to(word, { y: -80, opacity: 0, duration: 0.5, ease: "power4.inOut" }, "+=1.5");
    });

    gsap.from("#hero-action", {
      opacity: 0,
      yPercent: 100,
      duration: 1,
      ease: "power4.inOut"
    });
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-340 mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-24 pb-10">
        <div className="mt-5 max-w-3xl text-center mx-auto">
          <h1 className="block font-bold text-4xl md:text-5xl lg:text-6xl text-fg">
            <span id="hero-title-start">Empowering </span>
            <span
              id="hero-words"
              className="mr-2 inline-grid overflow-hidden justify-items-start *:col-start-1 *:col-end-2 *:row-start-1 *:row-end-2"
            >
              <span className=" text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-lime-500">
                Developers
              </span>
              <span className=" text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-lime-500">
                Businesses
              </span>
              <span className=" text-transparent bg-clip-text bg-linear-to-r from-cyan-500 to-lime-500">
                Individuals
              </span>
            </span>
            <span id="hero-title-end">with Open-Source products</span>
          </h1>
        </div>

        <div className="mt-8 max-w-3xl text-center mx-auto">
          <p className="text-lg text-fg-muted" id="hero-subtitle">
            We build high-quality, easy-to-use open-source tools and SaaS products to solve
            real-world problems and empower developers, businesses, and everyday users.
          </p>
        </div>
        <div className="mt-16 gap-3 flex justify-center" id="hero-action">
          <Link
            className="inline-flex justify-center items-center gap-x-3 text-center transition-colors duration-1000 bg-linear-to-l from-cyan-500 to-lime-500 hover:from-lime-500 hover:to-cyan-500 focus:from-lime-500 focus:to-cyan-500 focus:outline-none border border-transparent text-gray-900 text-sm font-medium rounded-full py-3 px-4"
            to="/products"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
              aria-hidden="true"
              focusable="false"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
              />
            </svg>
            Explore our Products
          </Link>
        </div>
      </div>
    </div>
  );
}
