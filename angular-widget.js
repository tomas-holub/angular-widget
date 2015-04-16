/**
 * @license AngularJS v1.3.15
 * (c) 2015 Tomas Holub
 * License: MIT
 */
(function (window, angular, undefined) {

    'use strict';

    /**
     * @ngdoc module
     * @name widgetDirectives
     * @description
     * Set of directives which provides resize and drag and drop of recursive widget elements
     */
    var widgetDirectives = angular.module('widgetDirectives', []);

    /**
     * @ngdoc directive
     * @name widgetDirectives.directive:grid
     * @description
     * Defines the area of dnd
     */
    widgetDirectives.directive('grid', function () {
        return {
            scope: {
                grid: '='
            },
            restrict: 'A',
            replace: true,
            template: '<div class="grid"><div ng-repeat="widget in grid" widget="widget"></div></div>'
        }
    });

    /**
     * @ngdoc directive
     * @name widgetDirectives.directive:widget
     * @description
     * Defines the single widget element
     */
    widgetDirectives.directive('widget', ['$compile', function ($compile) {

        return {
            scope: {
                widget: '='
            },
            restrict: 'A',
            replace: true,
            template: '<div class="widget" dnd resize ng-style="widget.style">{{widget.name}}</div>',
            link: function (scope, element) {
                element.on("mouseup", function () {
                    var style = {
                        height: element[0].offsetHeight + 'px',
                        width: element[0].offsetWidth + 'px',
                        left: element[0].offsetLeft + 'px',
                        top: element[0].offsetTop + 'px'
                    };
                    scope.widget.style = style;
                });

                if (angular.isArray(scope.widget.children)) {
                    element.append("<div grid='widget.children'></div>");
                }
                $compile(element.contents())(scope);
            }
        }
    }]);

    /**
     * @ngdoc directive
     * @name widgetDirectives.directive:dnd
     * @description
     * Handles drag and drop functionality of the widget
     */
    widgetDirectives.directive('dnd', ['$document', function ($document) {
        return {
            link: function (scope, element) {

                var startX = 0,
                    startY = 0;
                var wdrop = {};
                wdrop.width = element[0].offsetParent.offsetWidth;
                wdrop.height = element[0].offsetParent.offsetHeight;

                var setDimensions = function () {
                    wdrop.width = element[0].offsetParent.offsetWidth;
                    wdrop.height = element[0].offsetParent.offsetHeight;
                }

                element.on('mousedown', function ($event) {
                    setDimensions();
                    startX = $event.pageX - element[0].offsetLeft;
                    startY = $event.pageY - element[0].offsetTop;
                    $document.on("mousemove", mousemove);
                    $document.on("mouseup", mouseup);
                    $event.stopPropagation();
                });

                function placeWidget(element, top, left) {
                    element.css({
                        position: "absolute",
                        top: top + "px",
                        left: left + "px"
                    });
                }

                function mousemove($event) {
                    var ypos = $event.pageY - startY;
                    var xpos = $event.pageX - startX;
                    var width = element[0].clientWidth;
                    var height = element[0].clientHeight;

                    if (xpos < 0) {
                        xpos = 0;
                    }
                    if (ypos < 0) {
                        ypos = 0;
                    }
                    if (xpos + width > wdrop.width) {
                        xpos = wdrop.width - width;
                    }

                    if (ypos + height > wdrop.height) {
                        ypos = wdrop.height - height;
                    }

                    placeWidget(element, ypos, xpos);
                }

                function mouseup() {
                    $document.off("mousemove", mousemove);
                    $document.off("mouseup", mouseup);
                }
            }
        };
    }]);

    /**
     * @ngdoc directive
     * @name widgetDirectives.directive:resize
     * @description
     * Handles resize functionality of the widget
     */
    widgetDirectives.directive('resize', ['$document', function ($document) {
        return function ($scope, $element) {
            //Reference to the original
            var $mouseDown;
            var wdrop = {};
            wdrop.width = $element[0].offsetParent.offsetWidth;
            wdrop.height = $element[0].offsetParent.offsetHeight;

            var setDimensions = function () {
                wdrop.width = $element[0].offsetParent.offsetWidth;
                wdrop.height = $element[0].offsetParent.offsetHeight;
            }

            // Function to manage resize up event
            var resizeUp = function ($event) {
                setDimensions();
                var margin = 20;
                if ($scope.widget.children.length && typeof $scope.widget.children[0].style !== 'undefined') {
                    var childStyle = $scope.widget.children[0].style;
                    var height = parseInt(childStyle.height.replace('px', ''));
                    var top = parseInt(childStyle.top.replace('px', ''));
                    margin = (height + top) > margin ? (height + top) : margin;
                }
                var lowest = $mouseDown.top + $mouseDown.height - margin;
                var top = $event.pageY - $mouseDown.diffY > lowest ? lowest : $event.pageY - $mouseDown.diffY;
                height = $mouseDown.top - top + $mouseDown.height;

                if (top >= 0 && (wdrop.height - height >= 0)) {

                    $element.css({
                        top: top + "px",
                        height: height + "px"
                    });
                }
            };

            // Function to manage resize right event
            var resizeRight = function ($event) {
                setDimensions();
                var margin = 20;
                if ($scope.widget.children.length && typeof $scope.widget.children[0].style !== 'undefined') {
                    var childStyle = $scope.widget.children[0].style;
                    var width = parseInt(childStyle.width.replace('px', ''));
                    var left = parseInt(childStyle.left.replace('px', ''));
                    margin = (width + left) > margin ? (width + left) : margin;
                }
                var leftest = $element[0].offsetLeft + margin;
                var width = ($event.pageX - $mouseDown.diffX + $mouseDown.width) > leftest ? (($event.pageX - $mouseDown.diffX + $mouseDown.width) - $element[0].offsetLeft) : margin;

                if ($mouseDown.left + width <= wdrop.width) {
                    $element.css({
                        width: width + "px"
                    });
                }
            };

            // Function to manage resize down event
            var resizeDown = function ($event) {
                setDimensions();
                var margin = 20;
                if ($scope.widget.children.length && typeof $scope.widget.children[0].style !== 'undefined') {
                    var childStyle = $scope.widget.children[0].style;
                    var height = parseInt(childStyle.height.replace('px', ''));
                    var top = parseInt(childStyle.top.replace('px', ''));
                    margin = (height + top) > margin ? (height + top) : margin;
                }

                var uppest = $element[0].offsetTop + margin;
                var height = ($event.pageY - $mouseDown.diffY + $mouseDown.height) > uppest ? ($event.pageY - $mouseDown.diffY + $mouseDown.height) - $element[0].offsetTop : margin;

                if ($mouseDown.top + height <= wdrop.height) {
                    $element.css({
                        height: height + "px"
                    });
                }

            };

            // Function to manage resize left event
            function resizeLeft($event) {
                setDimensions();
                var margin = 20;
                if ($scope.widget.children.length && typeof $scope.widget.children[0].style !== 'undefined') {
                    var childStyle = $scope.widget.children[0].style;
                    var width = parseInt(childStyle.width.replace('px', ''));
                    var left = parseInt(childStyle.left.replace('px', ''));
                    margin = (width + left) > margin ? (width + left) : margin;
                }
                var rightest = $mouseDown.left + $mouseDown.width - margin;
                var left = $event.pageX - $mouseDown.diffX > rightest ? rightest : $event.pageX - $mouseDown.diffX;

                width = $mouseDown.left - left + $mouseDown.width;
                if (left >= 0) {
                    $element.css({
                        left: left + "px",
                        width: width + "px"
                    });
                }
            };


            var createResizer = function createResizer(className, handlers) {

                var newElement = angular.element('<div class="resizer  ' + className + '"></div>');
                $element.append(newElement);
                newElement.on("mousedown", function ($event) {
                    $event.stopPropagation();
                    $document.on("mousemove", mousemove);
                    $document.on("mouseup", mouseup);

                    $mouseDown = $event;
                    $mouseDown.top = $element[0].offsetTop;
                    $mouseDown.left = $element[0].offsetLeft;
                    $mouseDown.width = $element[0].offsetWidth;
                    $mouseDown.height = $element[0].offsetHeight;
                    $mouseDown.diffY = $event.pageY - $element[0].offsetTop;
                    $mouseDown.diffX = $event.pageX - $element[0].offsetLeft;

                    function mousemove($event) {
                        event.preventDefault();
                        for (var i = 0; i < handlers.length; i++) {
                            handlers[i]($event);
                        }
                    }

                    function mouseup() {
                        $document.off("mousemove", mousemove);
                        $document.off("mouseup", mouseup);
                    }
                });
            }

            createResizer('w-resize', [resizeLeft]);
            createResizer('e-resize', [resizeRight]);
            createResizer('n-resize', [resizeUp]);
            createResizer('s-resize', [resizeDown]);
            createResizer('sw-resize', [resizeDown, resizeLeft]);
            createResizer('ne-resize', [resizeUp, resizeRight]);
            createResizer('nw-resize', [resizeUp, resizeLeft]);
            createResizer('se-resize', [resizeDown, resizeRight]);
        };
    }]);

})(window, window.angular);