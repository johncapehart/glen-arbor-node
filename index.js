/**
 * Created by john.capehart on 1/15/2017.
 */
var logmessage = function (message) {
    console.log(message + " at " + (new Date()));
};

exports.default = function (localenvDir, serviceDirs) {
    var http = require('http');
    var express = require('express')
    var app = express();

    app.logmessage = logmessage;

    var server = http.createServer(app);
    var config = require('progressive-config').default({}, localenvDir, 'deployMode');
    var getPort = function () {
        return config.server.webhookport;
    }
    require('./config/express').default(config, app);

    require('./configuration-service.js').default(config, app, localenvDir, serviceDirs);
    // require('./operations-service.js').default(app, localenvDir, serviceDirs);
    // require('./template-service.js').default(app, localenvDir, serviceDirs);
    // require('./static-service.js').default(app, localenvDir, serviceDirs);
    // require('./job-service.js').default(app, localenvDir, serviceDirs);
    // require('./activity-service.js').default(app, localenvDir, serviceDirs);
    //require('./devops-selfservice/server/staticFile-service.js').default(localenvDir, serviceDir);


    function startServer() {
        app.server = server.listen(getPort(), config.webhookip, function () {
            console.log('Express server listening on %d, in %s mode', getPort(), app.get('env'));
        });
    }

    app.use(require('errorhandler')()); // Error handler - has to be last

    setImmediate(startServer);
    exports = module.exports = app;
    app.logmessage = logmessage;
    app.logmessage("Configuration complete");


};