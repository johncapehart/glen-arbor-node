/**
 * Created by john.capehart on 1/15/2017.
 */
'use strict';

var console = process.console;
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

exports.default = function(config) {
    var progressiveConfig = require('progressive-config');
    var templateService = require('./template-service.js');
    var persistService = require('./persist-service.js');

    config.__dynamic.router.use(config.server.sitePrefix + 'service/operation/list', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            var serviceName = context.service;
            if (!!serviceName) {
                var serviceConfig = config.__dynamic.root.serviceconfigs[serviceName];
                if (!!serviceConfig) {
                    res.json(serviceConfig.operations);
                    return;
                }
            }
            res.sendStatus(404);
        } catch (err) {
            console.error(err.toString(), err.stack.toString());;
            res.sendStatus(500);
        }
    });

    function handleTemplateJob(req, res, next, context, cb) {
        templateService.handleTemplateContext(req, res, next, context, cb);
    }

    function handlePersistJob(req, res, next, context, cb) {
        persistService.handlePersist(req, res, next, context, cb);
    }

    var doOperation = function(req, res, next, result, context, cb) {
        var iter = context.iter;
        var operation = context.iter.operations[context.iter.i++];
        context.input = result;
        var cb = iter.i >= iter.operations.length ? templateService.successcallback : doOperation;
        var context2 = { context: context, service: context.service, iter: iter};
        if (operation.template) {
            context2.template = operation.template.name;
            context2 = _.merge(context2, operation.template.context);
            handleTemplateJob(req, res, next, context2, cb);
        } else if (operation.persist) {
            context2 = _.merge(context2, operation.persist);
            handlePersistJob(req, res, next, context2, cb);
        }
    }

    config.__dynamic.router.use(config.server.sitePrefix + 'service/operation', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            var serviceName = context.service;
            var operationName = context.operation;
            if (!!serviceName && !!operationName) {
                var serviceConfig = config.__dynamic.root.serviceconfigs[serviceName];
                var operations = serviceConfig.operations[operationName];
                var context2 = _.merge({}, serviceConfig, context, progressiveConfig.defaultFilter);
                if (!!serviceConfig) {
                    var operation = serviceConfig.operations[operationName];
                    if (!!operation) {
                        var operations2 = Array.isArray(operation) ? operation : [operation];
                        context2.iter = {operations: operations2, i: 0};
                        doOperation(req, res, next, {}, context2)
                        return;
                    }
                }
            }
            res.sendStatus(404);
        } catch (err) {
            console.error(err.toString(), err.stack.toString());
            res.sendStatus(500);
        }
    });
}
;