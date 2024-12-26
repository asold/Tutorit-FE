import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import SignalRHandler from '../../../common/signalRHandler.ts';
import { HubConnection } from '@microsoft/signalr';
import { Box, Button, Typography, Modal, Backdrop, Fade } from '@mui/material';
import IncommingCallHandler from './IncommingCallHandler.tsx';

interface GlobalCallerReceiverProps {
    token: string | null;
    callPartnerUsername: string;
}

const GlobalCallerReceiver: React.FC<GlobalCallerReceiverProps> = ({ token, callPartnerUsername }) => {
    // State Management
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [incomingOffer, setIncomingOffer] = useState<any | null>(null); // Store SDP offer
    const [isCalling, setIsCalling] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);
    const [showModal, setShowModal] = useState(false); // Modal for Accept/Decline Call
    const [callerUsername, setCallerUsername] = useState<string>('');

    const handleCallAccepted = async () => setShowModal(false);
    const handleCallDeclined = () => setShowModal(false);

    // Video Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
    const signalRHandler = new SignalRHandler();

    // 📡 **Initialize SignalR Connection**
    const initializeSignalRConnection = useCallback(async () => {
        if (!connection && token) {
            try {
                const connect = await signalRHandler.createSignalRConnection(0, token);
                setConnection(connect);

                if (connect.state !== 'Connected') {
                    await connect.start();
                    console.log('SignalR Connection started successfully');
                }

                // Handle Incoming WebRTC Offer
                signalRHandler.onConnectionEvent(connect, 'receiveOffer', async (offer, senderUsername) => {
                    setIncomingOffer({ offer, senderUsername }); // Store both offer and senderUsername
                    setShowModal(true); // Show modal for user acceptance
                    setCallerUsername(senderUsername);
                });

                // Handle ICE candidates
                signalRHandler.onConnectionEvent(connect, 'receiveICECandidate', async (candidate) => {
                    console.log('Received ICE Candidate:', candidate);
                    await handleReceiveICECandidate(candidate);
                });

                // Handle SDP Answer from the Receiver
                signalRHandler.onConnectionEvent(connect, 'receiveAnswer', async (answer) => {
                    console.log('Received SDP Answer:', answer);
                    await handleReceiveAnswer(answer);
                });

            } catch (error) {
                console.error('SignalR connection failed:', error);
            }
        }
    }, [connection, token]);

    useEffect(() => {
        initializeSignalRConnection();

        return () => {
            if (connection) {
                signalRHandler.stopConnection(connection);
            }
            if (peerConnection) {
                peerConnection.close();
            }
        };
    }, [initializeSignalRConnection]);

    // 🎥 **Initialize WebRTC Connection**
    const initializeWebRTCConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && connection) {
                console.log("Sending the ICE Candidate to the other peer:", event.candidate);
                signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendICECandidate',
                    callPartnerUsername,
                    event.candidate
                );
            }
        };

        pc.ontrack = (event) => {
            console.log('Received remote track:', event.streams);
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };
        
        // console.log("peerConnection", pc);
        // setPeerConnection(pc);
        return pc;
    }, [connection, callPartnerUsername]);

    // 🎥 **Start Local Video Stream**
    const startLocalStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                peerConnection?.addTrack(track, stream);
            });
        } catch (error) {
            console.error('Failed to start local stream:', error);
        }
    }, [peerConnection]);

    // 📞 **Handle Call Start**
    const handleStartCall = useCallback(async () => {
        if (!connection) {
            console.error('SignalR connection is not established');
            return;
        }

        const pc = peerConnection ?? initializeWebRTCConnection();
        setPeerConnection(pc);
        setIsCalling(true);

        try {
            await startLocalStream();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            await signalRHandler.sendMessageThroughConnection(
                connection,
                'SendOffer',
                callPartnerUsername,
                offer
            );

            console.log('SDP Offer sent');
        } catch (error) {
            console.error('Failed to start call:', error);
        }
    }, [peerConnection, callPartnerUsername, startLocalStream, initializeWebRTCConnection]);

    // ✅ **Accept Offer**
    const handleAcceptOffer = useCallback(async () => {
        console.log("peerConnection", peerConnection);
        console.log("incomingOffer", incomingOffer);
        if (!peerConnection){
            const pc = initializeWebRTCConnection();
            setPeerConnection(pc);
        }

        if (!incomingOffer?.offer) return;
    
        console.log("peerConnection On Accepting Offer", peerConnection);
        console.log("incomming offer On Accepting Offer", incomingOffer);

        try {
            await startLocalStream();

            console.log("SDP offer from Caller:", incomingOffer.offer); 

            await peerConnection?.setRemoteDescription(new RTCSessionDescription(incomingOffer.offer));
    
            const answer = await peerConnection?.createAnswer();
            await peerConnection?.setLocalDescription(answer);

            console.log("SDP answer from Receiver:", answer);

            if (connection) {
                await signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendAnswer',
                    callerUsername,
                    answer
                );
            }
    
            setIsReceiving(true);
            setShowModal(false);
            console.log('SDP Answer sent');
        } catch (error) {
            console.error('Failed to accept offer:', error);
        }
    }, [peerConnection, connection, callPartnerUsername, incomingOffer, startLocalStream]);
    

    // ❌ **Decline Offer**
    const handleDeclineOffer = useCallback(() => {
        setIncomingOffer(null);
        setShowModal(false);
        console.log('Call declined by user');
    }, []);

        // Handle ICE Candidate
    const handleReceiveICECandidate = useCallback(async (candidate) => {
        if (!peerConnection) return;
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('ICE Candidate added');
        } catch (error) {
            console.error('Failed to add ICE candidate:', error);
        }
    }, [peerConnection]);

    // Handle Stop Call
    const handleStopCall = useCallback(() => {
        peerConnection?.close();
        setPeerConnection(null);
        setIsCalling(false);
        setIsReceiving(false);

        if (localVideoRef.current?.srcObject) {
            (localVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        }

        if (remoteVideoRef.current?.srcObject) {
            (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        }

        console.log('Call stopped');
    }, [peerConnection]);

    // Handle SDP Answer from Receiving User
    const handleReceiveAnswer = useCallback(async (answer) => {
        if (!peerConnection) {
            console.error('PeerConnection is not initialized');
            return;
        }
    
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('SDP Answer successfully set as Remote Description');
        } catch (error) {
            console.error('Failed to set remote description with SDP Answer:', error);
        }
    }, [peerConnection]);
    

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: 2,
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            {/* Call Information */}
            <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 1 }}>
                Video Call with {callPartnerUsername}
            </Typography>

            {/* Video Display */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                {/* Local Video */}
                <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                    <video ref={localVideoRef} autoPlay muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>

                {/* Remote Video */}
                <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
                    <video ref={remoteVideoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
            </Box>

            {/* Control Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 2 }}>
                <Button variant="contained" onTouchStart ={handleStartCall} onClick={handleStartCall} disabled={isCalling || isReceiving}>
                    Start Call
                </Button>
                <Button variant="contained" color="error" onTouchStart ={handleStopCall} onClick={handleStopCall}>
                    Stop Call
                </Button>
            </Box>

            {/* Modal for Call Accept/Decline */}
            <Modal open={showModal} onClose={handleDeclineOffer}>
                <Box sx={modalStyle}>
                    <Typography variant="h6">📞 Incoming Call</Typography>
                    {incomingOffer?.senderUsername && (
                        <Typography variant="body1">From: {incomingOffer.senderUsername}</Typography>
                    )}
                    <Button variant="contained" color="success" onClick={handleAcceptOffer}>Accept</Button>
                    <Button variant="contained" color="error" onClick={handleDeclineOffer}>Decline</Button>
                </Box>
            </Modal>

        </Box>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
    textAlign: 'center',
};
export default GlobalCallerReceiver;
