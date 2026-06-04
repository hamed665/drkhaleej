type HomeTrustBar2026Props = { items: readonly string[] };

export function HomeTrustBar2026({ items }: HomeTrustBar2026Props) {
  return (
    <div className="dm2026-trust-bar mx-auto grid max-w-5xl gap-3 rounded-[1.5rem] border border-dm-border bg-white/75 p-3 shadow-dm-sm sm:grid-cols-3">
      {items.map((item) => (
        <div key={item} className="rounded-2xl bg-dm-bg-soft px-4 py-3 text-center text-sm font-bold text-dm-brand-strong">
          {item}
        </div>
      ))}
    </div>
  );
}
