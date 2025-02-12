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
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const connectionref = useRef<HubConnection | null>(null);
    const [incomingOffer, setIncomingOffer] = useState<any | null>(null); // Store SDP offer
    const [isCalling, setIsCalling] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);
    const [showModal, setShowModal] = useState(false); // Modal for Accept/Decline Call
    const [callerUsername, setCallerUsername] = useState<string>('');
    const [iceCandidateQueue, setIceCandidateQueue] = useState<any[]>([]);
    const [callStopped, setCallStopped] = useState(false);
    
    //testing errors with media
    const [mediaError, setMediaError] = useState<string | null>(null);

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
                connectionref.current = connect;
                console.log("connection set to ref: ", connectionref.current);


                if (connect.state !== 'Connected') {
                    await connect.start();
                }

                // Handle Incoming WebRTC Offer
                signalRHandler.onConnectionEvent(connect, 'receiveOffer', async (offer, senderUsername) => {
                    console.log('Received incoming offer from:', senderUsername);
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
                //Handling ending the call from other clients
                signalRHandler.onConnectionEvent(connect, 'endCall', async () => {
                    // refreshComponent();
                    console.log("Received endCall event from SignalR");
                    setCallStopped(true);
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

    useEffect(() => {
        if (callStopped) {
            console.log("Refreshing component after callStopped");
    
            // Clean local states
            setIsCalling(false);
            setIsReceiving(false);
            setIncomingOffer(null);
            setRemoteStream(null);
    
            // Reset media tracks
            if (localVideoRef.current?.srcObject) {
                (localVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
            }
            if (remoteVideoRef.current?.srcObject) {
                (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
            }
    
            // Clean up peer connection
            peerConnectionRef.current?.close();
            peerConnectionRef.current = null;
    
            setCallStopped(false); // Reset after handling
        }
    }, [callStopped]);
    
    // 🎥 **Initialize WebRTC Connection**
    const initializeWebRTCConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });
        peerConnectionRef.current = pc;

        // Log ICE connection state changes
        pc.oniceconnectionstatechange = () => {
            console.log(`ICE Connection State: ${pc.iceConnectionState}`);
        };
    
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
                const targetUsername = callPartnerUsername || callerUsername || "";

                console.log("CallPartnerUsername:   ", callPartnerUsername);
                console.log("CallerUsername:", callerUsername);

                if (!targetUsername) {
                    console.error('No valid callPartnerUsername or senderUsername found. ICE Candidate cannot be sent.');
                    return;
                }

                signalRHandler.sendMessageThroughConnection(
                    connection,
                    'SendICECandidate',
                    targetUsername,
                    candidateData
                );
            } else if (!event.candidate) {
            }
        };
        
        pc.ontrack = (event) => {

            console.log("🎥 Received track:", event.track.kind, event.streams[0]);

            if (!event.streams[0]) {
                console.warn("⚠️ No streams in ontrack event!");
                return;
            }
            
            if (remoteVideoRef.current) {
                // Ensure the remote video stream is set once
                if (!remoteVideoRef.current.srcObject) {
                    console.log("🔄 Assigning remote stream to video element");
                    remoteVideoRef.current.srcObject = event.streams[0];
                } else {
                    // Add new tracks if they aren't already in the stream
                    console.log("➕ Adding new track to existing stream");
                    const remoteStream = remoteVideoRef.current.srcObject as MediaStream;

                    event.streams[0].getTracks().forEach(track => {
                        if (!remoteStream.getTracks().includes(track)) {
                            remoteStream.addTrack(track);
                        }
                    });

                    remoteVideoRef.current.load();
                }
            } else {
                console.warn("⚠️ Remote video ref is null, cannot set stream");
            }
        };
        

        pc.oniceconnectionstatechange = () => {
            switch (pc.iceConnectionState) {
                case 'connected':
                case 'completed':
                    break;
                case 'failed':
                case 'disconnected':
                case 'closed':
                    console.warn('ICE Connection failed, disconnected, or closed');
                    break;
                default:
            }
        };
            
        return pc;
    }, [connection, callPartnerUsername, remoteVideoRef.current]);
    

    const startLocalStream = useCallback(async () => {
        try {
            // Request media stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    
            console.log("✅ Local stream obtained:", stream);
    
            // Set local video
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            } else {
                console.warn("⚠️ Local video ref is null");
            }
    
            // Attach tracks to PeerConnection
            stream.getTracks().forEach(track => {
                peerConnectionRef.current?.addTrack(track, stream);
            });
    
        } catch (error) {
            console.error('❌ Error accessing media devices:', error);
            setMediaError('Please grant camera and microphone access for the call to work.');
        }
    }, []);
    

    // 📞 **Handle Call Start**
    const handleStartCall = useCallback(async () => {
        if (!connection) {
            console.error('❌ SignalR connection is not established');
            return;
        }
    
        try {
            // Get media before initializing WebRTC
            await startLocalStream();
            
            let pc = peerConnectionRef.current ?? initializeWebRTCConnection();
            peerConnectionRef.current = pc;
            setIsCalling(true);
    
            console.log("📞 Creating WebRTC Offer...");

            // 🔥 Ensure tracks are added
            if (localVideoRef.current?.srcObject) {
                (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => {
                    const senders = pc.getSenders();
                    const alreadyAdded = senders.some(sender => sender.track === track);
    
                    if (!alreadyAdded && localVideoRef.current) {
                        console.log("📡 Adding local track:", track.kind);
                        pc.addTrack(track, localVideoRef.current.srcObject as MediaStream);
                    } else {
                        console.warn("⚠️ Track already added:", track.kind);
                    }
                });
            }

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
    
            console.log("🚀 Sending WebRTC Offer to:", callPartnerUsername);
            await signalRHandler.sendMessageThroughConnection(
                connection,
                'SendOffer',
                callPartnerUsername,
                offer
            );
    
        } catch (error) {
            console.error('❌ Failed to start call:', error);
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

        // 🔥 Ensure `callerUsername` is set before accepting the offer
        if (!callerUsername && incomingOffer.senderUsername) {
            console.log("📌 Setting callerUsername:", incomingOffer.senderUsername);
            setCallerUsername(incomingOffer.senderUsername);
        }

        try {
            await startLocalStream();

            console.log("✅ Setting Remote Description with received offer...");
            await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer.offer));

            // 🔥 Prevent duplicate track addition
            if (localVideoRef.current?.srcObject) {
                const localStream = localVideoRef.current.srcObject as MediaStream;

                localStream.getTracks().forEach(track => {
                    const senders = pc.getSenders();
                    const alreadyAdded = senders.some(sender => sender.track === track);

                    if (!alreadyAdded) {
                        console.log("📡 Adding local track:", track.kind);
                        pc.addTrack(track, localStream);
                    } else {
                        console.warn("⚠️ Track already added:", track.kind);
                    }
                });
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

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
    }, [connection, incomingOffer, startLocalStream, iceCandidateQueue
        // ,callerUsername
    ]);

    

    // ❌ **Decline Offer**
    const handleDeclineOffer = useCallback(() => {
        setIncomingOffer(null);
        setShowModal(false);
    }, []);

    // Handle ICE Candidate
    const handleReceiveICECandidate = useCallback(async (candidate) => {
        const pc = peerConnectionRef.current;

        if (!pc) {
            console.warn('⚠️ PeerConnection not ready, queuing ICE Candidate:', candidate);
            setIceCandidateQueue((prevQueue) => [...prevQueue, candidate]);
            return;
        }

        console.log("📡 Adding ICE Candidate:", candidate);
    
        // Validate candidate
        if (!candidate || !candidate.candidate || candidate.sdpMid === null || candidate.sdpMLineIndex === null) {
            console.warn('Received invalid ICE Candidate:', candidate);
            return; // Skip invalid candidates
        }
    
        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Failed to add ICE candidate:', error, candidate);
        }
    }, []);

    const handleStopCall = useCallback(() => {
        if (!peerConnectionRef.current) {
            console.warn("Call is already stopped.");
            return;
        }
    
        console.log("Ending the call...");
    
        if (connectionref.current) {
            signalRHandler.sendMessageThroughConnection(
                connectionref.current,
                'EndCallForAllParticipants',
                "EndCall",
            );
        } else {
            console.error('SignalR connection is not established');
        }
    
        peerConnectionRef.current?.close();
        peerConnectionRef.current = null;
    
        setIsCalling(false);
        setIsReceiving(false);
        setCallStopped(true);
    
        if (localVideoRef.current?.srcObject) {
            (localVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        }
        if (remoteVideoRef.current?.srcObject) {
            (remoteVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
        }
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
    
            // Process queued ICE candidates after SDP setup
            if (iceCandidateQueue.length > 0) {
                for (const candidate of iceCandidateQueue) {
                    if (candidate && candidate.candidate && candidate.sdpMid !== null && candidate.sdpMLineIndex !== null) {
                        try {
                            await pc.addIceCandidate(new RTCIceCandidate(candidate));
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
            {mediaError && (
                <div
                    style={{
                        position: 'fixed',
                        top: '10%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        zIndex: 1000,
                    }}
                >
                    <strong>⚠️ Media Access Error:</strong>
                    <p>{mediaError}</p>
                </div>
            )}

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
