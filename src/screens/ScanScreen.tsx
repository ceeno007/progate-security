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
                                transform: [{ translateY: slideAnim }]
                            }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        {/* Drag Handle */}
                        <View style={{ width: '100%', alignItems: 'center', paddingVertical: 8 }}>
                            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.2)' }} />
                        </View>

                        {/* Close Button - Floating on top right */}
                        <TouchableOpacity
                            onPress={resetScan}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: 12,
                                zIndex: 9999, // Super high
                                backgroundColor: 'rgba(0,0,0,0.2)', // Subtle backing
                                borderRadius: 20,
                            }}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <Ionicons name="close-circle" size={36} color="#fff" />
                        </TouchableOpacity>

                        <View style={[styles.resultHeader, { backgroundColor: result?.valid ? colors.success : colors.danger }]}>
                            {result?.valid ? <Ionicons name="checkmark-circle" color="#fff" size={28} /> : <Ionicons name="close-circle" color="#fff" size={28} />}
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
                                <Text style={[styles.userType, { color: colors.primary }]}>{result?.type?.toUpperCase() || 'VISITOR'}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
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
                                    onPress={handleCheckIn}
                                    loading={checkInLoading}
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
