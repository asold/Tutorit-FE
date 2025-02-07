import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import SignalRHandler from '../../../common/signalRHandler.ts';
import { HubConnection } from '@microsoft/signalr';
import { Box, Button, Typography } from '@mui/material';

interface CallerProps {
    token: string | null;
    callPartnerUsername: string; // <-- Now passed in from the parent
}

const GobalCaller: React.FC<CallerProps> = ({ token, callPartnerUsername }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [receiverCallAccepted, setReceiverCallAccepted] = useState(false);

    // Keep using your Redux states, if needed:
    const isReceiving = useSelector((state: any) => state.receiver.isReceiving);
    const initialCallerUserName = useSelector((state: any) => state.receiver.initialCallerUserName);

    // The rest of your logic for building and managing the connection is unchanged:
    const signalRHandler = new SignalRHandler();

    // the connection through a socket is initialized for the Global Caller component
    const initializeConnection = useCallback(async () => {
        if (!connection && !isConnecting) {
            setIsConnecting(true);
            try {
                if(token!==null){
                    const connect = await signalRHandler.createSignalRConnection(0, token);
                    setConnection(connect);
                    setIsConnecting(false);
    
                    // Keep your event listeners as is
                    signalRHandler.onConnectionEvent(connect, 'callaccepted', () => {
                        setReceiverCallAccepted(true);
                    });
                }
            } catch (err) {
                console.error('Error while establishing SignalR connection:', err);
                setIsConnecting(false);
            }
        }
    }, [connection, isConnecting, token]);

    // Initialize connection on mount and clean up on unmount
    useEffect(() => {
        initializeConnection();
        return () => {
            if (connection) {
                signalRHandler.stopConnection(connection);
            }
        };
    }, [connection, initializeConnection]);

    const startRecording = useCallback((stream: MediaStream, connectionType: string) => {
        const options = { mimeType: 'video/webm; codecs=vp8' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.error(`${options.mimeType} is not supported`);
            return;
        }

        const recorder = new MediaRecorder(stream, options);
        recorder.ondataavailable = async (event) => {
            if (event.data && event.data.size > 0 && connection && connection.state === 'Connected') {
                const arrayBuffer = await event.data.arrayBuffer();
                try {
                    if (connectionType === "ReceiveVideoStream") {
                        await signalRHandler.sendMessageThroughConnection(
                            connection,
                            'ReceiveVideoStream',
                            callPartnerUsername,
                            new Uint8Array(arrayBuffer)
                        );
                        console.log('Chunk of data sent to ReceiveVideoStream');
                    } else if (connectionType === "SendVideoToSender") {
                        await signalRHandler.sendMessageThroughConnection(
                            connection,
                            'SendVideoToSender',
                            initialCallerUserName,
                            new Uint8Array(arrayBuffer),
                            "TESTING"
                        );
                        console.log('Chunk of data sent to SendVideoToSender');
                    }
                } catch (error) {
                    console.error('Error sending video chunk:', error);
                }
            }
        };

        recorder.onerror = (error) => console.error('MediaRecorder error:', error);
        recorder.onstart = () => {
            console.log('MediaRecorder GlobalCaller started');
            setIsRecording(true);
        };
        recorder.onstop = () => {
            console.log('MediaRecorder GlobalCaller stopped');
            setIsRecording(false);
        };

        recorder.start(50);
        setMediaRecorder(recorder);
    }, [connection, callPartnerUsername, initialCallerUserName, signalRHandler]);

    const startCamera = useCallback(async (connectionType: string) => {
        if (!isRecording) {
            console.log('Attempting to access camera...');
            const constraints = { video: true };
            try {
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                setVideoStream(stream);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                console.log('Camera feed set to video element');
                startRecording(stream, connectionType);
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        }
    }, [isRecording, startRecording]);

    const handleStartCameraClick = useCallback(async () => {
        //1. This part sends the request through the server to the partner
        // so that the partner can accept the call
        if (connection) {
            console.log('Requesting call with: ', callPartnerUsername);
            await signalRHandler.sendMessageThroughConnection(
                connection,
                'RequestCallUser',
                callPartnerUsername
            );
        }
    }, [connection, callPartnerUsername, signalRHandler]);

    useEffect(() => {
        //2. The original sender/caller starts recording the video and sending it
        if (receiverCallAccepted) {
            startCamera('ReceiveVideoStream');
        }
    }, [receiverCallAccepted, startCamera]);

    useEffect(() => {
        //3. If this is the receiver, start recording the video and sending it back
        if (isReceiving) {
            startCamera('SendVideoToSender');
        }
    }, [isReceiving, initialCallerUserName, startCamera]);

    const handleStopCameraClick = useCallback(async () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }

        if (videoStream) {
            videoStream.getTracks().forEach(track => {
                console.log('Stopping track:', track.kind);
                track.stop();
            });
            setVideoStream(null);
        }

        if (connection) {
            try {
                await signalRHandler.sendMessageThroughConnection(connection, 'PrepareForDisconnection');
                console.log('Server notified for disconnection');
            } catch (error) {
                console.error('Error notifying server:', error);
            }
            console.log('Closing SignalR connection...');
            await signalRHandler.stopConnection(connection);
            setConnection(null);
        }

        setReceiverCallAccepted(false);
    }, [mediaRecorder, videoStream, connection, signalRHandler]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                // gap: 2,
                // p: 2,
                border: '0.1rem solid #ddd',
                borderRadius: '0.3rem',
                overflow: 'hidden',
                height: '100%',
                width: '100%',
            }}
        >
            {/* <Typography variant="h6" fontWeight="bold">
                Make Video Call
            </Typography> */}

            <Typography variant="body2">
                <strong>Selected Partner:</strong> {callPartnerUsername || '(none)'}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStartCameraClick}
                    disabled={
                        isConnecting ||
                        isRecording ||
                        receiverCallAccepted ||
                        isReceiving ||
                        !callPartnerUsername
                    }
                >
                    Call Person
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleStopCameraClick}
                    disabled={isConnecting || !isRecording}
                >
                    Stop Call
                </Button>
            </Box>

            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    mt: 2,
                    borderRadius: '0.3rem',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                }}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            </Box>
        </Box>
    );
};

export default GobalCaller;
