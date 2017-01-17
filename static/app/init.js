/**
 * Created by john.capehart on 10/8/2016.
 */
'use strict';
console.log("loading init.js");
define([], function () {
    var appc = angular
        .module('app.c',
            ['app', 'ng', 'ngTouch', 'ngAnimate',
                'ui.bootstrap', "ui.bootstrap.popover", 'ui.router',
                'inform', 'inform-exception', 'inform-http-exception', 'blockUI',
                'ui.grid', 'ui.grid.resizeColumns', 'ui.grid.edit', 'ui.grid.selection',
                'ui.grid.pagination',
                'app.appConfig', 'app.api', 'app.services', 'app.modal'
            ]
        )
        .config(["$controllerProvider", "$provide", '$compileProvider', function ($controllerProvider, $provide, $compileProvider) {
        }
        ])
        // http://stackoverflow.com/a/32974096/6264046
        // https://jsfiddle.net/p7o2mkg4/1/
        // http://stackoverflow.com/a/23067240/6264046
        .directive('resizable', function () {
            var resizableConfig = {
                handles: "all", autoHide: true
            };
            return {
                restrict: 'A',
                scope: {
                    callback: '&onResize',
                    alsoResize: "modal-dialog"
                },
                link: function postLink(scope, elem) {
                    $('.modal-content').resizable(resizableConfig);
                    $('.modal-dialog').draggable();

                    elem.resizable(resizableConfig);
                    elem.on('resizestop', function () {
                        if (scope.callback) scope.callback();
                    });
                }
            };
        })
       .directive('adjustHeight', function ($timeout, $window) {
            return {
                //restrict: 'A',
                link: function (scope, element, attrs) {
                    var td = scope.tabledata;
                    var e = element;
                    td.setGridHeight = function () {
                        var e0 = $(e);
                        var h0 = e0.height();
                        var body = $('#changes-height');
                        var header = $('#layout-header');
                        var document = $('html');
                        var headerHeight = header.height();
                        var footerHeight = 75;
                        //var dh = document.height();
                        //var wh =  $window.innerHeight;
                        var gridHeight = ((td.gridOptions.data.length + 1) * 30) + 32 + 20;
                        var h = Math.max((6 * 30 + 32 + 30), Math.min(h0 - headerHeight - footerHeight, gridHeight));
                        //console.log("setGridHeight " + h + " element " + h0 + " document " + (h + eh) + " window " + wh);
                        body.height(h);
                        //document.height(Math.min(wh, h + eh));
                    };
                    td.setGridHeight();          // does not resize the grid
                    $timeout(td.setGridHeight);  // resizes the grid but not the render-container
                    angular.element($window).bind('resize', td.setGridHeight);
                }
            };
        })
        .directive('adjustModalHeight', function ($timeout, $window) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var td = scope.tabledata;
                    var e = element;
                    td.setGridHeight = function () {
                        var e0 = $(e);
                        var h0 = e0.height();
                        var body = $('#modal-changes-height');
                        var header = $('#modal-header');
                        var footer = $('#modal-footer');
                        var document = $('#modal-window');
                        var headerHeight = header.height();
                        var footerHeight = footer.height();
                        //var dh = document.height();
                        //var wh =  $window.innerHeight;
                        var gridHeight = ((td.gridOptions.data.length + 1) * 30) + 32 + 20;
                        var h = Math.max((6 * 30 + 32 + 30), Math.min(h0 - headerHeight - footerHeight, gridHeight));
                        //console.log("setGridHeight " + h + " element " + h0 + " document " + (h + eh) + " window " + wh);
                        body.height(h);
                        //document.height(Math.min(wh, h + eh));
                    };
                    td.setGridHeight();          // does not resize the grid
                    $timeout(td.setGridHeight);  // resizes the grid but not the render-container
                    angular.element(e).bind('resize', td.setGridHeight);
                }
            };
        })
});