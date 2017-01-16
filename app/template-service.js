/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function (app, localenvDir, serviceDirs) {
    var fs = require('fs');
    var path = require('path');
    var reload = require('require-reload')(require);
    var _ = require('lodash');
    var http = require('http');

    app.use(config.server.sitePrefix + 'service/template', function (req, res, next) {
        try {
            app.logmessage("Services template request");
            var context = _.merge({}, req.query, req.body);
            var serviceName = context["service"];
            var templateName = context["template"];
            var serviceConfig = config.__root.serviceconfigs[serviceName];
            var templatePath = serviceConfig.__getRelativePath('templates', templateName);

            if (fs.existsSync(templatePath)) {
                var ext = path.extname(templatePath);
                var mimetype = "text/plain";
                switch (ext) {
                    case "yml":
                    case "yaml":
                        mimetype = "application/x-yaml";
                        break;
                    case "json":
                        mimetype = "application/json";
                        break;
                    case "htm":
                    case "html":
                        mimetype = "text/html";
                        break;
                }
                var template = fs.readFileSync(templatePath, 'utf8');
                res.writeHead(200, {'content-type': mimetype});
                res.write(template);
                res.end();
            } else {
                res.send(404);
            }
        } catch (err) {
            app.logmessage(err);
        }
    });

    var staticdir = path.join(path.dirname(__dirname), 'client');
    app.use(config.server.sitePrefix + 'static', express.static(staticdir));
    var bowerdir = path.join(path.dirname(__dirname), 'bower_components');
    app.use(config.server.sitePrefix + 'bower_components', express.static(bowerdir));

// Start server
}
;