var RPC = require('../');
var test = require('tape');
var EventEmitter = require('events').EventEmitter;

test('fake', function (t) {
    t.plan(4);

    var frame = {
        _ev: new EventEmitter,
        addEventListener: function (name, cb) {
            t.equal(name, 'message');
            frame._ev.on(name, cb);
        },
        postMessage: function (data) {
            frame._ev.emit('message', {
                origin: parent.origin,
                data: data
            });
        },
        origin: 'http://frame.com'
    };

    var parent = {
        _ev: new EventEmitter,
        addEventListener: function (name, cb) {
            t.equal(name, 'message');
            parent._ev.on(name, cb);
        },
        postMessage: function (data) {
            parent._ev.emit('message', {
                origin: frame.origin,
                data: data
            });
        },
        origin: 'http://parent.com'
    };

    frame.rpc = RPC(frame, parent, parent.origin, {
        beep: function (n, cb) {
            t.equal(n, 5);
            cb(n * 111);
        }
    });

    parent.rpc = RPC(parent, frame, frame.origin);
    parent.rpc.call('beep', 5, function (result) {
        t.equal(result, 555);
    });
});
