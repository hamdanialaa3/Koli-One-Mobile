import { test, expect } from '@playwright/test';

test.describe('Sell Workflow', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to Sell page (assuming mobile simulation or web view)
        await page.goto('/sell');
    });

    test('should complete the sell flow successfully', async ({ page }) => {
        // Step 1: Basic Info
        await expect(page.getByText('Basic Info')).toBeVisible();
        await page.getByPlaceholder('Select Make').click();
        await page.getByText('Toyota').click();
        await page.getByPlaceholder('Select Model').click();
        await page.getByText('Corolla').click();
        await page.getByPlaceholder('Year').fill('2020');
        await page.getByText('Next').click();

        // Step 2: Technical Specs
        await expect(page.getByText('Technical Specs')).toBeVisible();
        await page.getByPlaceholder('Mileage').fill('50000');
        await page.getByText('Next').click();

        // Step 3: Equipment
        await expect(page.getByText('Equipment')).toBeVisible();
        await page.getByText('Next').click();

        // Step 4: Photos (Mock upload)
        await expect(page.getByText('Photos')).toBeVisible();
        // Simulate image upload (if possible via file input)
        // For now just proceed if allowed (or mock existing images)
        await page.getByText('Next').click();

        // Step 5: Pricing
        await expect(page.getByText('Pricing')).toBeVisible();
        await page.getByPlaceholder('Price').fill('15000');
        await page.getByText('Next').click();

        // Step 6: AI Description
        await expect(page.getByText('AI Description')).toBeVisible();
        await page.getByText('Next').click();

        // Step 7: Review & Publish
        await expect(page.getByText('Review')).toBeVisible();
        await page.getByText('Publish').click();

        // Success
        await expect(page.getByText('Success! 🎉')).toBeVisible({ timeout: 10000 });
    });
});
