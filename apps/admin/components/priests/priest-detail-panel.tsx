import type { ReactNode } from "react";
import { FileImage, FolderOpenDot, Globe2, Languages, MapPinned, PhoneCall, ScrollText } from "lucide-react";
import { savePriestReview } from "../../app/actions/priests";
import { KycDocumentGallery } from "./kyc-document-gallery";
import { PriestServiceSelector } from "../priest-service-selector";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { FieldHint } from "../ui/field-hint";
import { Input } from "../ui/input";
import type { PriestRecord } from "../../lib/priest-store";
import { buildCategoryLabel, type RitualStore } from "../../lib/ritual-store";

const documentPreviewMap: Record<string, { title: string; asset: string; sides: 1 | 2 }> = {
  govt_id: { title: "Government ID", asset: "/kyc/govt-id.svg", sides: 2 },
  address_proof: { title: "Address proof", asset: "/kyc/address-proof.svg", sides: 2 },
  profile_photo: { title: "Profile photo", asset: "/kyc/profile-photo.svg", sides: 1 },
  service_specialization: { title: "Service specialization", asset: "/kyc/service-specialization.svg", sides: 1 },
  home_pin: { title: "Home pin", asset: "/kyc/home-pin.svg", sides: 1 },
  aadhaar: { title: "Aadhaar", asset: "/kyc/govt-id.svg", sides: 2 },
  voter_id: { title: "Voter ID", asset: "/kyc/govt-id.svg", sides: 2 }
};

export function getPriestStatusVariant(status: string) {
  if (status === "approved" || status === "verified") {
    return "success" as const;
  }

  if (status === "review") {
    return "outline" as const;
  }

  return "secondary" as const;
}

type PriestDetailPanelProps = {
  priest: PriestRecord;
  ritualStore: RitualStore;
  returnTo: string;
};

export function PriestDetailPanel({ priest, ritualStore, returnTo }: PriestDetailPanelProps) {
  const documentGallery = priest.documentRecords.length
    ? priest.documentRecords.map((record) => ({
        key: `${record.id}:${record.side}`,
        title: documentPreviewMap[record.type]?.title ?? record.type,
        asset: documentPreviewMap[record.type]?.asset ?? "/kyc/govt-id.svg",
        sideLabel: record.side === "single" ? "Single" : record.side === "front" ? "Front" : "Back",
        note: `KYC ${record.status}`
      }))
    : priest.documents.flatMap((documentKey) => {
        const preview = documentPreviewMap[documentKey] ?? {
          title: documentKey,
          asset: "/kyc/govt-id.svg",
          sides: 1 as const
        };

        if (preview.sides === 2) {
          return [
            { key: `${documentKey}:front`, title: preview.title, asset: preview.asset, sideLabel: "Front", note: "Large preview available" },
            { key: `${documentKey}:back`, title: preview.title, asset: preview.asset, sideLabel: "Back", note: "Large preview available" }
          ];
        }

        return [{ key: documentKey, title: preview.title, asset: preview.asset, sideLabel: "Single", note: "Large preview available" }];
      });

  return (
    <form action={savePriestReview} className="space-y-5">
      <input name="id" type="hidden" value={priest.id} />
      <input name="pendingPayout" type="hidden" value={priest.pendingPayout} />
      <input name="returnTo" type="hidden" value={returnTo} />

      <div className="space-y-3">
        <div>
          <p className="text-xl font-semibold text-foreground">{priest.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {priest.locality}, {priest.district}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={getPriestStatusVariant(priest.kycStatus)}>KYC {priest.kycStatus}</Badge>
          <Badge variant={getPriestStatusVariant(priest.verificationStatus)}>{priest.verificationStatus}</Badge>
          <Badge variant="outline">Radius {priest.radiusKm} km</Badge>
        </div>
      </div>

      <div className="grid gap-2">
        <InfoRow icon={ScrollText} label="Services" value={priest.services.join(", ")} />
        <InfoRow icon={FolderOpenDot} label="Category path" value={priest.serviceCategoryId ? buildCategoryLabel(priest.serviceCategoryId, ritualStore.categories) : "Not assigned"} />
        <InfoRow icon={Globe2} label="Cultures" value={priest.cultureTags.join(", ")} />
        <InfoRow icon={Languages} label="Languages" value={priest.languageTags.join(", ")} />
        <InfoRow icon={PhoneCall} label="Contact" value={priest.phone} />
        <InfoRow icon={FileImage} label="Pending payout" value={`Rs ${priest.pendingPayout}`} />
        <InfoRow icon={MapPinned} label="Availability" value={priest.availabilitySummary} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          defaultValue={priest.kycStatus}
          label="KYC status"
          name="kycStatus"
          options={[
            { value: "pending", label: "pending" },
            { value: "review", label: "review" },
            { value: "approved", label: "approved" },
            { value: "rejected", label: "rejected" }
          ]}
        />
        <SelectField
          defaultValue={priest.verificationStatus}
          label="Verification status"
          name="verificationStatus"
          options={[
            { value: "unverified", label: "unverified" },
            { value: "review", label: "review" },
            { value: "verified", label: "verified" }
          ]}
        />
      </div>

      <label className="grid gap-2 text-sm font-semibold text-foreground">
        <span>Travel radius (km)</span>
        <Input defaultValue={priest.radiusKm} min={0} name="radiusKm" type="number" />
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Culture tags">
          <Input defaultValue={priest.cultureTags.join(", ")} name="cultureTags" placeholder="Bengali, Odia" />
        </Field>
        <Field label="Language tags">
          <Input defaultValue={priest.languageTags.join(", ")} name="languageTags" placeholder="Bengali, Hindi, Sanskrit" />
        </Field>
      </div>

      <label className="grid gap-2 text-sm font-semibold text-foreground">
        <span>Availability summary</span>
        <textarea
          className="min-h-24 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          defaultValue={priest.availabilitySummary}
          name="availabilitySummary"
        />
      </label>

      <div className="grid gap-2 text-sm font-semibold text-foreground">
        <span>Priest service mapping</span>
        <PriestServiceSelector
          categories={ritualStore.categories.map((category) => ({ id: category.id, name: category.name, parentId: category.parentId }))}
          defaultMainCategoryId={priest.mainCategoryId}
          defaultRitualIds={priest.ritualIds}
          defaultServiceCategoryId={priest.serviceCategoryId}
          rituals={ritualStore.rituals.map((ritual) => ({ id: ritual.id, name: `${ritual.cultureType}: ${ritual.name}`, categoryId: ritual.categoryId }))}
        />
      </div>

      <div className="rounded-[20px] border border-border bg-secondary/35 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
          <FileImage className="h-4 w-4 text-primary" />
          <span>KYC documents</span>
        </div>
        <KycDocumentGallery documents={documentGallery} />
      </div>

      <label className="grid gap-2 text-sm font-semibold text-foreground">
        <span>Admin notes</span>
        <textarea
          className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          defaultValue={priest.notes}
          name="notes"
        />
      </label>

      <div className="flex justify-end">
        <Button type="submit">Save priest review</Button>
      </div>
    </form>
  );
}

type InfoRowProps = {
  icon: typeof ScrollText;
  label: string;
  value: string;
};

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-border bg-white px-3 py-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm leading-6 text-foreground">{value}</p>
      </div>
    </div>
  );
}

type SelectFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
};

function SelectField({ label, name, defaultValue, options }: SelectFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <select className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" defaultValue={defaultValue} name={name}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      {children}
    </label>
  );
}


