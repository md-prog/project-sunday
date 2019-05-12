"use strict";

function init() {
    function addHover() {
        $(".show-menu .bars").addClass("tranny")
    }
    TweenMax.to("#loading-screen", .3, {
            opacity: 1,
            ease: Linear.easeNone
        }),
        TweenMax.set(".cropmarks", {
            height: "106px",
            width: "40%",
            display: "block"
        });
    var interFace = new TimelineMax({
        delay: 2
    });
    interFace.to(".logo, .site-title, .social-btns", .8, {
        opacity: 1,
        ease: Linear.easeNone
    }, 0).to(".share", .75, {
        top: "0",
        ease: Quint.easeOut
    }, 0).add("stagger", "0.5").staggerTo(".show-menu .bars", 1, {
        left: "0",
        width: "25px",
        ease: Quint.easeOut,
        onComplete: addHover
    }, .2, "stagger")
}
window.console || (console = {
    log: function () {},
    dir: function () {}
});
var LOCAL, PROD;
"localhost" == location.hostname ? (LOCAL = !0,
    PROD = !1) : (PROD = !0,
    LOCAL = !1);
var mobileWidth = 767,
    tabletWidth = 1023,
    app = angular.module("projectSunday", ["ui.router", "slick", "sticky", "ngAnimate", "angular-inview", "akoenig.deckgrid", "angular-cache", "mailchimp"]).run(["$rootScope", "$state", "$stateParams", "$timeout", "$location", "$window", "apiService", "$http", "CacheFactory", function ($rootScope, $state, $stateParams, $timeout, $location, $window, apiService, $http, CacheFactory) {
        function checkForMobile() {
            $rootScope.isMobile = !1,
                $rootScope.isTablet = !1,
                $rootScope.isDesktop = !1,
                window.innerWidth <= mobileWidth ? ($rootScope.isMobile = !0,
                    $rootScope.$broadcast("mobile")) : window.innerWidth <= tabletWidth ? ($rootScope.isTablet = !0,
                    $rootScope.$broadcast("tablet")) : $rootScope.isDesktop = !0
        }
        $rootScope.$state = $state,
            $rootScope.$stateParams = $stateParams,
            $rootScope.previousState,
            $rootScope.currentState,
            $rootScope.bodyClass = "home",
            $rootScope.prevLink,
            $rootScope.bread,
            $rootScope.crumb,
            $rootScope.pctLoaded = 0,
            $rootScope.menuEnabled = !0,
            $rootScope.broadcast = function () {
                $rootScope.$broadcast("contentLoaded")
            },
            $http.defaults.cache = CacheFactory("defaultCache", {
                maxAge: 36e5,
                cacheFlushInterval: 36e5,
                deleteOnExpire: "aggressive"
            });
        var port = $location.port();
        port = 80 === port || 443 === port ? "" : ":" + port,
            $rootScope.urlBase = $location.protocol() + "://" + $location.host() + port,
            $rootScope.url = $location.absUrl().split("?")[0],
            init(),
            checkForMobile(),
            $(window).on("resize", function () {
                checkForMobile()
            }),
            $(window).bind("scroll", function () {
                if ($rootScope.isDesktop)
                    if (this.pageYOffset >= 50) {
                        var shrink = new TimelineMax({
                            paused: !0
                        });
                        shrink.to(".top", .65, {
                                top: 0,
                                ease: Expo.easeOut
                            }, 0),
                            shrink.to(".right", .65, {
                                right: 0,
                                ease: Expo.easeOut
                            }, 0),
                            shrink.to(".bottom", .65, {
                                bottom: 0,
                                ease: Expo.easeOut
                            }, 0),
                            shrink.to(".left", .65, {
                                left: 0,
                                ease: Expo.easeOut
                            }, 0),
                            shrink.to(".icon-share", .1, {
                                color: "#dad6cc",
                                ease: Linear.easeNone
                            }, 0),
                            shrink.to(".share", .1, {
                                backgroundColor: "#8f7c4f",
                                ease: Linear.easeNone
                            }, 0),
                            shrink.play()
                    } else {
                        var shrink = new TimelineMax({
                            paused: !0
                        });
                        shrink.to(".top", .65, {
                                top: 0,
                                ease: Expo.easeOut
                            }, 0),
                            shrink.to(".right", .65, {
                                right: 0,
                                ease: Expo.easeOut
                            }, 0),
                            shrink.to(".bottom", .65, {
                                bottom: 0,
                                ease: Expo.easeOut
                            }, 0),
                            shrink.to(".left", .65, {
                                left: 0,
                                ease: Expo.easeOut
                            }, 0),
                            shrink.to(".icon-share", .1, {
                                color: "#dad6cc",
                                ease: Linear.easeNone
                            }, 0),
                            shrink.to(".share", .1, {
                                backgroundColor: "#8f7c4f",
                                ease: Linear.easeNone
                            }, 0),
                            shrink.reverse()
                    }
            })
    }]).config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "$sceDelegateProvider", "$httpProvider", "CacheFactoryProvider", function ($stateProvider, $urlRouterProvider, $locationProvider, $sceDelegateProvider, $httpProvider) {
        $sceDelegateProvider.resourceUrlWhitelist(["self", "http://projectsunday.net/**", "https://player.vimeo.com/**", "http://projectsunday.wearetopsecret.com/**"]),
            PROD && $locationProvider.html5Mode({
                enabled: !0,
                requireBase: !1
            }),
            $urlRouterProvider.otherwise("404-page"),
            $stateProvider.state("home", {
                url: "/",
                templateUrl: "partials/home.html",
                controller: "HomeCtrl",
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("portfolio", {
                url: "/portfolio",
                templateUrl: "partials/portfolio.html",
                controller: "PortfolioCtrl",
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("project", {
                url: "/portfolio/:slug",
                templateUrl: "partials/project.html",
                controller: "projectCtrl",
                params: {
                    slug: {
                        value: "",
                        squash: !1
                    }
                },
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("shop", {
                url: "/shop",
                templateUrl: "partials/shop.html",
                controller: "ShopCtrl",
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("product", {
                url: "/shop/:slug",
                templateUrl: "partials/product.html",
                controller: "productCtrl",
                params: {
                    slug: {
                        value: "",
                        squash: !1
                    }
                },
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("build", {
                url: "/build",
                templateUrl: "partials/bed-builder.html",
                controller: "BuildCtrl",
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("design", {
                url: "/design",
                templateUrl: "partials/staging.html",
                controller: "StagingCtrl",
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("about", {
                url: "/about",
                templateUrl: "partials/about.html",
                controller: "AboutCtrl",
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("contact", {
                url: "/contact",
                templateUrl: "partials/contact.html",
                controller: "ContactCtrl",
                resolve: {
                    e: ["$timeout", function ($timeout) {
                        return $timeout(function () {}, 1500)
                    }]
                }
            }).state("404-page", {
                url: "*path",
                templateUrl: "partials/404.html",
                controller: "404Ctrl"
            })
    }]);