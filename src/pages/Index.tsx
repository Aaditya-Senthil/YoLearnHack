import { useState } from "react";
import { motion } from "framer-motion";
import { PersonaCard } from "@/components/persona/PersonaCard";
import { MeetingRoom } from "@/components/video/MeetingRoom";

import persona1 from "@/assets/persona-1.jpg";
import persona2 from "@/assets/persona-2.jpg";
import persona3 from "@/assets/persona-3.jpg";
import persona4 from "@/assets/persona-4.jpg";

interface Persona {
  personaId: string;
  name: string;
  avatarUrl: string;
  voiceLabel: string;
}

const personas: Persona[] = [
  { personaId: "1", name: "Sarah Chen", avatarUrl: persona1, voiceLabel: "Professional & Warm" },
  { personaId: "2", name: "Marcus Johnson", avatarUrl: persona2, voiceLabel: "Confident & Clear" },
  { personaId: "3", name: "Emma Rodriguez", avatarUrl: persona3, voiceLabel: "Energetic & Friendly" },
  { personaId: "4", name: "Dr. James Williams", avatarUrl: persona4, voiceLabel: "Authoritative & Calm" },
];

const Index = () => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [inMeeting, setInMeeting] = useState(false);
  const [channelARN, setChannelARN] = useState<string | null>(null);
  const [channelEndpoint, setChannelEndpoint] = useState<string | null>(null);
  const [region, setRegion] = useState<string>("ap-south-1");

  const selectedPersona = personas.find((p) => p.personaId === selectedPersonaId);

  const handleStartCall = async () => {
    if (!selectedPersonaId) return;

    try {
      const response = await fetch("https://y4kppc6mp5.execute-api.ap-south-1.amazonaws.com/Prof/create-channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personaId: selectedPersonaId }),
      });

      const data = await response.json();
      console.log("Lambda Response:", data);

      if (data?.ChannelARN && data?.ChannelEndpoint) {
        setChannelARN(data.ChannelARN);
        setChannelEndpoint(data.ChannelEndpoint);
        setRegion(data.Region || "ap-south-1");
        setInMeeting(true);
      } else {
        console.error("Invalid response from Lambda:", data);
      }
    } catch (err) {
      console.error("Error starting call:", err);
    }
  };

  if (inMeeting && selectedPersona && channelARN && channelEndpoint) {
    return (
          <MeetingRoom
      selectedPersona={selectedPersona}
      channelARN={channelARN}
      channelEndpoint={channelEndpoint}
      region={region}
      onCallEnd={() => {
        setInMeeting(false);
        setChannelARN(null);
        setChannelEndpoint(null);
      }}
    />

    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-6xl w-full">
        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose Your AI Companion
          </h1>
          <p className="text-xl text-muted-foreground">
            Select a persona to start your interactive video session
          </p>
        </motion.div>

        {/* Persona Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {personas.map((persona, index) => (
            <motion.div
              key={persona.personaId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <PersonaCard
                {...persona}
                isSelected={selectedPersonaId === persona.personaId}
                onSelect={setSelectedPersonaId}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Start Call Button */}
        {selectedPersonaId && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartCall}
              className="bg-primary text-primary-foreground px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Start Call
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
