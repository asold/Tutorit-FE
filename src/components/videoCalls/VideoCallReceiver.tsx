import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import { setReceiverConnectionId } from '../../actions/videoActions/videoActions.ts';

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
    const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();


    const initMediaSource = async () => {
        if (!videoRef.current) {
            setError('MediaSource API is not supported in your browser.');
            return;
        }

        return new Promise<void>((resolve, reject) => {
            const mediaSource = new MediaSource();
            mediaSourceRef.current = mediaSource;
            if(videoRef.current){
                videoRef.current.src = URL.createObjectURL(mediaSource);
            }
            mediaSource.onsourceopen = () => {
                try {
                    const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
                    sourceBufferRef.current = sourceBuffer;
                    resolve();
                } catch (error) {
                    console.error('Error creating source buffer:', error);
                    // setError('Error creating source buffer');
                    reject(error)  
                }
            };
        });
    };

    useEffect(() => {
        if (!window.MediaSource) {
            setError('MediaSource API is not supported in your browser.');
            return;
        }

        const connect = new HubConnectionBuilder()
            .withUrl(`http://localhost:8000/hub?userToken=${encodeURIComponent(token)}&connectionType=${1}`)
            .withAutomaticReconnect()
            .withHubProtocol(new MessagePackHubProtocol())
            .configureLogging(LogLevel.Information)
            .build();



        const startConnection = async () => {
            try {
                await connect.start();
                console.log('Receiver SignalR connection established', connect.connectionId);
                setConnection(connect);
                // setupMediaSource(); // Setup media source on successful connection

                if(connect.connectionId){
                    await dispatch(setReceiverConnectionId(connect.connectionId))
                }    
        
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
            // setupMediaSource(); // Ensure fresh setup after reconnection
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
    }, [ token, dispatch]);

    useEffect(() => {
        if (!connection || !mediaSourceRef.current) return;

        const receiveVideoStream = async (fromUser, data) => {

            if (!mediaSourceRef.current || mediaSourceRef.current.readyState !== 'open' || !sourceBufferRef.current) {
                console.log("MediaSource is not ready. Reinitializing...");
                await initMediaSource();
                await new Promise(resolve => setTimeout(resolve, 1000));
                // return;
            }

                if (mediaSourceRef.current && sourceBufferRef.current) {
                    if (mediaSourceRef.current.readyState === 'open') {
                        if(!sourceBufferRef.current.updating){
                            sourceBufferRef.current.appendBuffer(data);
                            if (timeoutRef.current) {
                                clearTimeout(timeoutRef.current);
                            }
                            timeoutRef.current = setTimeout(() => {
                                if (mediaSourceRef.current && sourceBufferRef.current) {
                                    mediaSourceRef.current.endOfStream();
                                    mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
                                }
                            }, 3000);
                        }
                        else{
                            console.log("Source buffer is updating");
                        }                            
                    } else {
                        console.log("MediaSourceRef current readyState NOT OPEN, but: " , mediaSourceRef.current.readyState);
                        
                    }
                }
        };

        connection.on('receivevideostream', receiveVideoStream);

        return () => {
            connection.off('receivevideostream', receiveVideoStream);
        };
    }, [connection]);

    useEffect(() => {
        if (!callReceived) {

            const handleAcceptCallRequest = async() => {
                await initMediaSource();
                onReceiveCall();
                setCallReceived(true);
            };


            if (!callReceived && connection) {
                connection.on('acceptcallrequest', handleAcceptCallRequest);
                return () => connection.off('acceptcallrequest', handleAcceptCallRequest);
            }
    }
    }, [connection, onReceiveCall, initMediaSource]);
    
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
