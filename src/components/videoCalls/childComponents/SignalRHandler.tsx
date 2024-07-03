import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import React, { useEffect, useState } from 'react';
import CallAcceptanceModal from './CallAcceptanceModal.tsx';
import { SERVER_ADDRESS } from '../../../common/constants.ts';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { useDispatch } from 'react-redux';
import { setInitialCallerUserName } from '../../../actions/videoActions/videoActions.ts';

const SignalRHandler = ({ token, onAccept, onDecline }) => {
    const [callReceived, setCallReceived] = useState(false);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [key, setKey] = useState(0); // Add a key state to force re-render
    const [callerConnectionid, setCallerConnectionId] = useState("")

    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();

    useEffect(() => {
        const connect = new HubConnectionBuilder()
            .withUrl(`${SERVER_ADDRESS}/hub?userToken=${encodeURIComponent(token)}&connectionType=${2}`)
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
            const handleAcceptCallRequest = (fromUser:string) => {
                setShowModal(true);
                setCallerConnectionId(fromUser)
                setCallReceived(true);
            };
            //Step 1: In the receiver showing call.
            connection.on('acceptcallrequest', handleAcceptCallRequest);
            return () => connection.off('acceptcallrequest', handleAcceptCallRequest);
        }
    }, [connection, callReceived]);

    const handleModalAccept = () => {
        onAccept();
        setShowModal(false);

        if (connection) {
            //Step 2: In the receiver accepting call.
            connection.send('AcceptCallFromReceiver');
        }

        // Reset the component by updating the key
        setCallReceived(false);
        dispatch(setInitialCallerUserName(callerConnectionid))
        setKey(prevKey => prevKey + 1);
    };

    const handleModalDecline = () => {
        onDecline();
        setShowModal(false);

        // Reset the component by updating the key
        setCallReceived(false);
        setKey(prevKey => prevKey + 1);
    };

    return (
        <div key={key}>
            {showModal && (
                <CallAcceptanceModal
                    onAccept={handleModalAccept}
                    onDecline={handleModalDecline}
                    onReceiveCall={() => {}}
                    token={token}
                />
            )}
        </div>
    );
};

export default SignalRHandler;
