// "use client";

// import AgoraRTC from "agora-rtc-sdk-ng";
// import { useState } from "react";

// const useAgora = () => {
//   const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID!;
//   const [token, setToken] = useState("");
//   const [channelName, setChannelName] = useState("");
//   const [uid, setUid] = useState<number>();

//   let audioTracks = {
//     localAudioTrack: null,
//     remoteAudioTracks: {},
//   };

//   let rtcClient;

//   const initAgora = async () => {
//     rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

//     await rtcClient.join(appId, channelName, token, uid);

//     audioTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
//     rtcClient.publish(audioTracks.localAudioTrack)
//   };

//   return {
//     initAgora,
//     setToken,
//     setChannelName,
//     setUid,
//   };
// };
