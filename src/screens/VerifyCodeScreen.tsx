import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, Modal, Image, TouchableOpacity, Animated, PanResponder, Dimensions } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useThemeColors, SPACING, SHADOWS } from '../theme';
import { ChevronLeft, Search } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { accessApi } from '../api';
import Ionicons from 'react-native-vector-icons/Ionicons';

const VerifyCodeScreen = ({ navigation }: any) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [checkInLoading, setCheckInLoading] = useState(false);
    const colors = useThemeColors();
    const screenHeight = Dimensions.get('window').height;
    const slideAnim = useRef(new Animated.Value(screenHeight)).current;

    useEffect(() => {
        if (result) {
            slideAnim.setValue(screenHeight);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 5
            }).start();
        }
    }, [result]);

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
                    reset();
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true
                    }).start();
                }
            }
        })
    ).current;

    const handleVerify = async () => {
        if (!code) {
            Alert.alert('Error', 'Please enter a code');
            return;
        }
        setLoading(true);
        Keyboard.dismiss();

        try {
            const response = await accessApi.verifyCode(code);

            // Map API response to UI state structure
            if (response.valid) {
                setResult({
                    valid: true,
                    type: 'visitor', // Defaulting as API doesn't specify type yet
                    details: {
                        name: response.visitor_name || 'Unknown Visitor',
                        destination: response.resident_name ? `Visiting: ${response.resident_name}` : 'Unknown Destination',
                        // photoUrl: null, // API doesn't return photo yet
                        // vehiclePlate: null, // API doesn't return plate on verify
                        validUntil: response.valid_until
                    }
                });
            } else {
                setResult({
                    valid: false,
                    reason: response.message || 'Invalid or Expired Code'
                });
            }

        } catch (error: any) {
            console.error('Verify Error:', error);
            // Check for 404/400 explicitly if client throws them or just generic error
            const message = error.message || 'Verification Failed';
            setResult({ valid: false, reason: message });
        } finally {
            setLoading(false);
        }
    };

    const handleCheckIn = async () => {
        setCheckInLoading(true);
        try {
            await accessApi.checkIn(code);
            Alert.alert('Success', 'Visitor checked in successfully', [
                {
                    text: 'OK', onPress: () => {
                        setResult(null);
                        setCode('');
                        navigation.goBack();
                    }
                }
            ]);
        } catch (error: any) {
            Alert.alert('Check-In Failed', error.message || 'Could not log entry.');
        } finally {
            setCheckInLoading(false);
        }
    };

    const reset = () => {
        Animated.timing(slideAnim, {
            toValue: screenHeight,
            duration: 250,
            useNativeDriver: true
        }).start(() => {
            setResult(null);
            setCode('');
        });
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

            <Modal
                visible={!!result}
                transparent={true}
                animationType="fade"
                onRequestClose={reset}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={reset}
                >
                    <Animated.View
                        style={[
                            styles.resultCard,
                            {
                                backgroundColor: colors.surface,
                                overflow: 'visible',
                                transform: [{ translateY: slideAnim }],
                                maxWidth: 600,
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

                        {/* Status Header */}
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
                                {result?.valid ? 'Welcome to the estate' : result?.reason || 'Please contact security'}
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
                                {result?.details?.destination && (
                                    <View style={[styles.infoCard, { backgroundColor: colors.surfaceHighlight }]}>
                                        <Ionicons name="location-outline" size={20} color={colors.primary} />
                                        <View style={styles.infoCardText}>
                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Destination</Text>
                                            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={2}>
                                                {result.details.destination}
                                            </Text>
                                        </View>
                                    </View>
                                )}

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
                                    title={result?.valid ? "Cancel" : "Try Again"}
                                    variant="outline"
                                    onPress={reset}
                                    style={styles.cancelButton}
                                    disabled={checkInLoading}
                                />
                            </View>
                        </View>
                    </Animated.View>
                </TouchableOpacity>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
});

export default VerifyCodeScreen;
