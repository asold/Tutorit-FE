import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import SignalRHandler from '../../../common/signalRHandler.ts';
import { HubConnection } from '@microsoft/signalr';
import { setInitialCallerUserName } from '../../../actions/videoActions/videoActions.ts';
import CallAcceptModal from './CallAcceptModal.tsx';

interface IncommingCallHandlerProps {
    token: string | null;
    onAccept: () => void;
    onDecline: () => void;
    connection: HubConnection | null;
}

const IncommingCallHandler: React.FC<IncommingCallHandlerProps> = ({ token, onAccept, onDecline, connection }) => {
    const [callReceived, setCallReceived] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [key, setKey] = useState(0); // Force re-render on reset
    const [callerConnectionId, setCallerConnectionId] = useState("");

    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
    const signalRHandler = new SignalRHandler();

    useEffect(() => {
        if (connection && !callReceived) {
            const handleAcceptCallRequest = (fromUser: string) => {
                setShowModal(true);
                setCallerConnectionId(fromUser);
                setCallReceived(true);
            };

            // Attach event listener to accept call
            // signalRHandler.onConnectionEvent(connection, 'acceptcallrequest', handleAcceptCallRequest);

            return () => signalRHandler.offConnectionEvent(connection, 'acceptcallrequest', handleAcceptCallRequest);
        }
    }, [connection, callReceived]);

    const handleModalAccept = () => {
        onAccept();
        setShowModal(false);

        if (connection) {
            signalRHandler.sendMessageThroughConnection(connection, 'AcceptCallFromReceiver');
        }

        setCallReceived(false);
        dispatch(setInitialCallerUserName(callerConnectionId));
        setKey(prevKey => prevKey + 1);
    };

    const handleModalDecline = () => {
        onDecline();
        setShowModal(false);
        setCallReceived(false);
        setKey(prevKey => prevKey + 1);
    };

    return (
        <>
            {showModal && (
                <CallAcceptModal
                    onAccept={handleModalAccept}
                    onDecline={handleModalDecline}
                    token={token}
                />
            )}
        </>
    );
};

export default IncommingCallHandler;
