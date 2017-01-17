console.log("loading services.js")
define(function () {
    angular
        .module('app.services', ['ng', 'ui.grid']
        )
        .factory('contextService', function ($http, $log, $q, blockUI, inform, appConfig, userinfoservice) {
            return {
                getContext: function () {
                    //blockUI.start("Getting context...");

                    try {
                        var url = appConfig.webhookserver + "/" + appConfig.sitePrefix + appConfig.serviceName + "/context";
                        var deferred = $q.defer();
                        userinfoservice.getUser().then(function (userinfo) {
                            var userName = !!userinfo ? userinfo.userName : "";
                            var params = {
                                userName: userName,
                                mock: appConfig.mock
                            };
                            console.log("contextService Requesting data for " + filter + " mock " + appConfig.mock + " url " + url + " userName " + params.userName)
                            $http({
                                url: url,
                                method: 'POST', // POST avoids caching of response
                                params: params
                            })
                                .success(function (data, status, headers, config) {
                                    //blockUI.stop();
                                    console.log("contextService Received context");
                                    if (!!userinfo) {
                                        angular.merge(data, userinfo);
                                    }
                                    deferred.resolve(data);
                                })
                                .error(function (data, status, headers, config) {
                                    /*blockUI.stop();*/
                                    $log.error(data, status);
                                    deferred.resolve(data);
                                });
                        });
                        return deferred.promise;
                    } catch (ex) {
                        blockUI.stop();
                        console.log(ex);
                    }
                }
            };
        })
        .factory('discoveryService', function ($http, $log, $q, blockUI, inform, appConfig, userinfoservice) {
            return {
                getdata: function (filter) {
                    blockUI.start("Getting data...");
                    try {
                        var url = appConfig.webhookserver + "/" + appConfig.sitePrefix + appConfig.serviceName + "/discovery";
                        console.log("Requesting data for " + filter + " mock " + appConfig.mock + " url " + url)
                        var deferred = $q.defer();
                        userinfoservice.getUser().then(function (userinfo) {
                            var params = {
                                username: userinfo.userName,
                                filter: filter,
                                mock: appConfig.mock
                            };
                            $http({
                                url: url,
                                method: 'POST', // POST avoids caching of response
                                params: params
                            })
                                .success(function (data, status, headers, config) {
                                    blockUI.stop();
                                    console.log("Received data, record count " + data.output.data.length);
                                    deferred.resolve({
                                        data: data
                                    });
                                })
                                .error(function (data, status, headers, config) {
                                    blockUI.stop();
                                    deferred.reject(data);
                                    $log.error(data, status);
                                });
                        });
                        return deferred.promise;
                    } catch (ex) {
                        blockUI.stop();
                        console.log(ex);
                    }
                }
            };
        })
        .factory('actionservice', function ($http, $log, $q, blockUI, inform, appConfig, userData, userinfoservice, tabledata1) {
            return {
                doaction: function (list) {
                    blockUI.start("Processing request...");
                    try {
                        var url = appConfig.webhookserver + "/" + appConfig.sitePrefix + appConfig.serviceName + "/action";
                        console.log("Requesting action for " + list + " mock " + appConfig.mock + " url " + url);
                        var deferred = $q.defer();
                        console.log("action sevice " + url)
                        userinfoservice.getUser().then(function (userinfo) {
                            var params = {
                                username: userinfo.userName,
                                mock: appConfig.mock
                            };
                            var data = {
                                username: userinfo.userName,
                                filter: tabledata1.filter,
                                list: list,
                                forreal: !appConfig.whatif,
                                whatif: appConfig.whatif
                            };

                            $http({
                                url: url,
                                method: 'POST',
                                params: params,
                                data: data,
                                headers: {'Content-Type': 'application/json; charset=utf-8'},
                            })
                                .success(function (data, status, headers, config) {
                                    blockUI.stop();
                                    console.log("Action completed");
                                    deferred.resolve({
                                        data: data
                                    });
                                })
                                .error(function (data, status, headers, config) {
                                    console.log("Action failed");
                                    blockUI.stop();
                                    deferred.reject(data);
                                    $log.error(data, status);
                                });
                        });
                        return deferred.promise;
                    } catch (ex) {
                        blockUI.stop();
                        console.log(ex);
                    }
                }
            };
        })
    /*
     .factory('resolveservice', function (appConfigs, tabledata) {
     return {
     resolveDependencies: function ($q, $rootScope, dependencies) {
     var defer = $q.defer();
     require(dependencies, function () {

     $rootScope.$apply(function () {
     defer.resolve();
     });
     });

     return defer.promise;
     }
     };
     })
     */
    ;
});