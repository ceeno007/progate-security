import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Image, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useThemeColors, SPACING, SHADOWS } from '../theme';
import { X, CheckCircle, XCircle, MapPin } from 'lucide-react-native';
import { Button } from '../components/Button';
import { BlurView } from 'expo-blur';

const ScanScreen = ({ navigation }: any) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const colors = useThemeColors();

    useEffect(() => {
        if (permission && !permission.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || loading) return;
        setScanned(true);
        setLoading(true);

        // Mock API Call
        console.log(`Scanned: ${data}`);

        setTimeout(() => {
            // Mock Data
            const mockResponse = {
                valid: true,
                type: 'visitor',
                details: {
                    name: 'John Doe',
                    destination: 'Block A, Flat 5',
                    photoUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
                    vehiclePlate: 'LND-123-XY'
                }
            };
            setResult(mockResponse);
            setLoading(false);
        }, 1500);
    };

    const resetScan = () => {
        setScanned(false);
        setResult(null);
        setLoading(false);
    };

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <ScreenWrapper style={styles.permissionContainer}>
                <Text style={[styles.permissionText, { color: colors.text }]}>Camera permission is required.</Text>
                <Button title="Grant Permission" onPress={requestPermission} />
            </ScreenWrapper>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                facing="back"
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <X color="#fff" size={24} />
                    </TouchableOpacity>
                </View>

                <View style={styles.scanFrameContainer}>
                    <View style={[styles.scanFrame, { borderColor: colors.primary }]}>
                        {/* Corner Markers */}
                        <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
                        <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
                        <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
                        <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
                    </View>
                    {loading && <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />}
                </View>

                <Text style={styles.instruction}>Align QR code within frame</Text>
            </View>

            {/* Result Modal */}
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

                            <View style={[styles.typeBadge, { backgroundColor: colors.surfaceHighlight }]}>
                                <Text style={[styles.userType, { color: colors.primary }]}>{result?.type?.toUpperCase()}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <MapPin size={16} color={colors.textSecondary} />
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>{result?.details?.destination}</Text>
                            </View>

                            {result?.details?.vehiclePlate && (
                                <View style={[styles.plateContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Text style={[styles.plateText, { color: colors.text }]}>{result.details.vehiclePlate}</Text>
                                </View>
                            )}

                            <View style={styles.actions}>
                                <Button
                                    title="Log Entry"
                                    onPress={() => {
                                        resetScan();
                                        navigation.goBack();
                                    }}
                                    style={styles.actionButton}
                                />
                                <Button
                                    title="Cancel"
                                    variant="outline"
                                    onPress={resetScan}
                                    style={styles.cancelButton}
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.l,
    },
    permissionText: {
        fontSize: 16,
        marginBottom: SPACING.m,
        textAlign: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'space-between',
        paddingVertical: SPACING.xxl,
    },
    header: {
        paddingHorizontal: SPACING.m,
        marginTop: SPACING.l,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    scanFrameContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanFrame: {
        width: 260,
        height: 260,
        borderWidth: 2,
        borderRadius: 24,
        backgroundColor: 'transparent',
    },
    loader: {
        position: 'absolute',
    },
    instruction: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 15,
        fontWeight: '500',
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
    corner: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderColor: '#fff',
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 16,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 16,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 16,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 16,
    },
});

export default ScanScreen;
