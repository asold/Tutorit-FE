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

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);



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
            if (peerConnectionRef.current) {
                console.log("Closing peerConnection");
                peerConnectionRef.current.close();
            }
        };
    }, [initializeSignalRConnection]);

    // 🎥 **Initialize WebRTC Connection**
    const initializeWebRTCConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
    
        peerConnectionRef.current = pc;
    
        pc.onicecandidate = (event) => {
            if (event.candidate && connection) {
                console.log("Sending ICE Candidate to the other peer:", event.candidate);
                signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendICECandidate',
                    callPartnerUsername,
                    event.candidate
                );
            } else if (!event.candidate) {
                console.log("ICE Candidate gathering complete.");
            }
        };
        
        pc.ontrack = (event) => {
            console.log('Received remote track:', event.streams);
            setRemoteStream(event.streams[0]);
        };
    
    
        // pc.ontrack = (event) => {
        //     console.log('Received remote track:', event.streams);
        //     if (remoteVideoRef.current && event.streams[0]) {
        //         console.log('Setting remote stream to video element');
        //         remoteVideoRef.current.srcObject = event.streams[0];
        //     }
        // };
    
        pc.ontrack = (event) => {
            console.log('Received remote track:', event.streams);
        
            if (remoteVideoRef.current) {
                if (!remoteVideoRef.current.srcObject) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    console.log('Remote video stream set successfully');
                } else {
                    // Add new tracks if they aren't already in the stream
                    const remoteStream = remoteVideoRef.current.srcObject as MediaStream;
                    event.streams[0].getTracks().forEach(track => {
                        if (!remoteStream.getTracks().includes(track)) {
                            remoteStream.addTrack(track);
                            console.log('Added new track to remote stream');
                        }
                    });
                }
            } else {
                console.warn('Remote video ref is null, cannot set remote stream');
            }
        };
        
        console.log('Remote Video Ref:', remoteVideoRef.current);
        console.log('Remote Video Stream:', remoteVideoRef.current?.srcObject);


        pc.oniceconnectionstatechange = () => {
            console.log('ICE Connection State:', pc.iceConnectionState);
            switch (pc.iceConnectionState) {
                case 'connected':
                case 'completed':
                    console.log('ICE Connection successfully established');
                    break;
                case 'failed':
                case 'disconnected':
                case 'closed':
                    console.warn('ICE Connection failed, disconnected, or closed');
                    break;
                default:
                    console.log('ICE Connection state:', pc.iceConnectionState);
            }
        };
        
        

        console.log("WebRTC PeerConnection initialized:", pc);
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
                peerConnectionRef.current?.addTrack(track, stream);
            });
        } catch (error) {
            console.error('Failed to start local stream:', error);
        }
    }, [peerConnectionRef.current]);

    // 📞 **Handle Call Start**
    const handleStartCall = useCallback(async () => {
        if (!connection) {
            console.error('SignalR connection is not established');
            return;
        }
    
        let pc = peerConnectionRef.current ?? initializeWebRTCConnection();
        peerConnectionRef.current = pc;
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
    }, [callPartnerUsername, startLocalStream, initializeWebRTCConnection]);
    

   // ✅ **Accept Offer**
    const handleAcceptOffer = useCallback(async () => {
        let pc = peerConnectionRef.current;
        if (!pc) {
            pc = initializeWebRTCConnection();
            peerConnectionRef.current = pc;
            console.log("PeerConnection initialized during offer acceptance");
        }

        if (!incomingOffer?.offer) {
            console.error('No incoming offer available');
            return;
        }

        try {
            await startLocalStream();

            console.log("SDP offer from Caller:", incomingOffer.offer);
            await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer.offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log("SDP answer from Receiver:", answer);

            if (connection) {
                await signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendAnswer',
                    callerUsername,
                    answer
                );
            }

            // ✅ Process ICE Candidate Queue
            if (iceCandidateQueue.length > 0) {
                console.log("Processing queued ICE candidates:", iceCandidateQueue.length);
                for (const queuedCandidate of iceCandidateQueue) {
                    if (queuedCandidate && queuedCandidate.candidate && queuedCandidate.sdpMid !== null && queuedCandidate.sdpMLineIndex !== null) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(queuedCandidate));
                            console.log('Queued ICE Candidate added successfully:', queuedCandidate);
                        } catch (error) {
                            console.error('Failed to add queued ICE candidate:', error);
                        }
                    } else {
                        console.warn('Invalid queued ICE Candidate skipped:', queuedCandidate);
                    }
                }
                setIceCandidateQueue([]); // Clear the queue after processing
            }
            


            setIsReceiving(true);
            setShowModal(false);
            console.log('SDP Answer sent and ICE candidates processed');
        } catch (error) {
            console.error('Failed to accept offer:', error);
        }
    }, [connection, callerUsername, incomingOffer, startLocalStream, iceCandidateQueue]);

    

    // ❌ **Decline Offer**
    const handleDeclineOffer = useCallback(() => {
        setIncomingOffer(null);
        setShowModal(false);
        console.log('Call declined by user');
    }, []);

    // Handle ICE Candidate
    const handleReceiveICECandidate = useCallback(async (candidate) => {
        const pc = peerConnectionRef.current;
    
        if (!pc) {
            console.warn('PeerConnection not ready, queuing ICE Candidate:', candidate);
            setIceCandidateQueue((prevQueue) => [...prevQueue, candidate]);
            return;
        }
    
        if (candidate && candidate.candidate && candidate.sdpMid !== null && candidate.sdpMLineIndex !== null) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                console.log('ICE Candidate added successfully:', candidate);
            } catch (error) {
                console.error('Failed to add ICE candidate:', error);
            }
        } else {
            console.warn('Received invalid ICE Candidate:', candidate);
        }
    }, []);
    
    
    // const handleReceiveICECandidate = useCallback(async (candidate) => {
    //     const pc = peerConnectionRef.current;
    
    //     // Validate candidate
    //     if (!candidate || !candidate.candidate) {
    //         console.warn('Received invalid ICE Candidate:', candidate);
    //         return;
    //     }
    
    //     if (!pc) {
    //         console.warn('PeerConnection not ready, queuing ICE Candidate:', candidate);
    //         setIceCandidateQueue((prevQueue) => [...prevQueue, candidate]);
    //         return;
    //     }
    
    //     try {
    //         await pc.addIceCandidate(new RTCIceCandidate(candidate));
    //         console.log('ICE Candidate added successfully');
    //     } catch (error) {
    //         console.error('Failed to add ICE candidate:', error);
    //     }
    // }, []);
    

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

        // ✅ Process ICE Candidate Queue After SDP Answer
        if (iceCandidateQueue.length > 0) {
            console.log("Processing queued ICE candidates:", iceCandidateQueue.length);
            for (const queuedCandidate of iceCandidateQueue) {
                if (queuedCandidate && queuedCandidate.candidate && queuedCandidate.sdpMid !== null && queuedCandidate.sdpMLineIndex !== null) {
                    try {
                        await pc.addIceCandidate(new RTCIceCandidate(queuedCandidate));
                        console.log('Queued ICE Candidate added successfully:', queuedCandidate);
                    } catch (error) {
                        console.error('Failed to add queued ICE candidate:', error);
                    }
                } else {
                    console.warn('Invalid queued ICE Candidate skipped:', queuedCandidate);
                }
            }
            setIceCandidateQueue([]); // Clear the queue after processing
        }
        
    
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('SDP Answer successfully set as Remote Description');
        } catch (error) {
            console.error('Failed to set remote description with SDP Answer:', error);
        }
    }, []);
    

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
