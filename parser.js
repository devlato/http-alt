var inherits = require('util').inherits;
var Duplex = require('stream').Duplex;

var Request = require('./request.js');
var Response = require('./response.js');

module.exports = Parser;
inherits(Parser, Duplex);

var states = { METHOD: 0, KEY: 1, VALUE: 2, BODY: 3 };

function Parser (cb, stream) {
    Duplex.call(this);
    this.request = new Request;
    this._state = states.METHOD;
    this._lastIndex = 0;
    this._cb = cb;
    this._stream = stream;
}

Parser.prototype._prepareRequest = function () {
    this._state = states.BODY;
    var req = this.request;
    var res = this.response = new Response(req);
    this._prev = null;
    this._cb(req, res);
    
    if (this._ready) {
        this._ready = false;
        this._read();
    }
};

Parser.prototype._read = function () {
    var self = this;
    var res = this.response;
    
    if (!res) {
        this._ready = true;
    }
    else if (res._buffer) {
        var buf = res._buffer;
        if (Array.isArray(buf)) {
            buf = Buffer.concat(buf);
        }
        var next = res._next;
        
        res._buffer = null;
        res._next = null;
        
        if (!this._sentHeader) {
            this._sentHeader = true;
            this.push(res._getHeaderBuffer());
        }
        this.push(buf);
        if (next) next();
    }
    else {
        res._ondata = function () { self._read() };
    }
    if (res && res._finished) {
        this.push(null);
    }
};

Parser.prototype._write = function (buf, enc, next) {
    if (this._state === states.BODY) {
        // handle post data, whatever
        return next();
    }
    
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
            if (this._state === states.METHOD) {
                var parts = buf.slice(0, i).toString('utf8').trim().split(' ');
                req._setMethod(parts[0]);
                req._setUrl(parts[1]);
                req._setVersion(parts[2]);
                this._state = states.KEY;
                this._lastIndex = i;
            }
            else if (this._state === states.VALUE) {
                req._setHeader(this._keyName, buf.slice(this._lastIndex, i));
                this._keyName = null;
                this._lastIndex = i;
                this._state = states.KEY;
            }
            else if (this._state === states.KEY) {
                this._lastIndex = i;
            }
        }
        else if (this._state === states.KEY && buf[i] === 58) {
            this._keyName = buf.slice(this._lastIndex, i);
            this._lastIndex = i + 1;
            this._state = states.VALUE;
        }
    }
    
    if (this._state !== states.BODY) {
        this._prev = buf;
    }
    
    next();
};
