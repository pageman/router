// A Simple NodeJS Server using Typescript

import http from "http";

const PORT = 3333;

const server = http.createServer(function (req, res) {
  // SET Headers
  res.setHeader("Content-type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  // SET Status Code to HTTP 200/OK
  res.writeHead(200);

  // Define data to send on the client
  const data = JSON.stringify({ message: "Hello world" });

  // Send data to the client
  res.end(data);
});

server.listen(PORT, function () {
  console.log("Listening on port 1234");
});
