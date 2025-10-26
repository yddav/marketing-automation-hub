# FINDERR Project - Quick Context

**Project**: FINDERR - Phone Recovery System
**Package**: com.finderr.app
**Tech Stack**: Flutter + Supabase + Android Kotlin
**Status**: v4.2.0+230 - Production Ready ✅

---

## 📊 Current Release

### v4.2.0+230 (Oct 26, 2025)
**Status**: Cross-Platform Sync Validated on Samsung S20 (Android 13)

**Validation**: 100% Test Success ✅
- Web Activation → Emergency wallpaper: PASS
- Web Deactivation → Original wallpaper: PASS
- SMS Activation (FINDERR_ON): PASS
- SMS Deactivation (FINDERR_OFF): PASS

**Technical Achievement**:
- Mobile-as-Executor Model: Mobile executes, reports results
- Database-as-Shared-State: Coordinates commands
- Timestamp-Based Authority: Millisecond precision conflict resolution
- Cross-Platform Commands: Web + SMS → Mobile propagation

---

## 🏗️ System Architecture

### Core Components

**1. AlertSyncService** (`lib/services/alert_sync_service.dart`)
- 30-second polling + real-time subscriptions
- Automatic database sync with bulletproof persistence
- 2-7s SMS→Database sync performance
- Up to 30s Web→Mobile polling latency

**2. EmergencyModeManager** (`android/.../EmergencyModeManager.kt`)
- Native wallpaper operations (zero ANR)
- Emergency wallpaper generation with contact info
- Original wallpaper backup/restore via WallpaperManager.getDrawable()

**3. EmergencyBackgroundService** (`android/.../EmergencyBackgroundService.kt`)
- Background monitoring (30s polling when backgrounded)
- SharedPreferences persistence (`flutter.emergency_active`)
- Survives app restarts and device reboots

**4. SMS Integration**
- Direct Supabase REST API for SMS→Database sync
- Method channels: Flutter ↔ Android communication
- Listener: `lib/custom_code/actions/initialize_sms_listener.dart`

---

## 🔄 Data Flow

```
Web Dashboard → Supabase DB → AlertSyncService (30s) → EmergencyModeManager → Wallpaper API
SMS Trigger → SMS Listener → Direct Supabase → EmergencyModeManager → Wallpaper API
Background Service → SharedPreferences → Persistent emergency state
```

---

## 📱 SMS Commands

### Emergency Activation (7 commands)
```
EMERGENCY_ACTIVATE
EMERGENCY_ON
FINDERR_EMERGENCY
EMERGENCY_FINDERR
ACTIVATE_FINDERR
FINDERR_ACTIVATE
FINDERR_ON
```

### Emergency Restoration (6 commands)
```
EMERGENCY_OFF
FINDERR_OFF
RESTORE_PHONE
DEACTIVATE_FINDERR
FINDERR_DEACTIVATE
FINDERR_RESTORE
```

---

## 🗄️ Database Schema

**userinfo Table**:
```sql
id                      String (PK)
userid                  String (FK: auth.users)
email                   String
phone_nbr               String
alert_email             String (emergency contact)
alert_phone             String (emergency contact)
emergency_active        Boolean (current state)
emergency_activated_at  Timestamp
emergency_activated_by  String (SMS/Web)
emergency_modified_at   Timestamptz (v230: sync authority)
emergency_modified_source Text (v230: WEB/SMS/MOBILE_APP)
custom_background_url   String (user's emergency wallpaper)
created_at              DateTime
is_active               Boolean
```

**Supabase Config**:
- Project ID: `zdceeulkqfpzdjeyekgs`
- Region: `eu-west-3`
- Database: PostgreSQL 17.4.1.064

---

## ✅ Version History

### v4.2.0+230 (Current - Oct 26)
- ✅ Cross-platform sync: Web ↔ SMS ↔ Mobile
- ✅ Timestamp-based conflict resolution
- ✅ Samsung S20 validation complete
- ✅ 100% test success (all 4 scenarios)

### v4.2.0+219 (Merged - SuperClaude Army)
- ✅ 5 of 7 issues fixed (71.4% resolution)
- ✅ 91.7% linter reduction (12 → 1 warning)
- ✅ +195 additions, -890 deletions
- ✅ SMS contact info bug fixed
- ✅ Preview/wallpaper mismatch fixed

### v4.1.0+218 (Production)
- ✅ Stale browser auto-deactivation fixed
- ✅ AlertSyncService optimized
- ✅ 12+ minute persistence test passed

---

## 🔐 Security Status

**⚠️ PENDING**: RLS Security Implementation

**Files Ready**:
- `PARTIAL_RLS_SECURITY.sql` - Development-friendly
- `COMPREHENSIVE_RLS_SECURITY.sql` - Full production
- `RLS_SECURITY_TESTING.sql` - Validation suite

**Required Before Production**:
1. Apply PARTIAL_RLS_SECURITY.sql
2. Test with RLS_SECURITY_TESTING.sql
3. Apply COMPREHENSIVE_RLS_SECURITY.sql
4. Final validation (100% data isolation)

---

## 🚀 Roadmap

### IMMEDIATE
- ✅ Samsung S20 real-world testing COMPLETE
- ⏳ Google Play deployment (after S20 validation)
- ⏳ Comprehensive RLS security implementation
- ⏳ Production monitoring setup

### PENDING (V5.0+)
**Location Tracking & Mesh Network** ($40K, 28 weeks):
- V5.0: Traditional GPS tracking ($15K, 16 weeks)
- V6.0: Bluetooth mesh network - AirTag-style ($25K, 12 weeks)
- Emergency integration: Auto-activate mesh during emergency
- Community network: 1+ billion Android devices

**Premium+ Monetization** (+$10 one-time):
- QR code detection & formatting
- Network intelligence (IP/MAC/subnet)
- Cryptocurrency wallet addresses
- Reward codes & gift cards

---

## 📁 Key Files

```bash
# Core Architecture
lib/services/alert_sync_service.dart
android/app/src/main/kotlin/com/finderr/app/EmergencyModeManager.kt
android/app/src/main/kotlin/com/finderr/app/EmergencyBackgroundService.kt

# SMS Integration
lib/custom_code/actions/initialize_sms_listener.dart
android/app/src/main/kotlin/com/finderr/app/SmsEmergencyReceiver.kt

# Database Migrations
supabase_migrations/add_emergency_timestamp_tracking.sql

# Documentation
V4.2.0+230_STABLE_CROSS_SYNC_RELEASE.md
SESSION_HANDOFF_2025-10-26_*.md
FINDERR_PROJECT_MEMORY.md (full context)
```

---

## 🔧 Critical Development Notes

### NEVER REMOVE (Main.dart initialization):
```dart
// SMS Listener
await initializeSmsListener();

// AlertSyncService
await AlertSyncService.instance.initialize();

// Background Service
await EmergencyBackgroundService.initialize();
```

### Platform Channel
```
Method channel: "com.finderr.app/emergency"
Methods: activateEmergencyWallpaper, restoreEmergencyWallpaper
```

### Testing Device
- **Model**: Samsung S20
- **OS**: Android 13
- **Role**: Production validation

---

## 📊 Success Metrics

```yaml
SMS Activation (locked): 100% success
Web Dashboard Deactivation: 100% success
12+ Minute Persistence: Zero auto-deactivations
Cross-Platform Sync: 2-7s SMS→DB, ~30s Web→Mobile
ANR Rate: Zero (all wallpaper ops complete)
```

---

## 🔗 Integration: Hub Automation

Cross-project ecosystem:
- Hub automation triggers on FINDERR milestones
- Shared beta recruitment (210+ posts ready)
- Coordinated Android launch strategy
- Revenue alignment: $6.99/month subscription

---

## 📞 Quick Commands

```bash
# Build APK
flutter build apk

# Samsung S20 testing
adb logcat -s FINDERR:I

# Run app
flutter run

# Analyze code
flutter analyze
```

---

**Last Updated**: 2025-10-26
**Version**: v4.2.0+230
**Status**: Production Ready - Cross-Sync Validated ✅
**Next**: Google Play deployment + RLS security

**Ready for Android launch!** 🚀
