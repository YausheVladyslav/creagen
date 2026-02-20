import WebSocket from 'ws';

export default class WsClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.allMessages = [];
        this.isPurposelyClosed = false;
    }

    async connect() {
        this.ws = new WebSocket(this.url);

        this.ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message.toString());
            this.allMessages.push(parsedMessage);
            console.log('📥 WS message Received:', parsedMessage);
        });

        return new Promise((resolve, reject) => {
            this.ws.on('open', () => {
                console.log('✅ WS Opened');
                resolve();
            });

            this.ws.on('error', (error) => {
                console.log('⚠️ WS Error:', error.message);
                reject(error.message);
            });

        });

    };

    async send(data) {
        const message = JSON.stringify(data);
        console.log('➡️ Sending message:', message);
        this.ws.send(message);
    }

    async waitForMessage(predicate, timeout = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const foundMessage = this.allMessages.find(predicate);
            if (foundMessage) {
                return foundMessage;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        throw new Error(`Timeout waiting for message matching predicate: ${predicate}`);
    }

    async close() {
        this.isPurposelyClosed = true;
        if (this.ws) {
            this.ws.removeAllListeners();
            this.ws.close();
            console.log('🔌 WS Connection Closed');
        }
    }

    clearHistory() {
        this.allMessages = [];
    }

    // async connectWithRetry(retries = 3, delay = 1000) {
    //     for (let attempt = 1; attempt <= retries; attempt++) {
    //         try {
    //             await this.connect();
    //             return;
    //         } catch (error) {
    //             console.log(`Attempt ${attempt} failed: ${error.message}`);
    //             if (attempt < retries) {
    //                 await new Promise(resolve => setTimeout(resolve, delay));
    //             } else {
    //                 throw error;
    //             }
    //         }
    //     }
    // }

    async connectWithReconnect(onReconnectCallback, retries = 3) {
        this.isPurposelyClosed = false;

        const doConnect = async () => {
            for (let attempt = 1; attempt <= retries; attempt++) {
                try {
                    await this.connect();
                    console.log(`✅ Connected on attempt ${attempt}`);

                    if (onReconnectCallback) await onReconnectCallback();
                    return;
                } catch (error) {
                    console.log(`⚠️ Attempt ${attempt} failed: ${error.message}`);
                    if (attempt === retries) throw error;
                    await new Promise(res => setTimeout(res, 2000));
                }
            }
        };

        await doConnect();

        this.ws.on('close', async () => {
            if (!this.isPurposelyClosed) {
                console.log('🔄 Connection lost unexpectedly. Retrying...');
                await doConnect();
            }
        });
    }

    async forceDisconnect() {
        this.ws.terminate();
    }


}