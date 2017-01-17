/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function(config, app) {
    var console = process.console;
    var fs = require('fs');
    var path = require('path');
    var _ = require('lodash');

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

    exports.handleTemplateContext = function(req, res, next, context, jcontext) {
        if (!!context.template) {
            var template = exports.getTemplate(context);
            if (!!template) {
                var result = template.template;
                if (!!jcontext || !!context.context) {
                    const Handlebars = require('handlebars');
                    var t = Handlebars.compile(result);
                    if (!jcontext) {
                        jcontext = JSON.parse(context.context)
                    }
                    result = t(jcontext);
                }
                res.writeHead(200, {'content-type': template.mimetype});
                res.write(result);
                res.end();
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
            exports.handleTemplateContext(req, res, next, context);
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    });

    _.map(config.__dynamic.root.serviceconfigs, function(i) {
        app.use(i.server.sitePrefix + i.service.serviceName + '/template', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                context.service = i.service.serviceName;
                exports.handleTemplateContext(req, res, next, context);
            } catch (err) {
                console.error(err);
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
            console.error(err);
            res.sendStatus(500);
        }
    });

    _.map(config.__dynamic.root.serviceconfigs, function(i) {
        i.__dynamic.router.use(i.server.sitePrefix + i.service.serviceName + '/template/list', function(req, res, next) {
            try {
                res.json(i.templates);
            } catch (err) {
                console.error(err);
                res.sendStatus(500);
            }
        });
    });

    console.info('Configuration of configuration-service complete');

};