"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "../../lib/utils";

type FieldHintProps = {
  label: string;
  hint?: string;
  className?: string;
};

const hintMap: Record<string, string> = {
  "default culture": "Sets the launch-priority tradition used as the default admin and marketplace starting point.",
  "launch cluster": "Defines the current operating region used for rollout planning and service coverage.",
  currency: "Stores the currency label used across pricing, payouts, and wallet calculations.",
  "default commission (%)": "Controls the baseline platform commission before district or manual overrides are applied.",
  "advance payment (%)": "Sets the minimum advance required before a booking is treated as commercially confirmed.",
  "reveal contact after advance payment": "If enabled, users who have paid the required advance can view priest contact details when the priest-level permission is also enabled.",
  "referee discount (%)": "Discount applied to the referred user's first eligible booking.",
  "referrer reward (rs)": "Credit released to the referrer only after the referred booking is completed and verified.",
  "min booking gap (hours)": "Prevents back-to-back bookings that would create scheduling collisions for priest operations.",
  "max booking window (days)": "Limits how far into the future customers can book through the marketplace.",
  "reveal window min (hours)": "Earliest time before ritual start when contact reveal is permitted after advance payment.",
  "reveal window max (hours)": "Latest time boundary for contact reveal under the 48-72 hour privacy rule.",
  district: "District is used for hyper-local search, service coverage, and commission overrides.",
  "commission (%)": "Overrides the default platform commission for this district or region.",
  "zone travel fee (rs)": "Adds a district-level travel fee on top of ritual pricing when the service zone requires it.",
  status: "Use this state to control whether the record is active, paused, blocked, or otherwise operationally available.",
  "service clusters": "Comma-separated localities or serviceable clusters linked to this district override.",
  "culture tags": "Multi-value list of traditions this priest or record can actively serve.",
  "language tags": "Multi-value list of spoken languages used for matching and operational communication.",
  "availability summary": "Short operational summary of working hours, off-days, and booking readiness.",
  "travel radius (km)": "Maximum travel distance used for hyper-local matching and booking assignment.",
  "kyc status": "Tracks the current KYC review stage for approval and go-live decisions.",
  "verification status": "Controls whether the priest appears as unverified, under review, or fully verified.",
  "allow direct contact reveal": "Per-priest override that decides whether this priest's phone number can be shown after the booking advance has been paid.",
  "full name": "Primary display name used across bookings, admin search, and communication history.",
  email: "Main email identity for login, admin contact, and notification routing.",
  phone: "Primary phone number used for operational contact and WhatsApp deep links.",
  "wallet balance (rs)": "Available wallet amount that can be applied toward booking advances or account credits.",
  locality: "Hyper-local area used for search filters, district grouping, and user-facing service availability.",
  address: "Full stored address for operational verification, contact resolution, and service history.",
  "tradition preference": "Primary cultural preference used for ritual discovery and recommendation relevance.",
  "internal note": "Admin-only note that stays attached to this record for future operational context.",
  "assigned priest": "Current priest allocation for the booking. Update this during reassignment or manual overrides.",
  "advance state": "Commercial payment checkpoint for the booking's required advance amount.",
  risk: "Operational risk flag used to prioritize manual intervention and reassignment handling.",
  "contact reveal": "Current reveal state for customer and priest contact details under privacy rules.",
  "dakshina amount": "Base ritual earnings before add-ons, travel, or festival multipliers are applied.",
  "samagri add-ons": "Additional billable amount for ritual materials or administrator-defined extras.",
  "zone travel fee": "Location-based travel amount added for service distance or district zone policy.",
  "peak multiplier": "Festival or surge multiplier used to raise pricing during high-demand dates.",
  "whatsapp confirmation": "Tracks whether the manual WhatsApp booking confirmation has been sent successfully.",
  "otp status": "Tracks issuance and completion state for the booking completion OTP process.",
  "attempt count": "Number of OTP verification attempts recorded for this booking completion flow.",
  "issued at": "Timestamp when the completion OTP was last issued.",
  "verified at": "Timestamp when the completion OTP was successfully verified.",
  "otp event note": "Latest admin note explaining the OTP lifecycle or failure state.",
  "replacement notes": "Operational note for reassignment, priest cancellation, or recovery action.",
  "account holder": "Legal or preferred recipient name attached to the payout destination.",
  "upi id": "UPI destination used for manual payout confirmation and future payout automation.",
  "payout amount (rs)": "Net amount that should be settled manually to the priest or recipient.",
  "payout state": "Current settlement state for this payout record in the admin ledger.",
  "scheduled for": "Planned date or window when the manual transfer should be completed.",
  reference: "Bank, UPI, or manual transfer reference saved after settlement.",
  "admin notes": "Internal explanation or trace note for future operator context.",
  "entity name": "Name of the institutional customer such as a temple, office, or factory.",
  "entity type": "Classifies the subscriber for reporting and contract governance rules.",
  ritual: "Specific service or ritual linked to this record.",
  culture: "Tradition context used for matching priests, Panjika logic, and discovery filters.",
  frequency: "Recurring interval that controls automatic booking generation for subscriptions.",
  duration: "Contract duration in months for the recurring institutional agreement.",
  "starts on": "Contract start date used for recurring booking generation.",
  "ends on": "Contract end date after which no new auto-generated bookings should be created.",
  "next generation date": "Next planned date for creating the upcoming recurring booking block.",
  "generated booking codes": "Stored list of booking codes already created from this recurring contract.",
  "contract notes": "Internal contract note for operations, exceptions, or coordination details.",
  "control title": "Name of the trust or governance control shown in the admin policy area.",
  detail: "Description explaining what the current control, referral, or trust rule is intended to enforce.",
  "average rating": "Visible average review score used in the trust-score calculation.",
  "punctuality score": "Admin-adjusted punctuality component that affects overall trust visibility.",
  "completion quality": "Measures quality of completed rituals for trust scoring and review moderation.",
  "verification score": "Reflects verified identity and compliance strength inside the trust score.",
  "admin adjustment": "Manual adjustment applied on top of computed trust factors for final control.",
  "review state": "Moderation status that decides whether a review is visible, pending, or hidden.",
  "review comment": "Text shown in the review record after moderation approval."
};

function buildDefaultHint(label: string) {
  const normalized = label.trim().toLowerCase();
  return hintMap[normalized] ?? `Use this field to manage ${normalized} for the current record or workflow.`;
}

export function FieldHint({ label, hint, className }: FieldHintProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const hintId = useId();
  const resolvedHint = hint ?? buildDefaultHint(label);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <span className={cn("relative inline-flex shrink-0", className)} ref={containerRef}>
      <button
        aria-controls={hintId}
        aria-expanded={open}
        aria-label={`Field help for ${label}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        onClick={() => setOpen((prev) => !prev)}
        onMouseEnter={() => setOpen(true)}
        type="button"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        className={cn(
          "pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-30 w-[240px] rounded-xl border border-border bg-white px-3 py-2 text-xs font-medium leading-5 text-muted-foreground shadow-lg transition-all",
          open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        )}
        id={hintId}
        role="tooltip"
      >
        {resolvedHint}
      </span>
    </span>
  );
}

