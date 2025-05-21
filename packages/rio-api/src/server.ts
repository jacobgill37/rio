import { WebSocketServer } from "ws";
import { analyseStream } from "./radioTest";

const server = new WebSocketServer({
  port: 8081,
});

server.on("connection", (socket) => {
  console.log("Client connected");

  // Initialise AI
  // Pull radio urls from API
  // Start feeding radio urls to AI
  // pass the AI's response to the client

  socket.on("message", (message) => {
    console.log(`Received: ${message}`);
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.url) {
      console.log("Received URL:", parsedMessage.url);
      analyseStream(parsedMessage.url, socket);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on ws://localhost:8081");
