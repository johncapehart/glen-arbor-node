/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function (app, localenvDir, serviceDirs) {
    var fs = require('fs');
    var path = require('path');

    var staticdir = path.join(path.dirname(__dirname), 'client');
    app.use(config.server.sitePrefix + 'static', express.static(staticdir));
    var bowerdir = path.join(path.dirname(__dirname), 'bower_components');
    app.use(config.server.sitePrefix + 'bower_components', express.static(bowerdir));

    _.map(config.__root.serviceconfigs, function(i) {
        var staticdir = path.join(path.dirname(__dirname), 'client');
        app.use(config.server.sitePrefix + 'static', express.static(staticdir));
        var bowerdir = path.join(path.dirname(__dirname), 'bower_components');
        app.use(config.server.sitePrefix + 'bower_components', express.static(bowerdir));
    });

    app.logmessage("static-service configuration complete");
}
;