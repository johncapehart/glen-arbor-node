/**
 * Created by john.capehart on 1/16/2017.
 */
// http://stackoverflow.com/a/20780657/6264046
'use strict';
var expressServer;
//var credman = require('windows-credman');
//global.testuser = credman.getCredentials("sample");

before(function(done) {
    var appPromise = require('../server-test.js').default();
    appPromise.then(function(expressApp) {
        global.myapp = expressApp;
        global.myconfig = expressApp.config;
        expressServer = expressApp.server;
        console.log('leaving before hook then');
        done();
    });
    console.log('leaving before hook');
});

after(function() {
    console.log('entering after hook');
    expressServer.close();
});

