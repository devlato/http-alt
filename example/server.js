var http = require(process.argv[2]);
var fs = require('fs');
var server = http.createServer(function (req, res) {
    //fs.createReadStream(__filename).pipe(res);
    res.end('whatever\n');
});
server.listen(5000);
