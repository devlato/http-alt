var Writable = require('stream').Writable;
var inherits = require('util').inherits;

inherits(Response, Writable);
module.exports = Response;

function Response () {
    Writable.call(this);
}

Response.prototype._write = function (buf, enc, next) {
    this._buffer = buf;
    this._next = next;
};
