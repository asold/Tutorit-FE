import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import GlobalCaller from './GlobalCaller.tsx';
import GlobalReceiver from './GlobalReceiver.tsx';
import UserStatusDropdown from '../../users/UserStatusDropdown.tsx';
import { useDispatch, useSelector } from 'react-redux';
import IncommingCallHandler from './IncommingCallHandler.tsx';
import {closeVideoCallModal} from '../../../actions/videoActions/videoActions.ts'
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

const CallerReceiverBox: React.FC = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const [showModal, setShowModal] = useState(false);

    const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();


    const tokenAfterLogin = useSelector((state: any) => state.auth.token);
    const videoCallModalActive = useSelector((state:any) => state.videoCall.videoCallModalActive);

    const [callPartnerUsername, setCallPartnerUsername] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    const handleCallAccepted = async () => setShowModal(false);
    const handleCallDeclined = () => setShowModal(false);

    // Track position
     const [position, setPosition] = useState({ x: 0, y: 0 });
     const [lastValidPosition, setLastValidPosition] = useState({ x: 0, y: 0 });
    
    const draggableRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        setIsVisible(false);
        dispatch(closeVideoCallModal());
    }
    const handleMinimize = () => {
        // Save the last valid position before minimizing
        setLastValidPosition(position);
        setIsMinimized(true);
    };
    const handleExpand = () => {
        // Restore the last valid position after maximizing
        setPosition(lastValidPosition);
        setIsMinimized(false);
    };

     // Track position during dragging
    const handleDrag = (_: any, data: any) => {
        setPosition({ x: data.x, y: data.y });
        setLastValidPosition({ x: data.x, y: data.y }); // Always keep the last valid position updated
    };

    useEffect(() => {
        if (tokenAfterLogin && videoCallModalActive) {
            setIsVisible(true);
        }
    }, [tokenAfterLogin, videoCallModalActive]);

    if (!isVisible || !token) return null;

    return (
        <Draggable
            nodeRef={draggableRef}
            position={position}
            onDrag={handleDrag}
        >
            <Box
                ref={draggableRef}
                sx={{
                    position: 'fixed',
                    width: isMinimized ? '20rem' : '25rem',
                    minHeight: '3rem',
                    height: isMinimized ? '3rem' : 'auto',
                    backgroundColor: 'white',
                    border: '0.1rem solid #ccc',
                    borderRadius: '0.5rem',
                    boxShadow: 4,
                    zIndex: 9999,
                    overflow: 'hidden',
                }}
            >
                {/* Header with Controls */}
                <Box
                    sx={{
                        backgroundColor: '#1976d2',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        minHeight: '3rem',
                        cursor: 'grab',
                    }}
                >
                    <span>Caller & Receiver</span>
                    <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                        {isMinimized ? (
                            <CropSquareIcon
                                onClick={handleExpand}
                                onTouchStart={handleExpand}
                                sx={{ cursor: 'pointer' }}
                            />
                        ) : (
                            <MinimizeIcon
                                onClick={handleMinimize}
                                onTouchStart={handleMinimize}
                                sx={{ cursor: 'pointer' }}
                            />
                        )}
                        <CloseIcon
                            onClick={handleClose}
                            onTouchStart={handleClose}
                            sx={{ cursor: 'pointer' }}
                        />
                    </Box>
                </Box>

                {/* Body: Show only when expanded */}
                {!isMinimized && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            height: '80vh',
                            overflowY: 'auto',
                            p:1
                        }}
                    >
                        <Box>
                            <UserStatusDropdown
                                token={token}
                                onUsernameSelect={setCallPartnerUsername}
                            />
                        </Box>
                        <Box>
                            <IncommingCallHandler token={token} onAccept={handleCallAccepted} onDecline={handleCallDeclined} />
                        </Box>
                        {/*Video Call Sections*/}

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                // gap: '0.5rem',
                                height: '100%', 
                            }}
                        >
                            {/*Caller Section*/}
                            <Box sx={{ 
                                flex: 1,
                                border: '0.1rem solid #ddd',
                                borderRadius: '0.3rem',
                                overflow: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                
                            }}>
                                <GlobalCaller token={token} callPartnerUsername={callPartnerUsername} />
                            </Box>

                            {/*Receiver Section*/}
                            <Box sx={{ 
                                  flex: 1,
                                  border: '0.1rem solid #ddd',
                                  borderRadius: '0.3rem',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                 
                                 }}>
                                <GlobalReceiver token={token} />
                            </Box>

                        </Box>
                        
                    </Box>
                )}
            </Box>
        </Draggable>
    );
};

export default CallerReceiverBox;
