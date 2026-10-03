import { test, expect } from "@playwright/test";
import { authenticateAsExplorer } from "./admin/admin-fixtures";

test.describe("Account Settings — Password Management Tests", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAsExplorer(page);
  });

  test("loads /settings and verifies Change Password option in Profile & Identity", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Verify modal header and profile tab
    await expect(page.getByRole("heading", { name: /Account Security & Password Settings/i })).toBeVisible();

    // Verify Change Password button opposite Save Profile Changes is present
    const changePasswordBtn = page.getByRole("button", { name: /Change Password/i }).first();
    await expect(changePasswordBtn).toBeVisible();

    // Verify Save Profile Changes button is present alongside it
    await expect(page.getByRole("button", { name: /Save Profile Changes/i })).toBeVisible();

    // Verify Current (Old) Password input exists
    await expect(page.getByText(/Current \(Old\) Password/i)).toBeVisible();

    // Verify New Password and Confirm New Password inputs exist
    await expect(page.getByText(/^New Password$/i)).toBeVisible();
    await expect(page.getByText(/Confirm New Password/i)).toBeVisible();

    // Verify Update Password button exists
    const updateBtn = page.getByRole("button", { name: /Update Password Using Old Password/i });
    await expect(updateBtn).toBeVisible();

    // Test custom validation by filling old password, but short new password
    const oldPasswordInput = page.locator("input[placeholder='••••••••••••']").first();
    await oldPasswordInput.fill("oldpass123");
    const newPasswordInput = page.locator("input[placeholder='Min 6 characters']");
    await newPasswordInput.fill("123");
    const confirmPasswordInput = page.locator("input[placeholder='Repeat new password']");
    await confirmPasswordInput.fill("123");

    await updateBtn.click();
    await expect(page.getByText(/New password must be at least 6 characters long/i)).toBeVisible();
  });

  test("verifies Forgot Password option in Profile & Identity", async ({ page }) => {
    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Click Forgot Password tab
    const forgotPasswordTab = page.getByRole("button", { name: /Forgot Password/i });
    await expect(forgotPasswordTab).toBeVisible();
    await forgotPasswordTab.click();

    // Verify forgot password recovery view is active
    await expect(page.getByText(/Forgot your password\? Click below to send a secure recovery link/i)).toBeVisible();

    // Verify action button to send reset link
    const sendResetBtn = page.getByRole("button", { name: /Send Password Reset Link to Email/i });
    await expect(sendResetBtn).toBeVisible();
  });
});
