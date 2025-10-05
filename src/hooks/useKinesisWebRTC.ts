import { useEffect, useRef, useState } from "react";
import * as AWS from "aws-sdk";
import * as KVSWebRTC from "amazon-kinesis-video-streams-webrtc";
import { AWSConfig } from "@/config";

export const useKinesisWebRTC = (channelARN: string) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalingClientRef = useRef<KVSWebRTC.SignalingClient | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // for browser env fixes
  if (typeof window !== "undefined" && typeof (window as any).global === "undefined") {
    (window as any).global = window;
  }

  // ---------- Permissions ----------
  const getUserMedia = async (video = true, audio = true) => {
    try {
      setPermissionError(null);

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio,
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      return stream;
    } catch (err) {
      console.error("Media access denied:", err);
      setPermissionError("Camera or mic permission denied.");
      return null;
    }
  };

  const setTrackEnabled = (type: "audio" | "video", enabled: boolean) => {
    localStreamRef.current?.getTracks()
      .filter((t) => t.kind === type)
      .forEach((t) => (t.enabled = enabled));
  };

  const stopAllTracks = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  };

  const endSession = () => {
    signalingClientRef.current?.close();
    peerConnectionRef.current?.close();
    stopAllTracks();
  };

  // ---------- Start Session ----------
  const startSession = async (stream: MediaStream) => {
    try {
      // AWS setup
      AWS.config.update({
        region: AWSConfig.region,
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: AWSConfig.identityPoolId,
        }),
      });

      const credentials = await new Promise<AWS.Credentials>((resolve, reject) => {
        (AWS.config.credentials as AWS.CognitoIdentityCredentials).get((err) => {
          if (err) reject(err);
          else resolve(AWS.config.credentials as AWS.Credentials);
        });
      });

      const kinesisVideoClient = new AWS.KinesisVideo({
        region: AWSConfig.region,
        credentials,
      });

      // Describe channel
      await kinesisVideoClient.describeSignalingChannel({ ChannelARN: channelARN }).promise();

      // Get endpoints
      const endpointResponse = await kinesisVideoClient
        .getSignalingChannelEndpoint({
          ChannelARN: channelARN,
          SingleMasterChannelEndpointConfiguration: {
            Protocols: ["WSS", "HTTPS"],
            Role: "MASTER",
          },
        })
        .promise();

      const endpoints: Record<string, string> = {};
      endpointResponse.ResourceEndpointList?.forEach((ep) => {
        if (ep.Protocol && ep.ResourceEndpoint) endpoints[ep.Protocol] = ep.ResourceEndpoint;
      });

      if (!endpoints.WSS) throw new Error("No WSS endpoint found for channel.");

      const signalingClient = new KVSWebRTC.SignalingClient({
        channelARN,
        channelEndpoint: endpoints.WSS,
        role: KVSWebRTC.Role.MASTER,
        region: AWSConfig.region,
        credentials,
      });

      signalingClientRef.current = signalingClient;

      // Create PeerConnection
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnectionRef.current = peerConnection;

      stream.getTracks().forEach((t) => peerConnection.addTrack(t, stream));

      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      signalingClient.on("open", async () => {
        console.log("Signaling connected ✅");
        const offerInit = await peerConnection.createOffer({ offerToReceiveVideo: true, offerToReceiveAudio: true });
        await peerConnection.setLocalDescription(offerInit);
        signalingClient.sendSdpOffer(new RTCSessionDescription(offerInit));
        });

      signalingClient.on("sdpAnswer", async (answer) => {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      });

      signalingClient.on("iceCandidate", (candidate) => {
        peerConnection.addIceCandidate(candidate);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) signalingClient.sendIceCandidate(event.candidate);
      };

      signalingClient.open();
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  useEffect(() => {
  return () => endSession();
}, []);


  return {
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    getUserMedia,
    startSession,
    endSession,
    setTrackEnabled,
    stopAllTracks,
    permissionError,
  };
};
