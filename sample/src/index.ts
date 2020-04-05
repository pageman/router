// A Simple NodeJS Server using Typescript

import http from "http";
import { Router } from "../../";

const PORT = 3333;
const router = new Router();

router.add({
  path: "user",
  GET: (req, res) => {
    // Send data to the client
    res.send({ message: "Hello, World!" });
  },
});

router.add({
  path: "user",
  POST: (req, res) => {
    // Send data to the client
    res.send({ message: "This is a POST Request!" });
  },
});

const server = http.createServer(router.inititalize());

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
