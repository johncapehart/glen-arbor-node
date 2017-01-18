/**
 * Created by john.capehart on 10/13/2016.
 */
/**
 * Main application routes
 */
'use strict';

exports.factory = function (config, manager, app) {
    var testmode = require('../test/testmode.js').factory(config, manager, app);

    app.post('/' + config.sitePrefix + config.serviceName + '/testpowershell', function (req, res, next) {
        try {
            manager.test(req, function (err, result) {
                try {
                    app.logmessage("Test result" + result);
                    res.json(result);
                } catch (err) {
                    app.logmessage(err);
                    res.json(err);
                }
            });
        } catch (err) {
            app.logmessage(err);
        }
    });

    app.post('/' + config.sitePrefix + config.serviceName + '/testaction', function (req, res, next) {
        try {
            var user = req.query.username;
            app.logmessage("Request received for user " + user);
            manager.testaction(req, function (err, result) {
                try {
                    res.json(result);
                } catch (err) {
                    app.logmessage(err)
                }
            });
        } catch (err) {
            app.logmessage(err)
        }
    });

    return {};
};