/**
 * Public surface of the authenticator feature. The whole directory is
 * self-contained so it can be lifted into another KeepKey app as a unit.
 */

export { AccountsScreen } from "./screens/AccountsScreen";
export { AddAccountScreen } from "./screens/AddAccountScreen";
export { ScanScreen } from "./screens/ScanScreen";
export { deleteAccount, loadAccounts, newAccountId, saveAccount } from "./storage";
export { totp, hotp, formatCode, secondsRemaining } from "./lib/otp";
export { parseOtpAuthUri, OtpAuthParseError } from "./lib/otpauth";
export type { ParsedOtpAuth } from "./lib/otpauth";
export type { OtpAccount } from "./types";
