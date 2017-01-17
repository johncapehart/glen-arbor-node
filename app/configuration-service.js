/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function(config, app) {
    var fs = require('fs');
    var path = require('path');
    var reload = require('require-reload')(require);
    var _ = require('lodash');
    var console = process.console;

    // Setup server
    require('./load-service-configurations').default(config);

    config.__dynamic.router.use(config.server.sitePrefix + 'service/config', function(req, res, next) {
            try {
                console.file().info('services configuration request');
                var context = _.merge({}, req.query, req.body);
                var serviceName = context.service;
                if (!!serviceName) {
                    if (!!config.__dynamic.root.serviceconfigs[serviceName]) {
                        o = config.__dynamic.root.serviceconfigs[serviceName];
                        var o = _.omit(o, ['__dynamic']);
                        res.json(o);
                        return;
                    }
                }
                res.sendStatus(404);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        }
    );

    _.map(config.__dynamic.root.serviceconfigs, function(i) {
        i.__dynamic.router = config.__dynamic.express.Router();
        i.__dynamic.router.use(i.server.sitePrefix + i.service.serviceName + '/config', function(req, res, next) {
            try {
                var o = _.omit(i, ['__dynamic']);
                res.json(o);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    });

    config.__dynamic.router.use(config.server.sitePrefix + 'service/list', function(req, res, next) {
            try {
                res.json(_.map(config.__dynamic.root.serviceconfigs, function(i) {
                    return i.service;
                }));
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        }
    );

    config.__dynamic.router.use(config.server.sitePrefix + 'server/config', function(req, res, next) {
            try {
                var result = JSON.stringify(config, function(key, value) {
                    if (key === '__dynamic') {
                        return;
                    }
                    return value;
                });
                res.json(JSON.parse(result));
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        }
    );

    console.info('Configuration of configuration-service complete');
};