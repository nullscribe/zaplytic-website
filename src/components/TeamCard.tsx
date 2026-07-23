import type { Member } from "@/loaders/team";

const ROLE_DOTS: Record<Member["role"], string> = {
  "Founder & Engineer": "bg-cyan-400",
  "Product R&D": "bg-lime-400",
  Design: "bg-emerald-400",
  "Corporate Relations": "bg-indigo-400"
};

export default function TeamCard({ member }: { member: Member }) {
  const dot = ROLE_DOTS[member.role];

  return (
    <article className="teamcard group relative grid grid-cols-1 gap-2 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-8">
      <div className="flex items-center gap-3">
        <span className={`size-2 shrink-0 rounded-full ${dot}`} aria-hidden />
        <h3 className="text-lg font-semibold tracking-tight text-fg transition-colors group-hover:text-fg">
          {member.name}
        </h3>
      </div>
      <div className="flex flex-col gap-1.5 sm:pl-6 sm:border-l sm:border-border">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-fg-subtle">
          {member.role}
        </span>
        <p className="max-w-xl text-sm leading-6 text-fg-muted">{member.bio}</p>
      </div>
    </article>
  );
}
