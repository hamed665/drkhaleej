type PublicDisclaimer2026Props = { children: string };

export function PublicDisclaimer2026({ children }: PublicDisclaimer2026Props) {
  return (
    <aside className="dm2026-disclaimer rounded-[1.5rem] border border-dm-border bg-white/75 p-5 text-sm leading-6 text-dm-text-soft shadow-dm-sm">
      {children}
    </aside>
  );
}
