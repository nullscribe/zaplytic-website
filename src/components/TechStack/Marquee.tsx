import gsapIcon from "@/assets/technologies/gsap.svg";
import nextIcon from "@/assets/technologies/next.svg";
import reactIcon from "@/assets/technologies/react.svg";
import tailwindIcon from "@/assets/technologies/tailwind.svg";
import typescriptIcon from "@/assets/technologies/typescript.svg";
import jestIcon from "@/assets/technologies/jest.svg";
import vitestIcon from "@/assets/technologies/vitest.svg";
import angularIcon from "@/assets/technologies/angular.svg";
import railsIcon from "@/assets/technologies/rails.svg";
import reactNativeIcon from "@/assets/technologies/react-native.svg";
import expoIcon from "@/assets/technologies/expo.svg";
import postgresIcon from "@/assets/technologies/postgres.svg";
import expressIcon from "@/assets/technologies/express.svg";
import golangLogo from "@/assets/technologies/go.svg";
import phoenixLogo from "@/assets/technologies/phoenix.svg";
import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface MarqueeProps {
  isReversed?: boolean;
}

interface ImageData {
  name: string;
  src: string;
  height: number;
  width: number;
}

const icons: ImageData[] = [
  { name: "GSAP", src: gsapIcon, height: 40, width: 94 },
  { name: "Next", src: nextIcon, height: 40, width: 127 },
  { name: "React", src: reactIcon, height: 40, width: 117 },
  { name: "Tailwind", src: tailwindIcon, height: 40, width: 213 },
  { name: "React Native", src: reactNativeIcon, height: 40, width: 190 },
  { name: "Typescript", src: typescriptIcon, height: 40, width: 220 },
  { name: "Jest", src: jestIcon, height: 40, width: 107 },
  { name: "Vitest", src: vitestIcon, height: 40, width: 165 },
  { name: "Angular", src: angularIcon, height: 40, width: 163 },
  { name: "Rails", src: railsIcon, height: 40, width: 115 },
  { name: "Expo", src: expoIcon, height: 40, width: 120 },
  { name: "PostgreSQL", src: postgresIcon, height: 40, width: 197 },
  { name: "Express", src: expressIcon, height: 40, width: 177 },
  { name: "Golang", src: golangLogo, height: 40, width: 107 },
  { name: "Phoenix", src: phoenixLogo, height: 40, width: 180 }
];

const marqueeElements = [...icons, ...icons];

export default function Marquee({ isReversed }: MarqueeProps) {
  const movingContainer = useRef<HTMLDivElement | null>(null);
  const timeline = useRef<GSAPTimeline | null>(null);

  useGSAP(() => {
    gsap.set(movingContainer.current, {
      xPercent: isReversed ? -50 : 0
    });

    timeline.current = gsap
      .timeline({ defaults: { ease: "none", repeat: -1 } })
      .to(movingContainer.current, {
        xPercent: isReversed ? 0 : -50,
        duration: 50
      })
      .set(movingContainer.current, { xPercent: 0 });
  }, [isReversed]);

  const onPointerEnter = () => {
    timeline.current?.timeScale(0.3);
  };

  const onPointerLeave = () => {
    timeline.current?.timeScale(1);
  };

  const list = useMemo(
    () => (
      <div className="flex w-fit select-none items-center gap-10">
        {marqueeElements.map((elem, index) => {
          const isLast = index === marqueeElements.length - 1;
          return (
            <div
              key={index}
              className={`relative flex shrink-0 items-center justify-center ${isLast ? "mr-10" : ""}`}
              style={{ height: elem.height, width: elem.width }}
            >
              <img
                src={elem.src}
                height={40}
                alt={`${elem.name} logo`}
                className="object-contain w-full h-full"
              />
            </div>
          );
        })}
      </div>
    ),
    []
  );

  return (
    <div
      className="max-w-full overflow-hidden"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{
        maskImage:
          "linear-gradient(to right, transparent 0%, black 25%, black 75%, transparent 100%)"
      }}
    >
      <div ref={movingContainer} className="flex w-fit">
        {list}
        {list}
      </div>
    </div>
  );
}
