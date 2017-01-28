/**
 * Created by john.capehart on 1/15/2017.
 */
'use strict';

var console = process.console;
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var templateService = require('./template-service.js');
var mkdirp = require('mkdirp');

exports.default = function(config) {
    var progressiveConfig = require('progressive-config');

    exports.sucesscallback = function(req, res, next, result) {
        if (typeof result === 'string') {
            result = JSON.parse(result);
        }
        res.json(result);
    };

    exports.handleFilePersist = function(req, res, next, context, cb) {
        var input = context.context.input;
        var result = input;
        if (!!input.output) {
            input = input.output;
        }
        var ext = '.json'
        var jinput = input;
        if (typeof input !== 'string') {
            input = JSON.stringify(input, progressiveConfig.defaultFilter);
        } else {
            jinput = JSON.parse(input)
        }
        var name = !!context.name ? jinput[context.name] : jinput.id;
        var filepath = path.resolve(path.join(config.server.persist.file.directory, name + ext));
        mkdirp(config.server.persist.file.directory, function(err) {
            fs.writeFile(filepath, input, function() {
                cb(req, res, next, result, context);
            });
        });
    };

    exports.handlePersist = function(req, res, next, context, cb) {
        switch (context.mode) {
            case 'file':
            default:
                exports.handleFilePersist(req, res, next, context, cb);
        }
    };

    config.$dynamic.router.use(config.server.sitePrefix + 'service/persist', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            exports.handlePersist(req, res, next, context, templateService.sucesscallback);
            res.sendStatus(404);
        } catch (err) {
            console.file().error(err.toString(), err.stack.toString());
            res.sendStatus(500);
        }
    });
}
;