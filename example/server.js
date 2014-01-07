var http = require(process.argv[2]);
var server = http.createServer(function (req, res) {
    //console.log(req.headers);
    res.end('whatever\n');
});
server.listen(5000);
