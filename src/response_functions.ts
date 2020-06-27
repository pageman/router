import http from "http";
import { AdditionalResponseObjectFunctions } from "./interfaces";

export = function ResponseFunctions(res: http.ServerResponse): AdditionalResponseObjectFunctions {
  const endResponse = (value: any) => {
    res.write(value);
    res.end();
  };

  return {
    send(value: any) {
      const contentType = "Content-Type";
      const isJSON = value instanceof Object;
      res.writeHead(200, { [contentType]: isJSON ? "application/json" : "text/plain" });
      endResponse(isJSON ? JSON.stringify(value) : value);
    },
    json(json: object) {
      res.writeHead(200, { "Content-Type": "application/json" });
      endResponse(JSON.stringify(json));
    },
    html(html: string) {
      res.writeHead(200, { "Content-Type": "text/html" });
      endResponse(html);
    },
  };
};
