import { useState, useCallback, useRef } from "react";

interface MediaControlFunctions {
  getUserMedia: (video: boolean, audio: boolean) => Promise<MediaStream | null>;
  setTrackEnabled: (type: "audio" | "video", enabled: boolean) => void;
  stopAllTracks: () => void;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
}

export const useMeetingActions = (mediaControls?: MediaControlFunctions) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true); // Start with camera ON
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; timestamp: Date }>>([]);
  
  // Track if media has ever been initialized
  const mediaInitialized = useRef(false);

  const handleStartCall = useCallback(() => {
    console.log("Start call triggered");
  }, []);

  const handleEndCall = useCallback(() => {
    console.log("End call triggered");
    
    // Stop all tracks and cleanup
    if (mediaControls) {
      mediaControls.stopAllTracks();
    }
    
    // Reset states
    setIsMuted(false);
    setIsCameraOn(false);
    mediaInitialized.current = false;
  }, [mediaControls]);

  const handleMuteToggle = useCallback(async () => {
    if (!mediaControls) {
      setIsMuted(prev => !prev);
      return;
    }

    const newMutedState = !isMuted;
    
    // If not initialized yet, get media first
    if (!mediaInitialized.current) {
      const stream = await mediaControls.getUserMedia(isCameraOn, !newMutedState);
      if (stream) {
        mediaInitialized.current = true;
        setIsMuted(newMutedState);
      }
    } else {
      // Just toggle the audio track
      mediaControls.setTrackEnabled("audio", !newMutedState);
      setIsMuted(newMutedState);
    }
    
    console.log("Mute toggled:", newMutedState);
  }, [isMuted, isCameraOn, mediaControls]);

  const handleCameraToggle = useCallback(async () => {
    if (!mediaControls) {
      setIsCameraOn(prev => !prev);
      return;
    }

    const newCameraState = !isCameraOn;
    
    
    if (newCameraState) {
      // Turning camera ON - need to get user media
      const stream = await mediaControls.getUserMedia(true, !isMuted);
      if (stream) {
        mediaInitialized.current = true;
        setIsCameraOn(true);
      }
    } else {
      // Turning camera OFF - just disable video tracks
      // Keep audio track alive if not muted
      if (mediaControls.localStreamRef.current) {
        const videoTracks = mediaControls.localStreamRef.current.getVideoTracks();
        videoTracks.forEach(track => track.stop());
        
        // Remove video tracks from stream
        videoTracks.forEach(track => track.stop());
      }
      setIsCameraOn(false);
    }
    
    console.log("Camera toggled:", newCameraState);
  }, [isCameraOn, isMuted, mediaControls]);

  const handleSendMessage = useCallback((msg: string) => {
    if (!msg.trim()) return;
    
    console.log("Message:", msg);
    const newMessage = {
      sender: "You",
      text: msg,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  return {
    isMuted,
    isCameraOn,
    messages,
    handleStartCall,
    handleEndCall,
    handleMuteToggle,
    handleCameraToggle,
    handleSendMessage,
  };
};