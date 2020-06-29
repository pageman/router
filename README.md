<h1 align="center">MayaJS Router</h1>
<p align="center"><img src="https://github.com/mayajs/maya/blob/master/maya.svg" ></p>
<h2 align="center">Lightweight, simple and fast NodeJS Router developed using Typescript.</h2>

## Motivation

We know that this is another **Express JS** like project. We develop **@mayajs/router** not to compete but to have our own router for our other projects like [@mayajs/core](https://github.com/mayajs/maya#readme). As much as possible we don't want to rely on other framework/library to create our own projects. This is just for maintainability and ease of transition for future updates.

## Roadmap

You can see the detail roadmap of the project [here.](https://github.com/mayajs/router/blob/master/ROADMAP.md)

## Suggestions

For suggestions and features you want to see in the future you can visit our [issues section.](https://github.com/mayajs/router/issues)

## Getting started

Before installing this package make sure to download and install Node.js 10 or higher.

<sub>**To check your node version**</sub>

```shell
npm -v
```

For new project kindly initialize npm using the command below or see documentation [here](https://docs.npmjs.com/creating-a-package-json-file).

```shell
npm init
```

Installation via command-line

```shell
npm i @mayajs/router
```

## Features

- Simple interface
- Uses native Nodejs API
- Built in body parser
- Support for [ExpressJS Middlewares](https://expressjs.com/en/resources/middleware.html)
- Compatible with typescript
- ES6 compatible
- Super ligthweight
- No dependencies
- Fast execution
- Easy to learn

## Quick Start

The easiest way to get started is to create a simple route

```ts
import Router from "@mayajs/router";
import http from "http";

const PORT = process.env.PORT || 3000; // This is not required
const router = new Router();

// Define your routes method in this manner
router.get("path", ({ res, req, params, query, body }) => {
  res.send({ message: "Hello, World" });
});

// Pass the router and initialize it for used
http.createServer(router.init).listen(PORT, () => {
  console.log("Server listening on port", PORT, "...");
});
```

## Chaining

You can also chain your methods like this for easy management of routes.

```ts
router
  .get("path", ({ res, req }) => {
    // Do your thing here
  })
  .post("path", ({ res, req }) => {
    // Do your thing here
  })
  .put("path", ({ res, req }) => {
    // Do your thing here
  })
  .delete("path", ({ res, req }) => {
    // Do your thing here
  });
```

## Params

We also support `request params` like what other routing library implemented. Just add **:** infront of your named route i.e. `/user/:id` and it will treat the `:id` as a params.

```ts
router.get("path/:id", ({ res, req, params, query, body }) => {
  // Access id using req.params object
  req.params.id;

  // or access it using params variable
  params.id;
});
```

## Query String

To get the query string you can call the `query` object inside the request object or via function parameters.

```ts
router.get("path", ({ res, req, params, query, body }) => {
  // Access query strings using req.query object
  req.query.limit;

  // or access it using query variable
  query.limit;
});
```

## Request Object

If you think there are alot of parameters on your callback function you can remove them.
Params, query and body are optional variables. They are also accessible inside the `req` object.

```ts
router.get("path", ({ res, req }) => {
  req.params;
  req.query;
  req.body;
});
```

#### NOTE:

> The `req.body` object is already parsed for **Content-Type** of `application/json, application/x-www-form-urlencoded and multipart/form-data`.
> For `multipart/form-data` with files we are not yet supporting it.

## Middlewares

We treat a middleware as another callback function. MayaJS router supports **ExpressJS** middleware as well as our own middlewares.
To use a middleware see example below:

```ts
router.use((res, req, next, error) => {
  // This `error` variable comes from the previous middleware
  console.log(error);

  // The `next` function will trigger the end of this callback function
  // and execute the next middleware in the list
  next();
});
```

## Collaborating

See collaborating guides [here.](https://github.com/mayajs/maya/edit/master/COLLABORATOR_GUIDE.md)

## People

Author and maintainer [Mac Ignacio](https://github.com/Mackignacio)

## License

[MIT](https://github.com/mayajs/router/blob/develop/LICENSE)
