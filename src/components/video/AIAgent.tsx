import React, { useEffect, useRef, useState } from "react";

/**
 * Creates a HeyGen session using your Lambda API Gateway endpoint.
 * The Lambda should return:
 * {
 *   webrtcUrl: "https://api.heygen.com/v1/stream/webrtc",
 *   sessionId: "your-session-id",
 *   region: "ap-south-1"
 * }
 */
const createHeygenSession = async () => {
  try {
    const response = await fetch(
      "https://y4kppc6mp5.execute-api.ap-south-1.amazonaws.com/Prof/create-heygen-session",
      { method: "POST" }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("Failed to create HeyGen session:", err);
    throw err;
  }
};

/**
 * AI Agent Component — renders the live avatar video stream using HeyGen WebRTC
 */
export const AIAgent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initHeygen = async () => {
      try {
        // Step 1: Create HeyGen WebRTC session through Lambda
        const { webrtcUrl, sessionId } = await createHeygenSession();
        console.log("Session created:", sessionId);

        // Step 2: Initialize PeerConnection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // Step 3: Play the remote avatar video
        pc.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        // Step 4: Create an SDP offer and send to HeyGen
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sdpResponse = await fetch(`${webrtcUrl}?session_id=${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/sdp" },
          body: offer.sdp,
        });

        if (!sdpResponse.ok) throw new Error("Failed to fetch HeyGen SDP answer");

        const answerSdp = await sdpResponse.text();
        await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

        console.log("HeyGen live avatar connected ✅");
        setLoading(false);

        // Step 5: Optional — Handle voice/GPT integration later
        // (Future expansion: send audio to HeyGen, sync with GPT responses)
      } catch (err: any) {
        console.error("Error initializing HeyGen stream:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    initHeygen();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      {loading && !error && (
        <p className="text-gray-400 text-lg animate-pulse">Connecting to AI avatar...</p>
      )}
      {error && (
        <p className="text-red-500 font-medium">
          Failed to connect: {error}
        </p>
      )}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="rounded-2xl shadow-lg w-[640px] h-[480px] object-cover mt-4 border border-gray-700"
      />
    </div>
  );
};
