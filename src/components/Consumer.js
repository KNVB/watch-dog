import { useEffect,useRef } from "react";
import { io } from "socket.io-client";
import WebRTCConnection from "../WebRTCConnection";
export default function Consumer() {
    let videoRef=useRef();
    useEffect(() => {
        let init = async () => {
            const socket = io("http://localhost:5432");
            let peerConnection = new WebRTCConnection("Consumer");
            socket.on("addICECandidate", iceCandidate => {
                console.log("Add ICE Candidate");
                peerConnection.addICECandidate(iceCandidate);
            });
            socket.on("receiveAnswer", answer => {
                console.log("receive answer");
                peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            });
            peerConnection.on("negotiation", localDescription => {
                socket.emit("offer", localDescription);
            });
            peerConnection.on("iceCandidate", iceCandidate => {
                console.log("ICE Candidate event");
                socket.emit("sendICECandidateToStreamer", iceCandidate);
            });
            peerConnection.on("track", stream => {
                console.log("Track event");
                videoRef.current.srcObject=stream;
            });
            peerConnection.init();
            peerConnection.call();
        }
        init();
    }, [])

    return (
        <>
            <div>Consumer</div>
            <video autoPlay ref={videoRef}/>
        </>);
}