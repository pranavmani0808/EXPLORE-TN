import { Page } from "@playwright/test";

export const TEST_ADMIN_USER = {
  id: "admin-audit-001",
  name: "Pranav Admin",
  email: "admin@exploretn.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  role: "super_admin",
  status: "active",
  rank: "Level 10 Sovereign Explorer",
  districtCount: 38,
  xp: 9999
};

export const TEST_EXPLORER_USER = {
  id: "explorer-user-002",
  name: "Regular Explorer",
  email: "user@exploretn.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
  role: "explorer",
  status: "active",
  rank: "Level 1 Explorer",
  districtCount: 2,
  xp: 150
};

/**
 * Injects authenticated admin user session into localStorage before navigation.
 */
export async function authenticateAsAdmin(page: Page) {
  await page.addInitScript((user) => {
    localStorage.setItem("etn_auth_user", JSON.stringify(user));
    localStorage.setItem("etn_onboarding_completed", "true");
    localStorage.setItem("explorertn_cookie_preferences", JSON.stringify({ essential: true, analytics: true, marketing: true, preferences: true }));
    localStorage.setItem(`etn_user_preferences_${user.id}`, JSON.stringify({ onboardingCompleted: true }));
    localStorage.setItem("etn_user_preferences_guest", JSON.stringify({ onboardingCompleted: true }));
  }, TEST_ADMIN_USER);
}

/**
 * Injects non-admin user session into localStorage.
 */
export async function authenticateAsExplorer(page: Page) {
  await page.addInitScript((user) => {
    localStorage.setItem("etn_auth_user", JSON.stringify(user));
    localStorage.setItem("etn_onboarding_completed", "true");
    localStorage.setItem("explorertn_cookie_preferences", JSON.stringify({ essential: true, analytics: true, marketing: true, preferences: true }));
    localStorage.setItem(`etn_user_preferences_${user.id}`, JSON.stringify({ onboardingCompleted: true }));
  }, TEST_EXPLORER_USER);
}
