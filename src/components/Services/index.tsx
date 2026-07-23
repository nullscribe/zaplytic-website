import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ServiceCard from "./ServiceCard";
import { services } from "@/loaders/services";

export default function Services() {
  useGSAP(() => {
    gsap.from(".service-card", {
      opacity: 0,
      y: 24,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: "#services-section",
        start: "top 80%"
      }
    });

    gsap.from("#services-title", {
      opacity: 0,
      yPercent: 100,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#services-title",
        start: "top 85%"
      }
    });
  }, []);

  const feature = services.find((s) => s.feature) ?? services[0];
  const rest = services.filter((s) => !s.feature);

  return (
    <section
      id="services-section"
      className="max-w-7xl px-2 py-10 sm:px-4 lg:px-6 lg:py-14 mx-auto"
    >
      <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14">
        <h2 id="services-title" className="text-3xl font-bold md:text-4xl md:leading-tight text-fg">
          What we can do for you
        </h2>
        <p className="mt-3 text-fg-muted text-base md:text-lg">
          Software made simple — built for businesses, shops, and people across Bangladesh.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <div className="service-card md:col-span-2 lg:col-span-2 lg:row-span-2">
          <ServiceCard service={feature} />
        </div>
        {rest.map((service) => (
          <div key={service.id} className="service-card">
            <ServiceCard service={service} />
          </div>
        ))}
      </div>
    </section>
  );
}
