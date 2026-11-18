import gsap, { ScrollTrigger } from "@/lib/gsap";

/** Kills every tween, timeline and ScrollTrigger so tests don't leak animations. */
export function resetGsap(): void {
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  gsap.globalTimeline.clear();
}

/** Number of tweens/timelines currently on the global timeline. */
export const activeAnimations = (): number =>
  gsap.globalTimeline.getChildren(true, true, true).length;

/** Tweens targeting a given element (or any of the given elements). */
export const tweensOf = (targets: gsap.TweenTarget): gsap.core.Tween[] => gsap.getTweensOf(targets);
