import React, { useState } from 'react';
import Caller from './childComponents/Caller.tsx';
import Receiver from './childComponents/Receiver.tsx';
import InteractionBoard from '../boards/InteractionBoard.tsx';
import SignalRHandler from './childComponents/SignalRHandler.tsx';
import { Box, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

const VideoCallPage = () => {
    const token = localStorage.getItem('token');
    const [showInteractionBoard, setShowInteractionBoard] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const callAccepted = useSelector((state: any) => state.videoCall.callAccepted);
    const callDeclined = useSelector((state: any) => state.videoCall.callDeclined);
    const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
    const receiverConnectionId = useSelector((state: any) => state.receiver.receiverConnectionId);

    const toggleInteractionBoard = () => {
        setShowInteractionBoard((prev) => !prev);
    };

    const handleCallAccepted = async () => {
        // await dispatch(acceptCall(receiverConnectionId));
        setShowModal(false);
    };

    const handleCallDeclined = () => {
        // setShowModal(false);
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* SignalR Handler */}
            <SignalRHandler
                token={token}
                onAccept={handleCallAccepted}
                onDecline={handleCallDeclined}
            />

            {/* Toggle Button */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 1000,
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    onClick={toggleInteractionBoard}
                >
                    {showInteractionBoard ? 'Close Board' : 'Open Board'}
                </Button>
            </Box>

            {/* Content Section */}
            {!showInteractionBoard ? (
                // Initial View (Sender and Receiver in Center)
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexGrow: 1,
                        gap: 3,
                        padding: 2,
                    }}
                >
                    <Box
                        sx={{
                            border: '2px dashed #6db5a0',
                            borderRadius: '8px',
                            padding: 2,
                            width: { xs: '80%', md: '30%' },
                            textAlign: 'center',
                        }}
                    >
                        <Caller token={token} />
                    </Box>
                    <Box
                        sx={{
                            border: '2px dashed #6db5a0',
                            borderRadius: '8px',
                            padding: 2,
                            width: { xs: '80%', md: '30%' },
                            textAlign: 'center',
                        }}
                    >
                        <Receiver token={token} />
                    </Box>
                </Box>
            ) : (
                // Interaction Board Opened
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        height: '100%',
                        gap: 2,
                    }}
                >
                    {/* Smaller Caller & Receiver Boxes on Top */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 2,
                            width: '60%',
                            height: '15%',
                            paddingTop: 2,
                            flexShrink: 0,
                        }}
                    >
                        <Box
                            sx={{
                                border: '2px dashed #6db5a0',
                                borderRadius: '8px',
                                padding: 1,
                                width: { xs: '30%', md: '20%' },
                                height: { xs: '100%', md: '100%' },
                                textAlign: 'center',
                            }}
                        >
                            <Caller token={token} />
                        </Box>
                        <Box
                            sx={{
                                border: '2px dashed #6db5a0',
                                borderRadius: '8px',
                                padding: 1,
                                width: { xs: '30%', md: '20%' },
                                textAlign: 'center',
                            }}
                        >
                            <Receiver token={token} />
                        </Box>
                    </Box>

                    {/* Interaction Board Below */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            width: '95%',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: 2,
                            overflow: 'hidden',
                        }}
                    >
                        <InteractionBoard />
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default VideoCallPage;
