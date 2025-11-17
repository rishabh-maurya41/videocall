import { useEffect, useRef, useState, useCallback } from 'react';
import { ICE_SERVERS, MEDIA_CONSTRAINTS, SCREEN_SHARE_CONSTRAINTS } from '../utils/webrtcConfig';

export const useWebRTC = (socket, roomId, userId, userType, userName) => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [connectionState, setConnectionState] = useState('new');
    const [error, setError] = useState(null);
    const [remoteUserInfo, setRemoteUserInfo] = useState(null);

    const peerConnection = useRef(null);
    const screenStream = useRef(null);
    const originalVideoTrack = useRef(null);

    // Initialize media devices
    const initializeMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(MEDIA_CONSTRAINTS);
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            let errorMessage = 'Failed to access camera/microphone';

            if (err.name === 'NotAllowedError') {
                errorMessage = 'Permission denied. Please allow camera and microphone access.';
            } else if (err.name === 'NotFoundError') {
                errorMessage = 'No camera or microphone found.';
            }

            setError(errorMessage);
            throw err;
        }
    }, []);

    // Create peer connection
    const createPeerConnection = useCallback((stream) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);

        // Add local stream tracks
        stream.getTracks().forEach(track => {
            pc.addTrack(track, stream);
        });

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('ice-candidate', {
                    roomId,
                    candidate: event.candidate,
                    targetSocketId: remoteUserInfo?.socketId
                });
            }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        // Monitor connection state
        pc.onconnectionstatechange = () => {
            setConnectionState(pc.connectionState);
            console.log('Connection state:', pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
            console.log('ICE connection state:', pc.iceConnectionState);
        };

        peerConnection.current = pc;
        return pc;
    }, [socket, roomId, remoteUserInfo]);

// Create and send offer
const createOffer = useCallback(async (targetSocketId) => {
    try {
        if (!peerConnection.current) return;

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit('offer', {
            roomId,
            offer,
            targetSocketId
        });
    } catch (err) {
        console.error('Error creating offer:', err);
        setError('Failed to create call offer');
    }
}, [socket, roomId]);

// Handle incoming offer
const handleOffer = useCallback(async (offer, socketId) => {
    try {
        if (!peerConnection.current) return;

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit('answer', {
            roomId,
            answer,
            targetSocketId: socketId
        });
    } catch (err) {
        console.error('Error handling offer:', err);
        setError('Failed to handle call offer');
    }
}, [socket, roomId]);

// Handle incoming answer
const handleAnswer = useCallback(async (answer) => {
    try {
        if (!peerConnection.current) return;
        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (err) {
        console.error('Error handling answer:', err);
        setError('Failed to handle call answer');
    }
}, []);

// Handle ICE candidate
const handleIceCandidate = useCallback(async (candidate) => {
    try {
        if (!peerConnection.current) return;
        await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
        console.error('Error adding ICE candidate:', err);
    }
}, []);

// Toggle audio
const toggleAudio = useCallback(() => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            setIsAudioMuted(!audioTrack.enabled);
        }
    }
}, [localStream]);

// Toggle video
const toggleVideo = useCallback(() => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            setIsVideoOff(!videoTrack.enabled);
        }
    }
}, [localStream]);

// Toggle screen sharing
const toggleScreenShare = useCallback(async () => {
    try {
        if (!isScreenSharing) {
            // Start screen sharing
            const stream = await navigator.mediaDevices.getDisplayMedia(SCREEN_SHARE_CONSTRAINTS);
            screenStream.current = stream;

            const videoTrack = stream.getVideoTracks()[0];
            const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');

            if (sender) {
                originalVideoTrack.current = sender.track;
                await sender.replaceTrack(videoTrack);
            }

            // Handle screen share stop
            videoTrack.onended = () => {
                stopScreenShare();
            };

            setIsScreenSharing(true);
            socket.emit('screen-share-toggle', { roomId, isSharing: true, userName });
        } else {
            stopScreenShare();
        }
    } catch (err) {
        console.error('Error toggling screen share:', err);
        setError('Failed to share screen');
    }
}, [isScreenSharing, socket, roomId, userName]);

const stopScreenShare = useCallback(async () => {
    if (screenStream.current) {
        screenStream.current.getTracks().forEach(track => track.stop());
        screenStream.current = null;
    }

    const sender = peerConnection.current?.getSenders().find(s => s.track?.kind === 'video');
    if (sender && originalVideoTrack.current) {
        await sender.replaceTrack(originalVideoTrack.current);
    }

    setIsScreenSharing(false);
    socket.emit('screen-share-toggle', { roomId, isSharing: false, userName });
}, [socket, roomId, userName]);

// Cleanup
const cleanup = useCallback(() => {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    if (screenStream.current) {
        screenStream.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnection.current) {
        peerConnection.current.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
}, [localStream]);

return {
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    connectionState,
    error,
    remoteUserInfo,
    setRemoteUserInfo,
    initializeMedia,
    createPeerConnection,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    cleanup
};
};
