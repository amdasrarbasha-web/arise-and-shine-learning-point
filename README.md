# ARISE AND SHINE LEARNING POINT
### Official Tuition Center Mobile & Web Applications

**Location**: ARISE AND SHINE LEARNING POINT, Melvisharam  
**Google Maps**: [https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic](https://maps.app.goo.gl/HvDyLK4yPX7bpAeF9?g_st=ic)  
**Contact Numbers**: `6379840006`, `9842385666`  
**Classes Offered**: LKG to 12th Std (Tamil Nadu State Board, Matriculation & CBSE)  
**Tuition Timings**: Mon - Sat: 5:00 PM - 9:30 PM (Special Sunday Batches)

---

## 🚀 The Two Launchable Apps

### App 1: Student & Parent App
- **Direct Link**: `/` or `/student`
- **Features**:
  - **Student Profile**: Student picture, personal details, school, grade, and roll number.
  - **Live Attendance Bar**: Overall percentage, today's status, and full attendance logs.
  - **Behaviour & Discipline Bar**: Score out of 100, ratings, teacher remarks, and achievement badges.
  - **Switchable Profiles**: One-click toggle between Student Mode and Parent Mode.
  - **Fee Statement**: Monthly fee amount, Paid/Pending status badge, receipt details, and clear Next Due Date.
  - **School Homework Sharing**: Parents can enter subjects, descriptions, and attach photos taken directly from their phone camera.
  - **Announcements**: Circulars and notices posted by tuition management.
  - **Parent Query Box**: Direct query submission to Admin; replies are stored permanently.

### App 2: Admin Control Center
- **Direct Link**: `/admin`
- **Features**:
  - **Student Management**: Add, view, edit student profiles and credentials.
  - **Daily Attendance Marking**: One-click attendance recording with permanent persistence.
  - **Fee Manager with Edit**: Admin can edit any student's monthly fee amount and due date with immediate live reflection in the Parent's tab.
  - **Announcements Hub**: Post and edit notices (with live sync to Student app).
  - **Homework Reviews**: Review school homework submissions and send teacher remarks to parents.
  - **Parent Queries / Complaints**: View queries and send replies that never vanish until manually deleted.

---

## 📱 Mobile App Installation & Store Distribution

### 1. Instant 1-Click Mobile Install (PWA)
Any parent, student, or teacher can install the app directly on their mobile device without having to search an app store:
- **Android (Chrome)**: Tap the 3 dots menu `(⋮)` → Tap **"Install app"** or **"Add to Home screen"**.
- **iPhone / iPad (Safari)**: Tap the Share button `(⎋)` → Tap **"Add to Home Screen"**.
- **Result**: The official Arise & Shine icon appears on the device's home screen and runs in borderless, full-screen native mode with offline support.

---

### 2. Google Play Store Release (Android `.aab` / `.apk`)
There are two standard, official ways to publish to the Google Play Store:

#### Method A: PWABuilder (Official Microsoft / Google Tool - Fastest)
1. Ensure your app is hosted (e.g. on your domain, Railway, Render, or VPS).
2. Go to **[PWABuilder.com](https://www.pwabuilder.com)** and enter your live URL.
3. Click **"Package for Store"** → Select **Android (Google Play)**.
4. PWABuilder generates the signed `.aab` (Android App Bundle) package with digital asset links.
5. Upload the `.aab` directly to your **Google Play Console** account.

#### Method B: Capacitor (Native Android Studio Project)
1. Run in terminal:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap add android
   npx cap sync
   npx cap open android
   ```
2. Android Studio opens automatically.
3. Click **Build** → **Generate Signed Bundle / APK** → Choose **Android App Bundle (.aab)**.
4. Upload to **Google Play Console**.

---

### 3. Apple App Store Release (iOS `.ipa` / Xcode)
1. Run in terminal on a macOS machine:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios
   npx cap add ios
   npx cap sync
   npx cap open ios
   ```
2. Xcode opens automatically with the iOS project.
3. Select your Apple Developer Team under **Signing & Capabilities**.
4. Click **Product** → **Archive** → **Distribute App** to upload directly to **Apple App Store Connect**.

---

## 🔒 Permanent Dual-Layer Memory
All student records, attendance histories, homework photos, and parent complaints persist permanently in `data/db.json` with automatic real-time mirroring to `data/db.backup.json`. Parent messages and records stay indefinitely until explicitly deleted by Admin.
