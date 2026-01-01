import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Image, Platform, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useThemeColors, SPACING, SHADOWS } from '../theme';
import { Button } from '../components/Button';
import { BlurView } from 'expo-blur';
import { accessApi, storage } from '../api';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ScanScreen = ({ navigation }: any) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const colors = useThemeColors();
    const screenHeight = Dimensions.get('window').height;
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;

    useEffect(() => {
        if (result) {
            slideAnim.setValue(screenHeight); // Ensure effective reset
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 5
            }).start();
        }
    }, [result]);

    const resetScan = () => {
        Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 250,
            useNativeDriver: true
        }).start(() => {
            setScanned(false);
            setResult(null);
            setLoading(false);
            setScannedCode('');
        });
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    slideAnim.setValue(gestureState.dy);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    resetScan();
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    const [scannedCode, setScannedCode] = useState<string>('');

    // Removed old useEffect for permission
    useEffect(() => {
        if (permission && !permission.granted) requestPermission();
    }, [permission]);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || loading) return;
        setScanned(true);
        setLoading(true);
        setScannedCode(data);

        try {
            const response = await accessApi.verifyCode(data);

            if (response.valid) {
                setResult({
                    valid: true,
                    type: 'visitor',
                    details: {
                        name: response.visitor_name || 'Unknown Visitor',
                        destination: response.resident_name ? `Visiting: ${response.resident_name}` : 'Unknown Destination',
                        // validUntil: response.valid_until
                        photoUrl: null, // API doesn't return this yet
                        vehiclePlate: null // API doesn't return this yet
                    }
                });
            } else {
                setResult({
                    valid: false,
                    reason: response.message || 'Invalid Code'
                });
            }
        } catch (error: any) {
            setResult({ valid: false, reason: error.message || 'Scan Failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setCheckInLoading(true);
        try {
            await accessApi.checkIn(scannedCode);

            // Log Activity
            await storage.addActivity({
                type: 'SCAN',
                title: 'Entry Verified',
                subtitle: result?.details?.name ? `Visitor • ${result.details.name}` : 'Visitor Check-in'
            });

            Alert.alert('Success', 'Visitor checked in!', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        } catch (error: any) {
            Alert.alert('Check-In Failed', error.message || 'Could not log entry.');
        } finally {
            setCheckInLoading(false);
        }
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
                        <Ionicons name="close" color="#fff" size={24} />
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
            <Modal
                visible={!!result}
                transparent={true}
                animationType="fade"
                onRequestClose={resetScan}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={resetScan}
                >
                    <Animated.View
                        style={[
                            styles.resultCard,
                            {
                                backgroundColor: colors.surface,
                                overflow: 'visible',
                                transform: [{ translateY: slideAnim }],
                                maxWidth: 600, // Tablet friendly
                                alignSelf: 'center',
                                width: '100%',
                            }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        {/* Drag Handle */}
                        <View style={{ width: '100%', alignItems: 'center', paddingVertical: 12 }}>
                            <View style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: colors.border }} />
                        </View>

                        {/* Status Header with Large Icon */}
                        <View style={[styles.resultHeader, { backgroundColor: result?.valid ? '#10B981' : '#EF4444' }]}>
                            <View style={styles.statusIconContainer}>
                                {result?.valid ?
                                    <Ionicons name="checkmark-circle" color="#fff" size={64} /> :
                                    <Ionicons name="close-circle" color="#fff" size={64} />
                                }
                            </View>
                            <Text style={styles.resultTitle}>
                                {result?.valid ? 'Access Granted' : 'Access Denied'}
                            </Text>
                            <Text style={styles.resultSubtitle}>
                                {result?.valid ? 'Welcome to the estate' : 'Please contact security'}
                            </Text>
                        </View>

                        <View style={styles.resultContent}>
                            {/* Profile Section */}
                            {result?.details?.photoUrl && (
                                <View style={styles.photoSection}>
                                    <Image
                                        source={{ uri: result.details.photoUrl }}
                                        style={[styles.userPhoto, {
                                            borderColor: result?.valid ? '#10B981' : '#EF4444',
                                            borderWidth: 3,
                                        }]}
                                    />
                                </View>
                            )}

                            <Text style={[styles.userName, { color: colors.text }]}>
                                {result?.details?.name || 'Unknown Visitor'}
                            </Text>

                            <View style={[styles.typeBadge, {
                                backgroundColor: result?.valid ? '#D1FAE5' : '#FEE2E2',
                            }]}>
                                <Text style={[styles.userType, {
                                    color: result?.valid ? '#059669' : '#DC2626'
                                }]}>
                                    {result?.type?.toUpperCase() || 'VISITOR'}
                                </Text>
                            </View>

                            {/* Info Cards */}
                            <View style={styles.infoCards}>
                                <View style={[styles.infoCard, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Ionicons name="qr-code-outline" size={20} color={colors.primary} />
                                    <View style={styles.infoCardText}>
                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Code</Text>
                                        <Text style={[styles.infoValue, { color: colors.text }]}>{scannedCode}</Text>
                                    </View>
                                </View>

                                <View style={[styles.infoCard, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Ionicons name="location-outline" size={20} color={colors.primary} />
                                    <View style={styles.infoCardText}>
                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Destination</Text>
                                        <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={2}>
                                            {result?.details?.destination || 'Unknown'}
                                        </Text>
                                    </View>
                                </View>

                                {result?.details?.vehiclePlate && (
                                    <View style={[styles.infoCard, { backgroundColor: colors.surfaceHighlight }]}>
                                        <Ionicons name="car-sport-outline" size={20} color={colors.primary} />
                                        <View style={styles.infoCardText}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Vehicle</Text>
                                            <Text style={[styles.plateTextCompact, { color: colors.text }]}>
                                                {result.details.vehiclePlate}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>

                            {/* Security Warning */}
                            {result?.valid && (
                                <View style={[styles.warningBanner, {
                                    backgroundColor: '#FEF3C7',
                                    borderLeftColor: '#F59E0B',
                                }]}>
                                    <Ionicons name="shield-checkmark-outline" size={20} color="#D97706" />
                                    <Text style={[styles.warningText, { color: '#92400E' }]}>
                                        Verify physical ID matches photo before entry
                                    </Text>
                                </View>
                            )}

                            {/* Actions */}
                            <View style={styles.actions}>
                                {result?.valid && (
                                    <Button
                                        title="✓ Log Entry"
                                        onPress={handleCheckIn}
                                        loading={checkInLoading}
                                        style={styles.actionButton}
                                    />
                                )}
                                <Button
                                    title={result?.valid ? "Cancel" : "Dismiss"}
                                    variant="outline"
                                    onPress={resetScan}
                                    style={styles.cancelButton}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
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
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        ...SHADOWS.large,
    },
    resultHeader: {
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.xxl,
        paddingHorizontal: SPACING.l,
        alignItems: 'center',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },
    statusIconContainer: {
        marginBottom: SPACING.m,
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 4,
        textAlign: 'center',
    },
    resultSubtitle: {
        fontSize: 16,
        fontWeight: '500',
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
    },
    resultContent: {
        padding: SPACING.xl,
        alignItems: 'center',
    },
    photoSection: {
        marginBottom: SPACING.m,
    },
    userPhoto: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0f0f0',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    typeBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: SPACING.xl,
    },
    userType: {
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    infoCards: {
        width: '100%',
        gap: SPACING.m,
        marginBottom: SPACING.l,
    },
    infoCard: {
        flexDirection: 'row',
        padding: SPACING.m,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    infoCardText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
    },
    plateTextCompact: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    warningBanner: {
        flexDirection: 'row',
        padding: SPACING.m,
        borderRadius: 12,
        borderLeftWidth: 4,
        gap: 10,
        marginBottom: SPACING.xl,
        width: '100%',
        alignItems: 'center',
    },
    warningText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    closeScanButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        padding: 4,
    }
});

export default ScanScreen;
