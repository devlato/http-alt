var net = require('net');
var Parser = require('./parser.js');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;

exports.createServer = function (cb) {
    var server = new Server;
    if (cb) server.on('request', cb);
    return server;
};

exports.Server = Server;
inherits(Server, net.Server);

function Server () {
    var self = this;
    net.Server.call(self);
    
    this.on('connection', function (stream) {
        var parser = new Parser(function (req, res) {
            self.emit('request', req, res);
        });
        stream.pipe(parser).pipe(stream);
    });
}
