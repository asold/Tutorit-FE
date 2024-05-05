import React from 'react';
import VideoInteraction from './videoCalls/VideoInteraction.tsx'  // Assuming the initiator is in this file
import VideoCallReceiver from './videoCalls/VideoCallReceiver.tsx';
import { useSelector } from 'react-redux';

const VideoCallPage = () => {
    // const token = useSelector((state:any) => state.auth.token);
    const token = localStorage.getItem('token');


    return (
        <div>
            <h1>Video Call Page</h1>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <VideoInteraction token={token} />
                <VideoCallReceiver token={token} />
            </div>
        </div>
    );
};

export default VideoCallPage;
