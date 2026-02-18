import { expect } from '@playwright/test';
import { test } from '../../castomFixtures/CastomFixture';
import ApiClient from '../../src/clients/ApiClient';
import { faker } from "@faker-js/faker";

test.describe('Create a project', () => {
    let apiClient;

    test.beforeEach(async ({ request }) => {
        apiClient = new ApiClient(request);
    });

    test('should create a new project successfully @api', async ({ loggedInUser, request }) => {
        const userData = loggedInUser.userData;
        console.log('Logged in user data:', JSON.stringify(userData));

        const projectData = {
            "ownerID": "61985a2a-7144-426a-bca3-f5ff64d3cc36",
            "name": "testProject" + faker.string.alphanumeric(5),
        }

        const expectProjectResponse = {
            "data": {
                "project": {
                    "id": expect.any(String),
                    "ownerID": projectData.ownerID,
                    "name": projectData.name,
                    "maxFrames": 10,
                    "maxNodes": 1000,
                    "status": "active",
                    "info": {},
                    "lastChangeAt": 0
                },
                "flows": [
                    {
                        "id": expect.any(String),
                        "projectID": expect.any(String),
                        "name": "New Flow",
                        "info": {
                            "positionX": 200,
                            "positionY": 200,
                            "width": 1000,
                            "height": 600
                        }
                    }
                ]
            },
            "error": null
        }

        const prpjectResponse = await request.post('/project/create', {
            data: projectData,
            headers: {
                'Authorization': `Bearer ${loggedInUser.user.access}`
            }
        });

        const responseJson = await prpjectResponse.json();
        console.log("Create Project response:", JSON.stringify(responseJson));

        expect(prpjectResponse.status()).toBe(200);
        expect(responseJson).toMatchObject(expectProjectResponse);

    });
});