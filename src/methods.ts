import http from "http";
import { RequestMethod } from "./interfaces";

/**
 *  Generic methods from Node.js 0.10
 * */
const genericMethods = ["get", "post", "put", "head", "delete", "options", "patch"];

/**
 *  Current Node.js methods
 * */
const nodeHttpMethods = http.METHODS && http.METHODS.map((method) => method.toLowerCase());

export = (nodeHttpMethods || genericMethods) as RequestMethod[];
