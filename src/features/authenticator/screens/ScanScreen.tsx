import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { colors } from "../../../theme";
import { OtpAuthParseError, ParsedOtpAuth, parseOtpAuthUri } from "../lib/otpauth";

interface Props {
  onScanned: (parsed: ParsedOtpAuth) => void;
  onCancel: () => void;
}

export function ScanScreen({ onScanned, onCancel }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [error, setError] = useState<string | null>(null);
  // Guards against the camera delivering the same QR code several times per second.
  const handled = useRef(false);

  const handleBarcode = ({ data }: { data: string }) => {
    if (handled.current) return;
    try {
      const parsed = parseOtpAuthUri(data);
      handled.current = true;
      onScanned(parsed);
    } catch (err) {
      setError(err instanceof OtpAuthParseError ? err.message : "Couldn't read that QR code");
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.permission]}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionBody}>
          The camera is only used to read the QR code a service shows when you enable two-factor
          authentication. Nothing is recorded.
        </Text>
        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={requestPermission}>
          <Text style={styles.buttonLabel}>Allow camera</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]} onPress={onCancel}>
          <Text style={styles.cancelLabel}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarcode}
      />
      <View style={styles.overlay}>
        <Text style={styles.hint}>Point the camera at the 2FA QR code</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]} onPress={onCancel}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  permission: {
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  permissionBody: {
    color: colors.textDim,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 24,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 48,
  },
  hint: {
    color: colors.text,
    fontSize: 15,
    backgroundColor: "rgba(10, 12, 14, 0.75)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    backgroundColor: "rgba(10, 12, 14, 0.85)",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonLabel: {
    color: colors.accentText,
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
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
