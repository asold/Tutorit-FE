import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import { SERVER_ADDRESS } from './constants.ts';

class SignalRHandler {
    private connection: HubConnection | null = null;

    constructor() {}

    public async createSignalRConnection(type: number, userToken: string): Promise<HubConnection> {
        const connect = new HubConnectionBuilder()
            .withUrl(`${SERVER_ADDRESS}/hub?userToken=${encodeURIComponent(userToken)}&connectionType=${type}`)
            .withAutomaticReconnect()
            .withHubProtocol(new MessagePackHubProtocol())
            .configureLogging(LogLevel.Information)
            .build();

        try {
            await connect.start();
            this.connection = connect;
            console.log('SignalR connection established with type:', type);
            this.keepAlive(connect);
            return connect;
        } catch (err) {
            console.error('Error while establishing SignalR connection:', err);
            throw err;
        }
    }

    public async sendMessageThroughConnection(connection: HubConnection, connectionName: string, ...message: any[]): Promise<void> {
        if (connection && connection.state === 'Connected') {
            try {
                await connection.send(connectionName, ...message);
                console.log(`Message sent through connection: ${connectionName}`);
            } catch (error) {
                console.error('Error sending message:', error);
                throw error;
            }
        } else {
            console.error('Connection is not established or not connected');
            throw new Error('Connection is not established or not connected');
        }
    }

    public async stopConnection(connection: HubConnection): Promise<void> {
        if (connection) {
            try {
                await connection.stop();
                console.log('SignalR connection closed');
                this.connection = null;
            } catch (error) {
                console.error('Failed to close SignalR connection:', error);
                throw error;
            }
        }
    }

    private keepAlive(connection: HubConnection): void {
        const keepAliveInterval = setInterval(() => {
            if (connection.state === 'Connected') {
                connection.invoke("KeepAlive").catch(err => console.error("KeepAlive error:", err));
            }
        }, 15000);

        connection.onclose(() => {
            console.log("Connection lost. Attempting to reconnect...");
            clearInterval(keepAliveInterval);
        });
    }

    public onConnectionEvent(connection: HubConnection, eventName: string, callback: (...args: any[]) => void): void {
        if (connection) {
            connection.on(eventName, callback);
        }
    }

    public offConnectionEvent(connection: HubConnection, eventName: string, callback: (...args: any[]) => void): void {
        if (connection) {
            connection.off(eventName, callback);
        }
    }

    public getConnectionId(): string | null {
        return this.connection?.connectionId ?? null;
    }
}

export default SignalRHandler;
