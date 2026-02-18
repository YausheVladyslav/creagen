import { test, expect } from '@playwright/test';
import ApiClient from '../../src/clients/ApiClient';

test.describe('Authentication', () => {
    let apiClient;

    test.beforeEach(async ({ request }) => {
        apiClient = new ApiClient(request);
    });

    test("Login with valid credentials should be succeed", async () => {

        const loginData = {
            email: "vladyslav.y+21@medevelop.studio",
            password: "Test1234"
        };

        const expectedResponse = {
            "data": {
                "access": expect.any(String),
                "refresh": expect.any(String),
                "accessExp": expect.any(Number),
                "refreshExp": expect.any(Number)
            },
            "error": null
        }
        // "accessExp": 1771268671,
        // "refreshExp": 1771354711

        const loginResponse = await apiClient.userAPIController.login(loginData.email, loginData.password);
        const responseJson = await loginResponse.json();
        console.log("Login response:", JSON.stringify(responseJson));

        expect(responseJson).toMatchObject(expectedResponse);
        expect(loginResponse.status()).toBe(200);
        expect(loginResponse).toBeOK();

    });

});