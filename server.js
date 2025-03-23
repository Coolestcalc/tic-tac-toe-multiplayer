const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let players = {};
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    if (Object.keys(players).length < 2) {
        players[socket.id] = Object.keys(players).length === 0 ? "X" : "O";
        socket.emit("playerType", players[socket.id]);
        io.emit("updateBoard", board, currentPlayer);
    } else {
        socket.emit("full");
        socket.disconnect();
    }

    socket.on("move", (index) => {
        if (board[index] === "" && players[socket.id] === currentPlayer) {
            board[index] = currentPlayer;
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            io.emit("updateBoard", board, currentPlayer);
        }
    });

    socket.on("disconnect", () => {
        console.log("A player disconnected:", socket.id);
        delete players[socket.id];
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        io.emit("resetGame");
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));
