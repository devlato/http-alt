var inherits = require('util').inherits;
var Duplex = require('stream').Duplex;

var Request = require('./request.js');
var Response = require('./response.js');

module.exports = Parser;
inherits(Parser, Duplex);

var states = { GET: 0, KEY: 1, VALUE: 2, BODY: 3 };

function Parser (cb) {
    Duplex.call(this);
    this.request = new Request;
    this.response = new Response;
    this.state = states.GET;
    this.lastIndex = 0;
    this.cb = cb;
}

Parser.prototype._prepareRequest = function () {
    this.state = states.BODY;
    var req = this.request;
    var res = this.response;
    this._prev = null;
    this.cb(req, res);
};

Parser.prototype._read = function (size) {
};

Parser.prototype._write = function (buf, enc, next) {
    var keyName;
    var req = this.request;
    
    var i = 0;
    if (this._prev) {
        buf = Buffer.concat([ this._prev, buf ]);
        i = this._prev.length;
        this._prev = null;
    }
    for (var len = buf.length; i < len; i++) {
        if (i >= 1 && buf[i] === 0x0a && buf[i-1] === 0x0a) {
            this._prepareRequest();
        }
        if (i >= 2 && buf[i] === 0x0a && buf[i-1] === 0x0d
        && buf[i-2] === 0x0a) {
            this._prepareRequest();
        }
        else if (buf[i] === 0x0a) {
            if (this.state === states.GET) {
                var parts = buf.slice(0, i).toString('utf8').split(' ');
                req._setMethod(parts[0]);
                req._setUrl(parts[1]);
                req._setVersion(parts[2]);
                this.state = states.KEY;
                this.lastIndex = i;
            }
            else if (this.state === states.VALUE) {
                req._setHeader(keyName, buf.slice(this.lastIndex, i));
                keyName = null;
                this.lastIndex = i;
                this.state = states.KEY;
            }
            else if (this.state === states.KEY) {
                this.lastIndex = i;
            }
        }
        else if (this.state === states.KEY && buf[i] === 58) {
            keyName = buf.slice(this.lastIndex, i);
            this.lastIndex = i + 1;
            this.state = states.VALUE;
        }
    }
    
    if (this.state !== states.BODY) {
        this._prev = buf;
    }
    
    next();
};
