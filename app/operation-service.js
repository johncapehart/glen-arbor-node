/**
 * Created by john.capehart on 1/15/2017.
 */
'use strict';

var console = process.console;
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var templateService = require('./template-service.js');

exports.default = function(config) {

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
            console.error(err);
            res.sendStatus(500);
        }
    });

    config.__dynamic.router.use(config.server.sitePrefix + 'service/operation', function(req, res, next) {
        try {
            var context = _.merge({}, req.query, req.body);
            var serviceName = context.service;
            var operationName = context.operation;
            if (!!serviceName && !!operationName) {
                var serviceConfig = config.__dynamic.root.serviceconfigs[serviceName];
                if (!!serviceConfig) {
                    var operation = serviceConfig.operations[operationName];
                    if (!!operation) {
                        if (operation.template) {
                            context.template = operation.template;
                            templateService.handleTemplateContext(req, res, next, context, context);
                            return;
                        }
                    }
                }
            }
            res.sendStatus(404);
        } catch (err) {
            console.error(err);
            res.sendStatus(500);
        }
    });
};