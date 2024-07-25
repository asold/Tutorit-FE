import React, { useState } from 'react';
import Caller from './childComponents/Caller.tsx';  // Assuming the initiator is in this file
import Receiver from './childComponents/Receiver.tsx';
import CallAcceptanceModal from './childComponents/CallAcceptanceModal.tsx';
import InteractionBoard from '../boards/InteractionBoard.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { acceptCall } from '../../actions/videoActions/videoActions.ts';
import SignalRHandler from './childComponents/SignalRHandler.tsx';

const VideoCallPage = () => {
    const token = localStorage.getItem('token');
    const [showModal, setShowModal] = useState(false);
    const callAccepted = useSelector((state: any) => state.videoCall.callAccepted);
    const callDeclined = useSelector((state: any) => state.videoCall.callDeclined);
    const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
    const receiverConnectionId = useSelector((state: any) => state.receiver.receiverConnectionId);

    const handleCallAccepted = async () => {
        // await dispatch(acceptCall(receiverConnectionId));
        setShowModal(false);
    };

    const handleCallDeclined = () => {
        // setShowModal(false);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'row' }}>
            <SignalRHandler
                token={token}
                onAccept={handleCallAccepted}
                onDecline={handleCallDeclined}
            />

            <div style={{ flex: 1, margin: '0.5%', overflow: 'auto', position: 'relative' }}>
                <InteractionBoard />
            </div>

            <div style={{ width: '20%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                <div style={{ flex: 1, margin: '0.5%' }}>
                    <Caller token={token} />
                </div>
                <div style={{ flex: 1, margin: '0.5%' }}>
                    <Receiver token={token} />
                </div>
            </div>
        </div>
    );
};

export default VideoCallPage;
