var http = require('../');
var server = http.createServer(function (req, res) {
    res.end('whatever\n');
});
server.listen(5000);
