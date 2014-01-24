/* ng-infinite-scroll - v1.0.0 - 2014-01-24 */
var mod;

mod = angular.module('infinite-scroll', []);

mod.directive('infiniteScroll', [
  '$rootScope', '$window', '$timeout', function($rootScope, $window, $timeout) {
    return {
      link: function(scope, elem, attrs) {
        var checkInterval, checkShouldLoadMore, checkWhenEnabled, container, handler, scrollDistance, scrollEnabled, timeoutFn;
        $window = angular.element($window);
        scrollDistance = 0;
        if (attrs.infiniteScrollDistance != null) {
          scope.$watch(attrs.infiniteScrollDistance, function(value) {
            return scrollDistance = parseInt(value, 10);
          });
        }
        scrollEnabled = true;
        checkWhenEnabled = false;
        if (attrs.infiniteScrollDisabled != null) {
          scope.$watch(attrs.infiniteScrollDisabled, function(value) {
            scrollEnabled = !value;
            if (scrollEnabled && checkWhenEnabled) {
              checkWhenEnabled = false;
              return handler();
            }
          });
        }
        container = $window;
        if (attrs.infiniteScrollContainer != null) {
          scope.$watch(attrs.infiniteScrollContainer, function(value) {
            var newContainer;
            if (!value) {
              return;
            }
            newContainer = angular.element(value);
            if (newContainer) {
              container.off('scroll', handler);
              container = newContainer;
              container.on('scroll', handler);
            } else {
              throw new Exception("invalid infinite-scroll-container attribute.");
            }
          });
        }
        if (attrs.infiniteScrollParent != null) {
          container = elem.parent();
          scope.$watch(attrs.infiniteScrollParent, function() {
            container.off('scroll', handler);
            container = elem.parent();
            container.on('scroll', handler);
          });
        }
        checkShouldLoadMore = function() {
          var containerBottom, containerHeight, elementBottom, remaining, shouldScroll;
          containerHeight = container.height();
          if (container === $window) {
            containerBottom = containerHeight + container.scrollTop();
            elementBottom = elem.offset().top + elem.height();
          } else {
            containerBottom = containerHeight;
            elementBottom = elem.offset().top - container.offset().top + elem.height();
          }
          remaining = elementBottom - containerBottom;
          shouldScroll = remaining <= containerHeight * scrollDistance;
          if (shouldScroll && scrollEnabled) {
            if ($rootScope.$$phase) {
              return scope.$eval(attrs.infiniteScroll);
            } else {
              return scope.$apply(attrs.infiniteScroll);
            }
          } else if (shouldScroll) {
            return checkWhenEnabled = true;
          }
        };
        handler = function() {
          return scope.hasScrolled = true;
        };
        scope.$on('verifyLoadMore', handler);
        container.on('scroll', handler);
        scope.$on('$destroy', function() {
          container.off('scroll', handler);
          return clearInterval(checkInterval);
        });
        checkInterval = setInterval(function() {
          if (scope.hasScrolled) {
            return scope.$apply(function() {
              checkShouldLoadMore();
              return scope.hasScrolled = false;
            });
          }
        }, 300);
        timeoutFn = function() {
          if (attrs.infiniteScrollImmediateCheck) {
            if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
              return handler();
            }
          } else {
            return handler();
          }
        };
        return $timeout(timeoutFn, 0);
      }
    };
  }
]);
