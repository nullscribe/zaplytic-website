import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useGSAP } from "@gsap/react";
import type { ReactElement } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import TeamCard from "@/components/TeamCard";
import ValuesMagnetic from "@/components/ValuesMagnetic";
import { team, values, CONTACT_EMAIL, socials } from "@/loaders/team";

const SOCIAL_ICONS: Record<string, ReactElement> = {
  Email: (
    <svg
      className="shrink-0 size-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
    </svg>
  ),
  Twitter: (
    <svg
      className="shrink-0 size-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
    </svg>
  ),
  GitHub: (
    <svg
      className="shrink-0 size-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  ),
  Slack: (
    <svg
      className="shrink-0 size-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 16 16"
      aria-hidden
    >
      <path d="M3.362 10.11c0 .926-.756 1.681-1.681 1.681S0 11.036 0 10.111C0 9.186.756 8.43 1.68 8.43h1.682v1.68zm.846 0c0-.924.756-1.68 1.681-1.68s1.681.756 1.681 1.68v4.21c0 .924-.756 1.68-1.68 1.68a1.685 1.685 0 0 1-1.682-1.68v-4.21zM5.89 3.362c-.926 0-1.682-.756-1.682-1.681S4.964 0 5.89 0s1.68.756 1.68 1.68v1.682H5.89zm0 .846c.924 0 1.68.756 1.68 1.681S6.814 7.57 5.89 7.57H1.68C.757 7.57 0 6.814 0 5.89c0-.926.756-1.682 1.68-1.682h4.21zm6.749 1.682c0-.926.755-1.682 1.68-1.682.925 0 1.681.756 1.681 1.681s-.756 1.681-1.68 1.681h-1.681V5.89zm-.848 0c0 .924-.755 1.68-1.68 1.68A1.685 1.685 0 0 1 8.43 5.89V1.68C8.43.757 9.186 0 10.11 0c.926 0 1.681.756 1.681 1.68v4.21zm-1.681 6.748c.926 0 1.682.756 1.682 1.681S11.036 16 10.11 16s-1.681-.756-1.681-1.68v-1.682h1.68zm0-.847c-.924 0-1.68-.755-1.68-1.68 0-.925.756-1.681 1.68-1.681h4.21c.924 0 1.68.756 1.68 1.68 0 .926-.756 1.681-1.68 1.681h-4.21z" />
    </svg>
  )
};

export default function About() {
  useGSAP(() => {
    const titleSplit = SplitText.create("#about-title", { type: "chars,words" });
    gsap.from(titleSplit.chars, {
      yPercent: 120,
      opacity: 0,
      rotate: 4,
      duration: 0.6,
      ease: "power3.out",
      stagger: { each: 0.02, from: "start" }
    });

    gsap.from("#about-eyebrow", {
      opacity: 0,
      y: 12,
      duration: 0.5,
      delay: 0.1
    });

    gsap.from("#about-lead", {
      opacity: 0,
      y: 24,
      duration: 0.6,
      delay: 0.2
    });

    gsap.from("#about-story-body p", {
      opacity: 0,
      y: 24,
      duration: 0.5,
      stagger: 0.15,
      scrollTrigger: { trigger: "#about-story-body", start: "top 80%" }
    });

    gsap.from("#team-section h3", {
      opacity: 0,
      x: -20,
      duration: 0.5,
      scrollTrigger: { trigger: "#team-section", start: "top 85%" }
    });

    gsap.from(".teamcard", {
      opacity: 0,
      y: 32,
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: { trigger: "#team-section", start: "top 75%" }
    });

    gsap.from("#team-section .hairline", {
      scaleX: 0,
      transformOrigin: "left",
      duration: 0.5,
      stagger: 0.08,
      scrollTrigger: { trigger: "#team-section", start: "top 75%" }
    });

    gsap.from("#values-section h3", {
      opacity: 0,
      x: -20,
      duration: 0.5,
      scrollTrigger: { trigger: "#values-section", start: "top 85%" }
    });

    gsap.from("#contact-eyebrow, #contact-title, #contact-copy", {
      opacity: 0,
      x: -32,
      duration: 0.5,
      stagger: 0.1,
      scrollTrigger: { trigger: "#contact", start: "top 80%" }
    });

    gsap.from("#contact-actions > *", {
      opacity: 0,
      x: 32,
      duration: 0.5,
      stagger: 0.1,
      scrollTrigger: { trigger: "#contact", start: "top 80%" }
    });
  }, []);

  return (
    <div className="py-12 sm:py-16" data-testid="aboutpage">
      <AnimatedBackground />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p
          id="about-eyebrow"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500"
        >
          About
        </p>
        <h2
          id="about-title"
          className="mt-4 text-4xl font-bold tracking-tight text-neutral-200 sm:text-5xl lg:text-6xl"
        >
          We build tools we'd use ourselves.
        </h2>
        <p
          id="about-lead"
          className="mt-6 max-w-2xl text-lg leading-8 text-neutral-400"
        >
          A small studio building high-quality, easy-to-use open-source tools
          and SaaS products to solve real-world problems.
        </p>

        <div
          id="about-story-body"
          className="mt-8 max-w-2xl text-base leading-7 text-neutral-400"
        >
          <p>
            We started Zaplytic to solve real-world problems we kept running
            into — and to share what we build with anyone who can use it.
            Everything we ship starts from a problem we've seen firsthand, not
            a trend we're chasing.
          </p>
          <p className="mt-4">
            We're a tight team of four: engineering, product, design, and
            relationships. That's enough to take an idea from a sketch to
            production, and small enough that every project still has our
            names on it.
          </p>
        </div>

        <section id="team-section" className="mt-20 sm:mt-24">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Team
          </h3>
          <div className="mt-2 border-t border-neutral-800">
            {team.map((member) => (
              <div key={member.name} className="border-b border-neutral-800">
                <div className="hairline h-px w-full bg-linear-to-r from-cyan-500/40 via-lime-500/20 to-transparent" />
                <TeamCard member={member} />
              </div>
            ))}
          </div>
        </section>

        <section id="values-section" className="mt-20 sm:mt-24">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            What we value
          </h3>
          <ValuesMagnetic values={values} />
        </section>

        <section
          id="contact"
          className="mt-20 sm:mt-24 grid grid-cols-1 gap-10 border-t border-neutral-800 pt-12 sm:grid-cols-2 sm:gap-16"
        >
          <div className="flex flex-col gap-4">
            <p
              id="contact-eyebrow"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500"
            >
              Get in touch
            </p>
            <h3
              id="contact-title"
              className="text-3xl font-bold tracking-tight text-neutral-200 sm:text-4xl"
            >
              Let's build something together.
            </h3>
            <p id="contact-copy" className="max-w-md text-base leading-7 text-neutral-400">
              Have a project in mind, a question, or just want to talk shop?
              Drop us a line — we read everything.
            </p>
          </div>
          <div
            id="contact-actions"
            className="flex flex-col items-start gap-6 sm:items-end sm:justify-center"
          >
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex justify-center items-center gap-x-3 text-center transition-colors duration-1000 bg-linear-to-l from-cyan-500 to-lime-500 hover:from-lime-500 hover:to-cyan-500 focus:from-lime-500 focus:to-cyan-500 focus:outline-none border border-transparent text-gray-900 text-sm font-medium rounded-full py-3 px-5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-5"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
              {CONTACT_EMAIL}
            </a>
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  className="size-9 inline-flex justify-center items-center gap-x-2 text-sm font-semibold rounded-full border border-transparent focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none text-neutral-400 hover:bg-neutral-700 focus:bg-neutral-700"
                  href={social.href}
                  target={social.label === "Email" ? undefined : "_blank"}
                  rel={
                    social.label === "Email" ? undefined : "noopener noreferrer"
                  }
                  aria-label={social.label}
                >
                  {SOCIAL_ICONS[social.label]}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
