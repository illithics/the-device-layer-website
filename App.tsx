import React, { useCallback, useEffect, useState } from "react";
import { Alert, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import {
  AccountsScreen,
  AddAccountScreen,
  deleteAccount,
  loadAccounts,
  newAccountId,
  OtpAccount,
  ParsedOtpAuth,
  saveAccount,
  ScanScreen,
} from "./src/features/authenticator";
import { colors } from "./src/theme";

type Screen = "accounts" | "add" | "scan";

export default function App() {
  const [screen, setScreen] = useState<Screen>("accounts");
  const [accounts, setAccounts] = useState<OtpAccount[]>([]);

  useEffect(() => {
    loadAccounts()
      .then(setAccounts)
      .catch(() => Alert.alert("Storage error", "Couldn't read saved accounts from secure storage."));
  }, []);

  const addAccount = useCallback(async (account: OtpAccount) => {
    setAccounts((current) => [...current, account]);
    setScreen("accounts");
    try {
      await saveAccount(account);
    } catch {
      Alert.alert("Storage error", "The account couldn't be saved to secure storage.");
      setAccounts((current) => current.filter((existing) => existing.id !== account.id));
    }
  }, []);

  const removeAccount = useCallback(async (id: string) => {
    setAccounts((current) => current.filter((existing) => existing.id !== id));
    try {
      await deleteAccount(id);
    } catch {
      Alert.alert("Storage error", "The account couldn't be removed from secure storage.");
    }
  }, []);

  const handleScanned = useCallback(
    (parsed: ParsedOtpAuth) => {
      void addAccount({
        id: newAccountId(),
        issuer: parsed.issuer,
        account: parsed.account,
        secret: parsed.secret,
        algorithm: parsed.algorithm,
        digits: parsed.digits,
        period: parsed.period,
        createdAt: Date.now(),
      });
    },
    [addAccount]
  );

  return (
    <SafeAreaView style={styles.root}>
      <ExpoStatusBar style="light" />
      {screen === "accounts" && (
        <AccountsScreen accounts={accounts} onAdd={() => setScreen("add")} onDelete={removeAccount} />
      )}
      {screen === "add" && (
        <AddAccountScreen
          onSave={addAccount}
          onScan={() => setScreen("scan")}
          onCancel={() => setScreen("accounts")}
        />
      )}
      {screen === "scan" && <ScanScreen onScanned={handleScanned} onCancel={() => setScreen("add")} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: StatusBar.currentHeight ?? 0,
  },
});
