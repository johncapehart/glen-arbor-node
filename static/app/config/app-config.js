/**
 * Created by john.capehart on 9/26/2016.
 */
'use strict';

console.log("loading app-config.js");

define(function () {
    angular.module('app.appConfig', ['blockUI'])
        .config(['$locationProvider', function ($locationProvider) {
            $locationProvider.html5Mode(false);
        }])
        .factory('appConfigservice', function ($http, $log, $q, blockUI) {
            var getconfig = function () {
                var $location = window.location;    // could not get angular $location service to inject here
                var query = $location.href.split('?')[1];
                var rx = /(^|&)service=([^&#]*)/;
                var arr = rx.exec(query);
                var config = {};
                config.serviceName = arr[2];

                if (!!$location.origin) {
                    config.webhookserver = $location.origin;
                } else {
                    config.webhookserver = $location.protocol + '//' + $location.hostname;
                }
                var path = $location.pathname;
                var pieces = path.split('/');
                config.sitePrefix = pieces[1] + '/';
                if (config.serviceName === undefined) {
                    config.serviceName = pieces[2];
                }
                var url = config.webhookserver + "/" + config.sitePrefix + config.serviceName + "/clientconfig";
                var deferred = $q.defer();
                var params = {
                    //todo: populate username
                    //username: tabledata.userName,
                    test: false
                };
                console.log("Getting configuration from server url " + url);
                //blockUI.start("Getting configuration...");
                $http({
                    url: url,
                    method: 'GET',
                    params: params
                })
                    .success(function (config1) {
                        var v = {
                            inSharePoint: (typeof(_spPageContextInfo) !== 'undefined'),
                            templatedir: config.webhookserver + "/" + config.sitePrefix + config.serviceName + '/static/app/templates/',
                        };
                        angular.extend(config, config1, v);
                        deferred.resolve(config);
                    })
                    .error(function (msg, code) {
                        blockUI.stop();
                        deferred.reject(msg);
                        $log.error(msg, code);
                    });
                return deferred.promise;
            };

            return {
                getconfig: getconfig
            };
        })
        .factory('userinfoservice', function ($http, $log, $q, $timeout, blockUI, appConfig) {
            var result = {
                    getUser: function () {
                        var instance = this;
                        var deferred = $q.defer();
                        try {
                            if (!!instance.cached) {
                                $timeout(function () {
                                    deferred.resolve(instance.cached);
                                }, 1);
                                return deferred.promise;
                            }
                            if (!!appConfig.userInfo.queryString) {
                                var url;
                                if (!!appConfig.asphost) {
                                    url = appConfig.asphost.protocol + "://" + appConfig.asphost.host + "/" + appConfig.userInfo.queryString;
                                } else {
                                    url = appConfig.webhookserver + "/" + appConfig.userInfo.queryString;
                                }
                                if (userInfo.userName !== undefined) {
                                    url += "&userName=" + userInfo.userName;
                                }
                                console.log("userinfoservice Requesting data from " + url);
                                $http({
                                    url: url,
                                    method: 'GET', // POST avoids caching of response
                                })
                                    .success(function (data, status, headers, config) {
                                        //blockUI.stop();
                                        console.log("userinfoservice received user info");
                                        angular.merge(data, userInfo);
                                        instance.cached = data;
                                        deferred.resolve(data);
                                    })
                                    .error(function (data, status, headers, config) {
                                        /*blockUI.stop();*/
                                        $log.error(data, status);
                                        deferred.resolve(data);
                                    });
                            }
                            else {
                                deferred.resolve(instance.cached);
                            }
                        } catch (err) {
                            console.log(err);
                        }
                        instance.cached = {
                            userName: appConfig.userName
                        };
                        $timeout(function () {
                            deferred.resolve(instance.cached);
                        }, 1);
                        return deferred.promise;
                    },
                    cached: null
                }
                ;
            return result;
        })
    ;
})
;
