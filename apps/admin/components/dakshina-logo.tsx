import Image from "next/image";
import { cn } from "../lib/utils";

type DakshinaLogoProps = {
  compact?: boolean;
};

export function DakshinaLogo({ compact = false }: DakshinaLogoProps) {
  if (compact) {
    return (
      <div className="w-full space-y-4">
        <div className="w-full overflow-hidden rounded-3xl border border-border bg-white p-4 shadow-soft">
          <Image
            alt="Dakshina Direct logo"
            className="h-auto w-full"
            height={420}
            priority
            src="/brand/logo.png"
            width={1280}
          />
        </div>
        <div className="space-y-1 px-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">
            Dakshina Direct
          </p>
          <h1 className="text-lg font-extrabold tracking-tight text-foreground">Admin Command Center</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Elite operations backbone for ritual marketplace control.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 lg:flex-row lg:items-center") }>
      <div className="w-full max-w-[360px] overflow-hidden rounded-[32px] border border-border bg-white p-5 shadow-soft">
        <Image
          alt="Dakshina Direct logo"
          className="h-auto w-full"
          height={420}
          priority
          src="/brand/logo.png"
          width={1280}
        />
      </div>

      <div className="min-w-0 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-muted-foreground">Dakshina Direct</p>
        <h1 className="font-extrabold tracking-tight text-foreground text-4xl md:text-5xl">Admin Command Center</h1>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
          Premium ritual marketplace operations for launch markets across suburban West Bengal.
        </p>
      </div>
    </div>
  );
}
