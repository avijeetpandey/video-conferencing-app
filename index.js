const express = require("express");

const app = express();

const server = require("http").Server(app);
const io = require("socket.io")(server);

const { v4: uuidv4 } = require("uuid");

const { ExpressPeerServer } = require("peer");

const peerServer = ExpressPeerServer(server, {
  debud: true,
});

let ejs = require("ejs");

app.use(express.static("./assets"));

// set up the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    // messages
    socket.on("message", (message) => {
      //send message to the same room
      io.to(roomId).emit("createMessage", message);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(3000);
