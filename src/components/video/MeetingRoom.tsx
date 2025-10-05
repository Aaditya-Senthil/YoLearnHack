import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toolbar } from "../ui/Toolbar";
import { ChatPanel } from "../chat/ChatPanel";
import { useMeetingActions } from "@/hooks/useMeetingActions";
import { useNavigate } from "react-router-dom";
import { useKinesisWebRTC } from "@/hooks/useKinesisWebRTC";
import { AlertCircle } from "lucide-react";
import { AIAgent } from "@/components/video/AIAgent";

interface MeetingRoomProps {
  selectedPersona: {
    personaId: string;
    name: string;
    avatarUrl: string;
    voiceLabel: string;
  };
  channelARN: string;
  channelEndpoint: string; 
  region: string;   
  onCallEnd: () => void;       
}

export const MeetingRoom = ({ selectedPersona, channelARN, channelEndpoint, region ,onCallEnd }: MeetingRoomProps) => {
  const [isLoading, setIsLoading] = useState(true);
  console.log("MeetingRoom received channelARN:", channelARN);

  const {
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    getUserMedia,
    startSession,
    endSession,
    setTrackEnabled,
    stopAllTracks,
    permissionError,
  } = useKinesisWebRTC(channelARN);

  const navigate = useNavigate();

  const {
    isMuted,
    isCameraOn,
    messages,
    handleEndCall,
    handleMuteToggle,
    handleCameraToggle,
    handleSendMessage,
  } = useMeetingActions({
    getUserMedia,
    setTrackEnabled,
    stopAllTracks,
    localStreamRef,
  });

  // Fake loading animation for UX polish
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Start session on mount
  useEffect(() => {
    const init = async () => {
      const stream = await getUserMedia();
      if (stream) {
        await startSession(stream);
      }
    };
    init();

    return () => {
      endSession();
    };
  }, []);

  const handleEndCallClick = () => {
    handleEndCall();
    endSession();
    onCallEnd();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto border-4 border-primary border-t-transparent rounded-full"
                />
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                Connecting your AI Companion…
              </h2>
              <p className="text-muted-foreground">
                Setting up the meeting with {selectedPersona.name}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Error Banner */}
      {permissionError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border-l-4 border-destructive p-4 m-4"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">{permissionError}</p>
              <p className="text-sm text-muted-foreground">
                Please check your browser settings and grant camera/microphone permissions
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        {/* Video Grid Section */}
        <div className="flex-1 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6 flex-1"
          >
            {/* User Video */}
            <div className="video-placeholder relative aspect-video md:aspect-auto bg-muted rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {isCameraOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                        <line x1="4" y1="4" x2="20" y2="20" strokeWidth={2} />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">Camera Off</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the camera button to enable
                    </p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                <span className="text-sm font-medium">You</span>
              </div>
            </div>

            {/* AI Companion Video (remote feed) */}
            <div className="video-placeholder relative aspect-video md:aspect-auto bg-muted rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <AIAgent />
              </div>
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                <span className="text-sm font-medium">{selectedPersona.name}</span>
              </div>
            </div>
          </motion.div>

          {/* Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Toolbar
              isMuted={isMuted}
              isCameraOn={isCameraOn}
              onMuteToggle={handleMuteToggle}
              onCameraToggle={handleCameraToggle}
              onEndCall={handleEndCallClick}
            />
          </motion.div>
        </div>

        {/* Chat Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full lg:w-96 h-[500px] lg:h-auto"
        >
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
        </motion.div>
      </div>
    </div>
  );
};


