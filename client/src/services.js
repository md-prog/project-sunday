function trackLoading($rootScope) {
    this.progress = 0,
        this.action = !1,
        this.setProgress = function (loadProgress) {
            this.progress = loadProgress
        },
        this.getProgress = function (loadProgress) {
            return this.progress
        },
        this.setAction = function (desiredAction) {
            this.action = desiredAction
        },
        this.getAction = function (desiredAction) {
            return this.action
        },
        this.broadcastStatus = function () {
            $rootScope.$broadcast("loadingTrackerEvent")
        }
}
var app = angular.module("projectSunday");
app.service("loadingTracker", ["$rootScope", trackLoading]),
    app.factory("apiService", ["$http", "$q", "$cacheFactory", function ($http, $q, $cacheFactory) {
        var url = "/feed/",
            apiService = {
                home: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "home/").then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                contact: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "contact/", {
                            cache: !0
                        }).then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                about: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "about/", {
                            cache: !0
                        }).then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                shop: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "shop/", {
                            cache: !0
                        }).then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                products: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "products/", {
                            cache: !0
                        }).then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                categories: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "product-categories/").then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                portfolio: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "portfolio/", {
                            cache: !0
                        }).then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                projects: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "projects/", {
                            cache: !0
                        }).then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                staging: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "staging/").then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                },
                navigation: function () {
                    var deferred = $q.defer();
                    return $http.defaults.useXDomain = !0,
                        $http.get(url + "navigation/").then(function (result) {
                            deferred.resolve(result)
                        }, function (reason) {
                            deferred.reject(reason)
                        }),
                        deferred.promise
                }
            };
        return apiService
    }]),
    app.factory("postalService", ["$http", "$q", function ($http, $q) {
        var url = "/feed/",
            postalService = {
                requestStaging: function (name, email, address, city, state, footage, price) {
                    return $http.post(url + "request-staging/", {
                        name: name,
                        email: email,
                        address: address,
                        city: city,
                        state: state,
                        footage: footage,
                        price: price
                    })
                },
                orderProduct: function (product_id, first_name, last_name, email, phone, address, city, state, wood_finish, wood_species, base_color, size) {
                    return $http.post(url + "order/", {
                        order_product_id: product_id,
                        first_name: first_name,
                        last_name: last_name,
                        email: email,
                        phone: phone,
                        address: address,
                        city: city,
                        state: state,
                        wood_finish: wood_finish,
                        wood_species: wood_species,
                        base_color: base_color,
                        size: size
                    })
                }
            };
        return postalService
    }]);