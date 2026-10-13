import assert from "node:assert/strict"
import {
  classifyPasswordUpdateError,
  isExpiredLinkSearch,
  planAuthCallback,
  safeInternalPath,
  validateNewPassword,
} from "./recovery"

const legacyRecovery = planAuthCallback({
  code: "pkce-code",
  tokenHash: null,
  type: null,
  next: "/settings",
  error: null,
  errorCode: null,
})
assert.equal(legacyRecovery.kind, "exchange-code")
if (legacyRecovery.kind === "exchange-code") {
  assert.equal(legacyRecovery.isRecovery, true)
  assert.equal(legacyRecovery.nextPath, "/reset-password")
}

const resetLink = planAuthCallback({
  code: "pkce-code",
  tokenHash: null,
  type: null,
  next: "/reset-password",
  error: null,
  errorCode: null,
})
assert.equal(resetLink.kind, "exchange-code")
if (resetLink.kind === "exchange-code") assert.equal(resetLink.isRecovery, true)

const legacyExpired = planAuthCallback({
  code: null,
  tokenHash: null,
  type: null,
  next: "/settings",
  error: "access_denied",
  errorCode: "otp_expired",
})
assert.deepEqual(legacyExpired, { kind: "reject-recovery" })

const expiredOnPhone = planAuthCallback({
  code: null,
  tokenHash: null,
  type: null,
  next: "/reset-password",
  error: "access_denied",
  errorCode: "otp_expired",
})
assert.deepEqual(expiredOnPhone, { kind: "reject-recovery" })

const missingVerifier = planAuthCallback({
  code: null,
  tokenHash: null,
  type: "recovery",
  next: null,
  error: null,
  errorCode: null,
})
assert.deepEqual(missingVerifier, { kind: "reject-recovery" })

const signup = planAuthCallback({
  code: "signup-code",
  tokenHash: null,
  type: null,
  next: null,
  error: null,
  errorCode: null,
})
assert.equal(signup.kind, "exchange-code")
if (signup.kind === "exchange-code") {
  assert.equal(signup.isRecovery, false)
  assert.equal(signup.nextPath, "/home")
}

const crossDeviceToken = planAuthCallback({
  code: null,
  tokenHash: "abc123",
  type: "recovery",
  next: "/reset-password",
  error: null,
  errorCode: null,
})
assert.equal(crossDeviceToken.kind, "verify-otp")
if (crossDeviceToken.kind === "verify-otp") {
  assert.equal(crossDeviceToken.otpType, "recovery")
  assert.equal(crossDeviceToken.isRecovery, true)
  assert.equal(crossDeviceToken.nextPath, "/reset-password")
}

const openRedirect = planAuthCallback({
  code: "code",
  tokenHash: null,
  type: null,
  next: "https://evil.example/phish",
  error: null,
  errorCode: null,
})
assert.equal(openRedirect.kind, "exchange-code")
if (openRedirect.kind === "exchange-code") {
  assert.equal(openRedirect.isRecovery, false)
  assert.equal(openRedirect.nextPath, "/home")
}

assert.equal(safeInternalPath("//evil.example"), "/home")
assert.equal(isExpiredLinkSearch({ error: "expired" }), true)
assert.equal(isExpiredLinkSearch({ error_code: "otp_expired" }), true)
assert.equal(isExpiredLinkSearch({}), false)
assert.equal(validateNewPassword({ password: "short", confirmPassword: "short" }), "too-short")
assert.equal(validateNewPassword({ password: "longenough", confirmPassword: "other" }), "mismatch")
assert.equal(validateNewPassword({ password: "longenough", confirmPassword: "longenough" }), null)
assert.equal(classifyPasswordUpdateError("Auth session missing!"), "session")
assert.equal(classifyPasswordUpdateError("New password should be different from the old password."), "same")

console.log("recovery routing checks passed")
