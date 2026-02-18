import test from "@playwright/test";
import ApiClient from "../../src/clients/ApiClient";

test.describe.skip('Add a card to the board', () => {
    let apiClient;

    test.beforeEach(async ({ request }) => {
        apiClient = new ApiClient(request);
    });

    test('Add a new card should be successful @api', async ({ loggedInUser, request }) => {

    });

});