export default class WebRTCConnection{
    constructor(id){
        let config = {
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                        "stun:stun3.l.google.com:19302",
                        "stun:stun4.l.google.com:19302",
                    ]
                },						
                {
                    urls: 'turn:openrelay.metered.ca:80?transport=tcp',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ]
        }
        let dataChannel = null,peerConnection=null,stream=null;
        let ignoreOffer = false,makingOffer = false, polite = false;
        let iceCandidateHandler, negotiationHandler,trackHandler;

        this.addICECandidate = async(iceCandidate) => {
            if (peerConnection.connectionState !=="closed"){
                await peerConnection.addIceCandidate(iceCandidate);
            }
        }
       
        this.call = () => {
            polite = true;					
            initDataChannel(peerConnection.createDataChannel("chat"));
        }
        this.init=(stream)=>{
            peerConnection=new RTCPeerConnection(config);
            peerConnection.ondatachannel = (event) => {
                initDataChannel(event.channel);
            }
            peerConnection.onconnectionstatechange = ()=>{
                connectionStateChangeHandler();
            }
            peerConnection.onicecandidate = e=>{
                if (e.candidate) {
                    msgLogger(id+" received an ice candidate.");
                    iceCandidateHandler(e.candidate);
                }
            }
            peerConnection.onnegotiationneeded =  async () => {
                msgLogger("====Negotiation start====");
                try {
                    makingOffer = true;
                    await peerConnection.setLocalDescription();
                    msgLogger(id+" local description is generated.");
                    negotiationHandler(peerConnection.localDescription);
                } catch (err) {
                    msgLogger("Failed to send Local Description:" + err);
                } finally {
                    makingOffer = false;
                    msgLogger("====Negotiation end====");
                }
            }
            peerConnection.ontrack = event => {
                msgLogger(id+" received track event");
                trackHandler(event.streams[0]);
            };
            if (stream){
                for (const track of stream.getTracks()) {
                    peerConnection.addTrack(track, stream);
                }
            }
            msgLogger(id+" init completed");
        }				
        this.on=(eventType,handler)=>{
            switch (eventType){
                case "iceCandidate":
                    iceCandidateHandler =handler;
                    break;
                case "negotiation":
                    negotiationHandler = handler;
                    break;
                case "track":
                    trackHandler = handler;
                    break;
                default:
                    break
            }
        }
        this.setRemoteDescription = async (remoteDescription) => {
            msgLogger("====processRemoteDescription Start====");
            const offerCollision = (remoteDescription.type === "offer") &&
                (makingOffer || peerConnection.signalingState !== "stable");
            ignoreOffer = !polite && offerCollision;
            msgLogger("remoteDescription.type=" + remoteDescription.type + ",makingOffer=" + makingOffer + ", peerConnection.signalingState=" + peerConnection.signalingState);
            msgLogger("ignoreOffer = " + ignoreOffer + ",offerCollision=" + offerCollision + ",polite=" + polite);
            if (ignoreOffer) {
                msgLogger("Ignore offer from " + this.peerName);
                return;
            }
            try{
                await peerConnection.setRemoteDescription(remoteDescription);
            }catch (error){
                msgLogger("peerConnection.signalingState="+peerConnection.signalingState);
                msgLogger("An error occur when setting remote description.");
                msgLogger(error);
            }
            if (remoteDescription.type === "offer") {
                try{
                    await peerConnection.setLocalDescription();
                    negotiationHandler(peerConnection.localDescription);
                    msgLogger(id+" local description is generated.");
                }catch (error){
                    msgLogger("peerConnection.signalingState="+peerConnection.signalingState);
                    msgLogger("An error occur when setting local description.");
                    msgLogger(error);
                }                
            }
            msgLogger("====processRemoteDescription End====");
        }
        //========================================================
        //  Private function
        //========================================================
        let connectionStateChangeHandler=()=>{
            msgLogger(id+" Connection state="+peerConnection.connectionState);
        }
        
        /*=====================================================================*/
        /*        Initialize the data channel and its event handler            */
        /*=====================================================================*/
        let initDataChannel = (channel) => {
            dataChannel = channel;
            dataChannel.onclose = () => {
                msgLogger("DataChannel is closed!");
            };
            dataChannel.onerror = (event) => {
                msgLogger("An error occured in DataChannel:"+JSON.stringify(event));
            };
            dataChannel.onmessage = (message) => {
                msgLogger("Received Message from DataChannel");
            };
            dataChannel.onopen = () => {
                msgLogger("DataChannel is opened!");
            };
        }
        
        let msgLogger = (msg) => {
            console.log(msg);
        }        
    }
};