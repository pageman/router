import { app } from "./router";
import handler from "./handler";
import merge from "../utils/merge";

// Create mayajs router by merging the handler and functions
export default merge(handler, app);
