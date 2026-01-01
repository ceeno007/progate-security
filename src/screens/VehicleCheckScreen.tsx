import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useThemeColors, SPACING } from '../theme';
import { ChevronLeft, Car, Search, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { vehiclesApi, VehicleInfo, storage } from '../api';

const VehicleCheckScreen = ({ navigation }: any) => {
    const [plateNumber, setPlateNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VehicleInfo | null>(null);
    const colors = useThemeColors();

    const handleCheck = async () => {
        if (!plateNumber) {
            Alert.alert('Error', 'Please enter a plate number');
            return;
        }

        setLoading(true);
        setResult(null);
        Keyboard.dismiss();

        try {
            const data = await vehiclesApi.checkPlate(plateNumber);
            setResult(data);

            // Log Activity
            await storage.addActivity({
                type: 'VEHICLE',
                title: 'Vehicle Checked',
                subtitle: `${data.plate_number} • ${data.status}`
            });
        } catch (error: any) {
            Alert.alert('Search Failed', error.message || 'Could not find vehicle details.');
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const isApproved = status === 'APPROVED';
        return (
            <View style={[
                styles.badge,
                { backgroundColor: isApproved ? colors.success + '20' : colors.danger + '20' }
            ]}>
                {isApproved ? (
                    <ShieldCheck size={20} color={colors.success} style={{ marginRight: 6 }} />
                ) : (
                    <ShieldAlert size={20} color={colors.danger} style={{ marginRight: 6 }} />
                )}
                <Text style={[
                    styles.badgeText,
                    { color: isApproved ? colors.success : colors.danger }
                ]}>
                    {status}
                </Text>
            </View>
        );
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <Button
                    title="Back"
                    variant="ghost"
                    icon={<ChevronLeft size={24} color={colors.text} />}
                    onPress={() => navigation.goBack()}
                    style={{ width: 'auto', paddingHorizontal: 0 }}
                />
                <Text style={[styles.title, { color: colors.text }]}>Vehicle Check</Text>
                <View style={{ width: 40 }} />
            </View>

            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.content}>
                    <Text style={[styles.instruction, { color: colors.textSecondary }]}>
                        Enter vehicle plate number to verify access status.
                    </Text>

                    <Input
                        placeholder="Plate Number (e.g. ABC-123-XY)"
                        value={plateNumber}
                        onChangeText={(text) => setPlateNumber(text.toUpperCase())}
                        autoCapitalize="characters"
                        icon={<Car size={20} color={colors.textSecondary} />}
                    />

                    <Button
                        title="Check Status"
                        onPress={handleCheck}
                        loading={loading}
                        style={{ marginTop: SPACING.s }}
                    />
                </View>
            </TouchableWithoutFeedback>

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}

            {result && !loading && (
                <View style={[styles.resultCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <StatusBadge status={result.status} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Vehicle</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{result.make_model}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Owner</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{result.owner}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Plate</Text>
                        <Text style={[styles.detailValue, { color: colors.text, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }]}>{result.plate_number}</Text>
                    </View>
                </View>
            )}
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
    loadingContainer: {
        marginTop: SPACING.xl,
        alignItems: 'center',
    },
    resultCard: {
        marginTop: SPACING.xl,
        marginHorizontal: SPACING.l,
        padding: SPACING.l,
        borderRadius: 20,
        borderWidth: 1,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: SPACING.l,
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '700',
    },
    detailRow: {
        marginBottom: SPACING.s,
    },
    detailLabel: {
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: SPACING.m,
    }
});

export default VehicleCheckScreen;
