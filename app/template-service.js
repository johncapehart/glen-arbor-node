/**
 // Things that happen on a per express application basis.
 */
'use strict';
var console = process.console;
var http = require('http');
var httpGet = require('get-promise');

exports.default = function(config, app) {
    var console = process.console;
    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');
    var yaml = require('js-yaml');
    var progressiveConfig = require('progressive-config');

    var usePromisedHandlebars = true;

    if (usePromisedHandlebars) {
        var promisedHandlebars = require('promised-handlebars');
        var Q = require('q');
        var Handlebars = promisedHandlebars(require('handlebars'), {Promise: Q.Promise});
        var uuid = require('node-uuid');

        Handlebars.registerHelper('github-user', function(value, options) {
            var url = 'https://api.github.com/users/' + value;
            return httpGet(url, {headers: {'User-Agent': 'Node'}})
                .get('data')
                .then(JSON.parse)
                .then(function(data) {
                    // `options.fn` returns a promise. Wrapping brackets must be added after resolving
                    return options.fn(data);
                });
        });

        Handlebars.registerHelper('node-link', function(value, options) {
            var url = 'http://localhost:' + config.server.webhookport.toString() + config.server.sitePrefix + value;
            return httpGet(url, {headers: {'User-Agent': 'Node'}})
                .get('data')
                .then(JSON.parse)
                .then(function(data) {
                    // `options.fn` returns a promise. Wrapping brackets must be added after resolving
                    return options.fn(data);
                });
        });

        Handlebars.registerHelper('local-link', function(value, options) {
            var url = 'http://localhost' + value;
            return httpGet(url, {headers: {'User-Agent': 'Node'}})
                .get('data')
                .then(JSON.parse)
                .then(function(data) {
                    // `options.fn` returns a promise. Wrapping brackets must be added after resolving
                    return options.fn(data);
                });
        });

    } else {
        var Handlebars = require('handlebars');
    }

    // called when the template contains {{uuid}}
    Handlebars.registerHelper("uuid", function(/* [args, ] options */) {
        return uuid.v4();
    });

    var helpers = require('handlebars-helpers')({
        handlebars: Handlebars
    });

    exports.getTemplate = function({service: service, template: template}) {
        var serviceConfig = config.$dynamic.root.serviceconfigs[service];
        var templatePath = serviceConfig.__getRelativePath('templates', template);

        if (fs.existsSync(templatePath)) {
            var ext = path.extname(templatePath);
            var mimetype = 'text/plain';
            switch (ext) {
                case '.yml':
                case '.yaml':
                    mimetype = 'application/x-yaml';
                    break;
                case '.json':
                    mimetype = 'application/json';
                    break;
                case '.htm':
                case '.html':
                    mimetype = 'text/html';
                    break;
            }
            return {
                mimetype: mimetype,
                template: fs.readFileSync(templatePath, 'utf8')
            };
        }
        return null;
    };

    exports.validateOutput = function(result, mimetype) {
        try {
            switch (mimetype) {
                case 'application/json':
                    var json = JSON.parse(result);
                    result = progressiveConfig.defaultStringify(json);
                    break;
                case 'application/x-yaml':
                    var yresult = yaml.safeLoad(result);
                    result = yaml.safeDump(yresult);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.warning(err.toString());
        }
        return result;
    };

    exports.successcallback = function(req, res, next, result) {
        var result2 = exports.validateOutput(result.output, result.mimetype);
        res.writeHead(200, {'content-type': result.mimetype});
        res.write(result2);
        res.end();
    };

    exports.handleTemplate = function(req, res, next, context, cb) {
        if (!!context.template) {
            var template = exports.getTemplate(context);
            if (!!template) {
                var result = template.template;
                if (!!context.context) {
                    // re-register this helper in case it was changed
                    Handlebars.registerHelper('helperMissing', progressiveConfig.dropMissingFieldNames);
                    var t = Handlebars.compile(result);
                    if (typeof context.context === 'string') {
                        context.context = JSON.parse(context.context);
                    }
                    context.context.$parent = context;
                    //context.context.config = context.config;
                    result = t(context.context);
                    // TODO: for a better approach see http://stackoverflow.com/questions/27746304/how-do-i-tell-if-an-object-is-a-promise#27746324
                    if (!!result.then) {
                        result.then(function(result) {
                            result = { output: result, mimetype: template.mimetype };
                            cb(req, res, next, result, context);
                        });
                        return;
                    } else {
                        result = exports.validateOutput(result, template.mimetype);
                        cb(req, res, next, result, context);
                    }
                } else {
                    template.mimetype = 'text/plain';
                }
                result = { output: result, mimetype: template.mimetype };
                cb(req, res, next, result, context);
            } else {
                res.sendStatus(404);
            }
        } else {
            var serviceConfig = config.$dynamic.root.serviceconfigs[context.service];
            res.json(serviceConfig.templates);
        }
    };

    config.$dynamic.router.use(config.server.sitePrefix + 'service/template', function(req, res, next) {
        try {
            app.logmessage('Service template request');
            var context = _.merge({}, req.query, req.body);
            var localconfig = config;
            var serviceName = context.service;
            if (!!serviceName) {
                var serviceConfig = config.$dynamic.root.serviceconfigs[serviceName];
                context.config = serviceConfig
                exports.handleTemplate(req, res, next, context, exports.successcallback);
                return;
            }
            res.sendStatus(404);
        } catch (err) {
            console.file().error(err.toString(), err.stack.toString());;
            res.sendStatus(500);
        }
    });

    _.map(config.$dynamic.root.serviceconfigs, function(serviceConfig) {
        app.use(serviceConfig.server.sitePrefix + serviceConfig.serviceName + '/template', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                context.service = serviceConfig.serviceName;
                context.config = serviceConfig;
                exports.handleTemplate(req, res, next, context, exports.successcallback);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());;
                res.sendStatus(500);
            }
        });
    });

    config.$dynamic.router.use(config.server.sitePrefix + 'service/template/list', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            var serviceConfig = config.$dynamic.root.serviceconfigs[context.service];
            res.json(serviceConfig.templates);
        } catch (err) {
            console.file().error(err.toString(), err.stack.toString());;
            res.sendStatus(500);
        }
    });

    _.map(config.$dynamic.root.serviceconfigs, function(serviceConfig) {
        serviceConfig.$dynamic.router.use(serviceConfig.server.sitePrefix + serviceConfig.serviceName + '/template/list', function(req, res, next) {
            try {
                res.json(serviceConfig.templates);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());;
                res.sendStatus(500);
            }
        });
    });

    console.info('Configuration of configuration-service complete');

};