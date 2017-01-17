/**
 * Created by john.capehart on 10/5/2016.
 */
//'use strict';
console.log("loading layout.js");

define([], function () {
    var appc = angular
        .module('app.c'
        )
        .controller('layoutController', function ($scope, $element, $state, $sce, blockUI, uiGridConstants, tabledata1, contextService, discoveryService, modalService, appConfig) {
            console.log("In layoutController " + $state.$current.url.toString());
            $scope.$on('$viewContentLoaded',
                function (event) {
                    console.log('content loaded: ', event.currentScope.name);
                    $.unblockUI();
                });
            $scope.context = {};
            $scope.tabledata = tabledata1;
            tabledata1.layoutScope = $scope;
            $scope.name = "layout";
            $scope.ui = appConfig.client.ui;
            $scope.menuIndex = -1;
            $scope.menuLabel = function () {
                if ($scope.menuIndex >= 0) {
                    return $scope.ui.menuItems[$scope.menuIndex][$scope.ui.menu.displayColumnName];
                } else {
                    return $scope.ui.menuLabel;
                }
            };
            $scope.config = appConfig;
            $scope.setMenuIndex = function (i) {
                $scope.menuIndex = i;
                $scope.updateTable();
            };
            $scope.updateTable = function () {
                var changed = false;
                _.each($scope.tabledata.gridOptions.data, function (e) {
                    try {
                        if (!!$scope.ui.menuItems) {
                            if (($scope.menuIndex >= 0) && e.Selected) {
                                changed = changed || e != $scope.ui.menuItems[$scope.menuIndex];
                                e.menuItem = $scope.ui.menuItems[$scope.menuIndex];
                                e.Operation = e.menuItem[$scope.ui.menu.operationColumnName];
                                e[$scope.ui.menu.tableOperationColumnName] = e.menuItem[$scope.ui.menu.operationColumnName];
                                e[$scope.ui.menu.tableDisplayColumnName] = e.menuItem[$scope.ui.menu.displayColumnName];
                            } else {
                                changed = changed || e.NewCollectionID != null;
                                e.menuItem = null;
                                e.Operation = null;
                                e[$scope.ui.menu.tableOperationColumnName] = null;
                                e[$scope.ui.menu.tableDisplayColumnName] = null;
                            }
                        }
                    } catch (ex) {
                        console.log(ex);
                    }
                });
                if (changed) {
                    $scope.tabledata.gridOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
                }
            };
            $scope.refreshData = function () {
                if ($scope.context.filter === $scope.ui.filter.filterSecret) {
                    $scope.ui.advancedMode = !$scope.ui.advancedMode;
                } else {
                    tabledata1.filter = $scope.context.filter;
                    tabledata1.refreshData();
                }
            };
            $scope.nothingSelected = function () {
                //console.log("layoutController nothingSelected=" +  tabledata.nothingSelected)
                return tabledata1.nothingSelected;
            };
            $scope.entryIsInvalid = function () {
                if ($scope.context.filter === $scope.ui.filter.filterSecret) {
                    return false;
                }
                return $scope.ui.filter.filterMinimumLength === 0 ?
                    false : typeof($scope.context.filter) === 'undefined' ?
                    true : $scope.context.filter === null ?
                    true : $scope.context.filter.length < $scope.ui.filter.filterMinimumLength;
            };
            $scope.setSomethingSelected = tabledata1.setSomethingSelected;
            $scope.showModal = function () {
                modalService.showModal({
                    templateUrl: $sce.trustAsResourceUrl(appConfig.templatedir + 'modal.tpl.html'),
                    controller: 'modalController'
                });
            };
            console.log("layout.js Context requesting context");
            contextService.getContext().then(function (context) {
                console.log("layout.js Context retrieved " + context.userName);
                $scope.context = context;
                try {
                    if (!!$scope.ui.filter.filterContextVariable) {
                        $scope.context.filter = $scope.context[$scope.ui.filter.filterContextVariable];
                        console.log("layout.js Setting filter to " + $scope.context.filter + " from " + $scope.ui.filter.filterContextVariable);
                    }
                } catch (err) {
                    console.log(err);
                }

            });
        });
});
