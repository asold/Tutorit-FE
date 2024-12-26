import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

interface CallAcceptModalProps {
    onAccept: () => void;
    onDecline: () => void;
    token: string | null;
}

const CallAcceptModal: React.FC<CallAcceptModalProps> = ({ onAccept, onDecline }) => {
    return (
        <Modal
            open={true} // Always open when called
            onClose={onDecline}
            aria-labelledby="call-modal-title"
            aria-describedby="call-modal-description"
            closeAfterTransition
            BackdropProps={{
                timeout: 500,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 300,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    borderRadius: '8px',
                    p: 3,
                    textAlign: 'center',
                }}
            >
                <Typography id="call-modal-title" variant="h6" sx={{ mb: 2 }}>
                    📞 Incoming Call
                </Typography>
                <Typography id="call-modal-description" sx={{ mb: 3 }}>
                    You have an incoming call. Would you like to accept it?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Button variant="contained" color="success" onClick={onAccept}>
                        Accept
                    </Button>
                    <Button variant="contained" color="error" onClick={onDecline}>
                        Decline
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CallAcceptModal;
