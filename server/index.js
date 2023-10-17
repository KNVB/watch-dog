import { Server } from "socket.io";
let streamer = null;
const io = new Server({
  cors: true,
});
io.on("connect", (socket) => {
  socket.on("requestStream",()=>{
    socket.to(streamer).emit("requestStream",socket.id);
  })
  socket.on("sendAnswer",answer=>{
    console.log("Answer Sent");
    socket.to(streamer).emit("receiveAnswer",answer);
  });
  socket.on("sendICECandidateToConsumer",({iceCandidate,to})=>{
    socket.to(to).emit("addICECandidate",iceCandidate);
  });
  socket.on("sendICECandidateToStreamer",iceCandidate=>{
    socket.to(streamer).emit("addICECandidate",iceCandidate);
  });
  socket.on("sendOffer",({to,offer})=>{
    console.log("Offer Sent");
    socket.to(to).emit("receiveOffer",offer);
  });
  socket.on("streamerReady",()=>{
    streamer = socket.id;
    console.log("Streamer Ready");
  });
});
io.listen(5432);