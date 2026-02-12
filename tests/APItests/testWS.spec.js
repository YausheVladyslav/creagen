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

    test('should authenticate and receive data via WS for one message', async ({loggedInUser}) => {
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


    // test('should authenticate and receive data via WS', async ({ request }) => {
    //     let wsClient = new WsClient('wss://stage-backend-api-gateway-c1g0.creagen.app/ws');

    //     const loginData = {
    //         email: 'vladyslav.y+21@medevelop.studio',
    //         password: 'Test1234'
    //     }

    //     const responseLogin = await request.post('/auth/login', {
    //         data: { email: loginData.email, password: loginData.password }
    //     });

    //     console.log(responseLogin.status());
    //     console.log(await responseLogin.json());
    //     test.expect(responseLogin.status()).toBe(200);

    //     const userDataJSON = await responseLogin.json();
    //     const token = userDataJSON.data.access;

    //     wsClient = new WsClient('wss://stage-backend-api-gateway-c1g0.creagen.app/ws');
    //     await wsClient.connect();

    //     // Відправляємо аутентифікацію
    //     await wsClient.send({
    //         id: '3818',
    //         type: 516,
    //         data: { token: token }
    //     });

    //     const sendMessage = {
    //         "id": "f319e122-3efc-47ce-a636-d749afc96ffe_join-to-the-project",
    //         "type": 5001,
    //         "data": { "projectID": "39a74e98-b0e9-4170-b4c6-e3d371b191d3" }
    //     }

    //     await wsClient.send(sendMessage)

    //     const expectedMessages = {
    //         "id": "f319e122-3efc-47ce-a636-d749afc96ffe_join-to-the-project",
    //         "response": {
    //             "data":
    //             {
    //                 "success": true, "activeUsers": 1, "wasFirstUser": true, "clientID": "59b95404-fc5e-448a-a25a-e352519a7e6b",
    //                 "color": "#FFA07A",
    //                 "email": loginData.email, "login": "Vladyslav",
    //                 "avatarUrl": expect.any(String),
    //                 "projectID": sendMessage.data.projectID,
    //                 "userID": "61985a2a-7144-426a-bca3-f5ff64d3cc36"
    //             }, "error": null
    //         }, "type": 5001
    //     }

    //     await expect.poll(() => wsClient.allMessages.length, { timeout: 10000 }).toBeGreaterThan(0);

    //     console.log('Total messages received:', wsClient.allMessages.length);

    //     for (const msg of wsClient.allMessages) {
    //         expect(msg).toMatchObject(expectedMessages);
    //         console.log('Received message:', msg);
    //     }

    //     // console.log('All received messages:', wsClient.allMessages);

    // });

});