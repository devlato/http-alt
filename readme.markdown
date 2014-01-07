# http-alt

alternate implementation of the core node http server

This is a pure javascript http server implementation that has partial parity
with the node core API.

This module is currently slower than the `http` from core.

# performance

On my laptop with node v0.11.10 running example/server.js, http-alt gives:

```
$ ab -c 100 -t 5 http://localhost:5000/ 2>/dev/null | grep
'Requests per second:'
Requests per second:    1173.06 [#/sec] (mean)
```

and node core is at:

```
$ ab -c 100 -t 5 http://localhost:5000/ 2>/dev/null | grep
'Requests per second:'
Requests per second:    1976.75 [#/sec] (mean)
```

# methods

[The same as node core](http://nodejs.org/docs/latest/api/http.html),
except less complete.

# install

With [npm](https://npmjs.org) do:

```
npm install http-alt
```

# license

MIT
