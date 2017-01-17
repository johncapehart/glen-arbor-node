/**
 * Created by john.capehart on 10/5/2016.
 */
//'use strict';
console.log("loading list.js")

define([], function () {
        var appc = angular
            .module('app.c'
            )
            .controller("listController", function ($scope, $state, $timeout, $interval, $templateCache, uiGridConstants, appConfig, tabledata1) {
                console.log("In listController " + $state.$current.url.toString());
                $scope.name = "list"
                $scope.state = $state.current;
                $scope.ui = appConfig.client.ui;
                $scope.msg = {};
                $scope.appConfig = appConfig;
                $scope.tabledata = tabledata1;
                $scope.gridOptions = tabledata1.gridOptions;
                tabledata1.$scope = $scope;
                var loginName = '';
                $templateCache.put('ui-grid/selectionSelectAllButtons',
                    "<div class=\"ui-grid-selection-row-header-buttons \" ng-class=\"{'ui-grid-all-selected': grid.selection.selectAll}\" ng-if=\"grid.options.enableSelectAll\"><input style=\"margin: 0; vertical-align: middle\" type=\"checkbox\" ng-model=\"grid.selection.selectAll\" ng-click=\"grid.selection.selectAll=!grid.selection.selectAll;headerButtonClick($event)\"></div>"
                );
                $scope.isSomethingSelected = function () {
                   tabledata1.isSomethingSelected();
                };
                $scope.selectionClicked = tabledata1.selectionClicked;
                tabledata1.listControllerscope = $scope;
            });
    }
)
;
