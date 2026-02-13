import { expect /*, test*/ } from '@playwright/test';
import { test } from '../../castomFixtures/CastomFixture';
import ApiClient from '../../src/clients/ApiClient';
import WsClient from '../../src/clients/WsClient';

test.describe('API auth + ws', () => {
    let apiClient;
    let wsClient;

    test.beforeEach(async ({ request }) => {
        apiClient = new ApiClient(request);
        wsClient = new WsClient('wss://stage-backend-api-gateway-c1g0.creagen.app/ws');
    });

    test('should authenticate and receive data via WS for one message', async ({ loggedInUser }) => {
        const token = loggedInUser.user.access;

        await wsClient.connect();

        const sendMessage1 = { id: '3818', type: 516, data: { token: token } };

        await wsClient.send(sendMessage1);

        const answerMessage1 = await wsClient.waitForMessage(msg => msg.type === 516);
        expect(answerMessage1).toHaveProperty('type', 516);

        const sendMessage2 = {
            "id": "f319e122-3efc-47ce-a636-d749afc96ffe_join-to-the-project",
            "type": 5001,
            "data": { "projectID": "39a74e98-b0e9-4170-b4c6-e3d371b191d3" }
        }

        await wsClient.send(sendMessage2)

        const expectedMessage2 = {
            "id": sendMessage2.id,
            "response": {
                "data":
                {
                    "success": true,
                    "activeUsers": 1,
                    "wasFirstUser": true,
                    "clientID": expect.any(String),
                    "color": "#FFA07A",
                    "email": loggedInUser.userData.email,
                    "login": expect.any(String),
                    "avatarUrl": expect.any(String),
                    "projectID": sendMessage2.data.projectID,
                    "userID": "61985a2a-7144-426a-bca3-f5ff64d3cc36"
                }, "error": null
            }, "type": sendMessage2.type
        }

        const receivedMessage = await wsClient.waitForMessage(msg => msg.id === sendMessage2.id && msg.type === sendMessage2.type);

        console.log('Received message:', JSON.stringify(receivedMessage));
        expect(receivedMessage).toMatchObject(expectedMessage2);

    });

    test('should authenticate and receive data via WS for multiple messages', async ({ loggedInUser }) => {
        const token = loggedInUser.user.access;

        await wsClient.connect();

        const sendMessage1 = { id: '3818', type: 516, data: { token: token } };

        await wsClient.send(sendMessage1);

        const sendMessage2 = {
            "id": "f319e122-3efc-47ce-a636-d749afc96ffe_join-to-the-project",
            "type": 5001,
            "data": { "projectID": "39a74e98-b0e9-4170-b4c6-e3d371b191d3" }
        }

       await new Promise(resolve => setTimeout(resolve, 1000));

        await wsClient.send(sendMessage2)

        const expectedMessage2 = {
            "id": sendMessage2.id,
            "response": {
                "data":
                {
                    "success": true,
                    "activeUsers": 1,
                    "wasFirstUser": true,
                    "clientID": expect.any(String),
                    "color": "#FFA07A",
                    "email": loggedInUser.userData.email,
                    "login": expect.any(String),
                    "avatarUrl": expect.any(String),
                    "projectID": sendMessage2.data.projectID,
                    "userID": "61985a2a-7144-426a-bca3-f5ff64d3cc36",
                    // "data": null,
                }, "error": null
            }, "type": sendMessage2.type
        }

        const receivedMessages = await wsClient.waitForMultipleMessages(msg => msg.type === sendMessage2.type || msg.type === 516, 2, 1000);
        console.log('ALL received messages:', JSON.stringify(receivedMessages));

        const authMessage = receivedMessages.find(msg => msg.type === 516);
        const projectMessage = receivedMessages.find(msg => msg.type === sendMessage2.type);

        expect(receivedMessages).toHaveLength(2);
        expect(authMessage).toHaveProperty('type', 516);
        expect(projectMessage).toMatchObject(expectedMessage2);
    });

});