
import WebSocket from 'ws';

export default class WsClient {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.allMessages = [];
        this.isPurposelyClosed = false;
    }

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
        const start = Date.now();
        while (Date.now() - start < timeout) {
            // Шукаємо в масиві, який наповнюється в connect()
            const found = this.allMessages.find(predicate);
            if (found) return found;
            await new Promise(res => setTimeout(res, 100));
        }
        throw new Error(`WS Timeout: Message matching predicate not found`);
    }

    async close() {
        this.isPurposelyClosed = true;
        if (this.ws) {
            // Прибираємо всіх слухачів, щоб вони не стріляли після закриття
            this.ws.removeAllListeners();
            this.ws.close();
        }
    }

    // async waitForMessage(predicate, timeout = 5000) {
    //     return new Promise((resolve, reject) => {
    //         const timer = setTimeout(() => reject(new Error('WS Timeout')), timeout);

    //         this.ws.on('message', (data) => {
    //             const parsedData = JSON.parse(data.toString());
    //             if (predicate(parsedData)) {
    //                 clearTimeout(timer);
    //                 resolve(parsedData);
    //             } else {
    //                 reject(new Error(`No data received matching predicate: ${JSON.stringify(parsedData)}`));
    //             }
    //         });
    //     });
    // };

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

    async connectWithReconnect(onReconnectCallback) {
        this.isPurposelyClosed = false;

        await this.connect();

        this.ws.on('close', async (code) => {
            if (!this.isPurposelyClosed) {
                console.log(`⚠️ Connection lost (${code}). Reconnecting...`);

                await this.connect();

                if (onReconnectCallback) {
                    await onReconnectCallback();
                }
            }
        });
    }

    clearHistory() {
        this.allMessages = [];
    };

    // async close() {
    //     this.isPurposelyClosed = true;
    //     this.ws.close();
    // };

    async forceDisconnect() {
        this.ws.terminate();
    }

    async connectWithReconnect2(onReconnectCallback, maxAttempts = 3) {
        this.isExplicitlyClosed = false;
        let attempts = 0;

        const performConnect = async () => {
            try {
                attempts++;
                console.log(`🔌 Attempt ${attempts} to connect...`);
                await this.connect();
                console.log('✅ Connected successfully');

                attempts = 0;

                if (onReconnectCallback) {
                    await onReconnectCallback();
                }
            } catch (error) {
                if (attempts < maxAttempts) {
                    console.log(`❌ Connection failed. Retrying in 2s... (${attempts}/${maxAttempts})`);
                    await new Promise(res => setTimeout(res, 2000));
                    return performConnect();
                } else {
                    throw new Error(`🔥 Could not connect after ${maxAttempts} attempts.`);
                }
            }
        };

        // Перший запуск
        await performConnect();

        // Налаштовуємо слухача на майбутні розриви
        this.ws.on('close', async (code) => {
            if (!this.isPurposelyClosed) {
                console.log(`⚠️ Connection lost (${code}). Starting recovery...`);
                await performConnect();
            }
        });
    }
}