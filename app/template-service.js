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
        Handlebars.registerHelper('helperMissing', function(/* [args, ] options */) {
            var options = arguments[arguments.length - 1];
            return options.name;
        });

// called when the template contains {{uuid}}
        Handlebars.registerHelper("uuid", function(/* [args, ] options */) {
            return uuid.v4();
        });

        var helpers = require('handlebars-helpers')({
            handlebars: Handlebars
        });

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

    exports.getTemplate = function({service: service, template: template}) {
        var serviceConfig = config.__dynamic.root.serviceconfigs[service];
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
            }
        } catch (err) {
            console.warning(err.toString());
        }
        return result;
    };

    exports.sucesscallback = function(req, res, next, result) {
        var result2 = exports.validateOutput(result.output, result.mimetype);
        res.writeHead(200, {'content-type': result.mimetype});
        res.write(result2);
        res.end();
    };

    exports.handleTemplateContext = function(req, res, next, context, cb) {
        if (!!context.template) {
            var template = exports.getTemplate(context);
            if (!!template) {
                var result = template.template;
                if (context.context) {
                    var t = Handlebars.compile(result);
                    if (typeof context.context === 'string') {
                        context.context = JSON.parse(context.context);
                    }
                    context.context.gu = 'service/list';
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
                }
                cb(req, res, next, result, context);
            } else {
                res.sendStatus(404);
            }
        } else {
            var serviceConfig = config.__dynamic.root.serviceconfigs[context.service];
            res.json(serviceConfig.templates);
        }
    };

    config.__dynamic.router.use(config.server.sitePrefix + 'service/template', function(req, res, next) {
        try {
            app.logmessage('Service template request');
            var context = _.merge({}, req.query, req.body);
            exports.handleTemplateContext(req, res, next, context, exports.successcallback);
        } catch (err) {
            console.error(err.toString(), err.stack.toString());;
            res.sendStatus(500);
        }
    });

    _.map(config.__dynamic.root.serviceconfigs, function(i) {
        app.use(i.server.sitePrefix + i.serviceName + '/template', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                context.service = i.serviceName;
                exports.handleTemplateContext(req, res, next, context, exports.successcallback);
            } catch (err) {
                console.error(err.toString(), err.stack.toString());;
                res.sendStatus(500);
            }
        });
    });

    config.__dynamic.router.use(config.server.sitePrefix + 'service/template/list', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            var serviceConfig = config.__dynamic.root.serviceconfigs[context.service];
            res.json(serviceConfig.templates);
        } catch (err) {
            console.error(err.toString(), err.stack.toString());;
            res.sendStatus(500);
        }
    });

    _.map(config.__dynamic.root.serviceconfigs, function(i) {
        i.__dynamic.router.use(i.server.sitePrefix + i.serviceName + '/template/list', function(req, res, next) {
            try {
                res.json(i.templates);
            } catch (err) {
                console.error(err.toString(), err.stack.toString());;
                res.sendStatus(500);
            }
        });
    });

    console.info('Configuration of configuration-service complete');

};