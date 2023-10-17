import { Server } from "socket.io";
let streamer = null;
const io = new Server({
  cors: true,
});
io.on("connect", (socket) => {
  socket.on("requestStream", () => {
    socket.to(streamer).emit("requestStream", socket.id);
  })
  socket.on("sendAnswer", ({ to, answer }) => {
    console.log("Answer Sent");
    socket.to(to).emit("receiveAnswer", answer);
  });
  socket.on("sendICECandidateToConsumer", ({ iceCandidate, to }) => {
    socket.to(to).emit("addICECandidate", iceCandidate);
  });
  socket.on("sendICECandidateToStreamer", iceCandidate => {
    socket.to(streamer).emit("addICECandidate", iceCandidate);
  });
  socket.on("sendOffer", offer => {
    console.log("Offer Sent");
    socket.to(streamer).emit("receiveOffer", { offer, to: socket.id });
  });
  socket.on("streamerReady", () => {
    streamer = socket.id;
    console.log("Streamer Ready");
  });
});
io.listen(5432);