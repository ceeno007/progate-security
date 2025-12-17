import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, Modal, Image } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useThemeColors, SPACING, SHADOWS } from '../theme';
import { ChevronLeft, CheckCircle, XCircle, MapPin, Search } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

const VerifyCodeScreen = ({ navigation }: any) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const colors = useThemeColors();

    const handleVerify = () => {
        if (!code) {
            Alert.alert('Error', 'Please enter a code');
            return;
        }
        setLoading(true);
        Keyboard.dismiss();

        // Simulate API Call similar to ScanScreen
        setTimeout(() => {
            // Mock Data
            const mockResponse = {
                valid: true,
                type: 'visitor',
                details: {
                    name: 'Jane Doe',
                    destination: 'Block B, Flat 12',
                    photoUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
                    vehiclePlate: 'ABC-987-YZ'
                }
            };

            // Simulate invalid code for a specific string
            if (code === '0000') {
                setResult({ valid: false, reason: 'Expired Code' });
            } else {
                setResult(mockResponse);
            }

            setLoading(false);
        }, 1500);
    };

    const reset = () => {
        setResult(null);
        setCode('');
    };

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
                <Text style={[styles.title, { color: colors.text }]}>Manual Verification</Text>
                <View style={{ width: 40 }} />
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.content}>
                    <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                        Enter the visitor's 6-digit access code or estate passcode below.
                    </Text>

                    <Input
                        placeholder="Enter Code (e.g. 123-456)"
                        value={code}
                        onChangeText={setCode}
                        autoCapitalize="none"
                        keyboardType="default"
                        icon={<Search size={20} color={colors.textSecondary} />}
                        style={{ fontSize: 24, letterSpacing: 2, textAlign: 'center' }}
                    />

                    <Button
                        title="Verify Access"
                        onPress={handleVerify}
                        loading={loading}
                        style={{ marginTop: SPACING.m }}
                    />
                </View>
            </TouchableWithoutFeedback>

            {/* Result Modal - Reusing logic from ScanScreen for consistency */}
            <Modal visible={!!result} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <BlurView intensity={Platform.OS === 'ios' ? 20 : 0} style={StyleSheet.absoluteFill} tint="dark" />
                    <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>

                        <View style={[styles.resultHeader, { backgroundColor: result?.valid ? colors.success : colors.danger }]}>
                            {result?.valid ? <CheckCircle color="#fff" size={28} /> : <XCircle color="#fff" size={28} />}
                            <Text style={styles.resultTitle}>{result?.valid ? 'Access Granted' : 'Access Denied'}</Text>
                        </View>

                        <View style={styles.resultContent}>
                            {result?.details?.photoUrl && (
                                <Image source={{ uri: result.details.photoUrl }} style={[styles.userPhoto, { borderColor: colors.surfaceHighlight }]} />
                            )}

                            <Text style={[styles.userName, { color: colors.text }]}>{result?.details?.name || 'Unknown'}</Text>

                            <View style={[styles.verifyWarning, { backgroundColor: colors.surfaceHighlight, borderColor: colors.danger }]}>
                                <Text style={[styles.verifyWarningText, { color: colors.danger }]}>
                                    ⚠️ VERIFY IDENTITY: Check Visitor's ID Card matches the photo above.
                                </Text>
                            </View>

                            {result?.type && (
                                <View style={[styles.typeBadge, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Text style={[styles.userType, { color: colors.primary }]}>{result?.type?.toUpperCase()}</Text>
                                </View>
                            )}

                            {result?.details?.destination && (
                                <View style={styles.infoRow}>
                                    <MapPin size={16} color={colors.textSecondary} />
                                    <Text style={[styles.infoText, { color: colors.textSecondary }]}>{result.details.destination}</Text>
                                </View>
                            )}

                            {result?.details?.vehiclePlate && (
                                <View style={[styles.plateContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Text style={[styles.plateText, { color: colors.text }]}>{result.details.vehiclePlate}</Text>
                                </View>
                            )}

                            {!result?.valid && result?.reason && (
                                <Text style={[styles.errorReason, { color: colors.danger }]}>{result.reason.toUpperCase()}</Text>
                            )}

                            <View style={styles.actions}>
                                {result?.valid && (
                                    <Button
                                        title="Log Entry"
                                        onPress={() => {
                                            navigation.goBack();
                                        }}
                                        style={styles.actionButton}
                                    />
                                )}
                                <Button
                                    title={result?.valid ? "Cancel" : "Try Again"}
                                    variant="outline"
                                    onPress={reset}
                                    style={styles.cancelButton}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
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
        marginBottom: SPACING.xl,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: SPACING.l,
    },
    instruction: {
        fontSize: 16,
        marginBottom: SPACING.l,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    resultCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
        paddingBottom: SPACING.xl,
    },
    resultHeader: {
        padding: SPACING.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.s,
    },
    resultTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    resultContent: {
        padding: SPACING.l,
        alignItems: 'center',
    },
    userPhoto: {
        width: 96,
        height: 96,
        borderRadius: 48,
        marginBottom: SPACING.m,
        borderWidth: 4,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
    },
    typeBadge: {
        paddingHorizontal: SPACING.m,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: SPACING.m,
    },
    userType: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.l,
        gap: 6,
    },
    infoText: {
        fontSize: 16,
    },
    plateContainer: {
        paddingHorizontal: SPACING.l,
        paddingVertical: SPACING.s,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: SPACING.l,
    },
    plateText: {
        fontSize: 20,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        fontWeight: '700',
    },
    errorReason: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: SPACING.l,
    },
    actions: {
        width: '100%',
        gap: SPACING.m,
    },
    actionButton: {
        width: '100%',
    },
    cancelButton: {
        width: '100%',
    },
    verifyWarning: {
        padding: SPACING.s,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: SPACING.m,
        marginTop: SPACING.xs,
        width: '100%',
    },
    verifyWarningText: {
        fontSize: 13,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default VerifyCodeScreen;
