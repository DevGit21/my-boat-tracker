import express from "express";
import WebSocket from "ws";

const app = express();
const port = 3000;

const socket = new WebSocket("wss://stream.aisstream.io/v0/stream");
const API_KEY = "b9710779ae232dfef68e6104104a5fc280d3bb07";
let latestShipDetails = null;

socket.addEventListener("open", (_) => {
  const subscriptionMessage = {
    APIkey: API_KEY,
    BoundingBoxes: [
      [
        [-180, -90],
        [180, 90],
      ],
    ],
    FiltersShipMMSI: ["219230000"]
  };
  console.log(JSON.stringify(subscriptionMessage));
  socket.send(JSON.stringify(subscriptionMessage));
});

socket.addEventListener("error", (event) => {
  console.log(event);
});

socket.addEventListener("message", (event) => {
  let aisMessage = JSON.parse(event.data);
  if (aisMessage["MessageType"] === "PositionReport") {
    let positionReport = aisMessage["Message"]["PositionReport"];
    console.log(positionReport);
    latestShipDetails = {
      ShipName: aisMessage["MetaData"]["ShipName"],
      ShipId: positionReport["UserID"],
      Latitude: positionReport["Latitude"],
      Longitude: positionReport["Longitude"],
      Sog: positionReport["Sog"],
      Cog: positionReport["Cog"]
    };
  }
});

app.get("/ship-details", (req, res) => {
  if (latestShipDetails) {
    res.json(latestShipDetails);
  } else {
    res.status(404).send("No ship details available");
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
