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
        if (!connection && token) {
            try {
                const connect = await signalRHandler.createSignalRConnection(0, token);
                setConnection(connect);

                if (connect.state !== 'Connected') {
                    await connect.start();
                }

                // Handle Incoming WebRTC Offer
                signalRHandler.onConnectionEvent(connect, 'receiveOffer', async (offer, senderUsername) => {
                    setIncomingOffer({ offer, senderUsername }); // Store both offer and senderUsername
                    setShowModal(true); // Show modal for user acceptance
                    setCallerUsername(senderUsername);
                });

                // Handle ICE candidates
                signalRHandler.onConnectionEvent(connect, 'receiveICECandidate', async (candidate) => {
                    await handleReceiveICECandidate(candidate);
                });

                // Handle SDP Answer from the Receiver
                signalRHandler.onConnectionEvent(connect, 'receiveAnswer', async (answer) => {
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
    
        // this is sending the ice candidate to the other user
        pc.onicecandidate = (event) => {
            if (event.candidate && connection) {
                const candidateData = {
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex,
                    usernameFragment: event.candidate.usernameFragment,
                };
                
                // Resolve partner username correctly
                console.log('Sending ICE Candidate:', candidateData.candidate, "to partner: ", callerUsername);



                signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendICECandidate',
                    callerUsername,
                    candidateData
                );
            } else if (!event.candidate) {
                console.log("ICE Candidate gathering complete.");
            }
        };
        
        pc.ontrack = (event) => {
            console.log('Received remote track:', event.streams);
            
            if (remoteVideoRef.current) {
                // Ensure the remote video stream is set once
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
        

        pc.oniceconnectionstatechange = () => {
            switch (pc.iceConnectionState) {
                case 'connected':
                case 'completed':
                    console.log('ICE Connection established');
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
    }, [connection, callPartnerUsername, remoteVideoRef.current]);
    

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

            console.log('Offer sent :', offer );
            console.log("with peerconnection: ", pc);

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
        }

        if (!incomingOffer?.offer) {
            console.error('No incoming offer available');
            return;
        }

        try {
            await startLocalStream();

            await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer.offer));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log("Peerconnection in accept offer: ", pc , "eith answer: ", answer);  

            if (connection) {
                await signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendAnswer',
                    callerUsername,
                    answer
                );
            }

            // ✅ Process ICE Candidate Queue
            await processIceCandidateQueue();


            setIsReceiving(true);
            setShowModal(false);
        } catch (error) {
            console.error('Failed to accept offer:', error);
        }
    }, [connection, callerUsername, incomingOffer, startLocalStream, iceCandidateQueue]);

    

    // ❌ **Decline Offer**
    const handleDeclineOffer = useCallback(() => {
        setIncomingOffer(null);
        setShowModal(false);
    }, []);

    // Handle ICE Candidate
    const handleReceiveICECandidate = useCallback(async (candidate) => {
        const pc = peerConnectionRef.current;

        console.log('Trying to receive  ICE Candidate:', candidate, "with peerconnection: ", pc);
    
        if (!pc) {
            console.warn('PeerConnection not ready, queuing ICE Candidate:', candidate);
            setIceCandidateQueue((prevQueue) => [...prevQueue, candidate]);
            return;
        }
    
        // Validate candidate
        if (!candidate || !candidate.candidate || candidate.sdpMid === null || candidate.sdpMLineIndex === null) {
            console.warn('Received invalid ICE Candidate:', candidate);
            return; // Skip invalid candidates
        }
    
        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
            console.log('ICE Candidate added successfully:', candidate);
        } catch (error) {
            console.error('Failed to add ICE candidate:', error, candidate);
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
            console.log('SDP Answer successfully set as Remote Description with pc:', pc, "and answer: ", answer);
    
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
    
    const processIceCandidateQueue = useCallback(async () => {
        const pc = peerConnectionRef.current;
        if (!pc) return;
    
        if (iceCandidateQueue.length > 0) {
            console.log('Processing queued ICE candidates:', iceCandidateQueue.length);
            for (const candidate of iceCandidateQueue) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error('Failed to add queued ICE candidate:', error);
                }
            }
            setIceCandidateQueue([]); // Clear the queue after processing
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
