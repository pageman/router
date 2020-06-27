import { parse } from "querystring";
import http from "http";

const TEXT_PLAIN = "text/plain";
const FORM_DATA = "multipart/form-data";
const APPLICATION_JSON = "application/json";
const FORM_URLENCODED = "application/x-www-form-urlencoded";

export = function (request: http.IncomingMessage, callback: (body: any) => any) {
  const contentType = request.headers["content-type"] ?? "";

  let chunk = (chunks: any) => {
    body += chunks;
  };

  let body: any = "";
  let onEnd = () => {};

  if (request.method === "GET" || request.method === "OPTIONS") {
    // Don't parse 'GET' and 'OPTIONS' request method
    callback(body);
    return;
  }

  if (!contentType || contentType === TEXT_PLAIN) {
    // Request will be treated as 'text/plain'
    onEnd = () => callback(body);
  }

  if (contentType.includes(FORM_URLENCODED)) {
    // Request will be treated as 'application/x-www-form-urlencoded'
    onEnd = () => callback(parse(body));
  }

  if (contentType.includes(APPLICATION_JSON)) {
    // Request will be treated as 'application/json'
    onEnd = () => callback(JSON.parse(body));
  }

  if (contentType.includes(FORM_DATA)) {
    // Request will be treated as 'multipart/form-data'

    chunk = (chunks: Buffer) => {
      body += chunks.toString();
    };

    onEnd = () => formDataParser(body, contentType, callback);
  }

  // Get data from the REQUEST
  request.on("data", chunk);

  // Listen to end event
  request.on("end", onEnd);
};

function formDataParser(body: any, contentType: string, callback: (body: any) => any) {
  if (body.includes("filename=")) {
    throw new Error("Request 'multipart/form-data' with files is not yet supported!");
  }

  const base = (bound: string) => `(?:${bound}[\\r\\n\\w\\-]+?:[\\s\\w\\-;\\w=]+?"(?<field>.+?)"[\\r\\n]+?(?<value>.+?)[\\r\\n]+)`;
  const boundary = contentType.split("boundary=")[1];
  const regex = new RegExp(base(boundary), "gm");

  let jsonBody: any = {};
  let result;
  while ((result = regex.exec(body))) {
    if (result?.groups) {
      const { field, value } = result?.groups;
      jsonBody[field] = value;
    }
  }

  callback(jsonBody);
}
