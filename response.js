var Writable = require('stream').Writable;
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
    this._encoding = 'chunked';
    
    this.on('finish', this._finishEncode);
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
    this._buffer = this._encode(buf);
    this._next = next;
    
    if (this._ondata) {
        this._ondata();
        this._ondata = null;
    }
};

Response.prototype._encode = function (buf) {
    var enc = this._encoding;
    if (enc === 'plain') return buf;
    if (enc === 'chunked') {
        var pre = buf.length.toString(16) + '\r\n';
        var len = pre.length + buf.length;
        var b = new Buffer(len);
        for (var i = 0; i < pre.length; i++) {
            b[i] = pre.charCodeAt(i);
        }
        buf.copy(b, pre.length);
        return b;
    }
};

Response.prototype._finishEncode = function () {
    var enc = this._encoding;
    this._finished = true;
    
    if (enc !== 'chunked') return;
    if (this._buffer) {
        console.log('!! exists'); 
    }
    else {
        console.log('!! no buffer');
        this._buffer = Buffer('0\r\n');
    }
    if (this._ondata) this._ondata();
};
