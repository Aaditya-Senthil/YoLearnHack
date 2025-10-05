import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toolbar } from "../ui/Toolbar";
import { ChatPanel } from "../chat/ChatPanel";
import { useMeetingActions } from "@/hooks/useMeetingActions";
import { useNavigate } from "react-router-dom";

interface MeetingRoomProps {
  selectedPersona: {
    personaId: string;
    name: string;
    avatarUrl: string;
    voiceLabel: string;
  };
}

export const MeetingRoom = ({ selectedPersona }: MeetingRoomProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const {
    isMuted,
    isCameraOn,
    messages,
    handleEndCall,
    handleMuteToggle,
    handleCameraToggle,
    handleSendMessage,
  } = useMeetingActions();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleEndCallClick = () => {
    handleEndCall();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
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

      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        {/* Video Grid Section */}
        <div className="flex-1 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-6 flex-1"
          >
            {/* User Video */}
            <div className="video-placeholder relative aspect-video md:aspect-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                {isCameraOn ? (
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-4xl">👤</span>
                    </div>
                    <p className="text-muted-foreground">Your Camera</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-muted-foreground">Camera Off</p>
                  </div>
                )}
              </div>
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-lg">
                <span className="text-sm font-medium">You</span>
              </div>
            </div>

            {/* AI Companion Video */}
            <div className="video-placeholder relative aspect-video md:aspect-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <img
                  src={selectedPersona.avatarUrl}
                  alt={selectedPersona.name}
                  className="w-full h-full object-cover"
                />
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
