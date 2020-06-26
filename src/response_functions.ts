import http from "http";
import { AdditionalResponseObjectFunctions } from "./interfaces";

export = class ResponseFunctions implements AdditionalResponseObjectFunctions {
  constructor(private res: http.ServerResponse) {}

  send(value: any) {
    const contentType = "Content-Type";
    const isJSON = value instanceof Object;
    this.res.writeHead(200, { [contentType]: isJSON ? "application/json" : "text/plain" });
    this.endResponse(isJSON ? JSON.stringify(value) : value);
  }

  json(json: object) {
    this.res.writeHead(200, { "Content-Type": "application/json" });
    this.endResponse(JSON.stringify(json));
  }

  html(html: string) {
    this.res.writeHead(200, { "Content-Type": "text/html" });
    this.endResponse(html);
  }

  private endResponse(value: any) {
    this.res.write(value);
    this.res.end();
  }
};
