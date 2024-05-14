import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import React, { useEffect, useState } from 'react';

const CallAcceptanceModal = ({ onAccept, onDecline,  onReceiveCall, token}) => {

    const [callReceived, setCallReceived] = useState(false);
    const [connection, setConnection] = useState<HubConnection | null>(null);

    useEffect(() => {

        const connect = new HubConnectionBuilder()
            .withUrl(`http://localhost:8000/hub?userToken=${encodeURIComponent(token)}&connectionType=${3}`)
            .withAutomaticReconnect()
            .withHubProtocol(new MessagePackHubProtocol())
            .configureLogging(LogLevel.Information)
            .build();

        const startConnection = async () => {
            try {
                await connect.start();
                console.log('ACCEPTANCE MODAL SignalR connection established', connect.connectionId);
                setConnection(connect);
        
            } catch (err) {
                console.error('Error while establishing SignalR connection:', err);
            }
        };

        startConnection();
        
        const keepAliveInterval = setInterval(() => {
            if (connect.state === 'Connected') {
                connect.invoke("KeepAlive").catch(err => console.error("KeepAlive error:", err));
            }
        }, 15000); // Check and send KeepAlive every 15 seconds

        connect.onclose(() => {
            console.log("Connection lost. Attempting to reconnect...");
            // setupMediaSource(); // Ensure fresh setup after reconnection
        });

        return () => {
            clearInterval(keepAliveInterval);
            if (connect) {
                connect.stop().then(() => console.log('SignalR connection closed'));
            }
        };
    }, [token, onReceiveCall]);



    useEffect(() => {
        if (connection && !callReceived) {
            const handleAcceptCallRequest = () => {
                console.log('Incoming call request received');
                onReceiveCall();
                setCallReceived(true);
            };

            connection.on('acceptcallrequest', handleAcceptCallRequest);
            return () => connection.off('acceptcallrequest', handleAcceptCallRequest);
        }
    }, [connection, callReceived, onReceiveCall]);


    
    
    
    
    return (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000, background: 'white', padding: '20px', border: '1px solid black' }}>
            <h1>Incoming Call</h1>
            <button onClick={onAccept}>Accept</button>
            <button onClick={onDecline}>Decline</button>
        </div>
    );
};

export default CallAcceptanceModal;