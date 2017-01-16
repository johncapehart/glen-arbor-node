/**
 * Created by john.capehart on 1/15/2017.
 */
_.map(config.__root.serviceconfigs, function(i) {
    return i.service;
});

app.use(config.service.sitePrefix, function (req, res, next) {
    var context = _.merge({}, req.query, req.body);
    if (config.mock || ((req.query.mock !== void 0) && (req.query.mock === 'true'))) {
        if (!testmode.inTestMode) {
            testmode.enterTestMode();
        }
    } else if (testmode.inTestMode) {
        testmode.exitTestMode();
    }
    next();
});
