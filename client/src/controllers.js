"use strict";
app.controller("404Ctrl", ["$rootScope", "$scope", function ($rootScope, $scope) {
        $rootScope.bodyClass = "404",
            console.log("oops, try another page."),
            console.log("content loaded?");
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
            setTimeout(function () {
                $rootScope.$broadcast("contentLoaded")
            }, 1e3),
            setTimeout(function () {
                console.log("play animation"),
                    $rootScope.isDesktop && shrink.play()
            }, 4e3)
    }]),
    app.controller("AboutCtrl", ["$rootScope", "$scope", "$timeout", "$compile", "$window", "$location", "apiService", function ($rootScope, $scope, $timeout, $compile, $window, $location, apiService) {
        function destroy() {
            $scope.showGallery = !1
        }

        function GalleryPhoto(id, caption, largesize, mediumsize, smallsize, large, small, src) {
            this.id = id,
                this.caption = caption,
                this.largesize = largesize,
                this.mediumsize = mediumsize,
                this.smallsize = smallsize,
                this.large = large,
                this.small = small,
                this.src = src
        }

        function initialLoad(callback) {
            apiService.about().then(function (response) {
                    var about = response.data.results[0];
                    $scope.aboutpage = about,
                        $rootScope.fb = {
                            title: about.social_title,
                            picture: about.social_pic,
                            link: $rootScope.url
                        },
                        $rootScope.fbReady = !0,
                        callback($scope.aboutpage.photos),
                        $rootScope.$broadcast("contentLoaded")
                }),
                apiService.contact().then(function (response) {
                    var contact = response.data.results[0];
                    $scope.contact = contact
                })
        }

        function loadPage(photos) {
            createGallery(photos),
                loadInstaFeed(),
                playAnimations()
        }

        function createGallery(photos) {
            photos.forEach(function (photo) {
                    if (photo.image) {
                        var id = photo.id,
                            caption = photo.caption,
                            largesize = photo.image_size,
                            mediumsize = photo.medium_image.size,
                            smallsize = photo.small_image.size,
                            large = photo.image,
                            small = photo.small_image.url,
                            src = photo.medium_image.url,
                            galleryImage = new GalleryPhoto(id, caption, largesize, mediumsize, smallsize, large, small, src);
                        $scope.photos.push(galleryImage),
                            $scope.showGallery = !0
                    }
                }),
                $timeout(function () {
                    $(".gallery").photoswipe({
                            breakpoints: {
                                medium: 480,
                                large: 769
                            },
                            bgOpacity: .9,
                            loop: !0,
                            history: !1,
                            fullscreenEl: !1
                        }),
                        $scope.photos.length > 4 && $("<button id='projectBtn' class='gallery-btn'>Load More</button>").insertAfter("#hq .gallery .column:first-child > div:last-child")
                }, 3e3)
        }

        function loadInstaFeed() {
            var imgs = [],
                feed = new Instafeed({
                    get: "user",
                    userId: 192029391,
                    accessToken: "192029391.1677ed0.d1fd26ee64aa4dacb58557159c003c08",
                    limit: 4,
                    template: '<li><a href="{{link}}" target="_blank"><img src="{{image}}" /></a></li>',
                    mock: !0,
                    sortBy: "most-recent",
                    resolution: "standard_resolution",
                    success: function (data) {
                        for (var result, images = data.data, i = 0, numImages = images.length; numImages > i; i++) {
                            var image = images[i];
                            result = this._makeTemplate(this.options.template, {
                                    model: image,
                                    id: image.id,
                                    link: image.link,
                                    image: image.images[this.options.resolution].url
                                }),
                                imgs.push(result)
                        }
                        $("#insta1").html(imgs.slice(0, 4))
                    }
                });
            feed.run()
        }

        function playAnimations() {
            var title = $(".intro h1");
            TweenMax.to(title, .65, {
                    opacity: 1,
                    transform: "translateY(0px)",
                    delay: 3.5
                }),
                TweenMax.to(".border", .85, {
                    backgroundColor: "#dfdbd1",
                    ease: Linear.easeNone
                }, 0),
                TweenMax.to(".lcrop, .rcrop", .2, {
                    stroke: "#222"
                });
            var mantraText = $(".info .mantra-text");
            $scope.text = function (index, inview, inviewpart, event) {
                    "top" == inviewpart && 0 == firstRun && (console.log("text trigger"),
                        TweenMax.to(mantraText, .5, {
                            opacity: 1,
                            transform: "translateY(0px)",
                            force3D: !0,
                            ease: Cubic.easeOut
                        }))
                },
                $scope.furniture = function (index, inview, inviewpart, event) {
                    var lines = ".h1 path, .h1 circle";
                    TweenMax.set(".furniture .svg", {
                            visibility: "visible"
                        }),
                        "top" == inviewpart && 0 == firstRun && (TweenMax.to(".furniture", 1, {
                                paddingTop: 0,
                                ease: Quint.easeOut
                            }),
                            TweenMax.fromTo(lines, 1, {
                                drawSVG: "50% 50%"
                            }, {
                                drawSVG: "102%"
                            }))
                },
                $scope.staging = function (index, inview, inviewpart, event) {
                    var lines = ".h2 path";
                    "top" == inviewpart && 0 == firstRun && (TweenMax.set(".staging .svg", {
                            visibility: "visible"
                        }),
                        TweenMax.to(".staging", 1, {
                            paddingTop: 0,
                            ease: Quint.easeOut
                        }),
                        TweenMax.fromTo(lines, 1, {
                            drawSVG: "50% 50%"
                        }, {
                            drawSVG: "102%"
                        }))
                },
                $scope.installs = function (index, inview, inviewpart, event) {
                    var lines = ".h3 path";
                    TweenMax.set(".installs .svg", {
                            visibility: "visible"
                        }),
                        "top" == inviewpart && 0 == firstRun && (TweenMax.to(".installs", 1, {
                                paddingTop: 0,
                                ease: Quint.easeOut
                            }),
                            TweenMax.fromTo(lines, 1, {
                                drawSVG: "50% 50%"
                            }, {
                                drawSVG: "102%"
                            }))
                }
        }
        $rootScope.bodyClass = "aboutus",
            $rootScope.pageClass = "page-about",
            $rootScope.bread = "about",
            $rootScope.crumb = "",
            $scope.limit = 6;
        var firstRun = 0;
        $rootScope.url = $location.absUrl().split("?")[0],
            $rootScope.isMobile && $(".logo a").text("PS"),
            $scope.photos = [],
            $scope.$on("$destroy", destroy),
            $scope.sendMail = function () {
                $window.open("mailto:" + $scope.contact.email + "?subject=Hello Project Sunday")
            },
            initialLoad(loadPage),
            $("body").on("click", "#projectBtn", function () {
                $("#hq .gallery .column div:nth-child(n+3)").toggleClass("active"),
                    $("#projectBtn").html("Load More" == $("#projectBtn").html() ? "Close Gallery" : "Load More")
            })
    }]),
    app.controller("BuildCtrl", ["$rootScope", "$scope", function ($rootScope, $scope) {
        $rootScope.bodyClass = "build",
            $scope.pageClass = "page-build",
            $rootScope.bread = "build",
            $rootScope.crumb = "",
            $rootScope.isMobile && $(".logo a").text("project sunday"),
            TweenMax.to(".wrap", 1, {
                autoAlpha: 1,
                y: 0,
                delay: 3.5,
                ease: Quint.easeOut
            }),
            TweenMax.to(".border", .85, {
                backgroundColor: "#dad6cc",
                ease: Linear.easeNone
            }, 0),
            TweenMax.to(".lcrop, .rcrop", .2, {
                stroke: "#222"
            })
    }]),
    app.controller("ContactCtrl", ["$rootScope", "$scope", "$location", "apiService", function ($rootScope, $scope, $location, apiService) {
        function loadPage(callback) {
            apiService.contact().then(function (response) {
                    var page = response.data.results[0];
                    $scope.contact = page,
                        $rootScope.fb = {
                            title: page.social_title,
                            picture: page.social_pic,
                            link: $rootScope.url
                        },
                        $rootScope.fbReady = !0,
                        $rootScope.$broadcast("contentLoaded")
                }),
                callback()
        }

        function loadEverythingElse() {
            var mapText = document.getElementById("contact-map-text");
            TweenMax.to(".border", .85, {
                    backgroundColor: "#dfdbd1",
                    ease: Linear.easeNone
                }, 0),
                TweenMax.to(".lcrop, .rcrop", .2, {
                    stroke: "#222"
                }),
                setTimeout(function () {
                    TweenMax.to(mapText, .85, {
                        opacity: 1,
                        transform: "translateY(0px)",
                        ease: Quint.easeOut
                    })
                }, 3e3),
                $scope.runLogo = function (index, inview, inviewpart, event) {
                    var computer = ".computer path";
                    TweenMax.set(".computer", {
                            visibility: "visible"
                        }),
                        "top" == inviewpart && TweenMax.fromTo(computer, 3, {
                            drawSVG: "0"
                        }, {
                            drawSVG: "100%",
                            delay: .5,
                            ease: Power2.easeOut
                        })
                }
        }
        $rootScope.bodyClass = "contact",
            $scope.pageClass = "page-contact",
            $rootScope.bread = "contact",
            $rootScope.crumb = "",
            $rootScope.isMobile && $(".logo a").text("project sunday"),
            $rootScope.url = $location.absUrl().split("?")[0],
            loadPage(loadEverythingElse)
    }]),
    app.controller("footerCtrl", ["$scope", "apiService", function ($scope, apiService) {
        apiService.contact().then(function (response) {
            var page = response.data.results[0],
                contact = page;
            $scope.contact_name = contact.company_name,
                $scope.contact_address = contact.company_address,
                $scope.contact_city = contact.city,
                $scope.contact_state = contact.state,
                $scope.contact_hours = contact.hours
        })
    }]),
    app.controller("HomeCtrl", ["$rootScope", "$scope", "apiService", "$window", "$sce", "$location", function ($rootScope, $scope, apiService, $window, $sce, $location) {
        function setUp() {
            TweenMax.set(chars, {
                    opacity: 0,
                    y: 25
                }),
                getSlides()
        }

        function getSlides() {
            for (var imgs = [], imgLength1 = 10, imgLength2 = 100, imgLength3 = 250, startIndex = 4, i = startIndex; imgLength3 > i; i++) {
                var img = "";
                imgLength1 > i ? (img = "img/home/bed_pngs/YourMomsBed_0000" + [i] + ".png",
                    imgs.push(img)) : imgLength2 > i ? (img = "img/home/bed_pngs/YourMomsBed_000" + [i] + ".png",
                    imgs.push(img)) : (img = "img/home/bed_pngs/YourMomsBed_00" + [i] + ".png",
                    imgs.push(img))
            }
            $scope.frames = imgs
        }

        function bedBuilder() {
            setTimeout(function () {
                    $rootScope.$broadcast("playFrames")
                }, 1250),
                tl.play(),
                $("#close-bed-builder").on("click", function () {
                    tl.reverse()
                }),
                $(".replay-frames").on("mouseenter", function () {
                    replay.play()
                }),
                $(".replay-frames").on("mouseleave", function () {
                    replay.reverse()
                })
        }

        function mobileBedBuilder() {
            mobile.play(),
                $("#close-bed-builder").on("click", function () {
                    mobile.reverse()
                })
        }

        function resetFrames() {
            $rootScope.$broadcast("resetFrames")
        }

        function initialLoad(callback) {
            apiService.home().then(function (response) {
                    var homepage = response.data.results[0];
                    $scope.homepage = homepage,
                        $scope.tools = homepage.tools,
                        $scope.featured_video = homepage.featured_video_id,
                        $scope.video_url = "https://player.vimeo.com/video/" + $scope.featured_video + "?api=1",
                        $rootScope.$broadcast("contentLoaded"),
                        $rootScope.fb = {
                            title: homepage.social_title,
                            picture: homepage.social_pic,
                            link: $rootScope.url
                        },
                        $rootScope.fbReady = !0
                }),
                callback()
        }

        function setupAnimations() {
            TweenMax.to(".border", .85, {
                    backgroundColor: "#dfdbd1",
                    ease: Linear.easeNone
                }, 0),
                TweenMax.to(".lcrop, .rcrop", .2, {
                    stroke: "#222"
                }),
                loadInsta(),
                $scope.svgLoad = function () {
                    TweenMax.set(".lockup", {
                            visibility: "visible"
                        }),
                        TweenMax.fromTo(".scroll .arrow", 1.3, {
                            y: "0",
                            opacity: .2
                        }, {
                            y: "20",
                            opacity: .6,
                            yoyo: !0,
                            repeat: -1,
                            ease: Power1.easeInOut
                        });
                    var lockUp, strokes = ".strokes path",
                        outlines = ".outlines path",
                        lockUp = new TimelineMax({
                            paused: !0
                        });
                    lockUp.to(".lockup", .5, {
                            display: "block",
                            autoAlpha: 1,
                            ease: Linear.easeNone
                        }).fromTo(outlines, 1.36, {
                            drawSVG: 0
                        }, {
                            drawSVG: "102%"
                        }).fromTo(strokes, 1.5, {
                            drawSVG: 0
                        }, {
                            drawSVG: "102%"
                        }, "-=0.8").to(outlines, 1, {
                            autoAlpha: .4,
                            ease: Linear.easeNone
                        }, "-=1").to(".mask-fill", 1.36, {
                            attr: {
                                x: 0,
                                width: "900px"
                            },
                            ease: Quint.easeOut
                        }, "-=0.5").fromTo(".slc", .5, {
                            opacity: 0,
                            y: 50
                        }, {
                            opacity: 1,
                            y: 0,
                            ease: Quint.easeOut
                        }, "-=1.2").fromTo(".top-words", .7, {
                            opacity: 0,
                            y: 50
                        }, {
                            opacity: 1,
                            y: 0,
                            ease: Quint.easeOut
                        }, "-=1").fromTo(".left-nail", 1, {
                            opacity: 0,
                            y: -40,
                            x: 40
                        }, {
                            opacity: 1,
                            y: 0,
                            x: 0,
                            ease: Expo.easeOut
                        }, "-=1").fromTo(".right-nail", 1, {
                            opacity: 0,
                            y: -40,
                            x: -40
                        }, {
                            opacity: 1,
                            y: 0,
                            x: 0,
                            ease: Expo.easeOut
                        }, "-=1").set(".strokes", {
                            visibility: "hidden"
                        }),
                        $scope.$on("onBorderOut", function (e) {
                            lockUp.play()
                        })
                },
                $scope.mantraIn = function (index, inview, inviewpart, event) {
                    var topLine = ".top-line",
                        bottomLine = ".bottom-line",
                        built = ".built-lockup",
                        text = ".text",
                        words = ".mantra h4",
                        runMantra = new TimelineMax({
                            paused: !0
                        });
                    runMantra.to(".scroll", .3, {
                            autoAlpha: 0,
                            ease: Linear.easeNone
                        }).to(built, .4, {
                            top: 0,
                            ease: Quint.easeOut
                        }, .4).to(text, 1, {
                            opacity: 1,
                            top: 150,
                            ease: Quint.easeOut
                        }, 1).to(words, 1.5, {
                            letterSpacing: "2px",
                            ease: Quint.easeOut
                        }, 1).to(bottomLine, 1.5, {
                            width: "640px",
                            ease: Quint.easeOut
                        }, 1).to(topLine, 1.5, {
                            width: "640px",
                            ease: Quint.easeOut
                        }, 1),
                        "top" == inviewpart && 0 == fired && (console.log("runMantra"),
                            runMantra.play(),
                            fired = 1)
                },
                $scope.highlights = function (index, inview, inviewpart, event) {
                    var h1 = ".h1 path, .h1 circle",
                        h2 = ".h2 path",
                        h3 = ".h3 path";
                    TweenMax.set(".highlights .svg", {
                            visibility: "visible"
                        }),
                        "top" == inviewpart && 0 == firstRun && (console.log("highlights"),
                            TweenMax.fromTo(h1, 1.3, {
                                drawSVG: "50% 50%"
                            }, {
                                drawSVG: "100%"
                            }),
                            TweenMax.fromTo(h2, 1.3, {
                                drawSVG: "50% 50%"
                            }, {
                                drawSVG: "100%"
                            }),
                            TweenMax.fromTo(h3, 1.3, {
                                drawSVG: "50% 50%"
                            }, {
                                drawSVG: "100%"
                            }),
                            firstRun = 1)
                },
                $scope.buildIt = function (index, inview, inviewpart, event) {
                    "top" == inviewpart && TweenMax.to(".wrap", 1.36, {
                        opacity: 1,
                        y: 0,
                        delay: .5,
                        ease: Quint.easeOut
                    })
                }
        }

        function loadInsta() {
            var imgs = [],
                feed = new Instafeed({
                    get: "user",
                    userId: 192029391,
                    accessToken: "192029391.1677ed0.d1fd26ee64aa4dacb58557159c003c08",
                    limit: 20,
                    template: '<li><a href="{{link}}" target="_blank"><img src="{{image}}" /></a></li>',
                    mock: !0,
                    resolution: "standard_resolution",
                    success: function (data) {
                        for (var result, images = data.data, i = 0, numImages = images.length; numImages > i; i++) {
                            var image = images[i];
                            result = this._makeTemplate(this.options.template, {
                                    model: image,
                                    id: image.id,
                                    link: image.link,
                                    image: image.images[this.options.resolution].url
                                }),
                                imgs.push(result)
                        }
                        var bw_img = '<li><img class="non-insta" src="img/home/bw-square.jpg"></li>',
                            content1 = imgs.slice(0, 1) + bw_img,
                            marquee = '<li><img class="non-insta" src="img/home/marquee.jpg"></li>',
                            content2 = marquee + imgs.slice(4, 5);
                        $("#instafeed1").html(content1),
                            $("#instafeed2").html(imgs.slice(2, 4)),
                            $("#instafeed3").html(content2)
                    },
                    filter: function (image) {
                        return image.tags.indexOf("projectsunday") >= 0 ? !0 : !1
                    }
                });
            feed.run()
        }
        $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src)
            },
            $rootScope.bodyClass = "home",
            $scope.pageClass = "page-home",
            $rootScope.bread = "",
            $rootScope.crumb = "",
            $rootScope.isMobile && $(".logo a").text("project sunday"),
            $rootScope.url = $location.absUrl().split("?")[0],
            $scope.maskURL = $rootScope.urlBase + "#mask1",
            $scope.followUs = function () {
                $window.open("//instagram.com/project_sunday/")
            },
            $scope.playVideo = function () {
                $scope.showVideo = !0
            };
        var fired = 0,
            firstRun = 0,
            h1 = $(".bed-builder-preview .text h1"),
            h3 = $(".bed-builder-preview .text h3"),
            border = $(".bed-builder-preview .bed-border"),
            h6 = $(".bed-builder-preview .text h6"),
            p = $(".bed-builder-preview .text p"),
            splitText = new SplitText(h1, {
                type: "chars"
            }),
            chars = splitText.chars;
        setUp();
        var tl = new TimelineMax({
                paused: !0
            }),
            mobile = new TimelineMax({
                paused: !0
            }),
            left = $(".bed-builder-preview .half.left"),
            right = $(".bed-builder-preview .half.right");
        tl.to(".bed-builder-preview", .1, {
                display: "block"
            }),
            tl.to(left, .6, {
                width: "64%",
                force3D: !0,
                ease: Cubic.easeInOut,
                onReverseComplete: resetFrames
            }),
            tl.to(right, .6, {
                x: 0,
                force3D: !0,
                ease: Cubic.easeInOut
            }, "-=0.6"),
            tl.to(h6, .5, {
                opacity: 1,
                force3D: !0,
                ease: Linear.easeNone
            }, "-=0.5"),
            tl.staggerTo(chars, .4, {
                opacity: 1,
                y: 0,
                force3D: !0,
                ease: Quint.easeOut
            }, .03, "-=0.1"),
            tl.to(h3, .3, {
                opacity: 1,
                force3D: !0,
                ease: Cubic.easeInOut
            }, "-=0.75"),
            tl.to(border, .3, {
                opacity: 1,
                force3D: !0,
                ease: Cubic.easeInOut
            }, "-=0.45"),
            tl.to(".macbook", .7, {
                autoAlpha: 1,
                transform: "translateX(0)",
                ease: Power2.easeInOut
            }, "-=0.7"),
            tl.to(p, .35, {
                opacity: 1,
                transform: "translateY(0px)",
                force3D: !0,
                ease: Cubic.easeInOut
            }, "-=0.55"),
            mobile.to(".bed-builder-preview", .1, {
                display: "block"
            }).to(right, .6, {
                x: 0,
                force3D: !0,
                ease: Cubic.easeInOut
            }).to(h6, .4, {
                opacity: 1,
                force3D: !0,
                ease: Linear.easeNone
            }, "-=0.2").staggerTo(chars, .4, {
                opacity: 1,
                y: 0,
                force3D: !0,
                ease: Quint.easeOut
            }, .03, "-=0.1").to(h3, .3, {
                opacity: 1,
                force3D: !0,
                ease: Cubic.easeInOut
            }, "-=0.6").to(border, .3, {
                opacity: 1,
                force3D: !0,
                ease: Linear.easeNone
            }, "-=0.3").to(p, .3, {
                opacity: 1,
                transform: "translateY(0px)",
                force3D: !0,
                ease: Cubic.easeInOut
            }, "-=0.4").to("#close-bed-builder", .3, {
                opacity: 1,
                ease: Cubic.easeOut
            }, "-=0.4"),
            tl.to("#close-bed-builder", .3, {
                opacity: 1,
                ease: Cubic.easeOut
            }, "-=0.4");
        var replay = new TimelineMax({
            paused: !0
        });
        setTimeout(function () {
            var tracer = $(".replay-frames #tracer"),
                tracerCap = $(".replay-frames #tracer-cap"),
                bg = $(".replay-frames circle.cls-1");
            TweenMax.set(tracer, {
                    drawSVG: "100%"
                }),
                TweenMax.set(tracerCap, {
                    drawSVG: "100%"
                }),
                replay.to(bg, .3, {
                    fill: "#8f7c4f",
                    ease: Cubic.easeOut
                }).fromTo(tracer, .25, {
                    drawSVG: "100%"
                }, {
                    drawSVG: 0
                }, "-=0.2").fromTo(tracerCap, .1, {
                    drawSVG: "100%"
                }, {
                    drawSVG: 0
                }),
                $(".replay-frames").on("click", function () {
                    $rootScope.$broadcast("replayFrames")
                })
        }, 1e3);
        var tl2 = new TimelineMax({
            paused: !0
        });
        tl2.to(".modal-overlay", 1.2, {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                zIndex: "99999",
                left: "0",
                ease: Power2.easeOut
            }),
            $scope.updatesForm = function () {
                tl2.play(),
                    $("body, html").css("overflow", "hidden")
            },
            $scope.closeForm = function () {
                tl2.reverse(),
                    $("body, html").css("overflow", "auto")
            },
            $("#launch-bed-builder").on("click", function () {
                $rootScope.isMobile ? mobileBedBuilder() : bedBuilder()
            }),
            initialLoad(setupAnimations),
            $(".slider").on("click", ".slick-slide", function (e) {
                e.stopPropagation();
                var index = $(this).data("slick-index");
                $(".slick-slider").slick("slickCurrentSlide") !== index && $(".slick-slider").slick("slickGoTo", index)
            }),
            $scope.breakpoints = [{
                breakpoint: 769,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }, {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }]
    }]),
    app.controller("navController", ["$scope", "$rootScope", "apiService", function ($scope, $rootScope, apiService) {
        apiService.home().then(function (response) {
                var data = response.data.results[0];
                $rootScope.facebook_link = data.facebook_link,
                    $rootScope.pinterest_link = data.pinterest_link,
                    $rootScope.twitter_link = data.twitter_link,
                    $rootScope.instagram_link = data.instagram_link,
                    $rootScope.houzz_link = data.houzz_link
            }),
            apiService.navigation().then(function (response) {
                var page = response.data.results[0];
                $scope.portfolio_link = page.portfolio_link,
                    $scope.portfolio_sub = page.portfolio_subhead,
                    $scope.shop_link = page.shop_link,
                    $scope.shop_sub = page.shop_subhead,
                    $scope.staging_link = page.staging_link,
                    $scope.staging_sub = page.staging_subhead,
                    $scope.about_link = page.about_link,
                    $scope.about_sub = page.about_subhead,
                    $scope.contact_link = page.contact_link,
                    $scope.contact_sub = page.contact_subhead
            })
    }]),
    app.controller("PortfolioCtrl", ["$rootScope", "$scope", "$timeout", "$compile", "$filter", "$location", "apiService", function ($rootScope, $scope, $timeout, $compile, $filter, $location, apiService) {
        function destroy() {
            $scope.gridItems = [],
                $scope.showGrid = !1
        }

        function Project(order, id, title, description, slug, image) {
            this.order = order,
                this.id = id,
                this.title = title,
                this.description = description,
                this.slug = slug,
                this.src = image
        }

        function loadPage(callback) {
            apiService.portfolio().then(function (response) {
                    var portfolio = response.data.results[0];
                    $scope.portfolio = portfolio,
                        $rootScope.fb = {
                            title: portfolio.social_title,
                            picture: portfolio.social_pic,
                            link: $rootScope.url
                        },
                        $rootScope.fbReady = !0
                }),
                getProjects(callback)
        }

        function getProjects(callback) {
            apiService.projects().then(function (response) {
                    var data = response.data.results;
                    data.forEach(function (project) {
                        1 == project.featured && $scope.featured.push(project);
                        var order = project.order,
                            id = project.id,
                            title = project.project_name,
                            slug = project.slug,
                            description = project.short_description,
                            image = project.grid_image.url,
                            newProject = new Project(order, id, title, description, slug, image);
                        $scope.gridItems.push(newProject),
                            $scope.showGrid = !0
                    })
                }),
                callback()
        }

        function loadEverythingElse() {
            TweenMax.to(".border", .85, {
                    backgroundColor: "#dfdbd1",
                    ease: Linear.easeNone
                }, 0),
                TweenMax.to(".lcrop, .rcrop", .2, {
                    stroke: "#222"
                }),
                $timeout(function () {
                    var status = $(".numbers"),
                        feature = $(".feature-title"),
                        slickElement = $(".slider");
                    status.text("/ 01 /"),
                        feature.text("Featured Client 01"),
                        slickElement.on("init reInit afterChange", function (event, slick, currentSlide, nextSlide) {
                            var i = (currentSlide ? currentSlide : 0) + 1;
                            status.text("/ 0" + i + " /"),
                                feature.text("Featured Client 0" + i)
                        })
                }, 1e3)
        }
        $rootScope.bodyClass = "portfolio",
            $scope.pageClass = "page-portfolio",
            $rootScope.bread = "portfolio",
            $rootScope.crumb = "",
            $scope.featured = [],
            $scope.gridItems = [],
            $rootScope.fbReady = !1,
            $rootScope.url = $location.absUrl().split("?")[0],
            $scope.$on("$destroy", destroy),
            $rootScope.isMobile && $(".logo a").text("ps"),
            loadPage(loadEverythingElse)
    }]),
    app.controller("productCtrl", ["$rootScope", "$scope", "$timeout", "$stateParams", "apiService", "postalService", "$sce", "$location", function ($rootScope, $scope, $timeout, $stateParams, apiService, postalService, $sce, $location) {
        function destroy() {
            $scope.showGallery = !1
        }

        function GalleryPhoto(id, caption, largesize, mediumsize, smallsize, large, small, src) {
            this.id = id,
                this.caption = caption,
                this.largesize = largesize,
                this.mediumsize = mediumsize,
                this.smallsize = smallsize,
                this.large = large,
                this.small = small,
                this.src = src
        }

        function validateForm(form) {
            var valid = !0;
            return form.first_name.length <= 0 && (valid = !1),
                form.last_name.length <= 0 && (valid = !1),
                form.email.length <= 0 && (valid = !1),
                form.phone.length <= 0 && (valid = !1),
                form.address.length <= 0 && (valid = !1),
                form.city.length <= 0 && (valid = !1),
                form.state.length <= 0 && (valid = !1),
                valid
        }

        function mobileSticky() {
            $rootScope.isMobile ? $scope.priceOffset = 60 : $scope.priceOffset = 0
        }

        function showAlert() {
            swal({
                title: "Order Sent",
                text: "Thanks! We'll be in touch soon.",
                type: "success",
                confirmButtonText: "Okay"
            })
        }

        function getPrice() {
            TweenMax.to(".order-box", 1, {
                opacity: 1,
                delay: .2,
                ease: Linear.easeNone,
                onComplete: updateCss
            })
        }

        function updateCss() {
            TweenMax.to(CSSRulePlugin.getRule(".order-box"), .1, {
                cssRule: {
                    opacity: 1
                }
            })
        }

        function initGallery() {
            btnTimer = $timeout(function () {
                $(".gallery").photoswipe({
                        breakpoints: {
                            medium: 480,
                            large: 769
                        },
                        bgOpacity: .9,
                        loop: !0,
                        history: !1,
                        fullscreenEl: !1
                    }),
                    $scope.product.images.length > 4 && $("<button id='proBtn' class='gallery-btn'>Load More</button>").insertAfter("#pro-gallery .gallery .column:first-child div:last-child");
                var topScroll;
                $("#proBtn").on("click", function (event) {
                    $("#pro-gallery .gallery .column div:nth-child(n+3)").toggleClass("active");
                    var scrollPos = $("body").scrollTop();
                    $("#pro-gallery .gallery").toggleClass("load-more"),
                        $("#pro-gallery .gallery").hasClass("load-more") ? (topScroll = scrollPos,
                            $("#proBtn").html("Close Gallery")) : (TweenMax.to("body", .6, {
                                scrollTo: topScroll,
                                ease: Cubic.easeOut
                            }),
                            $("#proBtn").html("Load More"))
                })
            }, 1e3)
        }
        $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src)
            },
            $rootScope.showFilters = !1,
            $rootScope.bodyClass = "product",
            $rootScope.pageClass = "page-product",
            $scope.showForm = !1,
            $scope.priceOffset,
            $rootScope.bread = "shop",
            $rootScope.crumb = $stateParams.slug;
        var icon = ".compass path, .compass circle";
        $rootScope.isMobile && $(".logo a").text("project sunday"),
            $rootScope.url = $location.absUrl().split("?")[0],
            $scope.photos = [],
            $scope.limit = 3,
            $scope.$on("$destroy", destroy),
            $("#dimensions-waypoint").waypoint(function (direction) {
                "down" == direction ? $("#fixed-hero").addClass("grayscale") : $("#fixed-hero").removeClass("grayscale")
            }, {
                offset: "-40%"
            }),
            $scope.productForm = {
                product_id: null,
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                wood_species: "",
                wood_finish: "",
                base_color: "",
                size: ""
            };
        var firstRun = 0;
        $scope.options = function (index, inview, inviewpart, event) {
                document.querySelectorAll(".svg-wrapper .svg");
                TweenMax.set(".options .svg", {
                        visibility: "visible"
                    }),
                    "top" == inviewpart && 0 == firstRun && (TweenMax.staggerTo(".options .svg", .4, {
                            scale: 1
                        }, .2),
                        firstRun = 1)
            },
            apiService.products().then(function (response) {
                var products = response.data.results;
                products.forEach(function (product) {
                    product.slug == $stateParams.slug && ($scope.product = product,
                        $rootScope.productID = product.id,
                        $scope.hasOptions = !1,
                        $rootScope.fb = {
                            title: product.product_name,
                            picture: product.hero_image,
                            link: $rootScope.url
                        },
                        $rootScope.fbReady = !0,
                        $scope.optionDimensions = [],
                        product.sizes.length > 0 && product.sizes.forEach(function (option) {
                            (option.length || option.height || option.width || option.depth) && ($scope.optionDimensions.push(option),
                                $scope.hasOptions = !0)
                        }),
                        $scope.video_url = "https://player.vimeo.com/video/" + $scope.product.video_id + "?api=1",
                        $scope.product.images.forEach(function (image) {
                            if (image.image) {
                                var id = image.id,
                                    caption = image.caption,
                                    largesize = image.image_size,
                                    mediumsize = image.medium_image.size,
                                    smallsize = image.small_image.size,
                                    large = image.image,
                                    small = image.small_image.url,
                                    src = image.medium_image.url,
                                    galleryImage = new GalleryPhoto(id, caption, largesize, mediumsize, smallsize, large, small, src);
                                $scope.photos.push(galleryImage),
                                    $scope.showGallery = !0
                            }
                        }),
                        initGallery(),
                        $scope.orderProduct = function () {
                            var product_id = $rootScope.productID,
                                first_name = $scope.productForm.first_name,
                                last_name = $scope.productForm.last_name,
                                email = $scope.productForm.email,
                                phone = $scope.productForm.phone,
                                address = $scope.productForm.address,
                                city = $scope.productForm.city,
                                state = $scope.productForm.state,
                                wood_species = $scope.productForm.wood_species,
                                base_color = $scope.productForm.base_color,
                                size = $scope.productForm.size,
                                wood_finish = $scope.productForm.wood_finish;
                            validateForm($scope.productForm) ? (postalService.orderProduct(product_id, first_name, last_name, email, phone, address, city, state, wood_finish, wood_species, base_color, size),
                                console.log("form submitted!"),
                                console.log($scope.productForm),
                                showAlert(),
                                $scope.closeOrderForm()) : console.log("there was an error")
                        },
                        $rootScope.$broadcast("contentLoaded"))
                });
                var index = products.indexOf($scope.product),
                    lastItem = products[products.length - 1];
                index > 0 ? $scope.prior = products[index - 1] : $scope.prior = lastItem,
                    index == products.length - 1 ? $scope.next = products[0] : $scope.next = products[index + 1],
                    $scope.product.sizes.length > 0 && ($scope.selectedOption = $scope.product.sizes[0]),
                    $scope.pickOption = function (option) {
                        $scope.selectedOption = option
                    }
            }),
            $scope.playVideo = function () {
                $scope.showVideo = !0
            },
            $rootScope.isMobile && $(".logo a").text("project sunday"),
            TweenMax.to(".border, header", .85, {
                backgroundColor: "#1d1d1d",
                ease: Power1.easeOut
            }),
            TweenMax.to(".lcrop, .rcrop", .2, {
                stroke: "#8f7c4f"
            }),
            TweenMax.set(icon, {
                drawSVG: "0"
            });
        var tl = new TimelineMax({
            paused: !0
        });
        tl.to(".modal-overlay", .8, {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                zIndex: "99999",
                left: "0",
                ease: Power3.easeOut
            }),
            tl.to(".modal-content.order-modal", .6, {
                top: "50%",
                ease: Power3.easeOut
            }, "-=0.1"),
            mobileSticky(),
            $scope.orderForm = function () {
                tl.play(),
                    $("body, html").css("overflow", "hidden")
            },
            $scope.closeOrderForm = function () {
                tl.reverse(),
                    $("body, html").css("overflow", "auto")
            },
            $scope.specs = function (index, inview, inviewpart, event) {
                "top" == inviewpart && TweenMax.fromTo(icon, 2.5, {
                    drawSVG: "0"
                }, {
                    drawSVG: "102%",
                    delay: .2,
                    ease: Power3.easeOut
                })
            },
            $scope.$on("onBorderOut", function (e) {
                getPrice()
            }),
            $scope.$on("onBorderIn", function (e) {
                TweenMax.to(".order-box", .3, {
                    opacity: 0,
                    ease: Linear.easeNone
                })
            }),
            $scope.$on("refresh", getPrice);
        var btnTimer;
        $scope.$on("$destroy", function (event) {
            $timeout.cancel(btnTimer),
                $(".breadcrumbs a").off()
        })
    }]),
    app.controller("projectCtrl", ["$rootScope", "$scope", "$timeout", "$filter", "$stateParams", "apiService", "$sce", "$location", function ($rootScope, $scope, $timeout, $filter, $stateParams, apiService, $sce, $location) {
        function destroy() {
            $scope.showGallery = !1,
                $scope.photos = []
        }

        function GalleryPhoto(id, caption, largesize, mediumsize, smallsize, large, small, src) {
            this.id = id,
                this.caption = caption,
                this.largesize = largesize,
                this.mediumsize = mediumsize,
                this.smallsize = smallsize,
                this.large = large,
                this.small = small,
                this.src = src
        }

        function loadPage() {
            function showMap(err, data) {
                data.lbounds ? map.fitBounds(data.lbounds) : data.latlng && map.setView([data.latlng[0], data.latlng[1]], 10)
            }
            $scope.video_url = "https://player.vimeo.com/video/" + $scope.project.video_id + "?api=1",
                $scope.project.images.forEach(function (image) {
                    if (image.image) {
                        var id = image.id,
                            caption = image.caption,
                            largesize = image.image_size,
                            mediumsize = image.medium_image.size,
                            smallsize = image.small_image.size,
                            large = image.image,
                            small = image.small_image.url,
                            src = image.medium_image.url,
                            galleryImage = new GalleryPhoto(id, caption, largesize, mediumsize, smallsize, large, small, src);
                        $scope.photos.push(galleryImage),
                            $scope.showGallery = !0
                    }
                }),
                setTimeout(function () {
                    $scope.project.images.length > 4 && $('<button id="projectBtn" class="gallery-btn">Load More</button>').insertAfter("#project-gallery .gallery .column:first-child div:last-child");
                    var topScroll;
                    $("#projectBtn").on("click", function (event) {
                        $("#project-gallery .gallery .column div:nth-child(n+3)").toggleClass("active");
                        var scrollPos = $("body").scrollTop();
                        $("#project-gallery .gallery").toggleClass("load-more"),
                            $("#project-gallery .gallery").hasClass("load-more") ? (topScroll = scrollPos,
                                $("#projectBtn").html("Close Gallery")) : (TweenMax.to("body", .6, {
                                    scrollTo: topScroll,
                                    ease: Cubic.easeOut
                                }),
                                $("#projectBtn").html("Load More"))
                    })
                }, 1e3),
                L.mapbox.accessToken = "pk.eyJ1IjoibmZyYW5jaGkwNiIsImEiOiJNU1EtVGVJIn0.KjiAzZQK65ENmMUiMIOGfA";
            var geocoder = L.mapbox.geocoder("mapbox.places"),
                map = L.mapbox.map("mapbox", "nfranchi06.e704a5e3", {
                    zoomControl: !1
                });
            map.dragging.disable(),
                map.touchZoom.disable(),
                map.doubleClickZoom.disable(),
                map.scrollWheelZoom.disable();
            var location;
            location = "" == $scope.project.project_location || null == $scope.project.project_location ? "Salt Lake City, UT" : $scope.project.project_location,
                geocoder.query(location, showMap),
                $scope.playVideo = function () {
                    $scope.showVideo = !0
                },
                TweenMax.to(".border, header", .85, {
                    backgroundColor: "#1d1d1d",
                    ease: Power1.easeOut
                }),
                TweenMax.to(".lcrop, .rcrop", .2, {
                    stroke: "#8f7c4f"
                }),
                $rootScope.$broadcast("contentLoaded")
        }

        function flipIt() {
            TweenMax.to(".details h4", .5, {
                rotationX: 0,
                delay: 0,
                ease: Power2.easeOut
            })
        }
        $scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src)
            },
            $scope.pageClass = "page-project",
            $rootScope.bread = "portfolio",
            $rootScope.crumb = $stateParams.slug,
            $rootScope.isMobile && $(".logo a").text("project sunday"),
            $rootScope.url = $location.absUrl().split("?")[0],
            $scope.photos = [],
            $scope.$on("$destroy", destroy);
        var words = ".breadcrumbs a span";
        apiService.projects().then(function (response) {
            var projects = response.data.results;
            projects.forEach(function (project) {
                project.slug == $stateParams.slug && ($scope.project = project,
                    $rootScope.fb = {
                        title: project.project_name,
                        picture: project.hero_image,
                        link: $rootScope.url
                    },
                    $rootScope.fbReady = !0)
            });
            var index = projects.indexOf($scope.project),
                lastItem = projects[projects.length - 1];
            index > 0 ? $scope.prior = projects[index - 1] : $scope.prior = lastItem,
                index == projects.length - 1 ? $scope.next = projects[0] : $scope.next = projects[index + 1],
                loadPage()
        });
        var pTimer = $timeout(function () {
            $(".gallery").photoswipe({
                breakpoints: {
                    medium: 480,
                    large: 769
                },
                bgOpacity: .9,
                loop: !0,
                history: !1,
                fullscreenEl: !1
            })
        }, 3e3);
        $scope.$on("refresh", flipIt),
            $scope.$on("onBorderOut", function (e) {
                flipIt()
            }),
            $scope.$on("$destroy", function (event) {
                $timeout.cancel(pTimer),
                    TweenMax.set(words, {
                        width: "auto"
                    }),
                    $(".breadcrumbs a").off()
            })
    }]),
    app.controller("ShopCtrl", ["$rootScope", "$scope", "$timeout", "$http", "apiService", "$location", function ($rootScope, $scope, $timeout, $http, apiService, $location) {
        function loadPage() {
            apiService.shop().then(function (response) {
                var page = response.data.results[0];
                $scope.shop = page,
                    $rootScope.fb = {
                        title: page.social_title,
                        picture: page.social_pic,
                        link: $rootScope.url
                    },
                    $rootScope.fbReady = !0
            })
        }

        function getProducts() {
            apiService.products().then(function (response) {
                var data = response.data.results,
                    products = [];
                data.forEach(function (item) {
                        1 == item.active && products.push(item),
                            1 == item.in_slideshow && $scope.featuredProducts.push(item),
                            null == item.category ? item.category = "all" : item.category = item.category.name
                    }),
                    $scope.products = products
            })
        }

        function getCats() {
            apiService.categories().then(function (response) {
                var catsArray = [],
                    data = response.data.results;
                data.forEach(function (cat) {
                        cat.slug = cat.name.toLowerCase(),
                            catsArray.push(cat.slug)
                    }),
                    $scope.catsArray = catsArray,
                    $scope.cats = data
            })
        }

        function showFilters() {
            TweenMax.staggerTo(filterBox, .85, {
                y: 0,
                delay: 1,
                ease: Quint.easeOut
            }, .2)
        }

        function hideFilters() {
            TweenMax.staggerTo(filterBox, .85, {
                y: "-40px",
                delay: 0,
                ease: Quint.easeOut
            }, .1)
        }
        $rootScope.bodyClass = "shop",
            $rootScope.bread = "shop",
            $rootScope.crumb = "",
            $scope.pageClass = "page-shop",
            $scope.products,
            $scope.catSort = {
                cat: ""
            },
            $scope.limit = 9,
            $rootScope.showFilters = !0,
            $scope.featuredProducts = [];
        var filterBox = ".filter-box .box";
        $rootScope.isMobile && $(".logo a").text("ps"),
            $rootScope.url = $location.absUrl().split("?")[0],
            loadPage(),
            getProducts(),
            getCats(),
            $scope.filterProducts = function (products) {
                return products.category = products.category.toLowerCase(),
                    1 == products.local && (products.category = "locals"),
                    $scope.catSort.cat ? products.category == $scope.catSort.cat : products
            },
            $scope.loadMore = function () {
                $scope.limit += 6
            },
            $scope.showAll = function () {
                $scope.limit = 9,
                    TweenMax.set(".loadmore", {
                        display: "block"
                    }),
                    TweenMax.to(window, .75, {
                        scrollTo: {
                            y: 680
                        },
                        ease: Power2.easeOut
                    }),
                    $rootScope.isDesktop || (filterTimeline.reversed() ? filterTimeline.play() : filterTimeline.reverse())
            },
            $scope.filtered = function (cat) {
                $scope.catSort.cat = cat,
                    $scope.limit = 3e3,
                    TweenMax.set(".loadmore", {
                        display: "none"
                    }),
                    TweenMax.to(window, .75, {
                        scrollTo: {
                            y: 680
                        },
                        ease: Power2.easeOut
                    }),
                    $rootScope.isDesktop || (filterTimeline.reversed() ? filterTimeline.play() : filterTimeline.reverse())
            },
            TweenMax.to(".wrap", 1, {
                autoAlpha: 1,
                y: 0,
                delay: 3.5,
                ease: Quint.easeOut
            }),
            TweenMax.to(".border", .85, {
                backgroundColor: "#dfdbd1",
                ease: Linear.easeNone
            }, 0),
            TweenMax.to(".lcrop, .rcrop", .2, {
                stroke: "#222"
            }),
            $scope.$on("onBorderOut", function (e) {
                showFilters()
            }),
            $scope.$on("onBorderIn", function (e) {
                hideFilters()
            })
    }]),
    app.controller("StagingCtrl", ["$rootScope", "$scope", "apiService", "postalService", "$location", function ($rootScope, $scope, apiService, postalService, $location) {
        function loadPage(callback) {
            apiService.staging().then(function (response) {
                    var page = response.data.results[0];
                    $scope.staging = page,
                        $scope.packages = page.packages,
                        $rootScope.fb = {
                            title: page.social_title,
                            picture: page.social_pic,
                            link: $rootScope.url
                        },
                        $rootScope.fbReady = !0,
                        $rootScope.$broadcast("contentLoaded")
                }),
                callback()
        }

        function loadEverythingElse() {
            TweenMax.to(".border", .85, {
                    backgroundColor: "#dfdbd1",
                    ease: Linear.easeNone
                }, 0),
                TweenMax.to(".lcrop, .rcrop", .2, {
                    stroke: "#222"
                }),
                setTimeout(function () {
                    TweenMax.to(".page-staging .hero h1", .75, {
                        opacity: 1,
                        transform: "translateY(0px)",
                        ease: Quad.easeOut
                    })
                }, 3e3),
                $(window).bind("scroll", function () {
                    this.pageYOffset >= 200 ? TweenMax.to(".icon-made-in-utah", .3, {
                        right: "80px"
                    }) : TweenMax.to(".icon-made-in-utah", .3, {
                        right: "34px"
                    })
                })
        }

        function showButton() {
            TweenMax.to(CSSRulePlugin.getRule(".inquire-btn"), .3, {
                cssRule: {
                    opacity: 1
                }
            })
        }

        function hideButton() {
            TweenMax.to(".inquire-btn", .2, {
                opacity: 0,
                ease: Linear.easeNone
            }, 0)
        }

        function validateForm(form) {
            var valid = !0;
            return form.name.length <= 0 && (valid = !1),
                form.email.length <= 0 && (valid = !1),
                form.address.length <= 0 && (valid = !1),
                form.city.length <= 0 && (valid = !1),
                form.state.length <= 0 && (valid = !1),
                form.price.length <= 0 && (valid = !1),
                valid
        }

        function showAlert() {
            swal({
                title: "Request Sent",
                text: "Thanks! We'll be in touch soon.",
                type: "success",
                confirmButtonText: "Okay"
            })
        }
        $rootScope.bodyClass = "stagging",
            $scope.pageClass = "page-staging",
            $rootScope.bread = "interior design",
            $rootScope.crumb = "",
            $rootScope.isMobile && $(".logo a").text("PS"),
            $rootScope.url = $location.absUrl().split("?")[0],
            loadPage(loadEverythingElse),
            $scope.$on("onBorderOut", function (e) {
                showButton()
            }),
            $scope.$on("onBorderIn", function (e) {
                hideButton()
            }),
            $scope.stagingForm = {
                name: "",
                email: "",
                address: "",
                city: "",
                state: "",
                footage: "",
                price: ""
            },
            $scope.requestStaging = function () {
                var name, email, address, city, state, footage, price;
                name = $scope.stagingForm.name,
                    email = $scope.stagingForm.email,
                    address = $scope.stagingForm.address,
                    city = $scope.stagingForm.city,
                    state = $scope.stagingForm.state,
                    footage = $scope.stagingForm.footage,
                    price = $scope.stagingForm.price,
                    validateForm($scope.stagingForm) && (postalService.requestStaging(name, email, address, city, state, footage, price),
                        showAlert())
            }
    }]);