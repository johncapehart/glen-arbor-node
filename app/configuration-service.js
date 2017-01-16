/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function (config, app, localenvDir, serviceDirs) {
    var fs = require('fs');
    var path = require('path');
    var reload = require('require-reload')(require);
    var _ = require('lodash');

// Setup server

    require('./service').default(config, app);

    app.use(config.server.sitePrefix + 'service/config', function (req, res, next) {
            try {
                app.logmessage("Services configuration request");
                var context = _.merge({}, req.query, req.body);
                var serviceName = context["service"];
                if (!!serviceName) {
                    if (!!config.__root.serviceconfigs[serviceName]) {
                        res.json(config.__root.serviceconfigs[serviceName]);
                    } else {
                        res.send(404);
                    }
                } else {
                    _.map(config.__root.serviceconfigs, function(i) {
                        return i.service;
                    });
                }
            }
            catch
                (err) {
                app.logmessage(err);
            }
        }
    )
    app.logmessage("Configuration complete");
}
;