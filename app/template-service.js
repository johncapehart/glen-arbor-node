/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function(config, app) {
    var fs = require('fs');
    var path = require('path');
    var reload = require('require-reload')(require);
    var _ = require('lodash');
    var http = require('http');

    function getTemplate({service: service, template: template}) {
        var serviceConfig = config.__root.serviceconfigs[service];
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
    }

    app.use(config.server.sitePrefix + 'service/template', function(req, res, next) {
        try {
            app.logmessage('Services template request');
            var context = _.merge({}, req.query, req.body);
            if (!!context.template) {
                var template = getTemplate(context);
                if (!!template) {
                    var result = template.template;
                    if (!!context.context) {
                        const Handlebars = require('handlebars');
                        var t = Handlebars.compile(result);
                        result = t(JSON.parse(context.context));
                    }
                    res.writeHead(200, {'content-type': template.mimetype});
                    res.write(result);
                    res.end();
                } else {
                    res.sendStatus(404);
                }
            } else {
                var serviceConfig = config.__root.serviceconfigs[context.service];
                res.json(serviceConfig.templates);
            }
        } catch (err) {
            app.logmessage(err);
        }
    });

    app.use(config.server.sitePrefix + 'service/template/list', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            var serviceConfig = config.__root.serviceconfigs[context.service];
            res.json(serviceConfig.templates);
        } catch (err) {
            app.logmessage(err);
        }
    });
};