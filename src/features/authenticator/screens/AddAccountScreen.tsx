import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../../../theme";
import { isValidBase32Secret } from "../lib/base32";
import { DEFAULT_DIGITS, DEFAULT_PERIOD } from "../lib/otp";
import { newAccountId } from "../storage";
import { OtpAccount } from "../types";

interface Props {
  onSave: (account: OtpAccount) => void;
  onScan: () => void;
  onCancel: () => void;
}

export function AddAccountScreen({ onSave, onScan, onCancel }: Props) {
  const [issuer, setIssuer] = useState("");
  const [account, setAccount] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    const trimmedSecret = secret.replace(/\s/g, "");
    if (!issuer.trim() && !account.trim()) {
      setError("Give this account a name so you can tell it apart later.");
      return;
    }
    if (!isValidBase32Secret(trimmedSecret)) {
      setError("That setup key doesn't look right. It should only contain letters A–Z and digits 2–7.");
      return;
    }
    onSave({
      id: newAccountId(),
      issuer: issuer.trim(),
      account: account.trim(),
      secret: trimmedSecret,
      algorithm: "SHA1",
      digits: DEFAULT_DIGITS,
      period: DEFAULT_PERIOD,
      createdAt: Date.now(),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add account</Text>

        <Pressable style={({ pressed }) => [styles.scanButton, pressed && styles.pressed]} onPress={onScan}>
          <Text style={styles.scanLabel}>Scan QR code</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerLabel}>or enter manually</Text>
          <View style={styles.divider} />
        </View>

        <Text style={styles.fieldLabel}>Service</Text>
        <TextInput
          style={styles.input}
          value={issuer}
          onChangeText={setIssuer}
          placeholder="e.g. GitHub"
          placeholderTextColor={colors.textDim}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.fieldLabel}>Account</Text>
        <TextInput
          style={styles.input}
          value={account}
          onChangeText={setAccount}
          placeholder="e.g. chris@keepkey.com"
          placeholderTextColor={colors.textDim}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        <Text style={styles.fieldLabel}>Setup key</Text>
        <TextInput
          style={styles.input}
          value={secret}
          onChangeText={(text) => {
            setSecret(text);
            setError(null);
          }}
          placeholder="Base32 secret from the service"
          placeholderTextColor={colors.textDim}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]} onPress={save}>
          <Text style={styles.saveLabel}>Save account</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]} onPress={onCancel}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 20,
  },
  scanButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  scanLabel: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    color: colors.textDim,
    fontSize: 13,
    marginHorizontal: 12,
  },
  fieldLabel: {
    color: colors.textDim,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  saveLabel: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  cancelLabel: {
    color: colors.textDim,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.85,
  },
});
