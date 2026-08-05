import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { colors } from "../../../theme";
import { TokenCard } from "../components/TokenCard";
import { OtpAccount } from "../types";

interface Props {
  accounts: OtpAccount[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function AccountsScreen({ accounts, onAdd, onDelete }: Props) {
  const [nowSeconds, setNowSeconds] = useState(() => Date.now() / 1000);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNowSeconds(Date.now() / 1000), 1000);
    return () => clearInterval(timer);
  }, []);

  const copyCode = async (account: OtpAccount, code: string) => {
    await Clipboard.setStringAsync(code.replace(/\s/g, ""));
    setCopiedId(account.id);
    setTimeout(() => setCopiedId((current) => (current === account.id ? null : current)), 1500);
  };

  const confirmDelete = (account: OtpAccount) => {
    Alert.alert(
      "Remove account?",
      `${account.issuer || account.account} will no longer generate codes on this phone. ` +
        "Make sure you have another way to sign in first.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remove", style: "destructive", onPress: () => onDelete(account.id) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Authenticator</Text>
        {copiedId ? <Text style={styles.copied}>Code copied</Text> : null}
      </View>
      {accounts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No accounts yet</Text>
          <Text style={styles.emptyBody}>
            Add a website or service that offers two-factor authentication. Scan its QR code or type
            in the setup key, and this app will generate the 6-digit sign-in codes.
          </Text>
        </View>
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TokenCard
              account={item}
              nowSeconds={nowSeconds}
              onCopy={(code) => copyCode(item, code)}
              onDelete={confirmDelete}
            />
          )}
        />
      )}
      <Pressable style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} onPress={onAdd}>
        <Text style={styles.fabLabel}>+ Add account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
  },
  copied: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    paddingBottom: 96,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingBottom: 96,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyBody: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: colors.accent,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  fabPressed: {
    opacity: 0.85,
  },
  fabLabel: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: "700",
  },
});
