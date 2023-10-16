import { Server } from "socket.io";
let streamer = null;
const io = new Server({
  cors: true,
});
io.on("connect", (socket) => {
  socket.on("answer",({answer,to})=>{
    console.log("answer event");
    socket.to(to).emit("receiveAnswer",answer);
  });
  socket.on("sendICECandidateToConsumer",({iceCandidate,to})=>{
    socket.to(to).emit("addICECandidate",iceCandidate);
  });
  socket.on("sendICECandidateToStreamer",iceCandidate=>{
    socket.to(streamer).emit("addICECandidate",iceCandidate);
  });
  socket.on("offer",offer=>{
    socket.to(streamer).emit("receiveOffer",{to:socket.id,offer:offer});
  });
  socket.on("streamerReady",()=>{
    streamer = socket.id;
    console.log("Streamer Ready");
  });
});
io.listen(5432);