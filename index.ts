import http from "http";
import url from "url";
import { Route, Routes, RequestHandler, HttpMethods, UrlObject, HttpHeaders, Callback } from "./interface";

class Router {
  private routes: Routes = {};

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

    this.routes[method]![route.path] = value;
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

      // Get data from the REQUEST
      request.on("data", (chunk: any) => {
        // Concat chunks of data
        body += chunk;
      });

      // Listen to END event
      request.on("end", () => {
        // Define REQUEST Object
        const req: RequestHandler = { path, query, headers, method, body };

        // Temporary route
        const route = (req: any, res: any) => {
          // SET Headers
          res.setHeader("Content-type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");

          // SET Status Code to HTTP 200/OK
          res.writeHead(200);

          // Define data to send on the client
          const data = JSON.stringify(req);

          // Send data to the client
          res.end(data);
        };

        // Pass REQUEST and RESPONSE objects
        route(req, response);
      });
    };
  }
}

export { Router };
