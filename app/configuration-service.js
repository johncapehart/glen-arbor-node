/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function (config, app) {
    var fs = require('fs');
    var path = require('path');
    var reload = require('require-reload')(require);
    var _ = require('lodash');

    // Setup server
    require('./load-service-configurations').default(config, app);

    app.use(config.server.sitePrefix + 'service/config', function (req, res, next) {
            try {
                app.logmessage('Services configuration request');
                var context = _.merge({}, req.query, req.body);
                var serviceName = context['service'];
                if (!!serviceName) {
                    if (!!config.__root.serviceconfigs[serviceName]) {
                        res.json(config.__root.serviceconfigs[serviceName]);
                    } else {
                        res.sendStatus(404);
                    }
                } else {
                    res.sendStatus(404);
                }
            } catch (err) {
                app.logmessage(err);
                res.sendStatus(500);
            }
        }
    )

    app.use(config.server.sitePrefix + 'service/list', function (req, res, next) {
            try {
                res.json(_.map(config.__root.serviceconfigs, function (i) {
                    return i.service;
                }));
            } catch (err) {
                app.logmessage(err);
                res.sendStatus(500);
            }
        }
    );

    app.use(config.server.sitePrefix + 'server/config', function (req, res, next) {
            try {
                var result = JSON.stringify(config, function(key, value) {
                    if (key === '__root') {
                        return;
                    }
                    return value;
                });
                res.json(JSON.parse(result));
            } catch (err) {
                app.logmessage(err);
                res.sendStatus(500);
            }
        }
    );

    app.logmessage('Configuration of configuration-service complete');
};