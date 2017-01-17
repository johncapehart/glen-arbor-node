/**
 * Main application routes
 */
'use strict';

exports.factory = function (config, app) {
    var _ = require('lodash');
    var reload = require('require-reload')(require);
    var request = require("request");
    var path = require('path');
    var fs = require('fs');

    var manager = require("./api.js").factory(config, app);
    var testroutes = require('./test/mockedroutes').factory(config, manager, app);
    var testmode = require('./mock/mockingmode.js').factory(config, manager, app);
    var clientconfig;

    config.service.sitePrefix = config.server.sitePrefix + config.service.serviceName;

    config.__dynamic.router.use(config.service.sitePrefix, function (req, res, next) {
        if (config.mock || ((req.query.mock !== void 0) && (req.query.mock === 'true'))) {
            if (!testmode.inTestMode) {
                testmode.enterTestMode();
            }
        } else if (testmode.inTestMode) {
            testmode.exitTestMode();
        }
        next();
    });

    function clientConfigFunc(req, res, next) {
        if (testmode.inTestMode) {
            refreshConfig();
        }
        manager.configureClient(req, function (err, result) {
            clientconfig = _.merge(clientconfig, result);
            res.json(clientconfig);
            app.logmessage("Config returned");
        });
    };

    config.__dynamic.router.use(config.service.sitePrefix + "/clientconfig", clientConfigFunc);

    function forwardHandler(req, res, next, path, body)
    {
        try {
            request({
                uri: 'http://' + req.headers.host + config.server.sitePrefix + 'service/' + path,
                method: 'POST',
                form: body,
                timeout: 10000,
                followRedirect: true,
                maxRedirects: 10
            }, function (error, response, body) {
                res.writeHead(response.statusCode, response.headers['content-type']);
                res.write(body);
                res.end();
            });
        } catch (err) {
            app.logmessage(err);
        }
    }
    config.__dynamic.router.use(config.service.sitePrefix + "/config", function (req, res, next) {
        forwardHandler(req, res, next, 'config', {service: config.service.serviceName});
    });

    config.__dynamic.router.use(config.service.sitePrefix + "/template", function (req, res, next) {
        var context = _.merge({}, req, req.query, req.body);
        forwardHandler(req, res, next, 'config', {service: config.service.serviceName, template: context.template});
    });

    app.post(config.service.sitePrefix + "/start", function (req, res, next) {
        try {
            app.logmessage("Context request received for user " + req.query.username);
            manager.context(req, function (err, result) {
                var context = _.merge({}, req, req.query, req.body);
                if (result.userName === undefined) {
                    result.userName = context.userName;
                }
                if (result.filter === undefined) {
                    result.filter = result.userName;
                }
                res.json(result);
                app.logmessage("Context returned");
            });
        } catch (err) {
            app.logmessage(err);
        }
    });

    app.post(config.service.sitePrefix + "/discovery", function (req, res, next) {
        try {
            app.logmessage("Discovery request received for user " + req.query.username);
            manager.discovery(req, function (err, result) {
                res.json(result);
            });
        } catch (err) {
            app.logmessage(err);
        }
    });

    app.post(config.service.sitePrefix + '/action', function (req, res, next) {
        try {
            app.logmessage("Action request received for user " + req.query.username);
            manager.action(req, function (err, result) {
                try {
                    res.json(result);
                } catch (err) {
                    app.logmessage(err);
                }
            });
        } catch (err) {
            app.logmessage(err);
        }
    });

    var staticdir = path.join(path.dirname(__dirname), 'client');
    config.__dynamic.router.use(config.service.sitePrefix + '/static', express.static(staticdir));
    var bowerdir = path.join(path.dirname(__dirname), 'bower_components');
    config.__dynamic.router.use(config.service.sitePrefix + '/bower_components', express.static(bowerdir));

};