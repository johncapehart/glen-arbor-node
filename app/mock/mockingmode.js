/**
 * Created by john.capehart on 10/11/2016.
 */
'use strict';

var path = require('path');
var reload = require('require-reload')(require);

exports.factory = function (config, manager, app) {
    var _ = require('lodash');
    var path = require('path');
    var fs = require('fs');
    var instance = {};
    instance.inTestMode = false;
    var sandbox;
    var sinon;
    var inputs = config.__inputs[config.__inputs.length-1];
    inputs = Array.isArray(inputs) ? inputs : [inputs];
    var results = null;
    var testdir = null;
    var testfile = null;
    _.map(inputs, function(i) {
        testdir = path.join(i, 'test');
        testfile = path.join(testdir, "testApiResults.json");
        if (fs.existsSync(testfile)) {
            results = reload(testfile);
        }
    })
    instance.enterTestMode = function (){
        if (!instance.inTestMode) {
            console.log("Entering test mode");
            //var responses = reload(path.join(testdir, "testResponses.json"));
            var results = reload(testfile);
            sinon = require('sinon');
            sandbox = sinon.sandbox.create();
            var configstub = sandbox.stub(manager, 'configureClient')
                .callsArgWith(1, null, results.configure);
            var contextstub = sandbox.stub(manager, 'start')
                .callsArgWith(1, null, results.context);
            var datastub = sandbox.stub(manager, 'discovery')
                .callsArgWith(1, null, results.discovery);
            var actionstub = sandbox.stub(manager, 'action')
                .callsArgWith(1, null, results.action);
            instance.inTestMode = true;
        }
    };

    instance.exitTestMode = function (){
        if (instance.inTestMode) {
            console.log("Leaving test mode");
            instance.inTestMode = false;
            sandbox.restore();
        }
    };

    return instance;
};
