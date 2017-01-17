/**
 * Created by john.capehart on 10/24/2016.
 */
'use strict';
console.log("loading require-config-main.js");
define(function () {
    var getConfiguration = function () {
        //TODO: use require.replace https://github.com/SBoudrias/require.replace
        var bowerdir = "../../bower_components/";
        var configuration = {
            paths: {
                // below angular
                'require': bowerdir + 'requirejs/require',
                jquery: bowerdir + 'jquery/dist/jquery.min',
                'jquery-ui': bowerdir + 'jquery-ui/jquery-ui.min',
                'underscore': bowerdir + 'underscore/underscore-min',
                bootstrap: bowerdir + 'bootstrap/dist/js/bootstrap.min',
                'bootstrap-switch': bowerdir + 'bootstrap-switch/dist/js/bootstrap-switch',
                jqueryBlockUI: bowerdir + 'blockUI/jquery.blockUI',
                jqueryBackstretch: bowerdir + 'jquery-backstretch/jquery.backstretch',
                text: bowerdir + 'text/text',
                d3: bowerdir + 'd3/d3',
                'd3-context-menu': bowerdir + 'd3-context-menu/js/d3-context-menu',

                // angular
                angular: bowerdir + 'angular/angular.min',
                angularRoute: bowerdir + 'angular-route/angular-route',
                angularMocks: bowerdir + 'angular-mocks/angular-mocks',
                'angular-sanitize': bowerdir + 'angular-sanitize/angular-sanitize',
                'angular-animate': bowerdir + 'angular-animate/angular-animate',
                'angular-route': bowerdir + 'angular-route/angular-route',
                'ui-grid': bowerdir + 'angular-ui-grid/ui-grid',
                'angular-ui-router': bowerdir + 'angular-ui-router/release/angular-ui-router',
                'angular-ui-router-uib-modal': bowerdir + 'angular-ui-router-uib-modal/angular-ui-router-uib-modal',
                //'ui-bootstrap': bowerdir + 'ui-bootstrap/ui-bootstrap-tpls',
                //'angular-bootstrap': 'https://cdn.rawgit.com/angular-ui/bootstrap/gh-pages/ui-bootstrap-tpls-1.3.3'
                'angular-bootstrap': bowerdir + 'angular-bootstrap/ui-bootstrap-tpls',
                'angular-block-ui': bowerdir + 'angular-block-ui/dist/angular-block-ui',
                'angular-inform': bowerdir + 'angular-inform/dist/angular-inform.min',
                'angular-tooltips': bowerdir + 'angular-tooltips/dist/angular-tooltips',
                'angular-touch': bowerdir + 'angular-touch/angular-touch',

                // this application
                'app-config': 'config/app-config',
                api: 'api',
                services: 'services',
                app: 'app',
                modal: 'modal',
                init: 'init',
                layout: 'layout',
                list: 'list'
            },
            shim: {
                // below angular
                'bootstrap': ['jquery', 'jquery-ui'],
                jqueryBlockUI: ['jquery'],
                jqueryBackstretch: ['jquery'],
                // angular
                angular: {
                    exports: 'angular'
                },

                'angular-sanitize': ['angular'],
                'angular-bootstrap': ['angular'],
                angularRoute: ['angular'],
                'angular-animate': ['angular'],
                'angular-block-ui': ['angular'],
                'angular-inform': ['angular'],

                'angular-ui-router': ['angular'],
                'angular-ui-router-uib-modal': [
                    'angular',
                    'angular-ui-router'
                ],
                'ui-grid': ['angular'],
                angularMocks: {
                    deps: ['angular'],
                    exports: 'angular.mock'
                },

                // this application
                app: [
                    'angular',
                    'services',
                    'api',
                    'layout'
                ],

                'api': ['angular'],
                'services': ['angular'],
                'list': ['angular', 'init'],
                init: [
                    'underscore',
                    'bootstrap',
                    'angular',
                    'angular-ui-router',
                    'angular-ui-router-uib-modal',
                    'angular-inform',
                    'angular-block-ui',
                    'angular-bootstrap',
                    'angular-sanitize',
                    'angular-animate',
                    'angular-tooltips',
                    'angular-touch',
                    'ui-grid',
                    'app-config',
                    'api',
                    'services',
                ],
                'modal': [
                    'underscore',
                    'bootstrap',
                    'angular',
                    'angular-ui-router',
                    'angular-ui-router-uib-modal',
                    'angular-bootstrap',
                    'angular-animate',
                    'ui-grid',
                    'app-config'
                ],
                layout: [
                    'init',
                    'modal',
                    'angular',
                    'list'
                ],
                'app-config': [
				'angular',
				'angular-block-ui'
				]
            },
            priority: [
                'angular'
            ],
            packages: []
        }
        return configuration;
    };

    var requireMain = function () {
        require.config(getConfiguration());
        require([
            //'jqueryBackstretch',
            'jqueryBlockUI',
            'angular',
            'app-config'
        ], function () {
            var initInjector = angular.injector([
                'ng',
                'app.appConfig'
            ]);
            $.blockUI.defaults.css.backgroundColor = 'white';
            $.blockUI.defaults.css.border = 'none',
            $.blockUI.defaults.overlayCSS.opacity = 0;
            $.blockUI({
                message: '<div class="block-ui-overlay"></div><div class="block-ui-message-container" aria-live="assertive" aria-atomic="true"><div class="block-ui-message">Loading Application...</div></div>'
            });
            var appConfigservice = initInjector.get('appConfigservice');
            appConfigservice.getconfig().then(function (config) {
                require(['app'], function () {
                    angular.element().ready(function () {
                        // bootstrap the app manually
                        angular
                            .module('app.appConfig')
                            .constant('appConfig', config)
                        console.log("Bootstrapping application");
                        try {
                            angular.bootstrap(document, ['app']);
                        } catch (err) {
                            console.log(err);
                        }
                    });
                });
            });
        });
    }
    return requireMain;
});
