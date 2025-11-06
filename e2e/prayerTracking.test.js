/**
 * Prayer Tracking E2E Tests
 * Tests the core prayer tracking functionality
 */

import { device, element, by, expect } from 'detox';

describe('Prayer Tracking Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should display prayer tracking screen', async () => {
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

  it('should mark prayer as completed', async () => {
    // Navigate to Tracking tab
    await element(by.id('tracking-tab')).tap();
    
    // Tap on Fajr prayer to open modal
    await element(by.id('prayer-checkbox-fajr')).tap();
    
    // Wait for modal to appear
    await waitFor(element(by.id('prayer-details-modal')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Tap on "Completed" button
    await element(by.id('status-completed-button')).tap();
    
    // Close modal
    await element(by.id('close-modal-button')).tap();
    
    // Verify Fajr is marked as completed (check icon)
    await expect(element(by.id('fajr-completed-icon'))).toBeVisible();
  });

  it('should mark prayer as missed', async () => {
    // Navigate to Tracking tab
    await element(by.id('tracking-tab')).tap();
    
    // Tap on Dhuhr prayer
    await element(by.id('prayer-checkbox-dhuhr')).tap();
    
    // Wait for modal
    await waitFor(element(by.id('prayer-details-modal')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Tap on "Missed" button
    await element(by.id('status-missed-button')).tap();
    
    // Close modal
    await element(by.id('close-modal-button')).tap();
    
    // Verify Dhuhr is marked as missed (X icon)
    await expect(element(by.id('dhuhr-missed-icon'))).toBeVisible();
  });

  it('should add and complete sunnah prayers', async () => {
    // Navigate to Tracking tab
    await element(by.id('tracking-tab')).tap();
    
    // Find and tap on "2 Sunnah before Fajr" checkbox
    await element(by.id('sunnah-checkbox-fajr-before')).tap();
    
    // Verify it's marked as completed
    await expect(element(by.id('sunnah-fajr-before-completed'))).toBeVisible();
  });

  it('should navigate to qada screen', async () => {
    // Navigate to Qada tab
    await element(by.id('qada-tab')).tap();
    
    // Wait for qada screen to load
    await waitFor(element(by.id('qada-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Check if qada summary is visible
    await expect(element(by.id('qada-summary-card'))).toBeVisible();
  });

  it('should display statistics', async () => {
    // Navigate to Tracking tab
    await element(by.id('tracking-tab')).tap();
    
    // Look for statistics section
    await waitFor(element(by.id('stats-section')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Verify stats cards are visible
    await expect(element(by.id('today-stats-card'))).toBeVisible();
    await expect(element(by.id('streak-stats-card'))).toBeVisible();
  });

  it('should handle prayer details modal', async () => {
    // Navigate to Tracking tab
    await element(by.id('tracking-tab')).tap();
    
    // Tap on a prayer to open modal
    await element(by.id('prayer-checkbox-asr')).tap();
    
    // Verify modal elements
    await expect(element(by.id('prayer-details-modal'))).toBeVisible();
    await expect(element(by.id('prayer-title-text'))).toBeVisible();
    await expect(element(by.id('prayer-time-text'))).toBeVisible();
    await expect(element(by.id('status-completed-button'))).toBeVisible();
    await expect(element(by.id('status-missed-button'))).toBeVisible();
    await expect(element(by.id('status-delayed-button'))).toBeVisible();
    
    // Add notes
    await element(by.id('prayer-notes-input')).typeText('Prayed with concentration');
    
    // Save changes
    await element(by.id('save-notes-button')).tap();
    
    // Close modal
    await element(by.id('close-modal-button')).tap();
  });
});

describe('App Navigation', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should navigate between all tabs', async () => {
    // Start from Home
    await expect(element(by.id('home-screen'))).toBeVisible();
    
    // Navigate to Tracking
    await element(by.id('tracking-tab')).tap();
    await expect(element(by.id('tracking-screen'))).toBeVisible();
    
    // Navigate to Qibla
    await element(by.id('qibla-tab')).tap();
    await expect(element(by.id('qibla-screen'))).toBeVisible();
    
    // Navigate to Qada
    await element(by.id('qada-tab')).tap();
    await expect(element(by.id('qada-screen'))).toBeVisible();
    
    // Navigate to Settings
    await element(by.id('settings-tab')).tap();
    await expect(element(by.id('settings-screen'))).toBeVisible();
    
    // Return to Home
    await element(by.id('home-tab')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});

describe('Settings Screen', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should open and interact with settings', async () => {
    // Navigate to Settings
    await element(by.id('settings-tab')).tap();
    
    // Wait for settings to load
    await waitFor(element(by.id('settings-screen')))
      .toBeVisible()
      .withTimeout(5000);
    
    // Check if key settings are visible
    await expect(element(by.id('calculation-method-setting'))).toBeVisible();
    await expect(element(by.id('location-setting'))).toBeVisible();
    await expect(element(by.id('notifications-setting'))).toBeVisible();
    
    // Tap on calculation method
    await element(by.id('calculation-method-setting')).tap();
    
    // Verify picker opens
    await waitFor(element(by.id('calculation-method-picker')))
      .toBeVisible()
      .withTimeout(3000);
    
    // Close picker
    await element(by.id('close-picker-button')).tap();
  });
});