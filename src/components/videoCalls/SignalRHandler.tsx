import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import React, { useEffect, useState } from 'react';
import CallAcceptanceModal from './CallAcceptanceModal.tsx';

const SignalRHandler = ({ token, onAccept, onDecline }) => {
    const [callReceived, setCallReceived] = useState(false);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {

        const connect = new HubConnectionBuilder()
            .withUrl(`http://localhost:8000/hub?userToken=${encodeURIComponent(token)}&connectionType=${2}`)
            .withAutomaticReconnect()
            .withHubProtocol(new MessagePackHubProtocol())
            .configureLogging(LogLevel.Information)
            .build();

        const startConnection = async () => {
            try {
                await connect.start();
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
        });

        return () => {
            clearInterval(keepAliveInterval);
            if (connect) {
                connect.stop().then(() => console.log('SignalR connection closed'));
            }
        };
    }, [token]);

    useEffect(() => {
        if (connection && !callReceived) {
            const handleAcceptCallRequest = () => {
                console.log('QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ');

                console.log('Incoming call request received');
                setShowModal(true);
                setCallReceived(true);
            };

            connection.on('acceptcallrequest', handleAcceptCallRequest);
            return () => connection.off('acceptcallrequest', handleAcceptCallRequest);
        }
        else{
        }
    }, [connection, callReceived]);

    const handleModalAccept = () => {
        onAccept();
        setShowModal(false);
    };

    const handleModalDecline = () => {
        onDecline();
        setShowModal(false);
    };

    return (
        <>
            {showModal && (
                <CallAcceptanceModal
                    onAccept={handleModalAccept}
                    onDecline={handleModalDecline}
                    onReceiveCall={() => {}}
                    token={token}
                />
            )}
        </>
    );
};

export default SignalRHandler;
