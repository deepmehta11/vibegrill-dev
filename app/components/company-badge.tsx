const DOTS: Record<string, string> = {
  Meta: "#0866ff",
  Google: "#ea4335",
};

export function CompanyBadge({ company }: { company?: string | null }) {
  if (!company) return null;
  const dot = DOTS[company] ?? "var(--color-ember)";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[5px] border border-line bg-panel-2 px-2 py-0.5 font-mono text-[10px] tracking-wide text-muted lowercase">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: dot, boxShadow: `0 0 6px ${dot}` }}
      />
      {company}
    </span>
  );
}
