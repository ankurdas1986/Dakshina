import type { ReactNode } from "react";

export function FormActions({
  children,
  className = ""
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`flex flex-wrap justify-end gap-2 pt-3 ${className}`.trim()}>{children}</div>;
}
