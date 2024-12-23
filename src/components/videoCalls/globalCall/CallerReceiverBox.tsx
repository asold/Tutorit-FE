import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Draggable from 'react-draggable';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import GlobalCaller from './GlobalCaller.tsx';
import GlobalReceiver from './GlobalReceiver.tsx';
import UserStatusDropdown from '../../users/UserStatusDropdown.tsx';
import { useSelector } from 'react-redux';
import IncommingCallHandler from './IncommingCallHandler.tsx';

const CallerReceiverBox: React.FC = () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const [showModal, setShowModal] = useState(false);
    

    const tokenAfterLogin = useSelector((state: any) => state.auth.token);
    

    const [callPartnerUsername, setCallPartnerUsername] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const handleCallAccepted = async () => {
        setShowModal(false);
    };

    const handleCallDeclined = () => {
        setShowModal(false);
    };

    const draggableRef = useRef<HTMLDivElement>(null);

    const handleClose = () => setIsVisible(false);
    const handleMinimize = () => setIsMinimized(true);
    const handleExpand = () => setIsMinimized(false);
    
    useEffect(() =>{
        if(tokenAfterLogin){
            setIsVisible(true);
        }
    }, [tokenAfterLogin]);

    if (!isVisible || !token) return null;



    return (
        <Draggable nodeRef={draggableRef}>
            <Box
                ref={draggableRef}
                sx={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: isMinimized ? '300px' : '400px',
                    height: isMinimized ? '50px' : 'auto',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
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
                        padding: '8px',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span>Caller & Receiver</span>
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        {isMinimized ? (
                            <CropSquareIcon
                                onClick={handleExpand}
                                sx={{ cursor: 'pointer' }}
                            />
                        ) : (
                            <MinimizeIcon
                                onClick={handleMinimize}
                                sx={{ cursor: 'pointer' }}
                            />
                        )}
                        <CloseIcon
                            onClick={handleClose}
                            sx={{ cursor: 'pointer' }}
                        />
                    </Box>
                </Box>

                {/* Body: Show only when expanded */}
                {!isMinimized && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
                        <Box>
                            <UserStatusDropdown
                                token={token}
                                onUsernameSelect={setCallPartnerUsername}
                            />
                        </Box>
                        <Box sx={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}>
                            <GlobalCaller token={token} callPartnerUsername={callPartnerUsername} />
                        </Box>
                        <Box>
                            <IncommingCallHandler token={token} onAccept={handleCallAccepted} onDecline={handleCallDeclined} />
                        </Box>
                        <Box sx={{ border: '1px solid #ddd', borderRadius: '4px', padding: '8px' }}>
                            <GlobalReceiver token={token} />
                        </Box>
                    </Box>
                )}
            </Box>
        </Draggable>
    );
};

export default CallerReceiverBox;
