import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme";
import { formatCode, secondsRemaining, totp } from "../lib/otp";
import { OtpAccount } from "../types";

interface Props {
  account: OtpAccount;
  /** Current time in unix seconds; the parent ticks this so all cards stay in sync. */
  nowSeconds: number;
  onCopy: (code: string) => void;
  onDelete: (account: OtpAccount) => void;
}

export function TokenCard({ account, nowSeconds, onCopy, onDelete }: Props) {
  const remaining = secondsRemaining(account.period, nowSeconds);
  const expiring = remaining <= 5;

  const code = useMemo(() => {
    try {
      return totp(account, nowSeconds);
    } catch {
      return null;
    }
  }, [account, Math.floor(nowSeconds / account.period)]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => code && onCopy(code)}
      onLongPress={() => onDelete(account)}
      accessibilityLabel={`One-time code for ${account.issuer || account.account}. Tap to copy, long-press to remove.`}
    >
      <View style={styles.header}>
        <Text style={styles.issuer} numberOfLines={1}>
          {account.issuer || account.account}
        </Text>
        <Text style={[styles.countdown, expiring && styles.countdownExpiring]}>{remaining}s</Text>
      </View>
      {account.issuer && account.account ? (
        <Text style={styles.account} numberOfLines={1}>
          {account.account}
        </Text>
      ) : null}
      <Text style={[styles.code, expiring && styles.codeExpiring]}>
        {code ? formatCode(code) : "invalid secret"}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(remaining / account.period) * 100}%` }, expiring && styles.fillExpiring]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  cardPressed: {
    backgroundColor: colors.surfacePressed,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  issuer: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    flexShrink: 1,
    marginRight: 8,
  },
  account: {
    color: colors.textDim,
    fontSize: 13,
    marginTop: 2,
  },
  countdown: {
    color: colors.textDim,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  countdownExpiring: {
    color: colors.danger,
  },
  code: {
    color: colors.accent,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 10,
    fontVariant: ["tabular-nums"],
  },
  codeExpiring: {
    color: colors.danger,
  },
  track: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 12,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  fillExpiring: {
    backgroundColor: colors.danger,
  },
});
