const socket = new WebSocket("ws://localhost:8080");

socket.addEventListener("open", (event) => {
  console.log("Connected to the server");
});

socket.addEventListener("message", (event) => {
  console.log("Message from server: ", event.data);
});

socket.addEventListener("close", (event) => {
  console.log("Disconnected from the server");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error: ", event);
});

const message = {
  url: "http://stream-mz.planetradio.co.uk/planetrock.mp3?direct=true&aw_0_1st.playerid=BMUK_TuneIn&aw_0_1st.skey=7374499933",
};

socket.onopen = () => {
  console.log("WebSocket connection opened");
  socket.send(JSON.stringify(message));
};
