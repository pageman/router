import http from "http";
import url from "url";
import { Route, Routes, RequestHandler, ResponseHandler, HttpMethods, UrlObject, HttpHeaders, Callback } from "./interface";

class Router {
  private routes: Routes = {
    GET: {},
    POST: {},
    PUT: {},
    PATCH: {},
    DELETE: {},
    OPTIONS: {},
  };

  constructor() {}

  add(route: Route) {
    const method = Object.keys(route)[1] as HttpMethods;

    if (!route[method]) {
      return;
    }

    const value = route[method] as Callback;

    if (!this.routes[method]) {
      this.routes[method] = { [route.path]: value };
      return;
    }

    this.routes[method][route.path] = value;
  }

  inititalize() {
    return (request: http.IncomingMessage, response: http.ServerResponse) => {
      // Parse URL
      let parsedURL = url.parse(request.url || "", true);

      // Get the value of URL
      let path = parsedURL.pathname || "";

      // Sanitize URL string '/request/url/' becomes 'request/url'
      path = path.replace(/^\/+|\/+$/g, "");

      let query = parsedURL.query as UrlObject;
      let headers = request.headers as HttpHeaders;
      let method = request.method as HttpMethods;
      let body = "";

      (response as any)["send"] = (value: string | number | object) => {
        // SET Headers
        response.setHeader("Content-type", "application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");

        // SET Status Code to HTTP 200/OK
        response.writeHead(200);

        // Define data to send on the client
        const data = JSON.stringify(value);

        // Send data to the client
        response.end(data);
      };

      // Get data from the REQUEST
      request.on("data", (chunk: any) => {
        // Concat chunks of data
        body += chunk;
      });

      // Listen to END event
      request.on("end", () => {
        // Define REQUEST Object
        const req: RequestHandler = { path, query, headers, method, body };

        // Get routes with same path and method
        this.routes[method]![path](req, response as ResponseHandler);
      });
    };
  }
}

export { Router };
