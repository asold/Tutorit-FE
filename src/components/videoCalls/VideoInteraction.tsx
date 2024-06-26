import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';

const VideoInteraction = ({ token }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const dispatch = useDispatch<ThunkDispatch<any, any, AnyAction>>();
    const [callPartnerUsername, setCallPartnerUsername] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
    const [receiverCallAccepted, setReceiverCallAccepted] = useState(false);
    const [key, setKey] = useState(0); // Add a key state to force re-render

    const handlePartnerUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCallPartnerUsername(e.target.value);
    }, []);

    const initializeConnection = useCallback(() => {
        if (!connection && !isConnecting) {
            setIsConnecting(true);
            const userToken = encodeURIComponent(token);
            const connect = new HubConnectionBuilder()
                .withUrl(`http://localhost:8000/hub?userToken=${encodeURIComponent(token)}&connectionType=${0}`)
                .withAutomaticReconnect()
                .withHubProtocol(new MessagePackHubProtocol())
                .build();


            connect.start().then(() => {
                console.log('SignalR connection established in Sender');
                setConnection(connect);
                setIsConnecting(false);

                // Listen for the 'callaccepted' event
                connect.on('callaccepted', () => {
                    console.log('Call accepted by receiver');
                    setReceiverCallAccepted(true);
                });

            }).catch(err => {
                console.error('Error while establishing SignalR connection:', err);
                setIsConnecting(false);
            });
        }
    }, [connection, isConnecting, token]);

    useEffect(() => {
        initializeConnection();
        return () => {
            if (connection) {
                connection.stop().then(() => {
                    console.log('SignalR connection closed');
                    setConnection(null);
                });
            }
        };
    }, [connection, initializeConnection]);

    const startRecording = useCallback((stream) => {
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
                    await connection.send('ReceiveVideoStream', callPartnerUsername, new Uint8Array(arrayBuffer));
                    console.log('Chunk of data sent');
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

        recorder.start(1);
        setMediaRecorder(recorder);
    }, [connection, callPartnerUsername]);

    const startCamera = useCallback(async () => {
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
                startRecording(stream);
            } catch (error) {
                console.error('Error accessing camera:', error);
            }
        }
    }, [isRecording, startRecording]);

    const handleStartCameraClick = useCallback(async () => {
        if (connection) {
            await connection.send('RequestCallUser', callPartnerUsername); // Custom method on server
        }
    }, [connection, callPartnerUsername]);

    // Effect to start camera when receiverCallAccepted is true
    useEffect(() => {
        if (receiverCallAccepted) {
            console.log('Starting camera after call accepted');
            startCamera();
        }
    }, [receiverCallAccepted, startCamera]);

    const handleStopCameraClick = useCallback(async () => {
        console.log('Stop camera click');

        // Stop the media recorder if it's recording
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            console.log('MediaRecorder stopped');
        }

        // Stop all tracks from the video stream
        if (videoStream) {
            videoStream.getTracks().forEach(track => {
                console.log('Stopping track:', track.kind);
                track.stop();
            });
            setVideoStream(null); // Clear the video stream
        }

        // Notify the server that the client is about to disconnect
        if (connection) {
            try {
                await connection.send('PrepareForDisconnection'); // Custom method on server
                console.log('Server notified for disconnection');
            } catch (error) {
                console.error('Error notifying server:', error);
            }

            console.log('Closing SignalR connection...');
            await connection.stop()
                .then(() => {
                    console.log('SignalR connection closed');
                    setConnection(null); // Reset connection state to null
                })
                .catch(error => {
                    console.error('Failed to close SignalR connection:', error);
                });
        }

        // Reset the call accepted state and refresh the component
        setReceiverCallAccepted(false);
        setKey(prevKey => prevKey + 1); // Update the key to force re-render
    }, [mediaRecorder, videoStream, connection, initializeConnection]);

    return (
        <div key={key}>
            <h1>Video Interaction</h1>
            <div>
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" value={callPartnerUsername} onChange={handlePartnerUsernameChange} required />
                <button onClick={handleStartCameraClick} disabled={isConnecting || isRecording || receiverCallAccepted}>Call Person</button>
                <button onClick={handleStopCameraClick} disabled={isConnecting || !isRecording}>Stop Call</button>
            </div>
            <video ref={videoRef} autoPlay playsInline />
        </div>
    );
};

export default VideoInteraction;
