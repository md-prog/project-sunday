app.filter("digits", function () {
        return function (input) {
            return 10 > input && (input = "0" + input),
                input
        }
    }),
    app.directive("fbShare", function () {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                scope.$watch("fbReady", function (val) {
                    val && element.on("click", function () {
                        FB.ui({
                            method: "feed",
                            name: attrs.fbTitle,
                            link: attrs.fbLink,
                            picture: attrs.fbImg,
                            caption: attrs.caption,
                            description: attrs.description,
                            message: attrs.message
                        })
                    })
                })
            }
        }
    }),
    app.directive("fluidvids", function () {
        return {
            restrict: "EA",
            replace: !0,
            scope: {
                video: "@"
            },
            template: '<div class="fluidvids"><iframe ng-src="{{ video }}" id="video" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>',
            link: function (scope, element, attrs) {
                var ratio = attrs.height / attrs.width * 100;
                element[0].style.paddingTop = ratio + "%"
            }
        }
    }),
    app.directive("showMenu", ["$rootScope", function ($rootScope) {
        var menu = function (scope, element, attrs) {
            function update() {
                TweenLite.set(".fold-right, .mainnav, .page, header", {
                        clearProps: "all"
                    }),
                    rightpanel.kill(),
                    links.kill(),
                    stage.kill(),
                    $rootScope.isDesktop && (rightpanel = TweenMax.to(".fold-right", .7, {
                            rotationY: 0,
                            left: "480px",
                            ease: Expo.easeOut
                        }),
                        links = TweenMax.to(".mainnav", 1, {
                            rotationY: 0,
                            left: "420px",
                            opacity: "1",
                            ease: Expo.easeOut
                        }),
                        stage = TweenMax.to(".page, header", .8, {
                            left: "0",
                            ease: Expo.easeOut
                        }),
                        foldout.add(rightpanel, 0),
                        foldout.add(links, 0),
                        foldout.add(stage, 0))
            }

            function menuOpen() {
                isOpen = !0,
                    $(".menu-btn, .menu-btn-mobile, .inner-menu-btn").addClass("close"),
                    $("body, html").css("overflow-y", "hidden")
            }

            function menuClosed() {
                isOpen = !1,
                    $(".menu-btn, .menu-btn-mobile, .inner-menu-btn").removeClass("close"),
                    TweenMax.to(".order-box", .3, {
                        opacity: 1,
                        ease: Linear.easeNone
                    }),
                    $("body, html").css("overflow-y", "auto")
            }
            var isOpen = !1,
                foldout = new TimelineMax({
                    paused: !0,
                    reversed: !0,
                    onComplete: menuOpen,
                    onReverseComplete: menuClosed
                });
            foldout.to(".fold-left", .85, {
                    rotationY: 0,
                    left: "0",
                    ease: Expo.easeOut
                }, 0),
                foldout.to(".menu-overlay", .8, {
                    display: "block",
                    opacity: 1,
                    ease: Expo.easeOut
                }, 0);
            var mobileMenu = new TimelineMax({
                    paused: !0,
                    reversed: !0,
                    onComplete: menuOpen,
                    onReverseComplete: menuClosed
                }),
                mobileLeft = TweenMax.to(".mobile-menu .boxes .left", .5, {
                    left: 0,
                    ease: Expo.easeOut,
                    delay: .3,
                    force3D: !0,
                    rotation: .01
                }),
                mobileRight = TweenMax.to(".mobile-menu .boxes .right", .5, {
                    right: 0,
                    ease: Expo.easeOut,
                    delay: .3,
                    force3D: !0,
                    rotation: .01
                }),
                mobileBars = TweenMax.to(".menu-btn-mobile #second-bar", .4, {
                    width: "40px",
                    right: "0px",
                    ease: Expo.easeOut,
                    delay: .2
                }),
                mobileSocial = TweenMax.staggerTo(".mobile-menu .social-mobile a", .4, {
                    scale: 1,
                    delay: .4,
                    force3D: !0,
                    rotation: .01
                }, .15),
                mobileName = TweenMax.to(".mobile-menu .name", .6, {
                    bottom: 0,
                    left: 0,
                    opacity: 1,
                    delay: .3,
                    ease: Expo.easeOut,
                    force3D: !0,
                    rotation: .01
                }),
                mobileBase = TweenMax.to(".mobile-menu", .5, {
                    left: 0,
                    ease: Expo.easeOut
                }),
                rightpanel = TweenMax.to(".fold-right", .9, {
                    rotationY: 0,
                    left: "480px",
                    ease: Expo.easeOut
                }),
                links = TweenMax.to(".mainnav", 1, {
                    rotationY: 0,
                    left: "420px",
                    opacity: "1",
                    ease: Expo.easeOut
                }),
                stage = TweenMax.to(".page, header", .8, {
                    left: "0",
                    ease: Expo.easeOut
                }),
                innerBtn = TweenMax.to(".inner-menu-btn", .3, {
                    opacity: 1,
                    ease: Linear.easeNone,
                    delay: .2
                }),
                innerBar = TweenMax.to(".inner-menu-btn #second-bar", .4, {
                    width: "40px",
                    right: "0px",
                    ease: Expo.easeOut,
                    delay: .2
                });
            foldout.add(rightpanel, 0),
                foldout.add(links, 0),
                foldout.add(stage, 0),
                foldout.add(innerBtn, 0),
                foldout.add(innerBar, 0),
                mobileMenu.add(mobileBase, 0),
                mobileMenu.add(mobileLeft, 0),
                mobileMenu.add(mobileRight, 0),
                mobileMenu.add(mobileBars, 0),
                mobileMenu.add(mobileSocial, 0),
                mobileMenu.add(mobileName, 0),
                $rootScope.menuEnabled && $(element).on("click", function () {
                    update(),
                        $(".nav-icons").toggleClass("hide"),
                        TweenMax.to(".order-box", .1, {
                            opacity: 0,
                            ease: Linear.easeNone
                        }),
                        $rootScope.isDesktop ? foldout.reversed() ? foldout.play() : foldout.timeScale(2).reverse() : mobileMenu.reversed() ? mobileMenu.play() : mobileMenu.timeScale(2).reverse()
                }),
                $(".inner-menu-btn").on("click", function () {
                    update(),
                        $(".nav-icons").addClass("hide"),
                        foldout.timeScale(2).reverse()
                }),
                $(".menu-overlay").on("click", function () {
                    update(),
                        $(".nav-icons").toggleClass("hide"),
                        TweenMax.to(".order-box", .1, {
                            opacity: 0,
                            ease: Linear.easeNone
                        }),
                        foldout.reversed() ? foldout.play() : foldout.timeScale(2).reverse()
                }),
                $(".mainnav a, .mobile-menu .box").on("click", function () {
                    $(".nav-icons").addClass("hide"),
                        TweenMax.to(".order-box", .1, {
                            opacity: 0,
                            ease: Linear.easeNone
                        }),
                        $rootScope.isDesktop ? foldout.timeScale(2).reverse() : mobileMenu.timeScale(2).reverse()
                }),
                $(".show-menu-mobile").on("click", function () {
                    update(),
                        mobileMenu.reversed() ? mobileMenu.play() : mobileMenu.timeScale(2).reverse()
                }),
                $(".logo a").on("click", function () {
                    $(".nav-icons").addClass("hide"),
                        1 == isOpen && $rootScope.isDesktop ? foldout.timeScale(2).reverse() : 1 == isOpen && $rootScope.isMobile && mobileMenu.timeScale(2).reverse()
                }),
                $(window).on("resize", function () {
                    1 == isOpen && foldout.timeScale(2).reverse(),
                        update()
                })
        };
        return {
            restrict: "A",
            link: menu,
            scope: !0
        }
    }]),
    app.directive("shuffleGrid", function () {
        var link = function (scope, element, $attrs) {
            function showProducts() {
                TweenMax.to(productItem, .375, {
                    scale: 1,
                    delay: .1,
                    ease: Quint.easeOut
                })
            }
            var productItem = "#product-grid .col";
            $(element).on("click", function () {
                TweenLite.to(window, .75, {
                        scrollTo: {
                            y: 700
                        },
                        ease: Power2.easeOut
                    }),
                    TweenMax.to(productItem, .375, {
                        scale: 0,
                        delay: .1,
                        ease: Quint.easeOut,
                        onComplete: showProducts
                    })
            })
        };
        return {
            restrict: "A",
            link: link,
            scope: !0
        }
    }),
    app.directive("borderScroll", ["$window", function ($window) {
        var link = function (scope, element, attrs) {
                function getScrollOffsets(w) {
                    if (w = w || window,
                        null != w.pageXOffset)
                        return {
                            x: w.pageXOffset,
                            y: w.pageYOffset
                        };
                    var d = w.document;
                    return "CSS1Compat" == document.compatMode ? {
                        x: d.documentElement.scrollLeft,
                        y: d.documentElement.scrollTop
                    } : {
                        x: d.body.scrollLeft,
                        y: d.body.scrollTop
                    }
                }
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
                    angular.element($window).bind("scroll", function () {
                        var offset = getScrollOffsets($window);
                        offset.y >= 50 ? shrink.play() : shrink.reverse(),
                            scope.$apply()
                    })
            },
            template = '<div class="border top"></div><div class="border right"></div><div class="border bottom"></div><div class="border left"></div>';
        return {
            restrict: "E",
            link: link,
            template: template,
            scope: !0
        }
    }]),
    app.directive("shopFilter", ["$rootScope", function ($rootScope) {
        var link = function (scope, element, attrs) {
            filterTimeline = new TimelineLite({
                    paused: !0
                }).reversed(!0),
                filterTimeline.set(".page, header", {
                    clearProps: "all"
                }).to("header", .3, {
                    right: "200px",
                    left: "auto",
                    ease: Expo.easeOut
                }, 0).to(".page", .3, {
                    right: "200px",
                    ease: Expo.easeOut
                }, 0).to("#filters", .3, {
                    right: "0px",
                    ease: Expo.easeOut
                }, "-=0.3").to(".back-to-top", .3, {
                    opacity: 0
                }, 0).to(".border.right", .3, {
                    opacity: 0
                }, 0).to(".border.top", .3, {
                    opacity: 0
                }, 0).to(".share", .3, {
                    right: "240px",
                    ease: Expo.easeOut
                }, 0).to(".filter-box", .3, {
                    right: "200px",
                    ease: Expo.easeOut
                }, 0),
                $(element).on("click", function () {
                    filterTimeline.reversed() ? filterTimeline.play() : filterTimeline.reverse()
                })
        };
        return {
            restrict: "EA",
            link: link,
            scope: !1
        }
    }]),
    app.directive("drawIcon", function () {
        var draw = function (scope, element, attrs) {
            function checkAnimated() {
                animated = !1
            }
            var theClass, animated = !1;
            $(element).each(function (index, element) {
                    var myClass = this.className.split(" ")[0];
                    theClass = myClass,
                        $(this).addClass("on")
                }),
                $(element).on({
                    mouseenter: function () {
                        $(".mainnav a").removeClass("on"),
                            $(this).addClass("on"),
                            0 == animated && (TweenMax.set("." + theClass, {
                                    visibility: "visible"
                                }),
                                TweenMax.fromTo("." + theClass + " .draw", 1.3, {
                                    drawSVG: "30%"
                                }, {
                                    drawSVG: "100%",
                                    opacity: 1
                                }),
                                TweenMax.to("." + theClass + " .txt", .5, {
                                    opacity: 1,
                                    delay: .3
                                }),
                                animated = !0)
                    },
                    mouseleave: function () {
                        $(".mainnav a").addClass("on"),
                            1 == animated && (TweenMax.set("." + theClass, {
                                    visibility: "visible"
                                }),
                                TweenMax.fromTo("." + theClass + " .draw", .375, {
                                    drawSVG: "100%"
                                }, {
                                    drawSVG: "0%",
                                    opacity: 0,
                                    delay: .1
                                }),
                                TweenMax.to("." + theClass + " .txt", .2, {
                                    opacity: 0,
                                    overwrite: "all",
                                    onComplete: checkAnimated
                                }))
                    }
                })
        };
        return {
            restrict: "A",
            link: draw,
            scope: !0
        }
    }),
    app.directive("shareMenu", function () {
        var link = function (scope, element, attrs) {
            var btns = ".share a",
                tl = new TimelineMax({
                    paused: !0
                });
            tl.staggerTo(btns, .2, {
                    y: 0,
                    rotationX: 0,
                    skewX: 0,
                    ease: Circ.easeOut
                }, .175),
                $(element).on({
                    mouseenter: function () {
                        tl.play()
                    },
                    mouseleave: function () {
                        tl.reverse()
                    }
                })
        };
        return {
            restrict: "A",
            link: link,
            scope: !0
        }
    }),
    app.directive("cardFlip", function () {
        var link = function (scope, element, attrs) {
            var card = ".card",
                inner = ".backside",
                borderTop = $(element).find(".card-border.card-top"),
                borderRight = $(element).find(".card-border.card-right"),
                borderBottom = $(element).find(".card-border.card-bottom"),
                borderLeft = $(element).find(".card-border.card-left"),
                bigText = $(element).find(".card h4");
            TweenMax.set(card, {
                    transform: "scale(0.3) translateZ(0)",
                    autoAlpha: 0
                }),
                TweenMax.set(inner, {
                    y: "-20",
                    autoAlpha: 0
                });
            var tb = new TimelineMax({
                paused: !0
            });
            tb.insert(TweenMax.to([borderTop, borderBottom], .8, {
                    width: "100%",
                    ease: Power3.easeOut
                })),
                tb.insert(TweenMax.to([borderRight, borderLeft], .8, {
                    height: "100%",
                    ease: Power3.easeOut
                }));
            var tl = new TimelineMax({
                paused: !0
            });
            tl.to(element.find(card), .4, {
                    transform: "scale(1) translateZ(0)",
                    autoAlpha: 1,
                    delay: .1,
                    ease: Power3.easeOut
                }),
                tl.to(element.find(inner), .4, {
                    y: 0,
                    autoAlpha: 1,
                    ease: Linear.easeNone
                }, "-=0.5"),
                tl.to(bigText, .6, {
                    opacity: 1,
                    letterSpacing: "1px",
                    ease: Linear.easeNone
                }, "-=0.5"),
                $(element).on({
                    mouseenter: function () {
                        tl.play().timeScale(1),
                            tb.play().timeScale(1)
                    },
                    mouseleave: function () {
                        tl.reverse().timeScale(2),
                            tb.reverse().timeScale(2)
                    }
                })
        };
        return {
            restrict: "A",
            link: link,
            scope: !0
        }
    }),
    app.directive("vidPoster", function () {
        var link = function (scope, element, attrs) {
            var iframe = document.getElementById("video"),
                cover = ".cover, .play-btn",
                stroke = ".strokey",
                circ = ".mid-circ",
                player = $f(iframe),
                pl = new TimelineMax({
                    paused: !0
                });
            pl.to(element.find(circ), .4, {
                    fill: "#C1BDB2"
                }, 0),
                pl.fromTo(element.find(stroke), 1, {
                    drawSVG: 0
                }, {
                    drawSVG: "102%",
                    ease: Power3.easeOut
                }, 0),
                $(element).on("click", function () {
                    TweenMax.to(cover, .5, {
                            autoAlpha: 0
                        }),
                        player.api("play")
                }),
                $(element).on({
                    mouseenter: function () {
                        pl.play().timeScale(1)
                    },
                    mouseleave: function () {
                        pl.reverse().timeScale(2)
                    }
                })
        };
        return {
            restrict: "A",
            link: link,
            scope: !0
        }
    }),
    app.directive("teamRoll", ["$rootScope", function ($rootScope) {
        var team = function (scope, element, attrs) {
            var name, position;
            if ($rootScope.isDesktop) {
                new TimelineMax({
                    paused: !0
                });
                $(element).on({
                    mouseenter: function () {
                        name = attrs.title,
                            position = attrs.position;
                        var infoBox = (this.className.split(" ")[0],
                            $(this).next(".info-box-mobile"));
                        TweenMax.to(infoBox, .4, {
                            bottom: 0,
                            ease: Quint.easeOut
                        })
                    },
                    mouseleave: function () {
                        var infoBox = $(this).next(".info-box-mobile");
                        TweenMax.to(infoBox, .4, {
                            bottom: "-100px",
                            ease: Quint.easeOut
                        })
                    }
                })
            }
        };
        return {
            restrict: "A",
            link: team,
            scope: !0
        }
    }]),
    app.directive("backtoTop", ["$window", function ($window) {
        var goToTop = function (scope, element, attrs) {
            angular.element($window).bind("scroll", function () {
                    this.pageYOffset > 500 ? TweenMax.to(element, .1, {
                        css: {
                            right: "0"
                        },
                        ease: Power1.easeOut
                    }) : TweenMax.to(element, .3, {
                        css: {
                            right: "-40px"
                        },
                        ease: Power1.easeOut
                    })
                }),
                $(element).on("click", function () {
                    TweenMax.to($window, .6, {
                        scrollTo: {
                            y: 0,
                            autoKill: !0
                        }
                    })
                })
        };
        return {
            scope: !0,
            link: goToTop
        }
    }]),
    app.directive("scrollFade", ["$window", function ($window) {
        var fadeIn = function (scope, element, attrs) {
            angular.element($window).bind("scroll", function () {
                this.pageYOffset > 400 && TweenMax.to(element, .1, {
                    opacity: 1,
                    ease: Power1.easeOut
                })
            })
        };
        return {
            scope: !0,
            link: fadeIn
        }
    }]),
    app.directive("scrollTop", ["$window", function ($window) {
        var link = function (scope, element) {
            $(element).on("click", function () {
                TweenMax.to($window, .1, {
                    scrollTo: {
                        y: 0,
                        autoKill: !0
                    }
                }).delay(0)
            })
        };
        return {
            link: link,
            scope: !0
        }
    }]),
    app.directive("scrollToAnchor", ["$rootScope", function ($rootScope) {
        var link = function (scope, element) {
            var elemPos, elem = $("#anchor");
            $(element).on("click", function () {
                elemPos = elem.offset().top - 80,
                    TweenMax.to("body", .85, {
                        scrollTo: {
                            y: elemPos,
                            autoKill: !0
                        },
                        ease: Power3.easeOut
                    })
            })
        };
        return {
            link: link,
            scope: !0
        }
    }]),
    app.directive("scrollBlur", ["$rootScope", function ($rootScope, $window) {
        var blur = function ($scope, $element) {
            $rootScope.isDesktop && angular.element($window).bind("touchmove mousewheel DOMMouseScroll", function () {
                this.pageYOffset >= 300 ? $element.addClass("blur") : $element.removeClass("blur")
            })
        };
        return {
            link: blur,
            scope: !0
        }
    }]),
    app.directive("zoomScroll", ["$window", function ($window) {
        var zoom = function ($scope, $element) {
            angular.element($window).bind("touchmove mousewheel DOMMouseScroll", function () {
                this.pageYOffset > 50 ? TweenMax.to($element, 2.5, {
                    scale: 1,
                    opacity: .7,
                    ease: Power3.easeOut
                }) : this.pageYOffset < 50 && TweenMax.to($element, 1, {
                    scale: 1.15,
                    opacity: 1,
                    ease: Power3.easeOut
                })
            })
        };
        return {
            link: zoom,
            scope: !0
        }
    }]),
    app.directive("parallaxScroll", ["$rootScope", "$window", function ($rootScope, $window) {
        var link = function ($scope, $element, $attributes) {
            function Scroller() {
                this.latestKnownScrollY = 0,
                    this.ticking = !1
            }
            if ($rootScope.isDesktop) {
                var speed = $attributes.parallaxScroll,
                    $content = $element,
                    wHeight = $(window).height();
                $(window).on("resize", function () {
                        wHeight = $(window).height()
                    }),
                    window.requestAnimFrame = function () {
                        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
                            window.setTimeout(callback, 1e3 / 60)
                        }
                    }(),
                    Scroller.prototype = {
                        init: function () {
                            window.addEventListener("scroll", this.onScroll.bind(this), !1)
                        },
                        onScroll: function () {
                            this.latestKnownScrollY = window.scrollY,
                                this.requestTick()
                        },
                        requestTick: function () {
                            this.ticking || window.requestAnimFrame(this.update.bind(this)),
                                this.ticking = !0
                        },
                        update: function () {
                            var currentScrollY = this.latestKnownScrollY;
                            this.ticking = !1;
                            var slowScroll = Math.round(currentScrollY / speed * .08);
                            80 > slowScroll && $content.css({
                                transform: "translate3d(0," + slowScroll + "px, 0)",
                                "-moz-transform": "translate3d(0," + slowScroll + "px, 0)",
                                "-webkit-transform": "translate3d(0," + slowScroll + "px, 0)"
                            })
                        }
                    };
                var scroller = new Scroller;
                scroller.init()
            }
        };
        return {
            restrict: "A",
            link: link,
            scope: !0
        }
    }]),
    app.directive("twitter", [function () {
        return {
            link: function (scope, element, attr) {
                setTimeout(function () {
                    twttr.widgets.createShareButton(attr.url, element[0], function (el) {}, {
                        count: "none",
                        text: attr.text
                    })
                })
            }
        }
    }]),
    app.directive("photoSlider", [function () {
        var template = '<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"><div class="pswp__bg"></div><div class="pswp__scroll-wrap"><div class="pswp__container"><div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"><div class="pswp__top-bar"><div class="pswp__counter"></div><button class="pswp__button pswp__button--close" title="Close (Esc)"></button><button class="pswp__button pswp__button--share" title="Share"></button><button class="pswp__button pswp__button--fs" title="Toggle fullscreen"></button><button class="pswp__button pswp__button--zoom" title="Zoom in/out"></button><div class="pswp__preloader"><div class="pswp__preloader__icn"><div class="pswp__preloader__cut"><div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"><div class="pswp__share-tooltip"></div></div><button class="pswp__button pswp__button--arrow--left" title="Previous (arrow left)"></button><button class="pswp__button pswp__button--arrow--right" title="Next (arrow right)"></button><div class="pswp__caption"><div class="pswp__caption__center"></div></div></div></div></div>';
        return {
            restrict: "EA",
            replace: !0,
            template: template
        }
    }]),
    app.directive("mapbox", [function () {
        return {
            restrict: "AE",
            scope: !0,
            link: function (scope, element, attributes) {
                function showMap(err, data) {
                    data.lbounds ? map.fitBounds(data.lbounds) : data.latlng && map.setView([data.latlng[0], data.latlng[1]], 13)
                }
                scope.$eval(attributes.location);
                scope.$watch(attributes.location, function (value) {
                        console.log(value)
                    }),
                    L.mapbox.accessToken = "pk.eyJ1IjoibmZyYW5jaGkwNiIsImEiOiJNU1EtVGVJIn0.KjiAzZQK65ENmMUiMIOGfA";
                var geocoder = L.mapbox.geocoder("mapbox.places"),
                    map = L.mapbox.map("map", "nfranchi06.e704a5e3");
                geocoder.query("Salt Lake City, UT", showMap)
            }
        }
    }]),
    app.directive("repeatComplete", ["$timeout", "$rootScope", function ($timeout, $rootScope) {
        return {
            restrict: "A",
            link: function (scope, element, attrs) {
                scope.$last && scope.$eval(attrs.repeatComplete)
            }
        }
    }]),
    app.directive("imgPreloader", ["$timeout", "$stateParams", "$rootScope", function ($timeout, $stateParams, $rootScope) {
        function link($scope, $element, $attrs) {
            function hideLoader() {
                function allDone() {
                    $rootScope.$broadcast("onBorderOut", ""),
                        $rootScope.clipped = !1,
                        $("html,body,.page").removeClass("clipped"),
                        TweenMax.to(cropmarks, .1, {
                            display: "none"
                        }),
                        $(".breadcrumbs a span").html().length > 0 && TweenMax.to(".breadcrumbs", .6, {
                            top: "0",
                            ease: Expo.easeOut
                        }, 0)
                }
                var load = new TimelineMax({
                    delay: .3
                });
                load.to(pctIndicator, .2, {
                        opacity: 0,
                        ease: Expo.easeOut
                    }),
                    load.to(pctIndicator, .1, {
                        display: "none"
                    }),
                    load.to(borderTop, .75, {
                        top: "-40px",
                        height: "40px",
                        ease: Expo.easeOut
                    }, "-=0.2"),
                    load.to(borderRight, .75, {
                        right: "-40px",
                        width: "40px",
                        ease: Expo.easeOut
                    }, 0),
                    load.to(borderBottom, .75, {
                        bottom: "-40px",
                        height: "40px",
                        ease: Expo.easeOut
                    }, 0),
                    load.to(borderLeft, .75, {
                        left: "-40px",
                        width: "40px",
                        ease: Expo.easeOut
                    }, 0),
                    load.to(cropmarks, .6, {
                        height: "110%",
                        width: "110%",
                        ease: Expo.easeOut
                    }, 0),
                    load.to(loadingScreen, .75, {
                        opacity: 0,
                        ease: Linear.easeNone,
                        onComplete: allDone
                    }, .3),
                    load.to(loadingBar, .1, {
                        opacity: 0,
                        left: "50%",
                        width: "0px"
                    }),
                    $("body, html").css("overflow", "auto"),
                    setTimeout(function () {
                        TweenMax.set(loadingScreen, {
                                display: "none"
                            }),
                            $rootScope.pctLoaded = 0,
                            $("#pctIndicator h1").text($rootScope.pctLoaded),
                            $rootScope.menuEnabled = !0
                    }, 800)
            }

            function runLoader() {
                $("body,html").css("overflow", "hidden"),
                    $rootScope.$broadcast("onBorderIn", ""),
                    $("html,body,.page").addClass("clipped"),
                    $rootScope.menuEnabled = !1,
                    TweenMax.set(loadingScreen, {
                        display: "block"
                    }),
                    TweenMax.set(pctIndicator, {
                        display: "block"
                    });
                var load = new TimelineMax;
                orderBox && TweenMax.set(".order-box", {
                        display: "none"
                    }),
                    load.to(breadcrumbs, .5, {
                        top: "-60px",
                        ease: Expo.easeOut
                    }, 0),
                    load.to(loadingScreen, .3, {
                        opacity: 1,
                        ease: Linear.easeNone
                    }, 0),
                    load.to(borderTop, .75, {
                        top: 0,
                        height: "49.5%",
                        ease: Expo.easeOut
                    }, .4),
                    load.to(borderBottom, .75, {
                        bottom: 0,
                        height: "49.5%",
                        ease: Expo.easeOut
                    }, .4),
                    load.to(pctIndicator, .6, {
                        opacity: 1,
                        ease: Linear.easeNone
                    }, .4),
                    $rootScope.isDesktop && (load.to(borderLeft, .8, {
                            left: 0,
                            width: "33%",
                            ease: Expo.easeOut
                        }, .4),
                        load.to(borderRight, .8, {
                            right: 0,
                            width: "33%",
                            ease: Expo.easeOut
                        }, .4)),
                    load.to(cropmarks, .6, {
                        height: "106px",
                        width: "40%",
                        display: "block",
                        ease: Quint.easeOut
                    }, .4),
                    load.to(window, .1, {
                        scrollTo: {
                            y: 0
                        }
                    }, 1)
            }
            var loadingScreen = document.getElementById("loading-screen"),
                breadcrumbs = document.querySelector(".breadcrumbs"),
                borderTop = document.querySelector(".border.top"),
                borderBottom = document.querySelector(".border.bottom"),
                borderLeft = document.querySelector(".border.left"),
                borderRight = document.querySelector(".border.right"),
                cropmarks = document.querySelector(".cropmarks"),
                loadingBar = document.getElementById("loading-bar"),
                orderBox = document.querySelector(".order-box"),
                pctIndicator = document.getElementById("pctIndicator");
            $scope.$on("$stateChangeStart", function (event, toState, toParams) {
                    runLoader()
                }),
                $scope.$on("contentLoaded", function () {
                    TweenMax.set(pctIndicator, {
                            display: "block"
                        }),
                        TweenMax.to(pctIndicator, .4, {
                            opacity: 1,
                            ease: Linear.easeNone,
                            delay: 0
                        }),
                        $timeout(function () {
                            $scope.assetElements = document.querySelectorAll("[data-preloader=image]"),
                                $scope.assetCount = $scope.assetElements.length,
                                $scope.numLoaded = 0,
                                $scope.pctPerAsset = 100 / $scope.assetCount,
                                $scope.loadPageAssets()
                        }, 0)
                }),
                $scope.loadPageAssets = function () {
                    $scope.assetCount > 0 ? angular.forEach($scope.assetElements, function (asset, key) {
                        if (asset.onerror = function () {
                                $scope.assetIncrement()
                            },
                            "image" == asset.dataset.preloader) {
                            var img = new Image;
                            img.src = asset.dataset.src,
                                asset.src = img.src,
                                img.onload = function () {
                                    $scope.attachImg(asset)
                                }
                        }
                    }) : hideLoader()
                },
                $scope.attachImg = function (asset) {
                    "bg" == asset.dataset.attachMethod ? asset.style.backgroundImage = "url(" + asset.src + ")" : "src" == asset.dataset.attachMethod && (asset.src = asset.src),
                        asset.dataset.preloader = "loaded",
                        $scope.assetIncrement()
                },
                $scope.assetIncrement = function () {
                    function checkEnd() {
                        $("#pctIndicator h1").text($rootScope.pctLoaded),
                            $scope.numLoaded == $scope.assetCount && handleLoadComplete()
                    }

                    function handleLoadComplete() {
                        TweenMax.to("#loading-bar", 1, {
                            left: "250%",
                            delay: .3,
                            ease: Cubic.easeOut,
                            onComplete: hideLoader
                        })
                    }
                    $scope.numLoaded++,
                        loadProgress = $scope.numLoaded / $scope.assetCount,
                        $rootScope.pctLoaded = parseInt(100 * loadProgress),
                        $("#pctIndicator h1").text($rootScope.pctLoaded);
                    var progress = 800 * loadProgress;
                    TweenMax.to("#loading-bar", .375, {
                        width: progress + "px",
                        opacity: 1,
                        delay: .2,
                        ease: Cubic.easeOut,
                        onComplete: checkEnd
                    })
                }
        }
        return {
            scope: !0,
            restrict: "A",
            link: link
        }
    }]),
    app.directive("pngTicker", ["$timeout", function ($timeout) {
        function link(scope, element, attrs) {
            $timeout(function () {
                var frames = $(element).children(".png-frame"),
                    fps = 17,
                    duration = 1 / fps,
                    sequence = new TimelineMax({
                        paused: !0
                    });
                sequence.staggerTo(frames, 0, {
                        position: "static",
                        visibility: "visible"
                    }, duration, 0),
                    sequence.staggerTo(frames.not(frames.last()), 0, {
                        position: "absolute",
                        visibility: "hidden",
                        immediateRender: !1
                    }, duration, duration),
                    sequence.set({}, {}, "+=" + duration),
                    scope.$on("playFrames", function () {
                        sequence.play()
                    }),
                    scope.$on("resetFrames", function () {
                        sequence.restart(0).pause()
                    }),
                    scope.$on("replayFrames", function () {
                        sequence.restart(0)
                    })
            }, 1e3)
        }
        return {
            scope: !0,
            restrict: "A",
            link: link
        }
    }]);