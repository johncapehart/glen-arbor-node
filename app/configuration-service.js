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

    var routes = require('./routes.js');
    var progressiveConfig = require('progressive-config');
    var templateService = require('./template-service.js');

    require('./load-service-configurations').default(config);

    exports.handleConfiguration = function(req, res, next, context, cb) {
        var serviceName = context.service;
        if (!!serviceName) {
            if (!!config.$dynamic.root.serviceconfigs[serviceName]) {
                o = config.$dynamic.root.serviceconfigs[serviceName];
                var o = _.omit(o, context.exclude);
                result = progressiveConfig.defaultStringify(o);
                var result = {output: result, mimetype: 'application/json'};
                cb(req, res, next, result, context);
                return;
            }
        }
        res.sendStatus(404);
    };

    config.$dynamic.router.use(config.server.sitePrefix + 'service/config', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                context.exclude = ['$dynamic'];
                exports.handleConfiguration(req, res, next, context, templateService.successcallback);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());
                res.sendStatus(500);
            }
        }
    );

    _.map(config.$dynamic.root.serviceconfigs, function(i) {
        i.$dynamic.router = config.$dynamic.express.Router();
        i.$dynamic.router.use(i.server.sitePrefix + i.serviceName + '/config', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                context.service = i.serviceName;
                context.exclude = ['$dynamic'];
                exports.handleConfiguration(req, res, next, context, templateService.successcallback);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());
                res.sendStatus(500);
            }
        });
        routes.factory(config, app);
    });


    config.$dynamic.router.use(config.server.sitePrefix + 'service/clientconfig', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                context.exclude = ['$dynamic', 'server', 'operations', 'templates'];
                exports.handleConfiguration(req, res, next, context, templateService.successcallback);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());
                res.sendStatus(500);
            }
        }
    );

    _.map(config.$dynamic.root.serviceconfigs, function(i) {
        i.$dynamic.router.use(i.server.sitePrefix + i.serviceName + '/clientconfig', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                context.exclude = ['$dynamic', 'server', 'operations', 'templates'];
                context.service = i.serviceName;
                exports.handleConfiguration(req, res, next, context, templateService.successcallback);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());
                res.sendStatus(500);
            }
        });
    });

    config.$dynamic.router.use(config.server.sitePrefix + 'service/list', function(req, res, next) {
            try {
                var result = _.map(config.$dynamic.root.serviceconfigs, function(i) {
                    return i.serviceName;
                });
                res.json(result);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());
                res.sendStatus(500);
            }
        }
    );

    config.$dynamic.router.use(config.server.sitePrefix + 'server/config', function(req, res, next) {
            try {
                var result = JSON.stringify(config, function(key, value) {
                    if (key === '$dynamic') {
                        return;
                    }
                    return value;
                });
                res.json(JSON.parse(result));
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());
                res.sendStatus(500);
            }
        }
    );

    console.info('Configuration of configuration-service complete');
};