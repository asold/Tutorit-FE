import React, { useState } from 'react';
import VideoInteraction from './videoCalls/VideoInteraction.tsx'  // Assuming the initiator is in this file
import VideoCallReceiver from './videoCalls/VideoCallReceiver.tsx';
import CallAcceptanceModal from './videoCalls/CallAcceptanceModal.tsx';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { acceptCall } from '../actions/videoActions/videoActions.ts';

const VideoCallPage = () => {
    const token = localStorage.getItem('token');
    const [showModal, setShowModal] = useState(false);
    const callAccepted = useSelector((state:any) => state.videoCall.callAccepted);
    const callDeclined = useSelector((state:any) => state.videoCall.callDeclined);
    const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();


    const handleCallAccepted = () => {
        dispatch(acceptCall());
        setShowModal(false);
    };
    
    const handleCallDeclined = () => {
        setShowModal(false);
        
    };

    const handleReceiveCall = () => {
        setShowModal(true);
    };



    return (
        <div>
            <h1>Video Call Page</h1>

            {showModal &&(
                <CallAcceptanceModal
                    onAccept={handleCallAccepted}
                    onDecline={handleCallDeclined}
                />
            )}


            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <VideoInteraction token={token} />
                <VideoCallReceiver token={token} onReceiveCall={handleReceiveCall}/>
            </div>
        </div>
    );
};

export default VideoCallPage;
