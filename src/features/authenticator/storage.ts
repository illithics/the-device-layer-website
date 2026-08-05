/**
 * Account persistence backed by expo-secure-store, which stores values in the
 * iOS Keychain / Android Keystore-encrypted storage rather than plain app data.
 *
 * SecureStore caps each value at ~2 KB, so every account lives under its own
 * key and an index key tracks the ordering.
 */

import * as SecureStore from "expo-secure-store";
import { OtpAccount } from "./types";

const INDEX_KEY = "kk.authenticator.index";
const ACCOUNT_KEY_PREFIX = "kk.authenticator.account.";

const STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export function newAccountId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

async function readIndex(): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(INDEX_KEY, STORE_OPTIONS);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

async function writeIndex(ids: string[]): Promise<void> {
  await SecureStore.setItemAsync(INDEX_KEY, JSON.stringify(ids), STORE_OPTIONS);
}

export async function loadAccounts(): Promise<OtpAccount[]> {
  const ids = await readIndex();
  const accounts: OtpAccount[] = [];
  for (const id of ids) {
    const raw = await SecureStore.getItemAsync(ACCOUNT_KEY_PREFIX + id, STORE_OPTIONS);
    if (!raw) continue;
    try {
      accounts.push(JSON.parse(raw) as OtpAccount);
    } catch {
      // Skip corrupt entries rather than failing the whole list.
    }
  }
  return accounts;
}

export async function saveAccount(account: OtpAccount): Promise<void> {
  await SecureStore.setItemAsync(ACCOUNT_KEY_PREFIX + account.id, JSON.stringify(account), STORE_OPTIONS);
  const ids = await readIndex();
  if (!ids.includes(account.id)) {
    await writeIndex([...ids, account.id]);
  }
}

export async function deleteAccount(id: string): Promise<void> {
  await SecureStore.deleteItemAsync(ACCOUNT_KEY_PREFIX + id, STORE_OPTIONS);
  await writeIndex((await readIndex()).filter((existing) => existing !== id));
}
