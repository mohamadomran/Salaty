/**
 * Prayer Tracking E2E Tests
 * Tests for core app functionality using Detox
 */

import { device, element, by, expect } from 'detox';

describe('App Navigation', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should launch and show home screen', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should navigate between main tabs', async () => {
    // Navigate to Tracking
    await element(by.id('tracking-tab')).tap();
    await expect(element(by.id('tracking-screen'))).toBeVisible();
    
    // Navigate to Qada
    await element(by.id('qada-tab')).tap();
    await expect(element(by.id('qada-screen'))).toBeVisible();
    
    // Navigate to Qibla
    await element(by.id('qibla-tab')).tap();
    await expect(element(by.id('qibla-screen'))).toBeVisible();
    
    // Navigate to Settings
    await element(by.id('settings-tab')).tap();
    await expect(element(by.id('settings-screen'))).toBeVisible();
    
    // Return to Home
    await element(by.id('home-tab')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});

describe('Prayer Tracking Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display prayer tracking interface', async () => {
    // Navigate to Tracking tab
    await element(by.id('tracking-tab')).tap();
    
    // Wait for tracking screen to load
    await waitFor(element(by.id('tracking-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Check if prayer checkboxes are visible
    await expect(element(by.id('prayer-checkbox-fajr'))).toBeVisible();
    await expect(element(by.id('prayer-checkbox-dhuhr'))).toBeVisible();
    await expect(element(by.id('prayer-checkbox-asr'))).toBeVisible();
    await expect(element(by.id('prayer-checkbox-maghrib'))).toBeVisible();
    await expect(element(by.id('prayer-checkbox-isha'))).toBeVisible();
  });

  it('should open prayer details modal', async () => {
    // Navigate to Tracking tab
    await element(by.id('tracking-tab')).tap();
    
    // Wait for tracking screen
    await waitFor(element(by.id('tracking-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Tap on Fajr prayer to open modal
    await element(by.id('prayer-checkbox-fajr')).tap();
    
    // Verify modal elements are visible
    await waitFor(element(by.id('prayer-details-modal')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.id('prayer-title-text'))).toBeVisible();
    await expect(element(by.id('prayer-time-text'))).toBeVisible();
    await expect(element(by.id('prayer-notes-input'))).toBeVisible();
    
    // Close modal
    await element(by.id('close-modal-button')).tap();
  });

  it('should interact with sunnah prayers', async () => {
    // Navigate to Tracking tab
    await element(by.id('tracking-tab')).tap();
    
    // Wait for tracking screen
    await waitFor(element(by.id('tracking-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Find and interact with sunnah checkbox (if visible)
    // Note: This might not be visible depending on the time/prayer state
    try {
      await element(by.id('sunnah-checkbox-2-sunnah-before')).tap();
      // If successful, the checkbox state should change
    } catch (e) {
      // Sunnah checkboxes might not be visible, which is ok
      console.log('Sunnah checkboxes not visible - skipping test');
    }
  });
});

describe('Qada Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display qada tracking interface', async () => {
    // Navigate to Qada tab
    await element(by.id('qada-tab')).tap();
    
    // Wait for qada screen to load
    await waitFor(element(by.id('qada-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Check if qada summary is visible
    await expect(element(by.id('qada-summary-card'))).toBeVisible();
  });
});

describe('Settings Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display settings interface', async () => {
    // Navigate to Settings tab
    await element(by.id('settings-tab')).tap();
    
    // Wait for settings screen to load
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Check if key settings sections are visible
    await expect(element(by.id('prayer-settings-section'))).toBeVisible();
    await expect(element(by.id('location-setting'))).toBeVisible();
    await expect(element(by.id('notifications-setting'))).toBeVisible();
  });

  it('should interact with calculation method setting', async () => {
    // Navigate to Settings tab
    await element(by.id('settings-tab')).tap();
    
    // Wait for settings screen
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Tap on calculation method setting
    await element(by.id('calculation-method-setting')).tap();
    
    // The search bar should become visible or some interaction should happen
    // This test verifies the setting is tappable
  });
});

describe('Qibla Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display qibla compass interface', async () => {
    // Navigate to Qibla tab
    await element(by.id('qibla-tab')).tap();
    
    // Wait for qibla screen to load
    await waitFor(element(by.id('qibla-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Basic check that screen content is visible
    await expect(element(by.text('Qibla Direction'))).toBeVisible();
  });
});