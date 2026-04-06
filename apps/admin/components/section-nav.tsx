type SectionNavItem = {
  href: string;
  label: string;
  primary?: boolean;
};

type SectionNavProps = {
  items: SectionNavItem[];
};

export function SectionNav({ items }: SectionNavProps) {
  return (
    <nav aria-label="Section navigation" className="flex flex-wrap items-center gap-2">
      {items.map((item) => (
        <a
          className={
            item.primary
              ? "inline-flex items-center rounded-full border border-primary/10 bg-primary/10 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-primary/15"
              : "inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:bg-secondary/50"
          }
          href={item.href}
          key={item.href}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
