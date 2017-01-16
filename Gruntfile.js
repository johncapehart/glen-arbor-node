module.exports = function (grunt) {
    grunt.initConfig({
        karma: {
            configFile: 'karma.conf.js',
            autoWatch: true,
        },
    });
    require('load-grunt-tasks')(grunt);
    grunt.registerTask('test', ['karma']);
    grunt.registerTask('default', ['test'])

}
