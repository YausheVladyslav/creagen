import { test as base } from '@playwright/test';
import ApiClient from '../src/clients/ApiClient.js'

export const test = base.extend({
    loggedInUser: async ({ request }, use) => {
        const client = new ApiClient(request);
        const loginData = { email: 'vladyslav.y+21@medevelop.studio', password: 'Test1234' }
        const loginResponse = await client.userAPIController.login(loginData.email, loginData.password);
        const responseJson = await loginResponse.json();
        console.log('LOGGED USER DATA IN FIXTURE:', JSON.stringify(responseJson));
        await use({ client, user: responseJson.data, userData: loginData });
    }
});