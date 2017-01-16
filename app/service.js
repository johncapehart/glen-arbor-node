/**
 * Things that happen at the service level
 */
'use strict';

var _ = require('lodash');
var path = require('path');

exports.default = function (config, app) {
    // for each item in services, make add routes based on the config
    var config0 = config;
    config0.__root.serviceconfigs = (!!config.serviceconfigs) ? config.serviceconfigs : {};
    var progressiveConfig = require('progressive-config');
    var defaultServices = path.join(path.resolve(__dirname, 'config/services'));
    var registerService = function(config, ith) {
        var serviceconfig = progressiveConfig.default(config, ith);
        config0.__root.serviceconfigs[serviceconfig.service.serviceName] = serviceconfig;
        console.log('Configuring service ' + serviceconfig.service.serviceName);
        return serviceconfig;
    }
    var loadService = function(config, ith) {
        var serviceconfig = progressiveConfig.default(config, ith);
        return serviceconfig;
    }
    // without template expansion, assumes only one default service
    var config1 = progressiveConfig.default2({initial: config0, inputs: defaultServices, directoryMerger: loadService, templateFunction: null});
    // with temmplate expansion
    var config2 = progressiveConfig.default(config0, defaultServices, null, undefined, registerService, progressiveConfig.iterativelyApplyTemplate);
    progressiveConfig.default(config1, config.serviceDirs, null, undefined, registerService, progressiveConfig.iterativelyApplyTemplate);
    return config1;
};