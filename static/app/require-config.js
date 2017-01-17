/**
 * Created by john.capehart on 9/26/2016.
 */
window.console = window.console || (function(){
    var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function(s){};
    return c;
})();

console.log("loading require-config.js")

// sort of bootstrap config
require.config({
    paths: {
        requireMain: "config/require-config-main"
    }
});

require(["requireMain"],
    function (requireMain) {
    requireMain();
});
