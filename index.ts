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
      const parsedURL = url.parse(request.url || "", true);

      // Define default send function
      (response as any)["send"] = this.requestSender(response);

      let body = "";

      // Concat chunks of data
      const chunk = (chunks: any) => {
        body += chunks;
      };

      // Get data from the REQUEST
      request.on("data", chunk);

      // Listen to END event
      request.on("end", () => {
        try {
          // Define REQUEST Object
          const req: RequestHandler = this.requestHandlerBuilder(parsedURL || "", request);
          req.body = body;

          // Get routes with same path and method
          this.routes[req.method]![req.path](req, response as ResponseHandler);
        } catch (error) {
          // Set status code to 500/Internal server error
          response.writeHead(500);

          // End request
          response.end();
        }
      });
    };
  }

  /**
   * Builds a request handler object.
   *
   * @param {url.UrlWithParsedQuery} parsedURL
   *        Parsed url string from `request.url`.
   *
   * @param {Object} request
   *         An object that describe the request.
   *
   * @return { RequestHandler }
   *         Request Handler object
   */
  private requestHandlerBuilder(parsedURL: url.UrlWithParsedQuery, request: http.IncomingMessage): RequestHandler {
    // Get the value of URL
    const pathName = parsedURL.pathname || "";

    // Sanitize URL string '/request/url/' becomes 'request/url'
    const path = pathName.replace(/^\/+|\/+$/g, "");

    // Get the value of query
    const query = parsedURL.query as UrlObject;

    // Get the value of headers from request
    const headers = request.headers as HttpHeaders;

    // Get the value of method from request
    const method = request.method as HttpMethods;

    return { path, query, headers, method, body: "" };
  }

  /**
   * Creates an anonymous function that accepts `value` as parameters and used as `default sender` method.
   *
   * @param {http.ServerResponse} response
   *        Response object from NodeJS.
   *
   * @return { Function }
   *         Anonymous function for default sending of response.
   */
  private requestSender(response: http.ServerResponse): (value: string | number | object) => void {
    return (value: string | number | object) => {
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
  }
}

export { Router };
