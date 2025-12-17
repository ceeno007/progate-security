import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, StatusBar, useWindowDimensions, Modal, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { useThemeColors, SPACING, SHADOWS } from '../theme';
import { Button } from '../components/Button';
import { Scan, LogOut, TriangleAlert, Search, ChevronRight, User, KeyRound, Settings } from 'lucide-react-native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const DashboardScreen = ({ navigation }: any) => {
    const colors = useThemeColors();
    const { width } = useWindowDimensions();
    const isTablet = width >= 768; // iPad Portrait start
    const [refreshing, setRefreshing] = useState(false);
    const [activeAlerts, setActiveAlerts] = useState(0);
    const [sosVisible, setSosVisible] = useState(false);
    const [sosList, setSosList] = useState<any[]>([]);
    const [alertExpanded, setAlertExpanded] = useState(true); // Default open if alert exists

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    };

    const handleSettings = () => {
        navigation.navigate('Settings');
    };

    const toggleAlertExpansion = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAlertExpanded(!alertExpanded);
    };

    // Simulate incoming SOS Push Notifications
    useEffect(() => {
        // First Alert
        const timer1 = setTimeout(() => {
            const newAlert = {
                id: '1',
                name: "Mr. Chioma Okeke",
                address: "Block C, Flat 404",
                time: "Just Now"
            };
            setSosList(prev => [newAlert, ...prev]);
            setSosVisible(true);
            setActiveAlerts(prev => prev + 1);
        }, 5000);

        // Second Alert (Simulated multiple)
        const timer2 = setTimeout(() => {
            const newAlert2 = {
                id: '2',
                name: "Mrs. Sarah Adebayo",
                address: "Block A, Flat 102",
                time: "1 min ago"
            };
            setSosList(prev => [newAlert2, ...prev]);
            setActiveAlerts(prev => prev + 1);
        }, 12000);

        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    const handleAcknowledgeSos = () => {
        setSosVisible(false);
        // Navigate to map or detail if needed
    };

    const ActionCard = ({ title, icon, onPress, variant = 'standard', style }: any) => {
        const isPrimary = variant === 'primary';
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                style={[
                    styles.card,
                    {
                        backgroundColor: isPrimary ? colors.primary : colors.surface,
                        flex: 1,
                        minHeight: 120, // Square-ish
                        justifyContent: 'space-between',
                    },
                    !isPrimary && SHADOWS.small,
                    style
                ]}
            >
                <View style={styles.cardIconHeader}>
                    {React.cloneElement(icon, {
                        color: isPrimary ? colors.textInverse : colors.primary,
                        size: 28
                    })}
                </View>
                <View>
                    <Text style={[
                        styles.cardTitle,
                        { color: isPrimary ? colors.textInverse : colors.text }
                    ]}>
                        {title}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const Header = () => (
        <View style={styles.header}>
            <View>
                <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                    WEDNESDAY, 12 DECEMBER
                </Text>
                <Text style={[styles.screenTitle, { color: colors.text }]}>
                    Dashboard
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.avatar, { backgroundColor: colors.surfaceHighlight }]}
                onPress={handleSettings}
            >
                <Settings size={20} color={colors.textSecondary} />
            </TouchableOpacity>
        </View>
    );

    const ActionsSection = () => (
        <>
            {activeAlerts > 0 && (
                <View style={[styles.alertContainer, SHADOWS.medium]}>
                    <TouchableOpacity
                        style={[styles.alertBanner, { backgroundColor: colors.danger, borderBottomLeftRadius: alertExpanded ? 0 : 16, borderBottomRightRadius: alertExpanded ? 0 : 16 }]}
                        onPress={toggleAlertExpansion}
                        activeOpacity={0.9}
                    >
                        <View style={styles.alertHeaderContent}>
                            <TriangleAlert color="#fff" size={20} />
                            <Text style={styles.alertText}>{activeAlerts} Active Panic Alert{activeAlerts > 1 ? 's' : ''}</Text>
                            <ChevronRight
                                color="#fff"
                                size={20}
                                style={{ transform: [{ rotate: alertExpanded ? '90deg' : '0deg' }] }}
                            />
                        </View>
                    </TouchableOpacity>

                    {alertExpanded && (
                        <View style={[styles.alertDetails, { backgroundColor: '#FFEEF0', flexDirection: isTablet ? 'row' : 'column', flexWrap: isTablet ? 'wrap' : 'nowrap', justifyContent: isTablet ? 'space-between' : 'flex-start' }]}>
                            {sosList.map((alert, index) => (
                                <View
                                    key={alert.id}
                                    style={isTablet ?
                                        { width: '48%', backgroundColor: 'rgba(255,255,255,0.5)', padding: SPACING.m, borderRadius: 12, marginBottom: SPACING.m } :
                                        { marginBottom: index < sosList.length - 1 ? 16 : 0, borderBottomWidth: index < sosList.length - 1 ? 1 : 0, borderBottomColor: 'rgba(0,0,0,0.05)', paddingBottom: index < sosList.length - 1 ? 16 : 0 }
                                    }
                                >
                                    <View style={styles.alertDetailRow}>
                                        <Text style={styles.alertLabel}>RESIDENT:</Text>
                                        <Text style={styles.alertValue}>{alert.name}</Text>
                                    </View>
                                    <View style={styles.alertDetailRow}>
                                        <Text style={styles.alertLabel}>LOCATION:</Text>
                                        <Text style={styles.alertValue}>{alert.address}</Text>
                                    </View>
                                    <View style={styles.alertDetailRow}>
                                        <Text style={styles.alertLabel}>TIME:</Text>
                                        <Text style={styles.alertValue}>{alert.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            <View style={[styles.statusWidget, { backgroundColor: colors.surface }, SHADOWS.small]}>
                <View style={styles.statusRow}>
                    <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
                    <Text style={[styles.statusText, { color: colors.text }]}>Main Gate Active</Text>
                </View>
                <Text style={[styles.estateLabel, { color: colors.textSecondary }]}>Lekki Gardens Estate</Text>
            </View>

            <Text style={[styles.sectionHeader, { color: colors.text }]}>Actions</Text>
            <View style={styles.gridContainer}>
                <View style={styles.gridRow}>
                    <ActionCard
                        title="Scan Entry"
                        icon={<Scan />}
                        variant="primary"
                        onPress={() => navigation.navigate('Scan')}
                        style={{ marginRight: SPACING.m }}
                    />
                    <ActionCard
                        title="Verify OTP"
                        icon={<KeyRound />}
                        onPress={() => navigation.navigate('VerifyCode')}
                    />
                </View>
            </View>
        </>
    );

    const ActivitySection = () => (
        <>
            <Text style={[styles.sectionHeader, { color: colors.text, marginTop: isTablet ? 0 : SPACING.l }]}>Recent Activity</Text>
            <View style={[styles.groupedListContainer, { backgroundColor: colors.surface }]}>
                {[1, 2, 3, 4, 5, 6].map((item, index) => (
                    <View key={item}>
                        <View style={styles.listItem}>
                            <View style={styles.listLeft}>
                                <View style={[styles.listIcon, { backgroundColor: colors.surfaceHighlight }]}>
                                    {item % 2 !== 0 ? <Scan size={16} color={colors.text} /> : <LogOut size={16} color={colors.text} />}
                                </View>
                                <View>
                                    <Text style={[styles.listTitle, { color: colors.text }]}>
                                        {item % 2 !== 0 ? 'Entry Verified' : 'Exit Logged'}
                                    </Text>
                                    <Text style={[styles.listSubtitle, { color: colors.textSecondary }]}>
                                        {item % 2 !== 0 ? 'Visitor • John Doe' : 'Resident • Toyo...'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.listTime, { color: colors.textSecondary }]}>10:4{item} AM</Text>
                        </View>
                        {index < 5 && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
                    </View>
                ))}
            </View>
        </>
    );

    return (
        <ScreenWrapper style={{ backgroundColor: colors.background }}>
            <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} />

            {/* SOS Full Screen Overlay */}
            <Modal visible={sosVisible} animationType="slide" transparent={false}>
                <View style={[styles.sosContainer, { backgroundColor: colors.danger }]}>
                    <StatusBar barStyle="light-content" />

                    <View style={styles.sosContent}>
                        <View style={styles.sirenContainer}>
                            <TriangleAlert size={80} color="#fff" />
                        </View>

                        <Text style={styles.sosTitle}>SOS ALERT</Text>
                        <Text style={styles.sosSubtitle}>Resident requires immediate assistance</Text>

                        <View style={styles.sosCard}>
                            <Text style={styles.sosLabel}>RESIDENT</Text>
                            <Text style={styles.sosValue}>{sosList.length > 0 ? sosList[0].name : "Loading..."}</Text>

                            <View style={styles.divider} />

                            <Text style={styles.sosLabel}>LOCATION</Text>
                            <Text style={styles.sosValue}>{sosList.length > 0 ? sosList[0].address : "Unknown"}</Text>

                            <View style={styles.divider} />

                            <Text style={styles.sosLabel}>TIME</Text>
                            <Text style={styles.sosValue}>{sosList.length > 0 ? sosList[0].time : "Just Now"}</Text>
                        </View>

                        <Button
                            title="ACKNOWLEDGE & RESPOND"
                            onPress={handleAcknowledgeSos}
                            style={styles.acknowledgeButton}
                            textStyle={{ color: colors.danger, fontWeight: '800' }}
                        />
                    </View>
                </View>
            </Modal>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
                showsVerticalScrollIndicator={false}
            >
                <Header />

                {isTablet ? (
                    <View style={styles.tabletRow}>
                        <View style={styles.tabletLeftColumn}>
                            <ActionsSection />
                        </View>
                        <View style={styles.tabletRightColumn}>
                            <ActivitySection />
                        </View>
                    </View>
                ) : (
                    <>
                        <ActionsSection />
                        <ActivitySection />
                    </>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: SPACING.l,
        paddingTop: SPACING.l,
    },
    tabletRow: {
        flexDirection: 'row',
        gap: SPACING.l,
    },
    tabletLeftColumn: {
        flex: 1,
    },
    tabletRightColumn: {
        flex: 1.2, // Give slightly more space to history on tablet
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.l,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    screenTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        letterSpacing: 0.3,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20, // Circle
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBanner: {
        padding: SPACING.m,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.m,
        gap: SPACING.s,
    },
    alertText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
        flex: 1,
    },
    statusWidget: {
        padding: SPACING.m,
        borderRadius: 20,
        marginBottom: SPACING.l,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    statusIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 16,
        fontWeight: '600',
    },
    estateLabel: {
        fontSize: 14,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: SPACING.m,
        marginLeft: 4, // Align with typical inset
    },
    gridContainer: {
        gap: SPACING.m,
    },
    gridRow: {
        flexDirection: 'row',
    },
    card: {
        borderRadius: 24, // Apple style large rounding
        padding: SPACING.m,
    },
    cardIconHeader: {
        marginBottom: SPACING.s,
        alignItems: 'flex-start',
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    listButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
        borderRadius: 16,
    },
    listButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    groupedListContainer: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.m,
    },
    listLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.m,
    },
    listIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    listSubtitle: {
        fontSize: 13,
    },
    listTime: {
        fontSize: 13,
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 52, // Aligned with text start
    },
    sosContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: SPACING.l,
    },
    sosContent: {
        alignItems: 'center',
    },
    sirenContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.l,
    },
    sosTitle: {
        fontSize: 48,
        fontWeight: '900',
        color: '#fff',
        letterSpacing: 2,
        marginBottom: SPACING.s,
    },
    sosSubtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    sosCard: {
        backgroundColor: '#fff',
        width: '100%',
        borderRadius: 24,
        padding: SPACING.xl,
        marginBottom: SPACING.xl,
        alignItems: 'center',
    },
    sosLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#999',
        letterSpacing: 1,
        marginBottom: 8,
    },
    sosValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: SPACING.l,
        textAlign: 'center',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#eee',
        marginBottom: SPACING.l,
    },
    acknowledgeButton: {
        backgroundColor: '#fff',
        width: '100%',
        height: 56,
        borderRadius: 28,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    alertContainer: {
        marginBottom: SPACING.m,
        borderRadius: 16,
        backgroundColor: '#fff',
    },
    alertHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s,
        width: '100%'
    },
    alertDetails: {
        padding: SPACING.m,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    alertDetailRow: {
        flexDirection: 'row',
        marginBottom: 8,
        alignItems: 'flex-start',
    },
    alertLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#666',
        width: 80,
    },
    alertValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        flex: 1,
    },
    alertActions: {
        marginTop: SPACING.s,
        alignItems: 'flex-end',
    },
    miniButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    miniButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    }
});

export default DashboardScreen;
