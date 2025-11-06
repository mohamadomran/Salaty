# Google Play Store Submission Guide for Salaty

## Overview
This guide walks you through preparing and submitting Salaty to the Google Play Store.

---

## 1. Play Store Listing Assets

### Required Graphics

#### 📱 App Icon (Already Complete ✅)
- **Size**: 512x512 pixels
- **Format**: PNG (32-bit with alpha)
- **Location**: `ICON FOLDER/playstore.png`
- **Note**: You already have this ready!

#### 🎨 Feature Graphic (REQUIRED)
- **Size**: 1024 x 500 pixels
- **Format**: PNG or JPEG
- **Max Size**: 1MB
- **Purpose**: Displayed at the top of your Play Store listing
- **Design Tips**:
  - Showcase your app's key features
  - Use your brand colors (#194042)
  - Include app name "Salaty"
  - Keep text minimal and readable
  - Can include screenshots or mockups
  - Avoid clutter

**Example Layout:**
```
┌────────────────────────────────────────────────┐
│  [App Logo]     SALATY                         │
│                 Track Your Daily Prayers       │
│  [Screenshot 1] [Screenshot 2] [Screenshot 3] │
└────────────────────────────────────────────────┘
```

#### 📸 Screenshots (REQUIRED - Minimum 2, Maximum 8)

**Phone Screenshots:**
- **Minimum**: 2 screenshots
- **Recommended**: 4-8 screenshots
- **Size**: Minimum dimension 320px, Maximum 3840px
- **Aspect Ratio**: 16:9 or 9:16 recommended
- **Format**: PNG or JPEG (24-bit, no alpha)

**What to Capture:**
1. **Home Screen** - Show today's prayer times
2. **Tracking Screen** - Prayer completion checkboxes
3. **Qibla Compass** - Qibla direction feature
4. **Statistics** - Prayer tracking statistics
5. **Settings** - App customization options
6. **Notifications** - Prayer time reminders (optional)

**Tips for Screenshots:**
- Use a device with a clean status bar
- Show actual app functionality
- Avoid adding promotional text overlays (Play Store policy)
- Use consistent device frame if adding frames
- Capture in portrait mode
- Show the app in action with realistic data

**How to Capture:**
1. Run your app on a physical device or emulator
2. Navigate to each key screen
3. Take screenshots (Power + Volume Down on most Android devices)
4. Or use Android Studio's screenshot tool
5. Or use `adb shell screencap -p /sdcard/screenshot.png`

**Tablet Screenshots (Optional but Recommended):**
- **Size**: Minimum 1080 x 1920 pixels
- **Count**: Minimum 1, Maximum 8
- Shows your app works on tablets

---

## 2. App Description

### Short Description (80 characters max)
```
Track your daily prayers with accurate Islamic prayer times and Qibla direction
```

### Full Description (4000 characters max)

**Template:**

```
📿 SALATY - Your Daily Prayer Companion

Salaty helps Muslims maintain their daily prayers with accurate prayer times, Qibla direction, and prayer tracking features.

✨ KEY FEATURES

🕌 Accurate Prayer Times
• Automatic location-based prayer time calculations
• Support for multiple calculation methods
• Adjustable prayer time settings
• Works offline after initial setup

📍 Qibla Direction
• Accurate Qibla compass
• Works with device sensors
• Simple and easy to use

✅ Prayer Tracking
• Track your daily prayers
• View prayer completion statistics
• Monitor your prayer habits over time
• Detailed analytics and insights

🔔 Smart Notifications
• Customizable prayer time reminders
• Multiple notification types
• Flexible notification settings

🎨 Beautiful Design
• Clean, modern interface
• Material Design 3
• Dark and light themes
• Smooth animations

⚡ Key Benefits:
• 100% Free - No ads, no subscriptions
• Privacy-focused - All data stays on your device
• Works offline - No internet required after setup
• Lightweight - Small app size
• Fast and responsive

🌙 Perfect for Muslims who want to:
• Never miss prayer times
• Track their daily prayers
• Find accurate Qibla direction
• Build consistent prayer habits
• Monitor their spiritual progress

📱 Technical Features:
• Material Design 3
• Background notifications
• Precise location-based calculations
• Multiple calculation methods support
• Prayer time adjustments
• Qibla compass with sensor integration

🔒 Privacy:
• No data collection
• No ads or tracking
• All data stored locally
• No account required
• Works completely offline

Download Salaty today and strengthen your connection with your daily prayers!

For support or feedback, contact: [Your Email]
```

---

## 3. App Categorization

**Primary Category**: Lifestyle
**Alternative**: Education (Religion & Spirituality is under Lifestyle)

**Tags/Keywords (Organic Discovery):**
- Prayer times
- Islamic prayer
- Muslim prayer
- Salat
- Qibla
- Adhan
- Azan
- Prayer tracker
- Islamic app
- Muslim app
- Ramadan
- Masjid
- Mosque times

---

## 4. Content Rating

You'll need to complete the **IARC Questionnaire** in Play Console.

**Expected Ratings:**

**Questions to Expect:**
1. **Violence**: No
2. **Sexual Content**: No
3. **Profanity**: No
4. **Controlled Substances**: No
5. **Gambling**: No
6. **User Interaction**: No (no social features, chat, or user-generated content)
7. **Shares Location**: Yes (for prayer time calculation)
8. **Shares Personal Info**: No
9. **Purchases**: No

**Expected Rating**: **Everyone** (suitable for all ages)

---

## 5. Data Safety Form

You must complete the Data Safety section in Play Console.

### Data Collection & Security

**Does your app collect or share user data?**
✅ Yes (Location data for prayer times)

**Is all collected data encrypted in transit?**
✅ Yes

**Do you provide a way for users to request data deletion?**
✅ Yes (Uninstall app or clear app data)

**Data Types Collected:**

#### Location
- **Collected**: ✅ Yes
- **Purpose**: App functionality (prayer time calculation)
- **Shared**: ❌ No
- **Optional**: ❌ No (required for core functionality)
- **User Control**: Yes (can disable location permissions)

#### Device or other IDs
- **Collected**: ❌ No

#### Personal Information
- **Collected**: ❌ No

#### Financial Information
- **Collected**: ❌ No

#### Photos and Videos
- **Collected**: ❌ No

#### Files and Docs
- **Collected**: ❌ No

**Data Deletion:**
Users can delete their data by:
1. Clearing app data in device settings
2. Uninstalling the app

---

## 6. Privacy Policy

**Privacy Policy URL**:
You need to host your privacy policy publicly. Options:

### Option 1: GitHub Pages (FREE)
1. Create a GitHub repository for your privacy policy
2. Enable GitHub Pages in repository settings
3. Use URL: `https://yourusername.github.io/salaty-privacy-policy`

### Option 2: Your Website
Host `PRIVACY_POLICY.md` on your personal/company website

### Option 3: Firebase Hosting (FREE)
Use Firebase to host a static privacy policy page

**Note**: The privacy policy document is already created in `PRIVACY_POLICY.md`

---

## 7. Pricing & Distribution

**Price**: Free
**Countries**: All available countries (or select specific regions)
**Content Rating**: Everyone

---

## 8. Store Listing Optimization Tips

### Title (30 characters)
```
Salaty - Prayer Times Tracker
```

### Keywords to Include Naturally:
- Prayer times
- Islamic prayer
- Qibla
- Muslim
- Salat
- Adhan

### Localization (Optional but Recommended):
Consider adding Arabic translations:
- Arabic title
- Arabic description
- Arabic screenshots

---

## 9. Pre-Launch Checklist

Before submitting, verify:

- [ ] Feature graphic created (1024x500)
- [ ] At least 2 screenshots captured (recommend 4-8)
- [ ] Short description written (80 chars)
- [ ] Full description written
- [ ] Privacy policy hosted and URL ready
- [ ] Content rating questionnaire completed
- [ ] Data safety form completed
- [ ] App category selected
- [ ] Pricing set (Free)
- [ ] Countries selected for distribution
- [ ] Contact email provided
- [ ] Release notes written
- [ ] AAB file built and tested

---

## 10. Screenshots Recommendations

**Recommended Screenshots Order:**

1. **Home Screen** - Prayer times for today
   - Shows all 5 prayer times
   - Current time highlighted
   - Clean, clear interface

2. **Prayer Tracking** - Daily prayer tracker
   - Checkboxes for each prayer
   - Shows tracking functionality
   - Visual completion indicators

3. **Qibla Compass** - Qibla direction
   - Compass pointing to Qibla
   - Shows location-based feature
   - Demonstrates accuracy

4. **Statistics** - Prayer analytics
   - Charts and graphs
   - Prayer completion trends
   - Motivational insights

5. **Settings** - Customization options
   - Calculation methods
   - Notification settings
   - Theme options

6. **Notifications** - Prayer reminders
   - Example notification
   - Shows reminder feature
   - Customization options

---

## 11. Launch Checklist

### Phase 1: Pre-Submission
- [ ] Create Play Console account ($25 one-time fee)
- [ ] Host privacy policy online
- [ ] Prepare all graphics and screenshots
- [ ] Write descriptions

### Phase 2: Submission
- [ ] Upload AAB file
- [ ] Add all store listing assets
- [ ] Complete content rating
- [ ] Fill data safety form
- [ ] Set pricing and distribution
- [ ] Add contact information
- [ ] Write release notes

### Phase 3: Review
- [ ] Submit for review
- [ ] Monitor for policy violations
- [ ] Respond to any feedback
- [ ] Make corrections if needed

### Phase 4: Launch
- [ ] Publish to production
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Track analytics

---

## 12. Post-Launch

**Monitoring:**
- Check Play Console for crash reports
- Read and respond to user reviews
- Monitor app performance metrics
- Track download and retention rates

**Updates:**
- Plan regular updates
- Fix bugs reported by users
- Add new features based on feedback
- Keep dependencies up to date

**Marketing:**
- Share on social media
- Reach out to Islamic organizations
- List on Islamic app directories
- Encourage user reviews

---

## Tools & Resources

**Screenshot Tools:**
- Android Studio Device Screenshot
- Figma (for adding device frames)
- Screenshot Tool: `adb shell screencap`

**Graphic Design:**
- Canva (for feature graphic)
- Figma
- Adobe Photoshop/Illustrator

**Privacy Policy Hosting:**
- GitHub Pages
- Firebase Hosting
- Netlify
- Your own website

**Testing:**
- Internal testing track (test with limited users)
- Closed testing track (test with specific testers)
- Open testing (public beta)

---

## Support & Resources

**Play Console**: https://play.google.com/console
**Play Store Policies**: https://play.google.com/about/developer-content-policy/
**Android Asset Studio**: https://romannurik.github.io/AndroidAssetStudio/

---

**Need Help?**
If you encounter issues during submission, the Play Console provides detailed error messages and help articles for each section.

Good luck with your launch! 🚀
