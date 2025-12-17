import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useThemeColors, SPACING } from '../theme';
import { ArrowRight, Fingerprint, ScanFace } from 'lucide-react-native';

const LoginScreen = ({ navigation }: any) => {
    const [estateId, setEstateId] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const colors = useThemeColors();

    const isAndroid = Platform.OS === 'android';
    const biometricLabel = isAndroid ? 'Biometrics' : 'Face ID';
    const BiometricIcon = isAndroid ? Fingerprint : ScanFace;

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setIsBiometricSupported(compatible && enrolled);
        })();
    }, []);

    const handleLogin = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            navigation.replace('Main');
        }, 1500);
    };

    const handleBiometricAuth = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access ProGate',
                fallbackLabel: 'Use Passcode',
            });

            if (result.success) {
                navigation.replace('Main');
            }
        } catch (error) {
            Alert.alert('Authentication Failed', 'Please use your access code.');
        }
    };

    return (
        <ScreenWrapper style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    <View style={styles.header}>
                        <Image
                            source={require('../../assets/branding/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={[styles.title, { color: colors.text }]}>Sign in</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            ProGate Security Console
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Estate ID"
                            placeholder="e.g. LKG-001"
                            value={estateId}
                            onChangeText={setEstateId}
                            autoCapitalize="characters"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <Input
                            label="Access Code"
                            placeholder="Enter your unique code"
                            value={accessCode}
                            onChangeText={setAccessCode}
                            secureTextEntry
                            autoCapitalize="none"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <View style={styles.spacer} />

                        <Button
                            title="Continue"
                            onPress={handleLogin}
                            loading={loading}
                            icon={<ArrowRight size={20} color={colors.textInverse} />}
                        />

                        {
                            isBiometricSupported && (
                                <Button
                                    title={`Use ${biometricLabel}`}
                                    variant="secondary"
                                    onPress={handleBiometricAuth}
                                    style={styles.biometricButton}
                                    icon={<BiometricIcon size={20} color={colors.text} />}
                                />
                            )
                        }
                    </View >

                </KeyboardAvoidingView >
            </TouchableWithoutFeedback >
        </ScreenWrapper >
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.l,
        alignItems: 'center', // Center content horizontally
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        maxWidth: 420, // Tablet constraint
        alignSelf: 'center',
    },
    header: {
        marginBottom: SPACING.xl,
        alignItems: 'center', // Center text
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: SPACING.l,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -1,
        marginBottom: SPACING.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '400',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    spacer: {
        height: SPACING.l,
    },
    biometricButton: {
        marginTop: SPACING.m,
    }
});

export default LoginScreen;
