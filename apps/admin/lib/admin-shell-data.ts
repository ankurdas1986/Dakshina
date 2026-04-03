import "server-only";

import { getAdminNotificationInbox } from "./notification-store";
import { getSettingsSnapshot } from "./settings-store";

export async function getAdminShellData() {
  const settings = await getSettingsSnapshot();
  const inbox = await getAdminNotificationInbox(settings.notificationSettings);

  return {
    notificationEnabled: settings.notificationSettings.adminInboxEnabled,
    notificationCount: inbox.unreadCount,
    notifications: inbox.notifications,
    settings
  };
}
