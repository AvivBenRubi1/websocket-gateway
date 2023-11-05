const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const DroneData = require("./DTOs/drone-data.dto");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

function startSimulation(socket) {
  function createDrone() {
    let droneData = new DroneData(31.5017, 34.4668, drone_id.toString());
    setInterval(() => {
      droneData.latitude += 0.004;
      droneData.longitude += 0.003;
      socket.emit("dji_telemetry", droneData);
    }, 1000);
  }

  let droneId = 0;
  createDrone();
  return setInterval(() => {
    createDrone();
    droneId++;
  }, 20000);
}

io.on("connection", (socket) => {
  console.log("A user connected");
  let simulationInterval = startSimulation(socket);

  socket.on("dji_telemetry", (sd) => {
    console.log(sd);
    socket.broadcast.emit("sensor_data", sd);
  });

  socket.on("disconnect", () => {
    clearInterval(simulationInterval);
    console.log("A user disconnected\n");
  });
});

const PORT = 4000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
