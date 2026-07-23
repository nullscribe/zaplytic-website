import AnimatedBackground from "@/components/AnimatedBackground";
import Hero from "@/components/Hero";
import LatestBlogs from "@/components/LatestBlogs";
import Services from "@/components/Services";

export default function Home() {
  return (
    <main data-testid="homepage">
      <AnimatedBackground />
      <Hero />
      <Services />
      <LatestBlogs />
    </main>
  );
}
