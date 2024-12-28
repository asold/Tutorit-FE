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
    // const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [incomingOffer, setIncomingOffer] = useState<any | null>(null); // Store SDP offer
    const [isCalling, setIsCalling] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);
    const [showModal, setShowModal] = useState(false); // Modal for Accept/Decline Call
    const [callerUsername, setCallerUsername] = useState<string>('');
    const [iceCandidateQueue, setIceCandidateQueue] = useState<any[]>([]);


    const handleCallAccepted = async () => setShowModal(false);
    const handleCallDeclined = () => setShowModal(false);

    // Video Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
    const signalRHandler = new SignalRHandler();

    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    console.log('Component rendered');

    useEffect(() => {
        console.log('useEffect: remoteStream updated', remoteStream);
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            console.log('Remote video stream updated on remoteVideoRef');
        } else {
            console.warn('remoteStream or remoteVideoRef is null during useEffect');
        }
    }, [remoteStream]);


    // 📡 **Initialize SignalR Connection**
    const initializeSignalRConnection = useCallback(async () => {
        console.log('Initializing SignalR connection');
        if (!connection && token) {
            try {
                const connect = await signalRHandler.createSignalRConnection(0, token);
                setConnection(connect);

                console.log('SignalR connection established:', connect.state);

                if (connect.state !== 'Connected') {
                    await connect.start();
                    console.log('SignalR connection started successfully');
                }

                signalRHandler.onConnectionEvent(connect, 'receiveOffer', async (offer, senderUsername) => {
                    console.log('Received WebRTC offer:', offer);
                    setIncomingOffer({ offer, senderUsername });
                    setShowModal(true);
                    setCallerUsername(senderUsername);
                });

                signalRHandler.onConnectionEvent(connect, 'receiveICECandidate', async (candidate) => {
                    console.log('Received ICE candidate:', candidate);
                    await handleReceiveICECandidate(candidate);
                });

                signalRHandler.onConnectionEvent(connect, 'receiveAnswer', async (answer) => {
                    console.log('Received SDP answer:', answer);
                    await handleReceiveAnswer(answer);
                });
            } catch (error) {
                console.error('SignalR connection failed:', error);
            }
        } else {
            console.warn('SignalR connection already exists or token is missing');
        }
    }, [connection, token]);

    useEffect(() => {
        console.log('useEffect: Initializing SignalR connection');
        initializeSignalRConnection();

        return () => {
            console.log('Cleaning up SignalR and PeerConnection');
            if (connection) {
                signalRHandler.stopConnection(connection);
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
        };
    }, [initializeSignalRConnection]);

    const initializeWebRTCConnection = useCallback(() => {
        console.log('Initializing WebRTC connection');
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        peerConnectionRef.current = pc;
        console.log('PeerConnection created:', pc);

        pc.onicecandidate = (event) => {
            if (event.candidate && connection) {
                console.log('ICE Candidate:', event.candidate);
                signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendICECandidate',
                    callPartnerUsername,
                    event.candidate
                );
            } else if (!event.candidate) {
                console.log('ICE Candidate gathering complete.');
            }
        };

        pc.ontrack = (event) => {
            console.log('Remote track event:', event.streams);
            if (remoteVideoRef.current) {
                console.log('Assigning stream to remoteVideoRef');
                remoteVideoRef.current.srcObject = event.streams[0];
            } else {
                console.warn('remoteVideoRef is null during ontrack event');
            }
        };

        pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection state changed:', pc.iceConnectionState);
        };

        return pc;
    }, [connection, callPartnerUsername]);


    const startLocalStream = useCallback(async () => {
        console.log('Starting local video stream');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            console.log('Local stream acquired:', stream);

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            } else {
                console.warn('localVideoRef is null');
            }

            stream.getTracks().forEach((track) => {
                console.log('Adding track to PeerConnection:', track);
                peerConnectionRef.current?.addTrack(track, stream);
            });
        } catch (error) {
            console.error('Failed to start local stream:', error);
        }
    }, []);

    const handleStartCall = useCallback(async () => {
        console.log('Starting call...');
        if (!connection) {
            console.error('SignalR connection not established');
            return;
        }

        let pc = peerConnectionRef.current ?? initializeWebRTCConnection();
        peerConnectionRef.current = pc;
        setIsCalling(true);

        try {
            await startLocalStream();
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            console.log('Sending SDP Offer:', offer);

            await signalRHandler.sendMessageThroughConnection(
                connection,
                'SendOffer',
                callPartnerUsername,
                offer
            );
        } catch (error) {
            console.error('Failed to start call:', error);
        }
    }, [callPartnerUsername, startLocalStream, initializeWebRTCConnection]);


    const handleAcceptOffer = useCallback(async () => {
        console.log('Accepting incoming call offer');
        let pc = peerConnectionRef.current ?? initializeWebRTCConnection();
        peerConnectionRef.current = pc;

        if (!incomingOffer?.offer) {
            console.error('No incoming offer available');
            return;
        }

        try {
            await startLocalStream();
            await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer.offer));
            console.log('Remote description set with incoming offer');

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            console.log('SDP Answer created and set:', answer);

            if (connection) {
                await signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendAnswer',
                    callerUsername,
                    answer
                );
            }
        } catch (error) {
            console.error('Failed to accept offer:', error);
        }
    }, [connection, callerUsername, incomingOffer, startLocalStream]);
    

    // ❌ **Decline Offer**
    const handleDeclineOffer = useCallback(() => {
        setIncomingOffer(null);
        setShowModal(false);
    }, []);


    const handleReceiveICECandidate = useCallback(async (candidate) => {
        const pc = peerConnectionRef.current;
        if (!pc) {
            setIceCandidateQueue((prevQueue) => [...prevQueue, candidate]);
            return;
        }
    
        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Failed to add ICE candidate:', error);
        }
    }, []);
    
    
    // Handle Stop Call
    const handleStopCall = useCallback(() => {
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
        setIsCalling(false);
        setIsReceiving(false);

        if (localVideoRef.current?.srcObject) {
            (localVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        }

        if (remoteVideoRef.current?.srcObject) {
            (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        }

        console.log('Call stopped');
    }, []);

    // Handle SDP Answer from Receiving User
    const handleReceiveAnswer = useCallback(async (answer) => {
        const pc = peerConnectionRef.current;
        if (!pc) {
            console.error('PeerConnection is not initialized');
            return;
        }
    
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('SDP Answer successfully set as Remote Description');
    
            // Process queued ICE candidates after SDP setup
            if (iceCandidateQueue.length > 0) {
                console.log('Processing queued ICE candidates:', iceCandidateQueue.length);
                for (const candidate of iceCandidateQueue) {
                    if (candidate && candidate.candidate && candidate.sdpMid !== null && candidate.sdpMLineIndex !== null) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
                            console.log('Queued ICE Candidate added successfully:', candidate);
                        } catch (error) {
                            console.error('Failed to add queued ICE candidate:', error, candidate);
                        }
                    } else {
                        console.warn('Invalid queued ICE Candidate skipped:', candidate);
                    }
                }
                setIceCandidateQueue([]); // Clear queue after processing
            }
        } catch (error) {
            console.error('Failed to set remote description with SDP Answer:', error);
        }
    }, [iceCandidateQueue]);
    

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
                    <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
