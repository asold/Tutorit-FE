import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useDispatch, useSelector } from 'react-redux';

const VideoCallReceiver = ({ token, onReceiveCall }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(new MediaSource());
    const sourceBufferRef = useRef< SourceBuffer | null>(null);
    const [error, setError] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [callReceived, setCallReceived] = useState(false);
    const callIsActive = useSelector((state:any) => state.videoCall.accepted); // this will track if user accepted the call 
    const [bufferReady, setBufferReady] = useState(false);
    
    


    const setupMediaSource = useCallback(() => {
        if (!videoRef.current || !window.MediaSource) {
            setError('MediaSource API is not supported in your browser.');
            return;
        }

        let mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        videoRef.current.src = URL.createObjectURL(mediaSource);

        mediaSourceRef.current.addEventListener('sourceopen', () => {
            try {
                if (mediaSourceRef.current) {
                    const sourceBuffer = mediaSourceRef.current.addSourceBuffer('video/webm; codecs="vp8"');
                    sourceBufferRef.current = sourceBuffer;
                    console.log("Media source and source buffer are ready");
                }
            } catch (e) {
                console.error('Error creating source buffer:', e);
            }
        }, { once: true });
    }, []);

    useEffect(() => {

        if (!window.MediaSource) {
            setError('MediaSource API is not supported in your browser.');
            return;
        }

        const connect = new HubConnectionBuilder()
            .withUrl(`http://localhost:8000/hub?userToken=${encodeURIComponent(token)}`)
            .withAutomaticReconnect()
            .withHubProtocol(new MessagePackHubProtocol())
            .configureLogging(LogLevel.Information)
            .build();

        const startConnection = async () => {
            try {
                await connect.start();
                console.log('Receiver SignalR connection established');
                setConnection(connect);
                setupMediaSource(); // Setup media source on successful connection
            } catch (err) {
                console.error('Error while establishing SignalR connection:', err);
            }
        };

        startConnection();
        
        const keepAliveInterval = setInterval(() => {
            if (connect.state === 'Connected') {
                connect.invoke("KeepAlive").catch(err => console.error("KeepAlive error:", err));
            }
        }, 15000); // Check and send KeepAlive every 15 seconds

        connect.onclose(() => {
            console.log("Connection lost. Attempting to reconnect...");
            setupMediaSource(); // Ensure fresh setup after reconnection
        });

        return () => {
            clearInterval(keepAliveInterval);
            if (connect) {
                connect.stop().then(() => console.log('SignalR connection closed'));
            }
            if (mediaSourceRef.current && mediaSourceRef.current.readyState !== "closed") {
                mediaSourceRef.current.endOfStream();
                mediaSourceRef.current = null;
            }
        };
    }, [token, setupMediaSource]);

    useEffect(() => {
        if (!connection || !mediaSourceRef.current) return;

        const receiveVideoStream = (fromUser, data) => {
            console.log('CALL IS ACTIVE VALUE:', callIsActive)

            if (!callReceived) {
                onReceiveCall();
                setCallReceived(true);
            }
            
            if(callIsActive){
                if (mediaSourceRef.current && sourceBufferRef.current) {
                    if (mediaSourceRef.current.readyState === 'open' && !sourceBufferRef.current.updating) {
                        sourceBufferRef.current.appendBuffer(data);
                        if (timeoutRef.current) {
                            clearTimeout(timeoutRef.current);
                        }
                        timeoutRef.current = setTimeout(() => {
                            if (mediaSourceRef.current && sourceBufferRef.current && mediaSourceRef.current.readyState === 'open') {
                                mediaSourceRef.current.endOfStream();
                                mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
                                setupMediaSource();
                            }
                            else{
                                console.log("Attempted to end stream but MediaSource is not 'open'");
                            }
                        }, 3000);
                    } else {
                        console.log("Buffer is currently updating or not ready.");
                    }
                }
            }
        };

        connection.on('ReceiveVideoStream', receiveVideoStream);

        return () => {
            connection.off('ReceiveVideoStream', receiveVideoStream);
        };
    }, [connection, callReceived, onReceiveCall, callIsActive]);

    
    return (
        <div>
            {error ? (
                <div>Error: {error}</div>
            ) : (
                <>
                    <h1>Connection ID: {connection ? connection.connectionId : 'Not connected'}</h1>
                    <h2>Received Video Stream</h2>
                    <video ref={videoRef} autoPlay muted />
                </>
            )}
        </div>
    );
    
};

export default VideoCallReceiver;
