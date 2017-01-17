/**
 * Created by john.capehart on 10/9/2016.
 */
'use strict';
console.log("loading modal.js");
define(function () {
    var appmodal = angular
        .module('app.modal',
            ['ui.router', 'ui.grid', 'ui.grid.resizeColumns', 'app.appConfig', 'app.services', 'ngSanitize', 'ngAnimate',
                'ui.bootstrap', "ui.bootstrap.modal",
                "ui.bootstrap.popover", 'ui.grid.edit', 'ui.grid.selection']
        )
        /*
         .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider, grid) {
         }
         ])
         */
        .controller('modalOpener', function ($scope, $sce, appConfig, modalService) {
            modalService.showModal({
                templateUrl: $sce.trustAsResourceUrl(appConfig.templatedir + 'modal.tpl.html'),
                controller: 'modalController',
                size: 'lg'
            });
        })

        .controller('modalController', function ($timeout, $scope, $state, $sce, appConfig, tabledata2, tabledata3, modalService, uibModalService, actionservice) {
            console.log("In modalController");
            $scope.name = "modalController";
            $scope.title = appConfig.client.ui.confirmDialogTitle;// options.title;
            $scope.ui = appConfig.client.ui;
            $scope.confirmButtonValue = $scope.ui.confirmButtonValue;
            $scope.cancelText = 'Cancel';// options.cancelText;
            $scope.tabledata = tabledata2;
            $scope.tabledata.refreshData();
            $scope.gridOptions = $scope.tabledata.gridOptions;
            $scope.msg = {};
            $scope.cancel = function () {
                modalService.close();
            };
            $scope.ok = function () {
                actionservice
                    .doaction(tabledata2.gridOptions.data)
                    .then(function (data) {
                        console.log("Action commplete");
                        modalService.close();
                        tabledata3.data = data.data;
                        modalService.showModal({
                            templateUrl: $sce.trustAsResourceUrl(appConfig.templatedir + 'modal.tpl.html'),
                            controller: 'modalController2 as mi2'
                        });
                    });
            };
        })
        .controller('modalController2', function ($scope, $state, appConfig, modalService, tabledata3) {
            console.log("In modalController2");
            $scope.title = appConfig.client.ui.resultsDialogTitle;// options.title;
            $scope.name = "modalController2";
            $scope.ui = appConfig.client.ui;
            $scope.confirmButtonValue = $scope.ui.doneButtonValue;
            $scope.cancelText = '';// options.cancelText;
            $scope.tabledata = tabledata3;
            $scope.msg = {};
            $scope.tabledata.refreshData();
            $scope.gridOptions = $scope.tabledata.gridOptions;
            $scope.cancel = function () {
                modalService.close();
            };
            $scope.ok = function () {
                modalService.close();
            };

        })
        .factory("uibModalService", function ($state, $injector, appConfig) {
            return {
                showModal: function (options) {
                    var s = this;
                    $injector.invoke(['$uibModal', function ($uibModal) {
                        var modalInstance = $uibModal.open(options);
                        s.modalInstance = modalInstance;
                        modalInstance
                            .result
                            .finally(function () {
                                    console.log("Returning to main route");
                                    $state.go("^");
                                }
                            );
                    }]);
                },
                close: function () {
                    if (typeof(this.modalInstance) !== 'undefined') {
                        this.modalInstance.close(function (result) {
                            console.log("Modal closed");
                        });
                    }
                }
            };
        })
        .factory("uibModalService2", function ($state, $injector, appConfig) {
            return {
                showModal: function (options) {
                    var s = this;
                    $injector.invoke(['$uibModal', function ($uibModal) {
                        var modalInstance = $uibModal.open(options);
                        s.modalInstance = modalInstance;
                    }]);
                },
            };
        })
        /*
         .factory("sharePointModalService", function ($state, $http, $injector, appConfig) {
         return {
         showModal: function (options) {
         $http({
         url: options.templateUrl,
         method: 'GET'
         })
         .success(function (data, status, headers, config) {
         var newDirective = angular.element('<div ng-controller="modalController"></div>');
         document.append(newDirective);
         // $compile(newDirective)();
         //     var e = $(data).get(0)
         var spopts = {
         html: newDirective
         };
         console.log("Opening SP Modal");
         SP.UI.ModalDialog.showModalDialog(spopts);
         console.log("SP Modal opened");
         }
         )
         .error(function (data, status, headers, config) {
         console.log(status);
         });
         },
         close: function () {
         SP.UI.ModalDialog.close();
         }
         };
         })
         */
        .factory("modalService", function ($state, $http, $injector, appConfig, uibModalService) {
                return {
                    showModal: function (options) {
                        var modalOptions = {
                            scope: null,
                            size: 'lg',
                            transclude: true,
                            backdrop: false,
                            keyboard: true,
                            windowClass: 'app-modal-window',
                            resolve: {
                                $element: function () {
                                    return {
                                        title: 'Titlex', okText: 'Ok',
                                        cancelText: 'Cancel'
                                    };
                                }
                            }
                        };
                        angular.extend(modalOptions, options);
                        //modalOptions.controller = undefined;
                        if (false && appConfig.inSharePoint) {
                            //sharePointModalService.showModal(modalOptions);
                        } else {
                            uibModalService.showModal(modalOptions);
                        }
                    },
                    close: function () {
                        if (false && appConfig.inSharePoint) {
                            //sharePointModalService.close();
                        } else {
                            uibModalService.close();
                        }
                    }
                };
            }
        );
});
