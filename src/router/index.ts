import { MayaJsRequest, MayaJsResponse } from "../interface";
import { app, send } from "./router";
import merge from "../utils/merge";
import response from "./response";
import url from "url";

async function handler(req: MayaJsRequest, res: MayaJsResponse) {
  // Set local variables
  const parsedUrl = url.parse(req.url ?? "", true);

  // Sends result back and end request
  send(req, response(res), parsedUrl);
}

// Create mayajs router by merging the handler and app instance
export default merge(handler, app);
