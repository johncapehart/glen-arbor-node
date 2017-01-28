// Things that happen on a per server basis. A server is a machine
'use strict';
exports.default = function() {
    console.log('Starting test server');
    var path = require('path');
    var localenvDir = path.resolve('localenv');
    var serviceDir = [path.resolve('services')];
    // following returns a promise
    var appPromise = require('./index.js').default(localenvDir, serviceDir);
    console.log('test-server.js complete with promise ' + appPromise);
    return appPromise;
};