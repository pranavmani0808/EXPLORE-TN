import { test, expect } from "@playwright/test";

test.describe("THE CHECKLIST — Authentication & Account Lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.evaluate(() => localStorage.clear());
  });

  test("1. CHECKLIST — Login Flow (Sign In with Valid Credentials)", async ({ page }) => {
    // Select Sign In tab
    const signInTab = page.locator("#btn-tab-signin");
    await expect(signInTab).toBeVisible({ timeout: 10000 });
    await signInTab.click();

    // Fill in credentials
    await page.fill("#input-signin-email", "explorer@explorertn.com");
    await page.fill("#input-signin-password", "secretPassword123");

    // Click Sign In
    await page.click("#btn-submit-signin");

    // Verify session stored in localStorage
    await page.waitForFunction(() => !!localStorage.getItem("etn_auth_user"), { timeout: 10000 });
    const session = await page.evaluate(() => localStorage.getItem("etn_auth_user"));
    expect(session).toBeTruthy();
    expect(session).toContain("explorer@explorertn.com");
  });

  test("2. CHECKLIST — Register Flow (Create New Account)", async ({ page }) => {
    // Switch to Create Account tab
    const signUpTab = page.locator("#btn-tab-signup");
    await expect(signUpTab).toBeVisible({ timeout: 10000 });
    await signUpTab.click();

    // Fill in registration form
    const fullNameInput = page.locator("#input-signup-fullname");
    await expect(fullNameInput).toBeVisible({ timeout: 10000 });
    await fullNameInput.fill("Anitha Subramanian");
    await page.fill("#input-signup-email", "anitha@explorertn.com");
    await page.fill("#input-signup-password", "newSecurePass2026");

    // Submit registration
    await page.click("#btn-submit-signup");

    // Verify transition to Email Verification step
    const verificationNotice = page.locator("text=Email Verification Required");
    await expect(verificationNotice).toBeVisible({ timeout: 10000 });
  });

  test("3. CHECKLIST — Email Verification Flow (6-Digit OTP Verification)", async ({ page }) => {
    // Register first to reach Email Verification step
    const signUpTab = page.locator("#btn-tab-signup");
    await expect(signUpTab).toBeVisible({ timeout: 10000 });
    await signUpTab.click();

    const fullNameInput = page.locator("#input-signup-fullname");
    await expect(fullNameInput).toBeVisible({ timeout: 10000 });
    await fullNameInput.fill("Ramesh Kumar");
    await page.fill("#input-signup-email", "ramesh@explorertn.com");
    await page.fill("#input-signup-password", "pass123456");
    await page.click("#btn-submit-signup");

    // Fill 6-digit OTP code
    const otpInput = page.locator("#input-otp-code");
    await expect(otpInput).toBeVisible({ timeout: 10000 });
    await otpInput.fill("849201");

    // Click Verify Email
    await page.click("#btn-submit-verify-email");

    // Verify Email Verified status
    const verifiedNotice = page.locator("text=Email Verified!");
    await expect(verifiedNotice).toBeVisible({ timeout: 10000 });
  });

  test("4. CHECKLIST — Forgot Password Flow (Send Reset Email Instructions)", async ({ page }) => {
    // Click Forgot Password link
    const forgotLink = page.locator("#link-forgot-password");
    await expect(forgotLink).toBeVisible({ timeout: 10000 });
    await forgotLink.click();

    // Verify Forgot Password view
    const forgotEmail = page.locator("#input-forgot-email");
    await expect(forgotEmail).toBeVisible({ timeout: 10000 });

    // Fill in registered email
    await forgotEmail.fill("explorer@explorertn.com");

    // Click Send Reset Link
    await page.click("#btn-submit-forgot-password");

    // Verify Reset Link Sent confirmation
    const resetSentNotice = page.locator("text=Reset Link Sent!");
    await expect(resetSentNotice).toBeVisible({ timeout: 10000 });
  });

  test("5. CHECKLIST — Reset Password Flow (Update Credentials)", async ({ page }) => {
    // Trigger Forgot Password flow first
    const forgotLink = page.locator("#link-forgot-password");
    await expect(forgotLink).toBeVisible({ timeout: 10000 });
    await forgotLink.click();

    const forgotEmail = page.locator("#input-forgot-email");
    await expect(forgotEmail).toBeVisible({ timeout: 10000 });
    await forgotEmail.fill("explorer@explorertn.com");
    await page.click("#btn-submit-forgot-password");

    // Click Return to Sign In
    const returnBtn = page.locator("text=Return to Sign In");
    await expect(returnBtn).toBeVisible({ timeout: 10000 });
    await returnBtn.click();

    // Verify return back to Sign In
    const signInTab = page.locator("#btn-tab-signin");
    await expect(signInTab).toBeVisible({ timeout: 5000 });
  });
});
