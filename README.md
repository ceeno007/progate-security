# ProGate Security - Guard Terminal

A premium, high-security access control interface for ProGate Estate Management.

## Features
- **Smart Access Scanner**: Verifies QR codes and Entry Codes instantly.
- **Secure Login**: Biometric Authentication (Face ID / Touch ID) and Password support.
- **Real-Time Dashboard**: Monitor active alerts, gate logs, and visitor stats.
- **Emergency Response**: Receive and acknowledge panic alerts.
- **Watchlist Lookup**: Manual search for residents and vehicles.

## Tech Stack
- **Framework**: React Native (Expo SDK 54)
- **Navigation**: React Navigation Native Stack
- **Styling**: Custom StyleSheet + Expo Linear Gradient + BlurView
- **Icons**: React Native Vector Icons (Ionicons, Feather)
- **Camera**: Expo Camera (CameraView)
- **Auth**: Expo Local Authentication (Biometrics)

## Usage
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run on Device/Simulator**:
   ```bash
   npx expo start
   ```
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Scan QR code with Expo Go app
   - **Note for iOS Simulator**: To test Face ID, go to `Features > Face ID > Enrolled`.

## Configuration
- Update `src/utils/constants.ts` or similar if you add environment variables.
- Mock API is currently implemented in `src/screens/ScanScreen.tsx` for demonstration.

## Design
- **Theme**: "Night Guard" (Dark Slate, Electric Blue, Emerald Green).
- **UX**: Fast interactions, haptic feedback (optional integration), clean typography.
