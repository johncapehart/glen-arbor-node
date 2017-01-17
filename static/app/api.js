console.log("loading api.js")
define(function () {
    angular
        .module('app.api', ['ng', 'app.appConfig', 'app.services']
        )
        .factory('gridoptions', function (uiGridConstants) {
            return {
                gridOptions: {
                    enableColumnResizing: true,
                    enableCellEdit: true,
                    //enableCellEditOnFocus: true,
                    //enableFiltering: true,
                    enableRowSelection: true,
                    showSelectionCheckbox: true,
                    enableSelectAll: false,
                    selectWithCheckboxOnly: true,
                    enableSorting: true,
                    //selectionRowHeaderWidth: 35,
                    //rowHeight: 35,
                    paginationPageSizes: [10, 20, 50],
                    paginationPageSize: 10,
                    //columnDefs: $scope.columns
                    data: [],
                    selection: [],
                },
            }
        })
        .factory('userData', function (appConfig) {
            var v = {
                userName: null
            };
            return v;
        })
        .factory("tabledata1", function ($timeout, uiGridConstants, appConfig, gridoptions, contextService, discoveryService) {
            var refreshData = function () {
                var td = this;
                td.error = [];
                td.warn = [];
                td.verbose = [];
                discoveryService.getdata(this.filter)
                    .then(function (data) {
                        var output = data.data.output.data;
                        angular.extend(td, data.data);
                        td.noDataMessage = appConfig.client.ui.noDataMessage;
                        td.gridOptions.data = output;
                        td.lastobject = {};
                        td.gridOptions.columnDefs = _.filter(appConfig.columns, function (col) {
                            return (typeof(col.views) === 'undefined') || (_.contains(col.views, "choose"));
                        });
                        td.setGridHeight();
                        td.nothingSelected = true;
                        if (typeof td.gridOptions.gridApi !== 'undefined') {
                            td.gridOptions.gridApi.core.handleWindowResize()
                            td.gridOptions.gridApi.selection.clearSelectedRows();
                            td.gridOptions.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
                        }
                    });
            };
            var td = {
                    filter: appConfig.mock === "true" ? appConfig.common.testFilter : undefined,
                    scope: null,
                    refreshData: refreshData,
                    noDataMessage: appConfig.client.ui.beforeDataMessage,
                    gridOptions: angular.copy(gridoptions.gridOptions),
                    nothingSelected: true,
                    error: [],
                    warn: [],
                    verbose: [],
                    isSomethingSelected: function () {
                        console.log('isSomethingSelected', this.gridApi.selection.getSelectedCount());
                        return this.gridApi.selection.getSelectedCount() > 0;
                    },
                    setSomethingSelected: function (b) {
                        this.selectedCount = this.gridOptions.gridApi.selection.getSelectedCount();
                        console.log('setSomethingSelected', b, this.gridOptions.gridApi.selection.getSelectedCount());
                        this.nothingSelected = !b;
                        if (this.layoutScope !== undefined) {
                            this.layoutScope.updateTable();
                        }
                    },
                    selectionClicked: function (object) {
                        if (typeof object.grid.api === 'undefined') {
                            throw('null gridapi in tabledata service');
                        }
                        if (object.entity.Selected) {
                            object.grid.api.selection.selectRow(object.entity);
                        } else {
                            object.grid.api.selection.unSelectRow(object.entity);
                        }
                        this.setSomethingSelected(this.gridOptions.gridApi.selection.getSelectedCount() > 0);
                    }
                }
                ;
            td.gridOptions.onRegisterApi = function (gridApi) {
                //set gridApi on scope
                console.log("registering gridApi");
                this.gridApi = gridApi;
                this.gridApi.parent = this;
                this.gridApi.selection.clearSelectedRows();

                gridApi.selection.on.rowSelectionChanged(null, function (row) {
                    console.log("Row " + row.entity.ID + " selected: " + row.isSelected);
                    row.entity.Selected = row.isSelected;
                    this.parent.parent.setSomethingSelected((typeof(gridApi.selection) !== 'undefined') ? gridApi.selection.getSelectedCount() > 0 : false);
                });//end single row
                td.$scope.gridApi = gridApi;
                $timeout(function () {
                    td.$scope.gridApi.core.handleWindowResize();
                });
            }
            td.gridOptions.data = [];
            td.gridOptions.columnDefs = _.filter(appConfig.columns, function (col) {
                return (typeof(col.views) === 'undefined') | (_.contains(col.views, "choose"));
            });
            td.gridOptions.parent = td;
            return td;
        })
        .factory("tabledata2", function (uiGridConstants, appConfig, gridoptions, tabledata1) {
            var refreshData = function () {
                var td = this;
                td.gridOptions.selection = [];
                td.gridOptions.data = [];
                angular.forEach(tabledata1.gridOptions.data, function (row) {
                    if (row.Selected) {
                        this.push(row);
                    }
                }, td.gridOptions.data);

            }
            var td = {
                refreshData: refreshData,
                gridOptions: angular.copy(gridoptions.gridOptions)
            };
            td.gridOptions.enableRowSelection = false;
            td.gridOptions.columnDefs = _.filter(appConfig.columns, function (col) {
                return (typeof(col.views) === 'undefined') | (_.contains(col.views, "confirm"))
            });
            return td;
        })
        .factory("tabledata3", function (uiGridConstants, appConfig, gridoptions, tabledata2) {
                var refreshData = function () {
                    var td = this;
                    td.gridOptions.selection = [];
                    try {
                        td.gridOptions.data = td.data.output.data;
                    } catch (err) {
                        td.gridOptions.data = [];
                    }
                }
                var v = {
                    refreshData: refreshData,
                    gridOptions: angular.copy(gridoptions.gridOptions)
                };
                v.gridOptions.enableRowSelection = false;
                v.gridOptions.columnDefs = _.filter(appConfig.columns, function (col) {
                    return (typeof(col.views) === 'undefined') | (_.contains(col.views, "results"));
                });
                return v;
            }
        );
})
;