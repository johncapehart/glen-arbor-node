/**
 // Things that happen on a per express application basis.
 */
'use strict';

exports.default = function(config, app) {
    var fs = require('fs');
    var path = require('path');
    var reload = require('require-reload')(require);
    var _ = require('lodash');

    // Setup server
    require('./load-service-configurations').default(config, app);

    console.info('Configuration of job-service complete');
};