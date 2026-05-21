import { useGSAP } from "@gsap/react";
import Marquee from "./Marquee";
import gsap from "gsap";

export default function TechStack() {
  useGSAP(() => {
    gsap.from("#techstack-title", {
      opacity: 0,
      yPercent: 100,
      scrollTrigger: {
        trigger: "#techstack-title",
        start: "top 80%"
      }
    });
  }, []);
  return (
    <section className="max-w-7xl px-2 py-10 sm:px-4 lg:px-6 lg:py-14 mx-auto">
      <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
        <h2
          id="techstack-title"
          className="text-3xl font-bold md:text-4xl md:leading-tight text-white"
        >
          Our Technologies
        </h2>
      </div>
      <div className="flex flex-col justify-center space-y-12 text-white">
        <Marquee />
        <Marquee isReversed={true} />
      </div>
    </section>
  );
}
