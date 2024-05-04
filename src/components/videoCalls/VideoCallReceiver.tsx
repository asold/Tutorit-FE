import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';

const VideoCallReceiver = ({ token }) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const mediaSourceRef = useRef<MediaSource | null>(new MediaSource());
    const sourceBufferRef = useRef< SourceBuffer | null>(null);



    const setupMediaSource = useCallback(() => {
        if (!videoRef.current) return;

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

        // connect.on("KeepAlive", () => {
        //     console.log("KeepAlive message received from server");  // Just log or you can also do other actions
        // });
        
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
            if (mediaSourceRef.current && sourceBufferRef.current) {
                if (mediaSourceRef.current.readyState === 'open' && !sourceBufferRef.current.updating) {
                    sourceBufferRef.current.appendBuffer(data);
                } else {
                    console.log("Buffer is currently updating or not ready.");
                }
            }
        };

        connection.on('ReceiveVideoStream', receiveVideoStream);

        return () => {
            connection.off('ReceiveVideoStream', receiveVideoStream);
        };
    }, [connection]);










    // const setupMediaSource = useCallback(() => {
    //     if (!videoRef.current) return;

    //     let mediaSource = new MediaSource();
    //     mediaSourceRef.current = mediaSource;
    //     videoRef.current.src = URL.createObjectURL(mediaSource);

    //     mediaSourceRef.current.addEventListener('sourceopen', () => {
    //         try {
    //             if(mediaSourceRef.current){
    //                 const sourceBuffer = mediaSourceRef.current.addSourceBuffer('video/webm; codecs="vp8"');
    //                 sourceBufferRef.current = sourceBuffer;
    //                 console.log("Media source and source buffer are ready");
    //             }
    //         } catch (e) {
    //             console.error('Error creating source buffer:', e);
    //         }
    //     }, { once: true });
    // }, []);

    // useEffect(() => {
    //     const connect = new HubConnectionBuilder()
    //         .withUrl(`http://localhost:8000/hub?userToken=${encodeURIComponent(token)}`)
    //         .withAutomaticReconnect()
    //         .withHubProtocol(new MessagePackHubProtocol())
    //         .configureLogging(LogLevel.Information)
    //         .build();

    //     const startConnection = async () => {
    //         try {
    //             await connect.start();
    //             console.log('Receiver SignalR connection established');
    //             setConnection(connect);
    //             setupMediaSource(); // Setup media source on successful connection
    //         } catch (err) {
    //             console.error('Error while establishing SignalR connection:', err);
    //         }
    //     };

    //     startConnection();
        
    //     connect.onclose(() => {
    //         console.log("Connection lost. Attempting to reconnect...");
    //         setupMediaSource();  // Ensure fresh setup after reconnection
    //     });

    //     return () => {
    //         if (connect) {
    //             connect.stop().then(() => console.log('SignalR connection closed'));
    //         }
    //         if (mediaSourceRef.current && mediaSourceRef.current.readyState !== "closed") {
    //             mediaSourceRef.current.endOfStream();
    //             mediaSourceRef.current = null;
    //         }
    //     };
    // }, [token, setupMediaSource]);

    // useEffect(() => {
    //     if (!connection || !mediaSourceRef.current) return;

    //     const receiveVideoStream = (fromUser, data) => {
    //         if(mediaSourceRef.current && sourceBufferRef.current){
    //             if (mediaSourceRef.current.readyState === 'open' && !sourceBufferRef.current.updating) {
    //                 sourceBufferRef.current.appendBuffer(data);
    //             } else {
    //                 console.log("Buffer is currently updating or not ready.");
    //             }
    //         }
    //     };

    //     connection.on('ReceiveVideoStream', receiveVideoStream);

    //     return () => {
    //         connection.off('ReceiveVideoStream', receiveVideoStream);
    //     };
    // }, [connection]);

    
    return (
        <div>
            <h1>Connection ID: {connection ? connection.connectionId : 'Not connected'}</h1>
            <h2>Received Video Stream</h2>
            <video ref={videoRef} controls autoPlay />
        </div>
    );
    
};

export default VideoCallReceiver;
