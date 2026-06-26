import { Builder, By, until } from 'selenium-webdriver';
import safari from 'selenium-webdriver/safari';

async function runTest() {
  console.log('Starting Login page tests...');

  const driver = new Builder()
    .forBrowser('safari')
    .build();

  try {
    // Navigate to login page
    await driver.get('http://localhost:3001/login');
    console.log('✓ Page loaded:', await driver.getTitle());

    // Test 1: Check Email label exists
    const emailLabel = await driver.findElement(By.xpath('//label[@for="auth-email"]'));
    const emailLabelText = await emailLabel.getText();
    if (emailLabelText !== 'Email address') {
      throw new Error(`Email label incorrect: "${emailLabelText}"`);
    }
    console.log('✓ Email label is correct:', emailLabelText);

    // Test 2: Check Password label exists
    const passwordLabel = await driver.findElement(By.xpath('//label[@for="auth-password"]'));
    const passwordLabelText = await passwordLabel.getText();
    if (passwordLabelText !== 'Password') {
      throw new Error(`Password label incorrect: "${passwordLabelText}"`);
    }
    console.log('✓ Password label is correct:', passwordLabelText);

    // Test 3: Type wrong credentials
    await driver.findElement(By.id('auth-email')).clear();
    await driver.findElement(By.id('auth-email')).sendKeys('wronguser@example.com');
    await driver.findElement(By.id('auth-password')).clear();
    await driver.findElement(By.id('auth-password')).sendKeys('wrongpassword');
    console.log('✓ Filled in wrong credentials');

    // Click submit
    await driver.findElement(By.id('auth-submit-button')).click();
    console.log('✓ Clicked submit button');

    // Test 4: Wait for error message
    await driver.wait(until.elementLocated(By.css('.text-red-500')), 5000);
    const errorMessage = await driver.findElement(By.css('.text-red-500')).getText();
    if (!errorMessage || errorMessage.length === 0) {
      throw new Error('Error message not found');
    }
    console.log('✓ Error message displayed:', errorMessage);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  } finally {
    await driver.quit();
  }
}

runTest();