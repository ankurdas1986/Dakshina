import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { settingsSnapshot, type DistrictCommissionOverride, type SettingsSnapshot } from "./settings";

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

export async function getSettingsSnapshot() {
  try {
    const raw = await readFile(settingsFilePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<SettingsSnapshot>;
    return {
      ...cloneDefaults(),
      ...parsed,
      platform: {
        ...cloneDefaults().platform,
        ...parsed.platform
      },
      notificationSettings: {
        ...cloneDefaults().notificationSettings,
        ...parsed.notificationSettings
      },
      districts: parsed.districts ?? cloneDefaults().districts,
      serviceTiers: parsed.serviceTiers ?? cloneDefaults().serviceTiers,
      controls: parsed.controls ?? cloneDefaults().controls,
      auditLog: parsed.auditLog ?? cloneDefaults().auditLog
    };
  } catch {
    const fallback = cloneDefaults();
    await writeSettings(fallback);
    return fallback;
  }
}

function appendAuditLog(
  current: SettingsSnapshot,
  action: string,
  detail: string
): SettingsSnapshot["auditLog"] {
  return [
    {
      id: `audit_${Date.now()}`,
      action,
      detail,
      actor: "Admin operator",
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " ")
    },
    ...current.auditLog
  ].slice(0, 12);
}

type PlatformUpdate = {
  launchRegion: string;
  currency: string;
  bookingAdvancePercent: number;
  defaultCommissionPercent: number;
  revealWindowMin: number;
  revealWindowMax: number;
  refereeDiscountPercent: number;
  referrerRewardCredit: number;
};

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
      `Commission ${input.defaultCommissionPercent}% and advance ${input.bookingAdvancePercent}% are now active.`
    ),
    platform: {
      launchRegion: input.launchRegion,
      currency: input.currency,
      bookingAdvancePercent: input.bookingAdvancePercent,
      defaultCommissionPercent: input.defaultCommissionPercent,
      revealWindowHours: {
        min: input.revealWindowMin,
        max: input.revealWindowMax
      },
      refereeDiscountPercent: input.refereeDiscountPercent,
      referrerRewardCredit: input.referrerRewardCredit
    }
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
      `Regional commission and service cluster overrides were updated for ${districts.length} districts.`
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
      "Admin policy toggles were changed in the super-admin settings module."
    ),
    controls
  };

  await writeSettings(next);
  return next;
}

export async function updateNotificationSettings(
  notificationSettings: SettingsSnapshot["notificationSettings"]
) {
  const current = await getSettingsSnapshot();
  const next: SettingsSnapshot = {
    ...current,
    auditLog: appendAuditLog(
      current,
      "Notification settings updated",
      `Inbox badge count is now ${notificationSettings.unreadCount} with admin inbox ${notificationSettings.adminInboxEnabled ? "enabled" : "disabled"}.`
    ),
    notificationSettings
  };

  await writeSettings(next);
  return next;
}

export function parsePlatformFormData(formData: FormData, current: SettingsSnapshot): PlatformUpdate {
  const revealWindowMin = normalizeNumber(
    formData.get("revealWindowMin"),
    current.platform.revealWindowHours.min
  );
  const revealWindowMax = normalizeNumber(
    formData.get("revealWindowMax"),
    current.platform.revealWindowHours.max
  );

  return {
    launchRegion: normalizeText(formData.get("launchRegion"), current.platform.launchRegion),
    currency: normalizeText(formData.get("currency"), current.platform.currency).toUpperCase(),
    bookingAdvancePercent: normalizeNumber(
      formData.get("bookingAdvancePercent"),
      current.platform.bookingAdvancePercent
    ),
    defaultCommissionPercent: normalizeNumber(
      formData.get("defaultCommissionPercent"),
      current.platform.defaultCommissionPercent
    ),
    revealWindowMin: Math.min(revealWindowMin, revealWindowMax),
    revealWindowMax: Math.max(revealWindowMin, revealWindowMax),
    refereeDiscountPercent: normalizeNumber(
      formData.get("refereeDiscountPercent"),
      current.platform.refereeDiscountPercent
    ),
    referrerRewardCredit: normalizeNumber(
      formData.get("referrerRewardCredit"),
      current.platform.referrerRewardCredit
    )
  };
}

export function parseDistrictFormData(
  formData: FormData,
  current: SettingsSnapshot
): DistrictCommissionOverride[] {
  return current.districts.map((district, index) => {
    const clusters = normalizeText(
      formData.get(`districtClusters-${index}`),
      district.serviceClusters.join(", ")
    )
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      district: normalizeText(formData.get(`districtName-${index}`), district.district),
      commissionPercent: normalizeNumber(
        formData.get(`districtCommission-${index}`),
        district.commissionPercent
      ),
      serviceClusters: clusters,
      status:
        normalizeText(formData.get(`districtStatus-${index}`), district.status) === "active"
          ? "active"
          : "review"
    };
  });
}

export function parseControlFormData(
  formData: FormData,
  current: SettingsSnapshot
): SettingsSnapshot["controls"] {
  return current.controls.map((control, index) => ({
    ...control,
    enabled: formData.get(`controlEnabled-${index}`) === "on"
  }));
}

export function parseNotificationFormData(
  formData: FormData,
  current: SettingsSnapshot
): SettingsSnapshot["notificationSettings"] {
  return {
    adminInboxEnabled: formData.get("adminInboxEnabled") === "on",
    bookingAlertsEnabled: formData.get("bookingAlertsEnabled") === "on",
    kycAlertsEnabled: formData.get("kycAlertsEnabled") === "on",
    referralAlertsEnabled: formData.get("referralAlertsEnabled") === "on",
    dailyDigestEnabled: formData.get("dailyDigestEnabled") === "on",
    unreadCount: normalizeNumber(
      formData.get("unreadCount"),
      current.notificationSettings.unreadCount
    )
  };
}
