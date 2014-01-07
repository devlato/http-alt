var http = require(process.argv[2]);
var server = http.createServer(function (req, res) {
    res.end('whatever\n');
});
server.listen(5000);

if (process.argv[3] === 'mem') {
    var sprintf = require('sprintf');
    setInterval(function () {
        var used = process.memoryUsage().heapUsed;
        console.log(sprintf('%.2f M', used / 1024 / 1024));
    }, 1000);
}
