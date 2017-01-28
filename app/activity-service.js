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
    var configurstionService = require('./configuration-service.js');
    var operationService = require('./operation-service.js');

    config.$dynamic.router.use(config.server.sitePrefix + 'service/activity/list', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            var serviceName = context.service;
            if (!!serviceName) {
                var serviceConfig = config.$dynamic.root.serviceconfigs[serviceName];
                if (!!serviceConfig) {
                    res.json(serviceConfig.activitys);
                    return;
                }
            }
            res.sendStatus(404);
        } catch (err) {
            console.file().error(err.toString(), err.stack.toString());;
            res.sendStatus(500);
        }
    });

    var doActivity = function(req, res, next, result, context, cb) {
        var iter = context.iter;
        var operation = context.iter.operations[context.iter.i++];
        context.input = result;
        var cb = iter.i >= iter.operations.length ? templateService.successcallback : doActivity;
        var context2 = { context: context, service: context.service, iter: iter};
        if (operation.template) {
            context2.template = operation.template.name;
            context2 = _.merge(context2, operation.template.context);
            operationService.handleTemplate(req, res, next, context2, cb);
        } else if (operation.persist) {
            context2 = _.merge(context2, operation.persist);
            operationService.handlePersist(req, res, next, context2, cb);
        } else if (operation.configuration) {
            context2 = _.merge(context2, operation.persist);
            operationService.handleConfiguration(req, res, next, context2, cb);
        }
    }

    config.$dynamic.router.use(config.server.sitePrefix + 'service/activity', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            var serviceName = context.service;
            var activityName = context.activity;
            if (!!serviceName && !!activityName) {
                var serviceConfig = config.$dynamic.root.serviceconfigs[serviceName];
                var activitys = serviceConfig.activitys[activityName];
                var context2 = _.merge({}, serviceConfig, context, progressiveConfig.defaultFilter);
                if (!!serviceConfig) {
                    var activity = serviceConfig.activitys[activityName];
                    if (!!activity) {
                        var activitys2 = Array.isArray(activity) ? activity : [activity];
                        context2.iter = {activitys: activitys2, i: 0};
                        doactivity(req, res, next, {}, context2)
                        return;
                    }
                }
            }
            res.sendStatus(404);
        } catch (err) {
            console.file().error(err.toString(), err.stack.toString());
            res.sendStatus(500);
        }
    });
}
;