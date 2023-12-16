const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const cors = require("cors"); // Import the cors middleware
const { v4: uuidv4 } = require("uuid");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const corsOptions = {
  origin: "https://sweet-chatx-18a218.netlify.app", // Replace with your frontend origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.get("/ping",(req,res)=>res.send("pong"))
let connectedUsers = {};
function getFormattedTimestamp() {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  const timestamp = new Date().toLocaleString('en-US', options);
  return timestamp;
}
io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    let disconnectedUserDetails = connectedUsers[socket.id];
    delete connectedUsers[socket.id];
    if (disconnectedUserDetails) {
      io.sockets.emit(disconnectedUserDetails.roomKey, {
        text: `${disconnectedUserDetails.nickName} left the chat!`,
        room: disconnectedUserDetails.roomKey,
        owner: null,
        type: "info",
        members: Object.values(connectedUsers).filter(
          (t) => t.roomKey == disconnectedUserDetails.roomKey
        ),
        timeStamp: getFormattedTimestamp()
      });
    }
  });
  // Handle chat messages
  socket.on("chat message", (message) => {
    io.sockets.emit(message.room, message);
  });

  // Create a new room with a unique key
  socket.on("create room", (nickName) => {
    const roomKey = uuidv4();
    socket.join(roomKey);
    io.to(socket.id).emit("room created", { key: roomKey, nickName });
  });

  // Join an existing room
  socket.on("join room", ({ roomKey, nickName }) => {
    connectedUsers[socket.id] = { nickName, roomKey };
    socket.join(roomKey);
    io.sockets.emit(roomKey, {
      text: `${nickName} joined the chat!`,
      room: roomKey,
      owner: null,
      type: "info",
      members: Object.values(connectedUsers).filter(
        (t) => t.roomKey == roomKey
      ),
      timeStamp: getFormattedTimestamp()
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
