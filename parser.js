var inherits = require('util').inherits;
var Duplex = require('stream').Duplex;

var Request = require('./request.js');
var Response = require('./response.js');

module.exports = Parser;
inherits(Parser, Duplex);

var states = { GET: 0, KEY: 1, VALUE: 2 };

function Parser (cb) {
    Duplex.call(this);
    this.request = new Request;
    this.response = new Response;
    this.state = states.GET;
    this.cb = cb;
}

Parser.prototype._prepareRequest = function () {
    var req = this.request;
    var res = this.response;
    this.cb(req, res);
};

Parser.prototype._read = function (size) {
};

Parser.prototype._write = function (buf, enc, next) {
    var lastIndex = 0;
    var keyName;
    var req = this.request;
    
    for (var i = 0, len = buf.length; i < len; i++) {
        if ((i >= 2 && buf[i] === 0x0a && buf[i-1] === 0x0a)
        || (i >= 3 && buf[i] === 0x0a && buf[i-1] === 0x0d
        && buf[i-2] === 0x0a)) {
            this._prepareRequest();
        }
        else if (buf[i] === 0x0a) {
            if (this._state === states.GET) {
                var parts = buf.slice(0, i).toString('utf8').split(' ');
                req._setMethod(parts[0]);
                req._setUrl(parts[1]);
                req._setVersion(parts[2]);
                this._state = states.KEY;
                lastIndex = i;
            }
            else if (this._state === states.VALUE) {
                req._setHeader(keyName, buf.slice(lastIndex, i));
                keyName = null;
                lastIndex = i;
                this._state = states.KEY;
            }
            else if (this._state === states.KEY) {
                lastIndex = i;
            }
        }
        else if (this._state === states.KEY && buf[i] === 58) {
            keyName = buf.slice(lastIndex, i);
            lastIndex = i + 1;
            this._state = states.VALUE;
        }
    }
    next();
};
