import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import SignalRHandler from '../../../common/signalRHandler.ts';
import { HubConnection } from '@microsoft/signalr';
import { Box, Button, Typography } from '@mui/material';

interface GlobalCallerReceiverProps {
    token: string | null;
    callPartnerUsername: string;
}

const GlobalCallerReceiver: React.FC<GlobalCallerReceiverProps> = ({ token, callPartnerUsername }) => {
    // State Management
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [isCalling, setIsCalling] = useState(false);
    const [isReceiving, setIsReceiving] = useState(false);

    // Video Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
    const signalRHandler = new SignalRHandler();

    // SignalR Connection Initialization
    const initializeSignalRConnection = useCallback(async () => {
        if (!connection && token) {
            try {
                const connect = await signalRHandler.createSignalRConnection(0, token);
                setConnection(connect);

                // Handle incoming call offers
                signalRHandler.onConnectionEvent(connect, 'receiveOffer', async (offer) => {
                    console.log('Received WebRTC Offer:', offer);
                    await handleReceiveOffer(offer);
                });

                // Handle ICE candidates
                signalRHandler.onConnectionEvent(connect, 'receiveICECandidate', async (candidate) => {
                    console.log('Received ICE Candidate:', candidate);
                    await handleReceiveICECandidate(candidate);
                });
            } catch (error) {
                console.error('SignalR connection failed:', error);
            }
        }
    }, [connection, token]);

    useEffect(() => {
        initializeSignalRConnection();
        return () => {
            connection && signalRHandler.stopConnection(connection);
            peerConnection && peerConnection.close();
        };
    }, [initializeSignalRConnection, connection, peerConnection]);

    // Initialize WebRTC Connection
    const initializeWebRTCConnection = useCallback(() => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }, // Free STUN server
            ],
        });

        // Handle ICE Candidate Event
        pc.onicecandidate = (event) => {
            if (event.candidate && connection) {
                console.log('Sending ICE Candidate:', event.candidate);
                signalRHandler.sendMessageThroughConnection(
                    connection,
                    'sendICECandidate',
                    callPartnerUsername,
                    event.candidate
                );
            }
        };

        // Handle Remote Stream
        pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        setPeerConnection(pc);
        return pc;
    }, [connection, callPartnerUsername]);

    // Start Local Video Stream
    const startLocalStream = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            stream.getTracks().forEach((track) => {
                peerConnection?.addTrack(track, stream);
            });

            console.log('Local stream started');
        } catch (error) {
            console.error('Failed to start local stream:', error);
        }
    }, [peerConnection]);

    // Handle Call Start
    const handleStartCall = useCallback(async () => {
        if (!connection || !peerConnection) return;

        setIsCalling(true);
        await startLocalStream();

        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            // Send SDP Offer through SignalR
            await signalRHandler.sendMessageThroughConnection(
                connection,
                'sendOffer',
                callPartnerUsername,
                offer
            );
            console.log('SDP Offer sent');
        } catch (error) {
            console.error('Failed to start call:', error);
        }
    }, [connection, peerConnection, callPartnerUsername, startLocalStream]);

    // Handle Receiving Offer
    const handleReceiveOffer = useCallback(async (offer) => {
        if (!peerConnection) return;

        await startLocalStream();
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        if (connection) {
            await signalRHandler.sendMessageThroughConnection(
                connection,
                'sendAnswer',
                callPartnerUsername,
                answer
            );
        }

        setIsReceiving(true);
        console.log('SDP Answer sent');
    }, [peerConnection, connection, callPartnerUsername, startLocalStream]);

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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Video Call with {callPartnerUsername}</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <video ref={localVideoRef} autoPlay muted style={{ width: '48%', borderRadius: '8px', background: '#000' }} />
                <video ref={remoteVideoRef} autoPlay style={{ width: '48%', borderRadius: '8px', background: '#000' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="contained" onClick={handleStartCall} disabled={isCalling || isReceiving}>
                    Start Call
                </Button>
                <Button variant="contained" color="error" onClick={handleStopCall}>
                    Stop Call
                </Button>
            </Box>
        </Box>
    );
};

export default GlobalCallerReceiver;
