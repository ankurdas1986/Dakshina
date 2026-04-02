import type { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

export function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section
      style={{
        borderRadius: 20,
        border: "1px solid rgba(255, 153, 51, 0.16)",
        background: "rgba(255,255,255,0.72)",
        padding: 20
      }}
    >
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div>{children}</div>
    </section>
  );
}
