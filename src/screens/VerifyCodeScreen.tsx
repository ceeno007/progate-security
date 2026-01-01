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
                            onPress={reset}
                            style={{
                                position: 'absolute',
                                right: 12,
                                top: 12,
                                zIndex: 9999,
                                backgroundColor: 'rgba(0,0,0,0.2)',
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

                            {result?.type && (
                                <View style={[styles.typeBadge, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Text style={[styles.userType, { color: colors.primary }]}>{result?.type?.toUpperCase()}</Text>
                                </View>
                            )}

                            {result?.details?.destination && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
});

export default VerifyCodeScreen;
