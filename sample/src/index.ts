// A Simple NodeJS Server using Typescript

import http from "http";
import { Router } from "../../";

const PORT = 3333;
const router = new Router();
const server = http.createServer(router.inititalize());

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
