import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { settingsSnapshot, type CultureType, type DistrictCommissionOverride, type SettingsSnapshot } from "./settings";

const settingsFilePath = path.join(process.cwd(), "data", "global-settings.json");

function cloneDefaults() {
  return JSON.parse(JSON.stringify(settingsSnapshot)) as SettingsSnapshot;
}

async function ensureDirectory() {
  await mkdir(path.dirname(settingsFilePath), { recursive: true });
}

async function writeSettings(settings: SettingsSnapshot) {
  await ensureDirectory();
  await writeFile(settingsFilePath, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}

function normalizeCulture(value: string | undefined, fallback: CultureType): CultureType {
  const allowed: CultureType[] = ["Bengali", "North_Indian", "Marwadi", "Odia", "Gujarati"];
  return allowed.includes(value as CultureType) ? (value as CultureType) : fallback;
}

export async function getSettingsSnapshot() {
  try {
    const raw = await readFile(settingsFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<SettingsSnapshot> & {
      platform?: Partial<SettingsSnapshot["platform"]>;
    };
    const defaults = cloneDefaults();
    return {
      ...defaults,
      ...parsed,
      platform: {
        ...defaults.platform,
        ...parsed.platform,
        defaultCulture: normalizeCulture(parsed.platform?.defaultCulture, defaults.platform.defaultCulture),
        revealWindowHours: {
          ...defaults.platform.revealWindowHours,
          ...parsed.platform?.revealWindowHours
        }
      },
      notificationSettings: {
        ...defaults.notificationSettings,
        ...parsed.notificationSettings
      },
      districts: (parsed.districts ?? defaults.districts).map((district, index) => ({
        ...defaults.districts[index % defaults.districts.length],
        ...district,
        zoneTravelFee: district.zoneTravelFee ?? defaults.districts[index % defaults.districts.length].zoneTravelFee
      })),
      serviceTiers: parsed.serviceTiers ?? defaults.serviceTiers,
      cultureResearch: parsed.cultureResearch ?? defaults.cultureResearch,
      controls: parsed.controls ?? defaults.controls,
      auditLog: parsed.auditLog ?? defaults.auditLog
    };
  } catch {
    const fallback = cloneDefaults();
    await writeSettings(fallback);
    return fallback;
  }
}

function appendAuditLog(current: SettingsSnapshot, action: string, detail: string): SettingsSnapshot["auditLog"] {
  return [
    {
      id: `audit_${Date.now()}`,
      action,
      detail,
      actor: "Admin operator",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " ")
    },
    ...current.auditLog
  ].slice(0, 16);
}

type PlatformUpdate = SettingsSnapshot["platform"];

function normalizeNumber(value: FormDataEntryValue | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeText(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export async function updatePlatformSettings(input: PlatformUpdate) {
  const current = await getSettingsSnapshot();
  const next: SettingsSnapshot = {
    ...current,
    auditLog: appendAuditLog(
      current,
      "Platform settings updated",
      `Default culture ${input.defaultCulture}, commission ${input.defaultCommissionPercent}%, gap ${input.minBookingGapHours}h, booking window ${input.maxBookingWindowDays} days.`
    ),
    platform: input
  };

  await writeSettings(next);
  return next;
}

export async function updateDistrictSettings(districts: DistrictCommissionOverride[]) {
  const current = await getSettingsSnapshot();
  const next: SettingsSnapshot = {
    ...current,
    auditLog: appendAuditLog(
      current,
      "District settings updated",
      `Regional commission, travel fee, and cluster overrides were updated for ${districts.length} districts.`
    ),
    districts
  };

  await writeSettings(next);
  return next;
}

export async function updateControlSettings(controls: SettingsSnapshot["controls"]) {
  const current = await getSettingsSnapshot();
  const next: SettingsSnapshot = {
    ...current,
    auditLog: appendAuditLog(
      current,
      "Policy controls updated",
      "Admin policy toggles were changed in the multicultural governance module."
    ),
    controls
  };

  await writeSettings(next);
  return next;
}

export async function updateNotificationSettings(notificationSettings: SettingsSnapshot["notificationSettings"]) {
  const current = await getSettingsSnapshot();
  const next: SettingsSnapshot = {
    ...current,
    auditLog: appendAuditLog(
      current,
      "Notification settings updated",
      `Admin inbox is ${notificationSettings.adminInboxEnabled ? "enabled" : "disabled"} and registration alerts are ${notificationSettings.registrationAlertsEnabled ? "enabled" : "disabled"}.`
    ),
    notificationSettings
  };

  await writeSettings(next);
  return next;
}

export function parsePlatformFormData(formData: FormData, current: SettingsSnapshot): PlatformUpdate {
  const revealWindowMin = normalizeNumber(formData.get("revealWindowMin"), current.platform.revealWindowHours.min);
  const revealWindowMax = normalizeNumber(formData.get("revealWindowMax"), current.platform.revealWindowHours.max);

  return {
    launchRegion: normalizeText(formData.get("launchRegion"), current.platform.launchRegion),
    currency: normalizeText(formData.get("currency"), current.platform.currency).toUpperCase(),
    defaultCulture: normalizeCulture(
      normalizeText(formData.get("defaultCulture"), current.platform.defaultCulture),
      current.platform.defaultCulture
    ),
    bookingAdvancePercent: normalizeNumber(formData.get("bookingAdvancePercent"), current.platform.bookingAdvancePercent),
    defaultCommissionPercent: normalizeNumber(formData.get("defaultCommissionPercent"), current.platform.defaultCommissionPercent),
    revealContactAfterAdvanceEnabled: formData.get("revealContactAfterAdvanceEnabled") === "on",
    revealWindowHours: {
      min: Math.min(revealWindowMin, revealWindowMax),
      max: Math.max(revealWindowMin, revealWindowMax)
    },
    refereeDiscountPercent: normalizeNumber(formData.get("refereeDiscountPercent"), current.platform.refereeDiscountPercent),
    referrerRewardCredit: normalizeNumber(formData.get("referrerRewardCredit"), current.platform.referrerRewardCredit),
    minBookingGapHours: normalizeNumber(formData.get("minBookingGapHours"), current.platform.minBookingGapHours),
    maxBookingWindowDays: normalizeNumber(formData.get("maxBookingWindowDays"), current.platform.maxBookingWindowDays),
    festivalRushBlockingEnabled: formData.get("festivalRushBlockingEnabled") === "on",
    forceBookingOverrideEnabled: formData.get("forceBookingOverrideEnabled") === "on"
  };
}

export function parseDistrictFormData(formData: FormData, current: SettingsSnapshot): DistrictCommissionOverride[] {
  return current.districts.map((district, index) => {
    const clusters = normalizeText(formData.get(`districtClusters-${index}`), district.serviceClusters.join(", "))
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      district: normalizeText(formData.get(`districtName-${index}`), district.district),
      commissionPercent: normalizeNumber(formData.get(`districtCommission-${index}`), district.commissionPercent),
      serviceClusters: clusters,
      zoneTravelFee: normalizeNumber(formData.get(`districtTravelFee-${index}`), district.zoneTravelFee),
      status: normalizeText(formData.get(`districtStatus-${index}`), district.status) === "active" ? "active" : "review"
    };
  });
}

export function parseControlFormData(formData: FormData, current: SettingsSnapshot): SettingsSnapshot["controls"] {
  return current.controls.map((control, index) => ({
    ...control,
    enabled: formData.get(`controlEnabled-${index}`) === "on"
  }));
}

export function parseNotificationFormData(formData: FormData): SettingsSnapshot["notificationSettings"] {
  return {
    adminInboxEnabled: formData.get("adminInboxEnabled") === "on",
    registrationAlertsEnabled: formData.get("registrationAlertsEnabled") === "on",
    bookingAlertsEnabled: formData.get("bookingAlertsEnabled") === "on",
    kycAlertsEnabled: formData.get("kycAlertsEnabled") === "on",
    referralAlertsEnabled: formData.get("referralAlertsEnabled") === "on",
    dailyDigestEnabled: formData.get("dailyDigestEnabled") === "on",
    whatsappAlertsEnabled: formData.get("whatsappAlertsEnabled") === "on",
    superAdminWhatsappNumber: normalizeText(
      formData.get("superAdminWhatsappNumber"),
      settingsSnapshot.notificationSettings.superAdminWhatsappNumber
    )
  };
}

