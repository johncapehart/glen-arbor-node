'use strict';
console.log("loading app.js")
define([], function () {
        // Declare app level module which depends on views, and components
        var app = angular
            .module('app',
                ['ui.router', 'blockUI', 'app.c', 'app.modal', 'app.api']
            )
            .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
                    $urlRouterProvider
                        .otherwise(function (o, url) {
                            console.log("otherwise " + url.$$url)
                            return "/app.layout";
                        });
                }]
            )
            .config(function ($stateProvider, $urlRouterProvider, appConfig) {
                console.log("In appc.config");
                $stateProvider
                    .state('app', {
                        url: "/app",
                        template: '<div ui-view class="full-height"></div>',
                        abstract: true
                    })
                    .state('app.layout', {
                        url: '/home',
                        views: {
                            '': {
                                templateUrl: appConfig.templatedir + 'layout.tpl.html',
                                controller: 'layoutController as lc'
                            },
                            'list@app.layout': {
                                templateUrl: appConfig.templatedir + 'grid.tpl.html',
                                controller: 'listController as lc',
                            }
                        },
                        resolve: {
                            result_data: function ($q, $timeout)//,CommonService)
                            {
                                //return resolve_homepage($q,CommonService)
                                var deferred = $q.defer();
                                $timeout(function () {
                                    deferred.resolve({
                                        layout: true
                                    });
                                }, 500);
                                return deferred.promise;
                            }
                        }
                    })
                ;
            });
        app.run(['$state', function ($state) {
            $state.go('app.layout');
        }]);
    }
)
;

