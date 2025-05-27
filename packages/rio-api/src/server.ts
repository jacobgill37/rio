import { WebSocketServer } from "ws";
import { startStreamConsumer, startStreamProducer } from "./radioTest";

const server = new WebSocketServer({
  port: 8080,
});

server.on("connection", (socket) => {
  console.log("Client connected");

  // Initialise AI
  // Pull radio urls from API
  // Start feeding radio urls to AI
  // pass the AI's response to the client

  socket.on("message", async (message) => {
    console.log(`Received: ${message}`);
    const parsedMessage = JSON.parse(message.toString());

    if (parsedMessage.url) {
      console.log("Received URL:", parsedMessage.url);
      startStreamProducer(parsedMessage.url);
      await startStreamConsumer(socket);
    }
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server is running on ${server.options.port}`);
