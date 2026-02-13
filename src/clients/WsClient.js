
import WebSocket from 'ws';

export default class WsClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.allMessages = [];
    }

    // async connect() {
    //     this.ws = new WebSocket(this.url);
    //     return new Promise((resolve, reject) => {
    //         this.ws.on('open', () => {
    //             console.log('✅ WS Connected');
    //             resolve();
    //         });
    //         this.ws.on('error', reject);
    //     });
    // }

    async connect(timeout = 5000) {
        this.ws = new WebSocket(this.url);
        
        this.ws.on('message', (data) => {
            try {
                const parsed = JSON.parse(data.toString());
                this.allMessages.push(parsed);
                console.log('📥 WS Received:', parsed.type || parsed.id);
            } catch (error) {
                console.log('📥 WS Received Non-JSON', error.message);
            }
        });

        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.ws.terminate();
                reject(new Error(`Connection timeout ${timeout}ms`));
            }, timeout);

            this.ws.on('open', () => { clearTimeout(timer); resolve(); });
            this.ws.on('error', (error) => { clearTimeout(timer); reject(error.message); });
        });
    };

    async send(data) {
        const message = JSON.stringify(data);
        console.log('➡️ Sending:', message);
        this.ws.send(message);
    };

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
    };

    async waitForMultipleMessages(predicate, expectedCount, timeout = 5000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const filtered = this.allMessages.filter(predicate);
            if (filtered.length >= expectedCount) {
                return filtered;
            }
            await new Promise(result => setTimeout(result, 200));
        }
        throw new Error(`Timeout: Expected ${expectedCount} messages, but found ${this.allMessages.filter(predicate).length}`);
    };

    clearHistory() {
        this.allMessages = [];
    };

    async close() {
        if (this.ws) this.ws.close();
    };
}



// export default class WsClient {
//     constructor(url) {
//         this.url = url;
//         this.ws = null;
//         this.allMessages = []; 
//     }

//     async connect() {
//         this.ws = new WebSocket(this.url);
        
//         this.ws.on('message', (data) => {
//             try {
//                 const parsedData = JSON.parse(data.toString());
//                 this.allMessages.push(parsedData); 
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

//     clearHistory() {
//         this.allMessages = [];
//     }

//     async close() {
//         if (this.ws) this.ws.close();
//     }
// }