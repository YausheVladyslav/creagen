
import WebSocket from 'ws';

export default class WsClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
    }

    async connect() {
        this.ws = new WebSocket(this.url);
        return new Promise((resolve, reject) => {
            this.ws.on('open', () => {
                console.log('✅ WS Connected');
                resolve();
            });
            this.ws.on('error', reject);
        });
    }

    async send(data) {
        const message = JSON.stringify(data);
        console.log('➡️ Sending:', message);
        this.ws.send(message);
    }

    async waitForMessage(predicate, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('WS Timeout')), timeout);

            this.ws.on('message', (data) => {
                const parsedData = JSON.parse(data.toString());
                if (predicate(parsedData)) {
                    clearTimeout(timer);
                    resolve(parsedData);
                } else {
                    reject(new Error(`No data received matching predicate: ${JSON.stringify(parsedData)}`));
                }
            });
        });
    }

    async close() {
        if (this.ws) this.ws.close();
    }
}



// export default class WsClient {
//     constructor(url) {
//         this.url = url;
//         this.ws = null;
//         this.allMessages = []; // Сюди будуть падати всі JSON-відповіді
//     }

//     async connect() {
//         this.ws = new WebSocket(this.url);
        
//         this.ws.on('message', (data) => {
//             try {
//                 const parsedData = JSON.parse(data.toString());
//                 this.allMessages.push(parsedData); // Зберігаємо кожне повідомлення
//                 console.log('📥 Message received and saved');
//             } catch (error) {
//                 console.log('📥 Received non-JSON message:', data.toString());
//             }
//         });

//         return new Promise((resolve, reject) => {
//             this.ws.on('open', resolve);
//             this.ws.on('error', reject);
//         });
//     }

//     async send(data) {
//         this.ws.send(JSON.stringify(data));
//     }

//     // Очистити історію (корисно між кроками одного тесту)
//     clearHistory() {
//         this.allMessages = [];
//     }

//     async close() {
//         if (this.ws) this.ws.close();
//     }
// }