var Writable = require('readable-stream').Writable;
var inherits = require('util').inherits;

inherits(Response, Writable);
module.exports = Response;

function Response (req) {
    Writable.call(this);
    this.statusCode = 200;
    this._request = req;
    this._headers = {
        Date: new Date().toGMTString(),
        Connection: 'keep-alive',
        'Transfer-Encoding': 'chunked'
    };
}

Response.prototype._getHeader = function () {
    var req = this._request;
    var keys = Object.keys(this._headers);
    var code = parseInt(this.statusCode);
    var ok = code >= 200 && code < 300;
    
    var lines = [ 'HTTP/' + req.httpVersion + ' ' + code + (ok ? ' OK' : '') ];
    
    for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];
        lines.push(key + ': ' + this._headers[key]);
    }
    
    return Buffer(lines.join('\n') + '\n\n');
}

Response.prototype._write = function (buf, enc, next) {
    this._buffer = buf;
    this._next = next;
    
    if (this._ondata) {
        this._ondata();
        this._ondata = null;
    }
};
