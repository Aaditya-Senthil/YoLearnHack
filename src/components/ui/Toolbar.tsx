import { Mic, MicOff, Video, VideoOff, Phone } from "lucide-react";
import { motion } from "framer-motion";

interface ToolbarProps {
  isMuted: boolean;
  isCameraOn: boolean;
  onMuteToggle: () => void;
  onCameraToggle: () => void;
  onEndCall: () => void;
}

export const Toolbar = ({
  isMuted,
  isCameraOn,
  onMuteToggle,
  onCameraToggle,
  onEndCall,
}: ToolbarProps) => {
  return (
    <div className="flex items-center justify-center gap-4 py-6 px-4 bg-[hsl(var(--toolbar-bg))] rounded-2xl">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMuteToggle}
        className={`
          toolbar-button p-4 rounded-full transition-colors
          ${isMuted 
            ? 'bg-destructive text-destructive-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-[hsl(var(--hover-bg))]'
          }
        `}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCameraToggle}
        className={`
          toolbar-button p-4 rounded-full transition-colors
          ${!isCameraOn 
            ? 'bg-destructive text-destructive-foreground' 
            : 'bg-secondary text-secondary-foreground hover:bg-[hsl(var(--hover-bg))]'
          }
        `}
        aria-label={isCameraOn ? "Turn camera off" : "Turn camera on"}
      >
        {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onEndCall}
        className="toolbar-button p-4 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
        aria-label="End call"
      >
        <Phone className="w-6 h-6 rotate-135" />
      </motion.button>
    </div>
  );
};
