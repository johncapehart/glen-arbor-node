/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function(config, app, express) {
    var console = process.console;
    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');

    // define routes for static files
    var staticdir = path.resolve(path.join(path.dirname(__dirname), 'static'));
    var bowerdir = path.resolve(path.join(path.dirname(__dirname), 'bower_components'));
    config.__dynamic.router.use(config.server.sitePrefix + 'static', config.__dynamic.express.static(staticdir));
    config.__dynamic.router.use(config.server.sitePrefix + 'bower_components', config.__dynamic.express.static(bowerdir));

    // define routes through service prefix
    _.map(config.__dynamic.root.serviceconfigs, function(i) {
        config.__dynamic.router.use(config.server.sitePrefix + i.service.serviceName + '/static', config.__dynamic.express.static(staticdir));
        config.__dynamic.router.use(config.server.sitePrefix + i.service.serviceName + '/bower_components', config.__dynamic.express.static(bowerdir));
    });

    console.info('static-service configuration complete');
}
;