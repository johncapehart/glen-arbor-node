/**
 * Created by john.capehart on 1/15/2017.
 */
'use strict';

var logmessage = function (message) {
    console.log(message + ' at ' + (new Date()));
};

exports.default = function (localenvDir, serviceDirs) {
    var q = require('q');
    var http = require('http');
    var express = require('express');
    var app = express();
    exports.app = app;
    app.logmessage = logmessage;

    var server = http.createServer(app);
    var config = require('progressive-config').default({}, localenvDir, 'deployMode');
    var getPort = function () {
        return config.server.webhookport;
    };
    require('./config/express').default(config, app);

    config.serviceDirs = serviceDirs;
    require('./configuration-service.js').default(config, app);
    require('./template-service.js').default(config, app);
    // require('./template-service.js').default(app, localenvDir, serviceDirs);
    // require('./static-service.js').default(app, localenvDir, serviceDirs);
    // require('./job-service.js').default(app, localenvDir, serviceDirs);
    // require('./activity-service.js').default(app, localenvDir, serviceDirs);
    // require('./devops-selfservice/server/staticFile-service.js').default(localenvDir, serviceDir);


    function startServer() {
        var deferred = q.defer();
        app.server = server.listen(getPort(), config.webhookip, function () {
            console.log('Express server listening on %d, in %s mode', getPort(), app.get('env'));
            deferred.resolve(app);
        });
        return deferred.promise;
    }

    app.use(require('errorhandler')()); // Error handler - has to be last

    var promise = startServer();
    app.logmessage = logmessage;
    app.logmessage('app.js complete');
    return promise;
};
