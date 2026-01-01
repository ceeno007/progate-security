# ProGate Security - App Backend Specifications

**To Backend Developer:**
Please implement the following API endpoints to ensure full functionality of the ProGate Security App (Biometrics, Push Notifications, Scanning, etc.).

## 1. Authentication (Critical for Biometrics)
The app uses a `Refresh Token` flow to enable Biometric Login (FaceID).
*   **POST** `/auth/login`
    *   **Request**: `{ "email": "...", "password": "..." }`
    *   **Response**: 
        ```json
        { 
          "access_token": "...", 
          "refresh_token": "...", 
          "user": {
            "id": "...",
            "name": "...",
            "role": "SECURITY",
            "estate_id": "...",
            "estate_name": "Lekki Gardens Estate",
            "estate_logo_url": "https://yourcdn.com/estate-logo.png"
          }
        }
        ```
*   **POST** `/auth/refresh`
    *   **Request**: `{ "refresh_token": "..." }`
    *   **Response**: `{ "access_token": "..." }`
    *   *Note: This is how Biometrics works. The app stores the refresh token securely and uses it to auto-login.*
*   **POST** `/auth/logout`
    *   **Request**: `{}` (Header: Bearer Token)

## 2. Push Notifications (Critical for Alerts)
To receive alerts while the app is backgrounded/closed, we need to register the device token.

### A. Register Device Token
*   **POST** `/notifications/register-token`
    *   **Request**: 
        ```json
        { 
          "push_token": "ExponentPushToken[xxxxxxxx]", 
          "platform": "android"  // or "ios"
        }
        ```
    *   **Logic**: Save this token against the logged-in User/Device in your database.

### B. Send Push Notification (When SOS Alert Created)
When a panic button is triggered or an alert is created, send a notification to all active guards:

1. **Get all guard tokens** from your database (users with role "SECURITY")
2. **Send POST request** to Expo's push service:
   
   **Endpoint**: `https://exp.host/--/api/v2/push/send`
   
   **Headers**: `Content-Type: application/json`
   
   **Body**:
   ```json
   {
     "to": "ExponentPushToken[xxxxxxxx]",
     "sound": "default",
     "title": "🚨 EMERGENCY ALERT",
     "body": "Panic button triggered by John Doe - Block A, Flat 203",
     "data": {
       "type": "alert",
       "alert_id": "alert_123",
       "priority": "high"
     },
     "priority": "high",
     "channelId": "default"
   }
   ```

3. **For multiple devices**, send an array:
   ```json
   [
     { "to": "ExponentPushToken[device1]", "title": "...", ... },
     { "to": "ExponentPushToken[device2]", "title": "...", ... }
   ]
   ```

**Note**: iOS and Android both use the same Expo endpoint. No separate Firebase/APNs calls needed.

## 3. Real-Time Event Stream (Critical for Live Alarm)
To trigger the LOUD alarm while the app is open.
*   **GET** `/events` (Server-Sent Events)
    *   **Behavior**: Keep connection open.
    *   **Event**: `message` -> Data: `{ "type": "alert", "alert_id": "123" }`

## 4. Access Control (QR Scanning)
*   **POST** `/access/verify?code={code}`
    *   **Purpose**: Check if a visitor code is valid.
    *   **Response**: 
        ```json
        {
          "valid": true,
          "visitor_name": "John Doe",
          "resident_name": "Jane Smith",
          "destination": "Block B, Flat 402",
          "valid_until": "2024-12-31T23:59:59Z"
        }
        ```
*   **POST** `/access/check-in?code={code}` 
    *   **Purpose**: Log the actual entry time.
    *   **Response**: `{ "message": "Entry logged successfully" }`

## 5. Security Features
*   **GET** `/vehicles/check/{plate_number}` 
    *   **Purpose**: Verify if a vehicle is authorized.
    *   **Response**:
        ```json
        {
          "plate_number": "ABC-123",
          "status": "APPROVED",  // or "DENIED" / "UNKNOWN"
          "make_model": "Toyota Camry",
          "owner": "Mr. Smith"
        }
        ```
*   **GET** `/alerts/` 
    *   **Purpose**: List all active SOS alerts.
    *   **Response**:
        ```json
        [
          {
            "id": "alert_123",
            "status": "ACTIVE", // or "RESPONDING"
            "resident_name": "Alice Wonderland",
            "description": "Panic Button Triggered",
            "created_at": "2024-01-01T12:00:00Z"
          }
        ]
        ```
*   **PATCH** `/alerts/{id}`
    *   **Purpose**: Acknowledge an alert.
    *   **Request**: `{ "status": "RESPONDING" }`

**Summary for Developer**:
- **Biometrics** = Implement `/auth/refresh`.
- **Notifications** = Implement `/notifications/register-token`.
- **Live Alarm** = Implement `/events` (SSE).
