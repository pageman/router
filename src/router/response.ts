import { ResponseObjectProps, MayaJsResponse } from "../interface";
import merge from "../utils/merge";
import http from "http";

function ResponseFunctions(res: http.ServerResponse): ResponseObjectProps {
  const endResponse = (value: any) => {
    res.write(`${value}`);
    res.end();
  };

  return {
    send(value: any, statusCode = 200) {
      const isText = typeof value === "string";
      const isError = value instanceof Error;
      res.writeHead(isError ? 400 : statusCode, { "Content-Type": !isText ? "application/json" : "text/plain" });
      endResponse(!isText ? JSON.stringify(isError ? { message: value.message } : value) : value);
    },
    json(json: object, statusCode = 200) {
      res.writeHead(statusCode, { "Content-Type": "application/json" });
      endResponse(JSON.stringify(json));
    },
    html(html: string, statusCode = 200) {
      res.writeHead(statusCode, { "Content-Type": "text/html" });
      endResponse(html);
    },
  };
}

export default function createResponseObject(res: http.ServerResponse): MayaJsResponse {
  return merge(res, ResponseFunctions(res));
}
