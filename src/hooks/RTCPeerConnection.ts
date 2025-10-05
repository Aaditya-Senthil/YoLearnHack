import { useRef, useState, useCallback } from "react";
import AWS from "aws-sdk";
import {
  SignalingClient,
  Role,
} from "amazon-kinesis-video-streams-webrtc";

export const useKinesisPeerConnection = (channelARN: string) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [signalingClient, setSignalingClient] = useState<any>(null);

  const startSession = useCallback(
    async (stream: MediaStream) => {
      try {
        // Configure AWS
        AWS.config.region = "ap-south-1"; // change to your region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: "<YOUR_COGNITO_POOL_ID>", // or use IAM User creds
        });

        // Create signaling client
        const client = new SignalingClient({
          channelARN,
          role: Role.VIEWER, // or Role.MASTER depending on your role
          region: AWS.config.region,
          credentials: AWS.config.credentials,
        });
        setSignalingClient(client);

        // Create RTCPeerConnection
        const peerConnection = new RTCPeerConnection();
        setPc(peerConnection);

        // Attach local stream
        stream.getTracks().forEach(track =>
          peerConnection.addTrack(track, stream)
        );
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Handle remote stream
        peerConnection.ontrack = event => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // Wire signaling events
        client.on("sdpOffer", async offer => {
          await peerConnection.setRemoteDescription(offer);
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          client.sendSdpAnswer(answer);
        });

        client.on("iceCandidate", candidate => {
          peerConnection.addIceCandidate(candidate);
        });

        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            client.sendIceCandidate(event.candidate);
          }
        };

        // Open connection
        client.open();
      } catch (err) {
        console.error("Error starting peer connection:", err);
      }
    },
    [channelARN]
  );

  const endSession = useCallback(() => {
    if (pc) {
      pc.close();
      setPc(null);
    }
    if (signalingClient) {
      signalingClient.close();
      setSignalingClient(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [pc, signalingClient]);

  return { localVideoRef, remoteVideoRef, startSession, endSession };
};
