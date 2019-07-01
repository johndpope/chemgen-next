# Web Server Architecture

The web server code is divided into two parts. The server side code which talks directly to the database and generates the REST API, and a client side that consumes the REST APIs and generates interfaces for the team to use. The client side never directly talks to the database, but instead gets everything through the REST API.

All REST APIs are http called, which are mapped to function calls in the client side codebase, mostly for the purposes of type checking.

## Server Side

On the server side any data structure that gets served up to the front end is queried through a REST API. The REST API is in the standard Loopbackjs format. 

Official documentation for adding and modifying the REST APIs and adding additional endpoints are available through: Loopbackjs Docs [Extend your Api](https://loopback.io/doc/en/lb3/Extend-your-API.html).

Additional endpoints (beyond find, findOne, findMany, count, delete, etc) are defined in `chemgen-next-server/common/models/$ModelName/def/$ModelName.js`

The ORM for a model is defined in: `chemgen-next-server/common/models/$ModelName/def/$ModelName.json` 

Example REST call:

```
curl -X GET --header 'Accept: application/json' 'http://localhost:3000/api/ExpAssays/findOne'
```

You can find all exposed models and associated endpoints by opening up your browser at this web address.

```
http://localhost:3000/explorer/
```

## Client Side and REST API Function Maps

These are called on the client side using an http library. Each of the exposed REST points is mapped to a function call.

The REST call on the server:

```
http://localhost:3000/api/ExpAssays/findOne
```

Maps to the function call on the client:

```
this.expAssayApi
    .findOne()
    .subscribe((results) => {console.log(results)}, 
    (error) =>{console.log(error)});
```

Because this is a REST API you could simply call it through a regular http call as well. The functions are only there for convenience.

