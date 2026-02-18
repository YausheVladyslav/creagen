// import test from "@playwright/test";
import { expect } from '@playwright/test';
import { test } from '../../castomFixtures/CastomFixture';
import { faker } from "@faker-js/faker";

test.describe('API tests for board creation', () => {


    test('should create a new board successfully @api', async ({ loggedInUser, request }) => {
        const userData = loggedInUser.userData;
        console.log('Logged in user data:', JSON.stringify(userData));

        const boardData = {
            "name": "testBoard" + faker.string.alphanumeric(5),
            "userID": "61985a2a-7144-426a-bca3-f5ff64d3cc36",
            "isDefault": false,
            "shared": false
        }

        const expectedResponse = {
            "data": {
                "id": expect.any(String),
                "name": boardData.name,
                "status": "active",
                "isDefault": false,
                "shared": false,
                "addImgTime": 0,
                "userID": boardData.userID,
                "metadata": {
                    "boardDescription": "",
                    "banner": {
                        "urlCutted": "",
                        "urlFull": ""
                    }
                },
                "imgAmount": 0
            },
            "error": null
        }

        const createBoardResponse = await request.post('board/create', {
            data: boardData,
            headers: {
                'Authorization': `Bearer ${loggedInUser.user.access}`
            }
        });

        const responseJson = await createBoardResponse.json();
        console.log("Create Board response:", JSON.stringify(responseJson));

        expect(createBoardResponse.status()).toBe(200);
        expect(responseJson).toMatchObject(expectedResponse);
    })
})