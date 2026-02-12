import { expect, test } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe.skip('UI auth + ws', () => {

    // test.beforeEach(async ({ page }) => {
    //     await page.goto('/auth/login');
    // });

    test('UI login + ws', async ({ page }) => {

        const receivedMessages = [];
        const sentMessages = [];
        // const receivedMessages = null;
        // const sentMessages = null;

        page.on('websocket', ws => {
            console.log('WS opened:', ws.url());

            ws.on('framesent', frame => {
                console.log('➡️ Sent:', frame.payload);
                sentMessages.push(frame.payload);
                // sentMessages = frame.payload;
            });

            ws.on('framereceived', frame => {
                console.log('⬅️ Received:', frame.payload);
                receivedMessages.push(frame.payload);
                // receivedMessages = frame.payload;
            });
        });

        await page.goto('https://stage-frontend-c1g0.creagen.app/login');
        const authModal = page.locator('.auth-content')
        const emailField = authModal.locator('#login-form__input-1')
        const passwordField = authModal.locator('#login-form__input-2')
        const loginButton = authModal.locator('button:has-text("Log In")')

        await emailField.fill('vladyslav.y+21@medevelop.studio');
        await passwordField.fill('Test1234');

        expect(loginButton).toBeEnabled();
        await loginButton.click();

        const headerMenu = page.locator('.page-header__nav-wrapper')
        const projectsButton = headerMenu.getByRole('button', { name: 'Projects' })

        await projectsButton.click();
        await page.waitForTimeout(3000); // Wait for WS messages to be exchanged

        const projectSidebar = page.locator('.projects-sidebar')
        const createProjectField = projectSidebar.getByPlaceholder('Create')
        const projectName = `TestProject_${faker.string.alphanumeric(5)}`;

        await createProjectField.fill(projectName);
        await createProjectField.press('Enter');

        await page.waitForTimeout(3000); // Wait for WS messages to be exchanged

        const pageContent = page.locator('.page__content')
        const projectCardImage = pageContent
            .locator('.project-card')
            .filter({ hasText: projectName });

        expect(projectCardImage).toContainText(projectName);

        projectCardImage.click();
        await page.waitForTimeout(5000); // Wait for WS messages to be exchanged

        const miniMap = page.locator('.flow__minimap-wrapper')
        expect(miniMap).toBeVisible();

        console.log('Sent WS messages:', sentMessages);
        console.log('Received WS messages:', receivedMessages);

    });

});