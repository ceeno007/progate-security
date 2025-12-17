import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useThemeColors, SPACING } from '../theme';
import { ChevronLeft, Bell, Shield, LogOut, ChevronRight, Fingerprint, ScanFace } from 'lucide-react-native';
import { Button } from '../components/Button';
import * as LocalAuthentication from 'expo-local-authentication';

const SettingsScreen = ({ navigation }: any) => {
    const colors = useThemeColors();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(true);

    const isAndroid = Platform.OS === 'android';
    const biometricLabel = isAndroid ? 'Biometric Login' : 'Face ID Login';
    const BiometricIcon = isAndroid ? Fingerprint : ScanFace;

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            // User wants to ENABLE biometrics - confirm identity first
            try {
                const hasHardware = await LocalAuthentication.hasHardwareAsync();
                if (!hasHardware) {
                    Alert.alert('Not Supported', 'Biometric hardware not available on this device.');
                    return;
                }

                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: `Confirm ${biometricLabel}`,
                    fallbackLabel: 'Use Passcode',
                });

                if (result.success) {
                    setBiometricEnabled(true);
                    Alert.alert('Success', `${biometricLabel} enabled.`);
                } else {
                    // Start off if failed
                    setBiometricEnabled(false);
                }
            } catch (error) {
                Alert.alert('Error', 'Could not authenticate.');
                setBiometricEnabled(false);
            }
        } else {
            // User wants to DISABLE - usually safe to just do it, or ask for confirm?
            // Let's just disable it for now straightforwardly
            setBiometricEnabled(false);
        }
    };

    const SettingItem = ({ icon, title, value, type = 'toggle', onPress, onToggle }: any) => (
        <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={onPress}
            disabled={type === 'toggle'}
        >
            <View style={styles.itemLeft}>
                {React.cloneElement(icon, { size: 22, color: colors.text })}
                <Text style={[styles.itemTitle, { color: colors.text }]}>{title}</Text>
            </View>
            {type === 'toggle' ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: colors.surfaceHighlight, true: colors.primary }}
                    thumbColor="#fff"
                />
            ) : (
                <View style={styles.itemRight}>
                    {value && <Text style={[styles.itemValue, { color: colors.textSecondary }]}>{value}</Text>}
                    <ChevronRight size={18} color={colors.textSecondary} />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
                <Button
                    title="Back"
                    variant="ghost"
                    icon={<ChevronLeft size={24} color={colors.text} />}
                    onPress={() => navigation.goBack()}
                    style={{ width: 'auto', paddingHorizontal: 0 }}
                />
                <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PREFERENCES</Text>
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <SettingItem
                        icon={<Bell />}
                        title="Push Notifications"
                        value={notificationsEnabled}
                        onToggle={setNotificationsEnabled}
                    />
                </View>

                <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>SECURITY</Text>
                <View style={[styles.section, { backgroundColor: colors.surface }]}>
                    <SettingItem
                        icon={<BiometricIcon />}
                        title={biometricLabel}
                        value={biometricEnabled}
                        onToggle={handleBiometricToggle}
                    />
                </View>

                <Button
                    title="Log Out"
                    variant="danger"
                    style={{ marginTop: SPACING.xl }}
                    onPress={() => navigation.replace('Login')}
                    icon={<LogOut size={20} color="#fff" />}
                />

                <Text style={[styles.version, { color: colors.textSecondary }]}>
                    ProGate v1.0.0 (Build 240)
                </Text>

            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.l,
        marginTop: SPACING.m,
        marginBottom: SPACING.l,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: SPACING.l,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: SPACING.s,
        marginLeft: SPACING.s,
        marginTop: SPACING.l,
    },
    section: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemValue: {
        fontSize: 15,
    },
    version: {
        textAlign: 'center',
        marginTop: SPACING.xl,
        fontSize: 13,
    },
});

export default SettingsScreen;
