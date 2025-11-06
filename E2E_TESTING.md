# E2E Testing with Detox

This project includes End-to-End (E2E) tests using [Detox](https://github.com/wix/Detox), a popular testing framework for React Native applications.

## Setup

### Prerequisites
- Node.js 20+
- React Native development environment
- iOS Simulator (for iOS testing)
- Android Emulator (for Android testing)

### Installation
```bash
# Install dependencies
npm install

# Build the app for testing
npm run build:e2e:ios    # for iOS
# or
npm run build:e2e:android # for Android
```

## Running Tests

### iOS Tests
```bash
# Run all E2E tests on iOS simulator
npm run test:e2e:ios
```

### Android Tests
```bash
# Run all E2E tests on Android emulator
npm run test:e2e:android
```

### All Tests
```bash
# Run tests on default platform
npm run test:e2e
```

## Test Coverage

The E2E tests cover:

### Navigation
- ✅ App launch and home screen display
- ✅ Tab navigation between all main screens
- ✅ Screen visibility and basic rendering

### Prayer Tracking
- ✅ Prayer tracking screen interface
- ✅ Prayer checkboxes visibility
- ✅ Prayer details modal interaction
- ✅ Sunnah prayer checkboxes (when visible)

### Qada (Makeup Prayers)
- ✅ Qada screen interface
- ✅ Qada summary display

### Settings
- ✅ Settings screen interface
- ✅ Key settings sections (Prayer, Location, Notifications)
- ✅ Calculation method setting interaction

### Qibla
- ✅ Qibla compass screen interface

## Test Files

- `e2e/simple.test.js` - Main E2E test suite
- `.detoxrc.js` - Detox configuration
- `e2e/jest.config.js` - Jest configuration for E2E tests

## Writing New Tests

### Test Structure
```javascript
describe('Feature Name', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should do something', async () => {
    await element(by.id('some-element')).tap();
    await expect(element(by.id('result'))).toBeVisible();
  });
});
```

### Best Practices
1. **Use testIDs**: Add `testID` props to components for reliable element selection
2. **Wait for elements**: Use `waitFor()` for async operations
3. **Clean state**: Use `beforeEach` to reset app state
4. **Descriptive tests**: Write clear, action-oriented test names
5. **Avoid hard-coded delays**: Use `waitFor` instead of `sleep`

### Adding TestIDs
```jsx
// React Native components
<TouchableOpacity testID="my-button" onPress={handlePress}>
  Press me
</TouchableOpacity>

// React Native Paper components
<Button testID="submit-button" mode="contained" onPress={handleSubmit}>
  Submit
</Button>
```

## Debugging

### View Test Hierarchy
```bash
# Show element hierarchy for debugging
detox test --inspect
```

### Run Specific Test
```bash
# Run only specific test suite
npx detox test --testNamePattern "Navigation"
```

### Record Test Session
```bash
# Record test execution for debugging
detox test --record-videos all
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Ensure iOS/Android development environment is properly set up
   - Clean and rebuild: `npm run clean:cache && npm run rebuild:ios`

2. **Element Not Found**
   - Verify `testID` is properly set on components
   - Use `device.getReactNativeDebugView()` to inspect element hierarchy

3. **Timeout Errors**
   - Increase timeout in `waitFor()` calls
   - Check if app is still loading or has crashed

4. **Simulator/Emulator Issues**
   - Restart simulator/emulator
   - Ensure sufficient memory and disk space
   - Check if device is properly booted

## Continuous Integration

These tests can be integrated into CI/CD pipelines:

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    npm run build:e2e:ios
    npm run test:e2e:ios
```

## Current Status

✅ **Detox framework installed and configured**
✅ **Test infrastructure set up**
✅ **Test suites created**
✅ **App builds and runs successfully**
⚠️ **Detox test connection issues on Android**

## Known Issues

### Detox Test App Connection
The main app builds and runs perfectly on Android emulators, but Detox is having trouble connecting to the test instrumentation process. This appears to be a common issue with Detox + React Native 0.82+.

**Symptoms:**
- App builds and installs successfully
- App launches and runs normally when started manually
- Detox tests fail with "Failed to run application on the device"
- Test app process not found by Detox

**Troubleshooting Attempted:**
- ✅ Updated APK paths in Detox config
- ✅ Added testBinaryPath configuration  
- ✅ Created Android test directory structure
- ✅ Rebuilt APKs multiple times
- ✅ Verified app package name (com.salaty)
- ✅ Manual app launch works perfectly

## Alternative Testing Approaches

While we work on resolving Detox connection issue, here are alternative approaches:

### 1. Manual Testing
```bash
# Launch app manually
adb shell am start -n com.salaty/.MainActivity

# Verify app is running
adb shell ps | grep salaty
```

### 2. Unit Testing
Unit tests for services and utilities work fine:
```bash
npm test
```

### 3. iOS Testing (Future)
iOS testing may work better with Detox once configured.

## Next Steps

1. **Research Detox + RN 0.82 compatibility**
2. **Try alternative E2E frameworks (Maestro, Appium)**
3. **Consider downgrading React Native for E2E compatibility**
4. **Focus on manual testing for now**

## Resources

- [Detox Documentation](https://github.com/wix/Detox/blob/master/docs/README.md)
- [React Native Testing](https://reactnative.dev/docs/testing-overview)
- [Jest Matchers](https://jestjs.io/docs/using-matchers)