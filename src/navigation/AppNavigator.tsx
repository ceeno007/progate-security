import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ScanScreen from '../screens/ScanScreen';
import VerifyCodeScreen from '../screens/VerifyCodeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VehicleCheckScreen from '../screens/VehicleCheckScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Main" component={DashboardScreen} />
                <Stack.Screen
                    name="Scan"
                    component={ScanScreen}
                    options={{
                        animation: 'slide_from_bottom',
                        presentation: 'fullScreenModal'
                    }}
                />
                <Stack.Screen
                    name="VerifyCode"
                    component={VerifyCodeScreen}
                    options={{
                        animation: 'slide_from_right'
                    }}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                        animation: 'slide_from_right'
                    }}
                />
                <Stack.Screen
                    name="VehicleCheck"
                    component={VehicleCheckScreen}
                    options={{
                        animation: 'slide_from_right'
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
