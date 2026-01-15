import express from "express";
import project from "./routes/project_s.js";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { Server } from "socket.io"; 
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

const app = express();
const server = http.createServer(app);

dotenv.config();

const allowedOrigins = [
  'http://localhost:4001',                  
  'http://localhost:5500',                  
  'http://127.0.0.1:5500',                 
  'https://project-s-nhsi.onrender.com'
]

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', "PUT", "DELETE"],
  credentials: true
}));

// CORS wrap inside Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', "PUT", "DELETE"],
    credentials: true
  }
});

const PORT = process.env.PORT || 10000;

app.use(express.json());

app.use("/manager", express.static(path.join(__dirname, "../manager_side")));
app.use("/customer", express.static(path.join(__dirname, "../customer_side")));
app.use("/", express.static(path.join(__dirname, "../logging_page")));

app.use("/project", project);

app.use((req, res) => res.status(404).send("404 Not Found"));

// ==== SOCKET LOGIC ==== 
io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  // joins specific rooms
  socket.on('join_room', (roomName) => {
    if(roomName === "manager_room") {
      socket.join("manager_room");
      console.log(`Socket ${socket.id} joined Manager Room`);
    } else {
      socket.join(`customer_${roomName}`);
      console.log("Joined room: ", `customer_${roomName}`);
    }
  });

  // sends message
  socket.on('send_message', (data) => {
    io.to(`customer_${data.customerId}`)
    .to("manager_room")
    .emit("receive_message", data);
  });

  // disconnects
  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at ${PORT}\nWelcome ${process.env.USER}`);
});
