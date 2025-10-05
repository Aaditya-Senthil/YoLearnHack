import { useState, useCallback } from "react";

export const useMeetingActions = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; timestamp: Date }>>([]);

  const handleStartCall = useCallback(() => {
    console.log("Start call triggered");
  }, []);

  const handleEndCall = useCallback(() => {
    console.log("End call triggered");
  }, []);

  const handleMuteToggle = useCallback(() => {
    setIsMuted((prev) => {
      console.log("Mute toggled:", !prev);
      return !prev;
    });
  }, []);

  const handleCameraToggle = useCallback(() => {
    setIsCameraOn((prev) => {
      console.log("Camera toggled:", !prev);
      return !prev;
    });
  }, []);

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
