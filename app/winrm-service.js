/**
 * Created by john.capehart on 1/16/2017.
 */
/**
 * Created by john.capehart on 9/25/2016.
 */
'use strict';
var console = process.console;

var _ = require('lodash');
var LINQ = require('node-linq').LINQ;
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
const Handlebars = require('handlebars');
var templateService = require('./template-service.js');

exports.default = function(config, app) {

    function prepareOutput(result, context, cb) {
        var oresult = JSON.parse(result);
        var data;
        oresult.output = {
            data: data
        };
        console.file().info('Retrieved ' + data.length + ' records');
        cb(null, oresult);
    }

    exports.handleWinRM = function(req, res, next, context, cb) {
        var forreal = context.forreal;
        var whatif = context.whatif;
        var swhatif = ((forreal === true) && (whatif === false)) ? '' : ' -whatif ';
        if (context.input) {
            if (typeof context.input !== 'string') {
                context.input = JSON.stringify(context.input);
            }
            context.command += '$InputObject' + ' = @\'\n' + context.input + '\n\'@ | convert-jsontohashtable;\n';
        }
        if (context.pipe) {
            if (context.pipe.startsWith('{')) {
                context.pipe = ' % ' + context.pipe;
            } else {
                context.pipe += swhatif;
            }
            context.command += '$InputObject | ' + context.pipe + ';\n';
        }
        console.file().info('\n' + context.command);
        context.template = 'winrm';
        templateService.handleTemplate(req, res, next, context, function(req, res, next, result) {
        context.config.$dynamic.winrm.callps(context.command, config.payload, function(err, result) {
            if (context.output === 'columns') {
                prepareOutput(result, context, function(err, result) {
                    result.command = context.command;
                    result.mimetype = 'application/json';
                    cb(req, res, end, result, context);
                });
            } else {
                result = { output: result, mimetype: 'application/json' };
                cb(req, res, next, result, context);
            }
        });});
    };

    config.$dynamic.router.use(config.server.sitePrefix + 'service/winrm', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                var localconfig = config;
                var serviceName = context.service;
                if (!!serviceName) {
                    var serviceConfig = config.$dynamic.root.serviceconfigs[serviceName];
                    context = _.merge({}, serviceConfig.operations.winrm, context);
                    context.config = serviceConfig;
                    exports.handleWinRM(req, res, next, context, templateService.successcallback);
                    return;
                }
                res.sendStatus(404);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());
                res.sendStatus(500);
            }
        }
    );

    _.map(config.$dynamic.root.serviceconfigs, function(serviceConfig) {
        serviceConfig.$dynamic.winrm = require('node-winrm').factory(config.server.winrmhost, config.server.credential);
        config.payload = serviceConfig.$dynamic.winrm.payload;

        serviceConfig.$dynamic.router.use(serviceConfig.server.sitePrefix + serviceConfig.serviceName + '/winrm', function(req, res, next) {
            try {
                var context = _.merge({}, req.query, req.body);
                context = _.merge({}, serviceConfig.operations.winrm, context);
                context.service = serviceConfig.serviceName;
                context.config = serviceConfig;
                exports.handleWinRM(req, res, next, context, templateService.successcallback);
            } catch (err) {
                console.file().error(err.toString(), err.stack.toString());
                res.sendStatus(500);
            }
        });
    });
};
