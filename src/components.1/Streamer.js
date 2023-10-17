import { useEffect } from "react";
import { io } from "socket.io-client";
import LocalStreamManager from "../common/LocalStreamManager";
export default function Streamer() {
    useEffect(() => {
        let config = {
            iceServers: [
                {
                    urls: "turn:relay1.expressturn.com:3478",
                    credential: "oHQxqIXXX63eZpaK",
                    username: "efVTRNEFUYDNDWD9WP",
                }
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
            let stream = await LocalStreamManager.getMediaStream(true, true);
            const socket = io("http://localhost:5432");
            socket.emit("streamerReady");
            socket.on("requestStream", to => {
                console.log("receive requestStream event");
                let peerConnection = new RTCPeerConnection(config);

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
                        socket.emit("sendICECandidateToConsumer", { iceCandidate: event.candidate, to });
                    };
                }
                peerConnection.onnegotiationneeded = async event => {
                    console.log("Negotiation Event.");                   
                    await peerConnection.setLocalDescription();
                    socket.emit("sendOffer", { offer: peerConnection.localDescription, to: to });                   
                }
                for (let track of stream.getTracks()) {
                    peerConnection.addTrack(track, stream);
                }
                socket.on("receiveAnswer", async answer => {
                    console.log("receive answer");
                    await peerConnection.setRemoteDescription(answer);
                })
                socket.on("addICECandidate", candidate => {
                    console.log("add ICE Candidate event");
                    peerConnection.addIceCandidate(candidate);
                });
            });
        }
        init();
    }, []);
    return <div>Streamer</div>
}