/**
 * Created by john.capehart on 1/15/2017.
 */
'use strict';
exports.default = function(localenvDir, serviceDirs) {
    return require('./app/app.js').default(localenvDir, serviceDirs);
};
