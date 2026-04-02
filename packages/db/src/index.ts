export type BookingStatus =
  | "draft"
  | "pending_priest_confirmation"
  | "awaiting_advance_payment"
  | "confirmed"
  | "contact_window_locked"
  | "contact_window_open"
  | "in_progress"
  | "completed"
  | "cancelled_by_user"
  | "cancelled_by_priest"
  | "cancelled_by_admin"
  | "replacement_in_progress"
  | "expired";

export type UserRole = "admin" | "priest" | "user";
