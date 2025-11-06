describe('Simple App Launch Test', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      launchArgs: {
        detoxEnableSynchronization: 0,
      },
    });
  });

  it('should launch app without crashing', async () => {
    // Just a simple test to see if the app launches
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);
  });
});