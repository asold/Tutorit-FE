import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { setReceiverConnectionId, setReceivingStatus } from '../../../actions/videoActions/videoActions.ts';
import SignalRHandler from '../../../common/signalRHandler.ts';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';


import { SERVER_ADDRESS } from '../../../common/constants.ts';

const GlobalReceiver = ({ token }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(new MediaSource());
    const sourceBufferRef = useRef<SourceBuffer | null>(null);
    const [error, setError] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
    const [hasDispatched, setHasDispatched] = useState(false);

    const signalRHandler = new SignalRHandler();

    const setupMediaSource = useCallback(() => {
        if (!videoRef.current || !window.MediaSource) {
            setError('MediaSource API is not supported in your browser.');
            return;
        }

        const mediaSource = new MediaSource();
        mediaSourceRef.current = mediaSource;
        videoRef.current.src = URL.createObjectURL(mediaSource);

        mediaSource.addEventListener('sourceopen', () => {
            try {
                const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
                sourceBufferRef.current = sourceBuffer;
                console.log("Media source and source buffer are ready");
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

        const initializeConnection = async () => {
            try {
                const connect = await signalRHandler.createSignalRConnection(1, token);
                setConnection(connect);

                if (connect.connectionId) {
                    dispatch(setReceiverConnectionId(connect.connectionId));
                }

                setupMediaSource();
            } catch (err) {
                console.error('Error while establishing SignalR connection:', err);
            }
        };

        initializeConnection();

        return () => {
            if (connection) {
                signalRHandler.stopConnection(connection);
            }
            if (mediaSourceRef.current && mediaSourceRef.current.readyState !== "closed") {
                mediaSourceRef.current.endOfStream();
                mediaSourceRef.current = null;
            }
        };
    }, [token, setupMediaSource, dispatch]);

    useEffect(() => {
        if (!connection || !mediaSourceRef.current) return;

        const handleVideoStream = (fromUser, data) => {
            if (mediaSourceRef.current && sourceBufferRef.current) {
                if (mediaSourceRef.current.readyState === 'open' && !sourceBufferRef.current.updating) {
                    sourceBufferRef.current.appendBuffer(data);

                    if (!hasDispatched) {
                        dispatch(setReceivingStatus(true));
                        console.log("SET RECEIVING TO TRUE!!!");
                        setHasDispatched(true);
                    }

                    if (timeoutRef.current) {
                        clearTimeout(timeoutRef.current);
                    }
                    timeoutRef.current = setTimeout(() => {
                        if (mediaSourceRef.current && sourceBufferRef.current) {
                            mediaSourceRef.current.endOfStream();
                            mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
                            setupMediaSource();
                        }
                    }, 3000);
                } else {
                    console.log("Buffer is currently updating or not ready.");
                }
            }
        };

        signalRHandler.onConnectionEvent(connection, 'receivevideostream', handleVideoStream);
        signalRHandler.onConnectionEvent(connection, 'sendbacktosender', handleVideoStream);

        return () => {
            signalRHandler.offConnectionEvent(connection, 'receivevideostream', handleVideoStream);
            signalRHandler.offConnectionEvent(connection, 'sendbacktosender', handleVideoStream);
        };
    }, [connection, setupMediaSource, dispatch, hasDispatched]);

    return (
        <div>
            {error ? (
                <div>Error: {error}</div>
            ) : (
                <>
                    {/* <h1>Connection ID: {connection ? connection.connectionId : 'Not connected'}</h1> */}
                    <h2>Partner</h2>
                    <video ref={videoRef} autoPlay muted />
                </>
            )}
        </div>
    );
};

export default GlobalReceiver;

