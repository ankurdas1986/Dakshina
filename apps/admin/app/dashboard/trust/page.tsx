import { MessageSquareQuote, ShieldCheck, Star, WalletCards } from "lucide-react";
import {
  saveReferralEntry,
  saveReviewEntry,
  saveTrustScoreEntry,
  saveTrustControl
} from "../../actions/trust";
import { AdminShell } from "../../../components/admin-shell";
import { SectionNav } from "../../../components/section-nav";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "../../../components/ui/card";
import { FieldHint } from "../../../components/ui/field-hint";
import { Input } from "../../../components/ui/input";
import { KpiCard } from "../../../components/ui/kpi-card";
import { SectionTitle } from "../../../components/ui/section-title";
import { getAdminShellData } from "../../../lib/admin-shell-data";
import { requireAdminUser } from "../../../lib/auth";
import { getTrustMetrics, getTrustStore } from "../../../lib/trust-store";

export const dynamic = "force-dynamic";

type TrustPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const messageMap: Record<string, string> = {
  control_saved: "Trust control updated and stored for local UAT.",
  referral_saved: "Referral ledger entry updated and stored for local UAT.",
  review_saved: "Review moderation entry updated and stored for local UAT.",
  score_saved: "Trust score entry updated and stored for local UAT."
};

const errorMap: Record<string, string> = {
  missing_control_id: "Control id is missing.",
  invalid_control_id: "Control id is invalid.",
  missing_referral_id: "Referral id is missing.",
  invalid_referral_id: "Referral id is invalid.",
  missing_review_id: "Review id is missing.",
  invalid_review_id: "Review id is invalid.",
  missing_score_id: "Trust score id is missing.",
  invalid_score_id: "Trust score id is invalid."
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function TrustPage({ searchParams }: TrustPageProps) {
  const user = await requireAdminUser();
  const { notifications, notificationCount, notificationEnabled } = await getAdminShellData();
  const store = await getTrustStore();
  const metricsSnapshot = getTrustMetrics(store);
  const resolvedSearchParams = (await searchParams) ?? {};
  const messageKey = readParam(resolvedSearchParams, "message");
  const errorKey = readParam(resolvedSearchParams, "error");
  const query = readParam(resolvedSearchParams, "q")?.toLowerCase() ?? "";
  const bannerMessage = messageKey ? messageMap[messageKey] ?? null : null;
  const bannerError = errorKey ? errorMap[errorKey] ?? errorKey : null;
  const filteredControls = store.controls.filter((control) =>
    [control.title, control.detail, control.state].join(" ").toLowerCase().includes(query)
  );
  const filteredReferrals = store.referrals.filter((entry) =>
    [entry.referrer, entry.referee, entry.firstBooking, entry.state].join(" ").toLowerCase().includes(query)
  );
  const filteredReviews = store.reviews.filter((review) =>
    [review.bookingCode, review.priest, review.status, review.comment].join(" ").toLowerCase().includes(query)
  );
  const filteredScorecards = store.scorecards.filter((entry) =>
    [entry.priest, entry.notes, String(entry.visibleScore)].join(" ").toLowerCase().includes(query)
  );

  const metrics = [
    { label: "Average rating", value: metricsSnapshot.averageRating, icon: Star },
    { label: "Reviews pending", value: metricsSnapshot.reviewsAwaitingModeration, icon: MessageSquareQuote },
    { label: "Referral credits pending", value: metricsSnapshot.referralCreditsPending, icon: WalletCards },
    { label: "Priests below threshold", value: metricsSnapshot.priestsBelowThreshold, icon: ShieldCheck }
  ];

  return (
    <AdminShell
      active="trust"
      notificationCount={notificationCount}
      notificationEnabled={notificationEnabled}
      notifications={notifications}
      subtitle="Track marketplace quality, review eligibility, and referral reward release after OTP-based completion."
      title="Trust and Referral"
      userEmail={user.email}
      subnav={
        <SectionNav
          items={[
            { href: "#trust-controls", label: "Completion gate", primary: true },
            { href: "#trust-score", label: "Trust score" },
            { href: "#referral-ledger", label: "Referral ledger" },
            { href: "#review-moderation", label: "Review moderation" }
          ]}
        />
      }
    >
      {bannerMessage ? (
        <div className="rounded-[24px] border border-success/20 bg-success/10 px-4 py-3 text-sm font-medium text-success">
          {bannerMessage}
        </div>
      ) : null}
      {bannerError ? (
        <div className="rounded-[24px] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {bannerError}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const tone = metric.label === "Reviews pending" ? "rose" : metric.label === "Referral credits pending" ? "amber" : metric.label === "Average rating" ? "violet" : "green";
          const detail =
            metric.label === "Average rating"
              ? "Visible public quality signal from verified completed bookings."
              : metric.label === "Reviews pending"
                ? "Moderation workload currently waiting for admin review."
                : metric.label === "Referral credits pending"
                  ? "Ledger credits not yet released into final settlement state."
                  : "Priests currently falling below trust threshold controls.";
          return <KpiCard detail={detail} icon={metric.icon} key={metric.label} label={metric.label} tone={tone} value={metric.value} />;
        })}
      </div>

      <form className="rounded-[20px] border border-border bg-white px-4 py-3 shadow-soft">
        <Field label="Search trust operations">
          <Input defaultValue={query} name="q" placeholder="Search controls, referrals, reviews, priests..." />
        </Field>
      </form>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="trust-controls">
          <CardHeader>
            <SectionTitle icon={ShieldCheck} tone="rose">Trust controls</SectionTitle>
            <CardDescription>Completion gates, review policy, and quality operations remain admin-managed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredControls.map((control) => (
              <form action={saveTrustControl} className="rounded-[24px] border border-border bg-white p-4" key={control.id}>
                <input name="id" type="hidden" value={control.id} />
                <div className="grid gap-3">
                  <Field label="Control title">
                    <Input defaultValue={control.title} name="title" required />
                  </Field>
                  <TextAreaField label="Detail" defaultValue={control.detail} name="detail" />
                  <SelectField
                    defaultValue={control.state}
                    label="State"
                    name="state"
                    options={[
                      { value: "active", label: "active" },
                      { value: "planned", label: "planned" }
                    ]}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary">Save control</Button>
                  </div>
                </div>
              </form>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="trust-score">
            <CardHeader>
              <SectionTitle icon={Star} tone="violet">Trust score operations</SectionTitle>
              <CardDescription>Admin can tune the visible score using rating, punctuality, completion quality, verification, and a controlled adjustment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredScorecards.map((entry) => (
                <form action={saveTrustScoreEntry} className="rounded-[24px] border border-border bg-white p-4" key={entry.id}>
                  <input name="id" type="hidden" value={entry.id} />
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.priest}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Visible score {entry.visibleScore}</p>
                    </div>
                    <Badge variant={entry.visibleScore >= 4 ? "success" : "secondary"}>{entry.visibleScore}</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Average rating">
                      <Input defaultValue={entry.averageRating} max={5} min={0} name="averageRating" type="number" />
                    </Field>
                    <Field label="Punctuality score">
                      <Input defaultValue={entry.punctualityScore} max={5} min={0} name="punctualityScore" type="number" />
                    </Field>
                    <Field label="Completion quality">
                      <Input defaultValue={entry.completionQualityScore} max={5} min={0} name="completionQualityScore" type="number" />
                    </Field>
                    <Field label="Verification score">
                      <Input defaultValue={entry.verificationScore} max={5} min={0} name="verificationScore" type="number" />
                    </Field>
                    <Field label="Admin adjustment">
                      <Input defaultValue={entry.adminAdjustment} max={1} min={-1} name="adminAdjustment" step="0.1" type="number" />
                    </Field>
                  </div>
                  <TextAreaField label="Admin notes" defaultValue={entry.notes} name="notes" />
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary">Save trust score</Button>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>

          <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="referral-ledger">
            <CardHeader>
              <SectionTitle icon={WalletCards} tone="amber">Referral ledger</SectionTitle>
              <CardDescription>Reward release remains auditable and depends on completion state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredReferrals.map((entry) => (
                <form action={saveReferralEntry} className="rounded-[24px] border border-border bg-white p-4" key={entry.id}>
                  <input name="id" type="hidden" value={entry.id} />
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{entry.referrer} {"->"} {entry.referee}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Booking {entry.firstBooking}</p>
                    </div>
                    <Badge variant={entry.state === "credited" ? "success" : "outline"}>{entry.state}</Badge>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Referee discount">
                        <Input defaultValue={entry.refereeDiscount} disabled />
                      </Field>
                      <Field label="Reward credit">
                        <Input defaultValue={entry.rewardCredit} disabled />
                      </Field>
                    </div>
                    <SelectField
                      defaultValue={entry.state}
                      label="Reward state"
                      name="state"
                      options={[
                        { value: "pending_completion", label: "pending_completion" },
                        { value: "eligible", label: "eligible" },
                        { value: "credited", label: "credited" },
                        { value: "cancelled", label: "cancelled" }
                      ]}
                    />
                    <TextAreaField label="Admin notes" defaultValue={entry.adminNotes} name="adminNotes" />
                    <div className="flex justify-end">
                      <Button type="submit" variant="secondary">Save referral entry</Button>
                    </div>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>

          <Card className="scroll-mt-28 rounded-[28px] border-border/80 bg-white" id="review-moderation">
            <CardHeader>
              <SectionTitle icon={MessageSquareQuote} tone="blue">Review moderation</SectionTitle>
              <CardDescription>Reviews should only stay visible after valid completed bookings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredReviews.map((review) => (
                <form action={saveReviewEntry} className="rounded-[24px] border border-border bg-white p-4" key={review.id}>
                  <input name="id" type="hidden" value={review.id} />
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{review.bookingCode} - {review.priest}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Moderation state {review.status}</p>
                    </div>
                    <Badge variant={review.status === "visible" ? "success" : review.status === "hidden" ? "secondary" : "outline"}>
                      {review.status}
                    </Badge>
                  </div>
                  <div className="grid gap-3">
                    <Field label="Rating">
                      <Input defaultValue={review.rating} max={5} min={1} name="rating" type="number" />
                    </Field>
                    <SelectField
                      defaultValue={review.status}
                      label="Review state"
                      name="status"
                      options={[
                        { value: "visible", label: "visible" },
                        { value: "pending_moderation", label: "pending_moderation" },
                        { value: "hidden", label: "hidden" }
                      ]}
                    />
                    <TextAreaField label="Review comment" defaultValue={review.comment} name="comment" />
                    <div className="flex justify-end">
                      <Button type="submit">Save review</Button>
                    </div>
                  </div>
                </form>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      {children}
    </label>
  );
}

type TextAreaFieldProps = {
  label: string;
  name: string;
  defaultValue: string;
};

function TextAreaField({ label, name, defaultValue }: TextAreaFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span className="flex items-start justify-between gap-2"><span className="min-w-0">{label}</span><FieldHint label={label} className="shrink-0" /></span>
      <textarea
        className="min-h-28 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={defaultValue}
        name={name}
      />
    </label>
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
      <select
        className="h-11 rounded-lg border border-border bg-white px-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        defaultValue={defaultValue}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

