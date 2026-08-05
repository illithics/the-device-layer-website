import { OtpAlgorithm } from "./lib/otp";

/** A stored TOTP account. The secret stays base32-encoded, exactly as provisioned. */
export interface OtpAccount {
  id: string;
  issuer: string;
  account: string;
  secret: string;
  algorithm: OtpAlgorithm;
  digits: number;
  period: number;
  createdAt: number;
}
