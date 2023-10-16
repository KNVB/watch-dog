import { useEffect } from "react";
import { io } from "socket.io-client";
import LocalStreamManager from "../LocalStreamManager";
import WebRTCConnection from "../WebRTCConnection";
export default function Streamer(){
    useEffect(()=>{
        let init=async()=>{
            let stream=await LocalStreamManager.getMediaStream(true,true);
            const socket = io("http://localhost:5432");
            socket.emit("streamerReady");
            socket.on("receiveOffer",async({to,offer})=>{
                console.log("Receive Offer");
                let peerConnection=new WebRTCConnection("Streamer");
                socket.on("addICECandidate",iceCandidate=>{
                    console.log("Add ICE Candidate");
                    peerConnection.addICECandidate(iceCandidate);
                });
                peerConnection.on("iceCandidate",iceCandidate=>{
                    console.log("ICE Candidate event");
                    socket.emit("sendICECandidateToConsumer",{iceCandidate,to});
                });
                peerConnection.on("negotiation",localDescription=>{
                    console.log("Neg");
                    socket.emit("answer",{answer:localDescription,to}); 
                });
                peerConnection.init(stream);
                //peerConnection.addStream(stream);
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            })
        }
        init();
    },[])
    return <div>Streamer</div>
}