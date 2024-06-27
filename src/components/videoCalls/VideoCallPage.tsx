// src/components/VideoCallPage.js

import React, { useState } from 'react';
import VideoInteraction from './childComponents/VideoInteraction.tsx';  // Assuming the initiator is in this file
import VideoCallReceiver from './childComponents/VideoCallReceiver.tsx';
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
        <div>
            <h1>Video Call Page</h1>

            <SignalRHandler
                token={token}
                onAccept={handleCallAccepted}
                onDecline={handleCallDeclined}
            />

            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <div style={{ flex: 1, margin: '0 10px' }}>
                    <VideoInteraction token={token} />
                </div>
                <div style={{ flex: 1, margin: '0 10px' }}>
                    <VideoCallReceiver token={token} />
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <InteractionBoard />
            </div>
        </div>
    );
};

export default VideoCallPage;
