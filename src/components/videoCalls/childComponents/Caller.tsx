import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import SignalRHandler from '../../../common/signalRHandler.ts';
import { HubConnection } from '@microsoft/signalr';
import UserStatusDropdown from '../../users/UserStatusDropdown.tsx'; // Adjust the import path as needed

const Caller: React.FC<{ token }> = ({ token }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [receiverCallAccepted, setReceiverCallAccepted] = useState(false);
    const [key, setKey] = useState(0);

    const isReceiving = useSelector((state: any) => state.receiver.isReceiving);
    const initialCallerUserName = useSelector((state: any) => state.receiver.initialCallerUserName);
    
    const selectedCallPartnerUsername = useSelector((state: any) => state.callPartner.callPartnerUsername);

    // The state is now based on the selected username from the dropdown
    const [callPartnerUsername, setCallPartnerUsername] = useState(selectedCallPartnerUsername || '');

    // Synchronize callPartnerUsername with selectedCallPartnerUsername from Redux
    useEffect(() => {
        setCallPartnerUsername(selectedCallPartnerUsername);
    }, [selectedCallPartnerUsername]);

    const signalRHandler = new SignalRHandler();

    const initializeConnection = useCallback(async () => {
        if (!connection && !isConnecting) {
            setIsConnecting(true);
            try {
                const connect = await signalRHandler.createSignalRConnection(0, token);
                setConnection(connect);
                setIsConnecting(false);

                signalRHandler.onConnectionEvent(connect, 'callaccepted', () => {
                    console.log('Call accepted by receiver');
                    setReceiverCallAccepted(true);
                });

            } catch (err) {
                console.error('Error while establishing SignalR connection:', err);
                setIsConnecting(false);
            }
        }
    }, [connection, isConnecting, token]);

    useEffect(() => {
        initializeConnection();
        return () => {
            if (connection) {
                signalRHandler.stopConnection(connection);
            }
        };
    }, [connection, initializeConnection]);

    const startRecording = useCallback((stream, connectionType) => {
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
                        await signalRHandler.sendMessageThroughConnection(connection, 'ReceiveVideoStream', callPartnerUsername, new Uint8Array(arrayBuffer));
                        console.log('Chunk of data sent to ReceiveVideoStream');
                    } else if (connectionType === "SendVideoToSender") {
                        await signalRHandler.sendMessageThroughConnection(connection, 'SendVideoToSender', initialCallerUserName, new Uint8Array(arrayBuffer), "TESTING");
                        console.log('Chunk of data sent to SendVideoToSender');
                    }
                } catch (error) {
                    console.error('Error sending video chunk:', error);
                }
            }
        };

        recorder.onerror = (error) => console.error('MediaRecorder error:', error);
        recorder.onstart = () => {
            console.log('MediaRecorder started');
            setIsRecording(true);
        };
        recorder.onstop = () => {
            console.log('MediaRecorder stopped');
            setIsRecording(false);
        };

        recorder.start(100);
        setMediaRecorder(recorder);
    }, [connection, callPartnerUsername, initialCallerUserName]);

    const startCamera = useCallback(async (connectionType) => {
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
        if (connection) {
            await signalRHandler.sendMessageThroughConnection(connection, 'RequestCallUser', callPartnerUsername);
        }
    }, [connection, callPartnerUsername]);

    useEffect(() => {
        if (receiverCallAccepted) {
            console.log('Starting camera after Call Accepted!!');
            startCamera('ReceiveVideoStream');
        }
    }, [receiverCallAccepted, startCamera]);

    useEffect(() => {
        if (isReceiving) {
            console.log('Starting camera after isReceiving is True!!!');
            startCamera('SendVideoToSender');
        }
    }, [isReceiving, initialCallerUserName, startCamera]);

    const handleStopCameraClick = useCallback(async () => {
        console.log('Stop camera click');
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            console.log('MediaRecorder stopped');
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
        setKey(prevKey => prevKey + 1);
    }, [mediaRecorder, videoStream, connection]);

    return (
        <div key={key}>
            <h1>Make Video Call</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label htmlFor="username">Username:</label>
                <UserStatusDropdown token={token} /> {/* Add the dropdown here */}
            </div>
            <div>
                <button 
                    onClick={handleStartCameraClick} 
                    disabled={
                        isConnecting || 
                        isRecording || 
                        receiverCallAccepted || 
                        isReceiving || 
                        !callPartnerUsername // Enable button only if a username is selected
                    }
                >
                    Call Person
                </button>
                <button onClick={handleStopCameraClick} disabled={isConnecting || !isRecording}>Stop Call</button>
            </div>
            <video ref={videoRef} autoPlay playsInline />
        </div>
    );
};

export default Caller;
