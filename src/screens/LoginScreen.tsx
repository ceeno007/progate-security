import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useThemeColors, SPACING } from '../theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { authApi } from '../api';

const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const colors = useThemeColors();

    const isAndroid = Platform.OS === 'android';
    const biometricLabel = isAndroid ? 'Biometrics' : 'Face ID';
    // Ionicons names
    const biometricIconName = isAndroid ? 'finger-print' : 'scan-outline';

    useEffect(() => {
        (async () => {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            console.log('Biometrics Check:', { compatible, enrolled });
            setIsBiometricSupported(compatible && enrolled);
        })();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter both email and password.');
            return;
        }

        setLoading(true);
        try {
            await authApi.login({ email, password });

            // Navigate to Main flow
            navigation.replace('Main');
        } catch (error: any) {
            console.error('Login Error:', error);

            let errorMessage = error.message || 'An unexpected error occurred.';

            // Customize error message for common issues
            if (errorMessage.includes('404') || errorMessage.includes('401')) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (errorMessage.includes('Network request failed')) {
                errorMessage = 'Please check your internet connection.';
            }

            Alert.alert('Login Failed', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricAuth = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access ProGate',
                fallbackLabel: 'Use Password',
            });

            if (result.success) {
                // Ideally, we would need to retrieve stored credentials or efficient token validation here
                // For now, redirecting to Main assuming session is valid or needs re-auth
                navigation.replace('Main');
            }
        } catch (error) {
            Alert.alert('Authentication Failed', 'Please use your password.');
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
                            ProGate Security
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Email Address"
                            placeholder="guard@progatehq.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            placeholderTextColor={colors.textSecondary}
                        />
                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            placeholderTextColor={colors.textSecondary}
                        />

                        <View style={styles.spacer} />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            icon={<Ionicons name="arrow-forward" size={20} color={colors.textInverse} />}
                        />

                        {
                            isBiometricSupported && (
                                <Button
                                    title={`Use ${biometricLabel}`}
                                    variant="secondary"
                                    onPress={handleBiometricAuth}
                                    style={styles.biometricButton}
                                    icon={<Ionicons name={biometricIconName} size={20} color={colors.text} />}
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
