import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { setReceiverConnectionId, setReceivingStatus } from '../../../actions/videoActions/videoActions.ts';
import SignalRHandler from '../../../common/signalRHandler.ts';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';


import { SERVER_ADDRESS } from '../../../common/constants.ts';

const Receiver = ({ token }) => {
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
                    <h1>Connection ID: {connection ? connection.connectionId : 'Not connected'}</h1>
                    <h2>Received Video Stream</h2>
                    <video ref={videoRef} autoPlay muted />
                </>
            )}
        </div>
    );
};

export default Receiver;



// import React, { useCallback, useEffect, useRef, useState } from 'react';
// import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
// import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
// import { useDispatch } from 'react-redux';
// import { AnyAction } from 'redux';
// import { ThunkDispatch } from 'redux-thunk';
// import { setReceiverConnectionId, setReceivingStatus } from '../../../actions/videoActions/videoActions.ts';
// import { SERVER_ADDRESS } from '../../../common/constants.ts';

// const Receiver = ({ token }) => {
//     const videoRef = useRef<HTMLVideoElement | null>(null);
//     const [connection, setConnection] = useState<HubConnection | null>(null);
//     const mediaSourceRef = useRef<MediaSource | null>(new MediaSource());
//     const sourceBufferRef = useRef<SourceBuffer | null>(null);
//     const [error, setError] = useState('');
//     const timeoutRef = useRef<NodeJS.Timeout | null>(null);
//     const dispatch: ThunkDispatch<any, any, AnyAction> = useDispatch();
//     const [hasDispatched, setHasDispatched] = useState(false); // Add this state

//     const setupMediaSource = useCallback(() => {
//         if (!videoRef.current || !window.MediaSource) {
//             setError('MediaSource API is not supported in your browser.');
//             return;
//         }

//         const mediaSource = new MediaSource();
//         mediaSourceRef.current = mediaSource;
//         videoRef.current.src = URL.createObjectURL(mediaSource);

//         mediaSource.addEventListener('sourceopen', () => {
//             try {
//                 const sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
//                 sourceBufferRef.current = sourceBuffer;
//                 console.log("Media source and source buffer are ready");
//             } catch (e) {
//                 console.error('Error creating source buffer:', e);
//             }
//         }, { once: true });
//     }, []);

//     useEffect(() => {
//         if (!window.MediaSource) {
//             setError('MediaSource API is not supported in your browser.');
//             return;
//         }

//         const connect = new HubConnectionBuilder()
//             .withUrl(`${SERVER_ADDRESS}/hub?userToken=${encodeURIComponent(token)}&connectionType=${1}`)
//             .withAutomaticReconnect()
//             .withHubProtocol(new MessagePackHubProtocol())
//             .configureLogging(LogLevel.Information)
//             .build();

//         const startConnection = async () => {
//             try {
//                 await connect.start();
//                 console.log('Receiver SignalR connection established');
//                 setConnection(connect);

//                 // Dispatch action to set the connection ID
//                 if (connect.connectionId) {
//                     dispatch(setReceiverConnectionId(connect.connectionId));
//                 }

//                 setupMediaSource(); // Setup media source on successful connection
//             } catch (err) {
//                 console.error('Error while establishing SignalR connection:', err);
//             }
//         };

//         startConnection();

//         const keepAliveInterval = setInterval(() => {
//             if (connect.state === 'Connected') {
//                 connect.invoke("KeepAlive").catch(err => console.error("KeepAlive error:", err));
//             }
//         }, 15000); // Check and send KeepAlive every 15 seconds

//         connect.onclose(() => {
//             console.log("Connection lost. Attempting to reconnect...");
//             setupMediaSource(); // Ensure fresh setup after reconnection
//         });

//         return () => {
//             clearInterval(keepAliveInterval);
//             if (connect) {
//                 connect.stop().then(() => console.log('SignalR connection closed'));
//             }
//             if (mediaSourceRef.current && mediaSourceRef.current.readyState !== "closed") {
//                 mediaSourceRef.current.endOfStream();
//                 mediaSourceRef.current = null;
//             }
//         };
//     }, [token, setupMediaSource, dispatch]);

//     // useEffect(() => {
//     //     if (!connection || !mediaSourceRef.current) return;

//     //     const receiveVideoStream = (fromUser, data) => {
//     //         if (mediaSourceRef.current && sourceBufferRef.current) {
//     //             if (mediaSourceRef.current.readyState === 'open' && !sourceBufferRef.current.updating) {
//     //                 sourceBufferRef.current.appendBuffer(data);

//     //                 // Set receiving status in Redux store only once
//     //                 if (!hasDispatched) {
//     //                     dispatch(setReceivingStatus(true));
//     //                     console.log("SET REVEING TO TRUE!!!")
//     //                     setHasDispatched(true); // Update the flag
//     //                 }

//     //                 if (timeoutRef.current) {
//     //                     clearTimeout(timeoutRef.current);
//     //                 }
//     //                 timeoutRef.current = setTimeout(() => {
//     //                     if (mediaSourceRef.current && sourceBufferRef.current) {
//     //                         mediaSourceRef.current.endOfStream();
//     //                         mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
//     //                         setupMediaSource();
//     //                     }
//     //                 }, 3000);
//     //             } else {
//     //                 console.log("Buffer is currently updating or not ready.");
//     //             }
//     //         }
//     //     };

//     //     connection.on('ReceiveVideoStream', receiveVideoStream);

//     //     return () => {
//     //         connection.off('ReceiveVideoStream', receiveVideoStream);
//     //     };
//     // }, [connection, setupMediaSource, dispatch, hasDispatched]);


//     useEffect(() => {
//         if (!connection || !mediaSourceRef.current) return;
    
//         const handleVideoStream = (fromUser, data) => {
//             if (mediaSourceRef.current && sourceBufferRef.current) {
//                 if (mediaSourceRef.current.readyState === 'open' && !sourceBufferRef.current.updating) {
//                     sourceBufferRef.current.appendBuffer(data);
    
//                     // Set receiving status in Redux store only once
//                     if (!hasDispatched) {
//                         dispatch(setReceivingStatus(true));
//                         console.log("SET RECEIVING TO TRUE!!!");
//                         setHasDispatched(true); // Update the flag
//                     }
    
//                     if (timeoutRef.current) {
//                         clearTimeout(timeoutRef.current);
//                     }
//                     timeoutRef.current = setTimeout(() => {
//                         if (mediaSourceRef.current && sourceBufferRef.current) {
//                             mediaSourceRef.current.endOfStream();
//                             mediaSourceRef.current.removeSourceBuffer(sourceBufferRef.current);
//                             setupMediaSource();
//                         }
//                     }, 3000);
//                 } else {
//                     console.log("Buffer is currently updating or not ready.");
//                 }
//             }
//         };
    
//         connection.on('receivevideostream', handleVideoStream);
//         connection.on('sendbacktosender', handleVideoStream);
    
//         return () => {
//             connection.off('receivevideostream', handleVideoStream);
//             connection.off('sendbacktosender', handleVideoStream);
//         };
//     }, [connection, setupMediaSource, dispatch, hasDispatched]);
    







//     return (
//         <div>
//             {error ? (
//                 <div>Error: {error}</div>
//             ) : (
//                 <>
//                     <h1>Connection ID: {connection ? connection.connectionId : 'Not connected'}</h1>
//                     <h2>Received Video Stream</h2>
//                     <video ref={videoRef} autoPlay muted />
//                 </>
//             )}
//         </div>
//     );
// };

// export default Receiver;
