import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

export default function Consumer() {
    let videoRef = useRef();
    useEffect(() => {
        let config = {
            iceServers: [
                {
                    urls: "turn:relay1.expressturn.com:3478",
                    credential: "oHQxqIXXX63eZpaK",
                    username: "efVTRNEFUYDNDWD9WP",
                },
            ]
        }
        let initDataChannel = (dataChannel) => {
            dataChannel.onclose = () => {
                console.log("DataChannel is closed!");
            };
            dataChannel.onerror = (event) => {
                console.log("An error occured in DataChannel:" + JSON.stringify(event));
            };
            dataChannel.onmessage = (message) => {
                console.log("Received Message from DataChannel");
            };
            dataChannel.onopen = () => {
                console.log("DataChannel is opened!");
            };
        }
        let init = async () => {
            let peerConnection = new RTCPeerConnection(config);
            const socket = io("http://localhost:5432");

            socket.emit("requestStream");
            socket.on("receiveOffer", async offer => {
                console.log("receive Offer");
                peerConnection.ondatachannel = (event) => {
                    console.log("Data channel event");
                    initDataChannel(event.channel);
                }
                peerConnection.oniceconnectionstatechange = () => {
                    console.log("ICE Connection State:" + peerConnection.iceConnectionState);
                }
                peerConnection.onicegatheringstatechange = () => {
                    console.log("ICE Gathering State:" + peerConnection.iceGatheringState);
                }
                peerConnection.onsignalingstatechange = () => {
                    console.log("Signaling State:" + peerConnection.signalingState);
                }
                peerConnection.onicecandidate = event => {
                    console.log("Candidate Event.")
                    if (event.candidate !== null) {
                        socket.emit("sendICECandidateToStreamer", event.candidate);
                    }
                }
                peerConnection.ontrack = event => {
                    console.log("track event");
                    videoRef.current.srcObject = event.streams[0];
                }
                await peerConnection.setRemoteDescription(offer);
                await peerConnection.setLocalDescription();
                socket.emit("sendAnswer", peerConnection.localDescription);
                socket.on("addICECandidate", candidate => {
                    console.log("add ICE Candidate event");
                    peerConnection.addIceCandidate(candidate);
                });
            });
        }
        init();
    }, []);
    return (
        <>
            <div>Consumer</div>
            <video autoPlay muted controls ref={videoRef} />
        </>);
}