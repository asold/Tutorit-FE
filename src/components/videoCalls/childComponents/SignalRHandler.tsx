import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import CallAcceptanceModal from './CallAcceptanceModal.tsx';
import SignalRHandler from '../../../common/signalRHandler.ts';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';


import { setInitialCallerUserName } from '../../../actions/videoActions/videoActions.ts';

const SignalRHandlerComponent = ({ token, onAccept, onDecline }) => {
    const [callReceived, setCallReceived] = useState(false);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [key, setKey] = useState(0); // Add a key state to force re-render
    const [callerConnectionId, setCallerConnectionId] = useState("");

    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();

    const signalRHandler = new SignalRHandler();

    useEffect(() => {
        console.log("SignalRHandler initialized")
        const initializeConnection = async () => {
            try {
                const connect = await signalRHandler.createSignalRConnection(2, token);
                setConnection(connect);
            } catch (err) {
                console.error('Error while establishing SignalR connection:', err);
            }
        };

        initializeConnection();

        return () => {
            if (connection) {
                signalRHandler.stopConnection(connection);
            }
        };
    }, [token]);

    useEffect(() => {
        if (connection && !callReceived) {
            const handleAcceptCallRequest = (fromUser: string) => {
                setShowModal(true);
                setCallerConnectionId(fromUser);
                setCallReceived(true);
            };

            // Step 1: In the receiver showing call.
            signalRHandler.onConnectionEvent(connection, 'acceptcallrequest', handleAcceptCallRequest);

            return () => signalRHandler.offConnectionEvent(connection, 'acceptcallrequest', handleAcceptCallRequest);
        }
    }, [connection, callReceived]);

    const handleModalAccept = () => {
        onAccept();
        setShowModal(false);

        if (connection) {
            // Step 2: In the receiver accepting call.
            signalRHandler.sendMessageThroughConnection(connection, 'AcceptCallFromReceiver');
        }

        // Reset the component by updating the key
        setCallReceived(false);
        dispatch(setInitialCallerUserName(callerConnectionId));
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

export default SignalRHandlerComponent;
