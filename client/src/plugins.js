var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
        "use strict";
        _gsScope._gsDefine("plugins.CSSRulePlugin", ["plugins.TweenPlugin", "TweenLite", "plugins.CSSPlugin"], function (TweenPlugin, TweenLite, CSSPlugin) {
            var CSSRulePlugin = function () {
                    TweenPlugin.call(this, "cssRule"),
                        this._overwriteProps.length = 0
                },
                _doc = window.document,
                _superSetRatio = CSSPlugin.prototype.setRatio,
                p = CSSRulePlugin.prototype = new CSSPlugin;
            return p._propName = "cssRule",
                p.constructor = CSSRulePlugin,
                CSSRulePlugin.version = "0.6.3",
                CSSRulePlugin.API = 2,
                CSSRulePlugin.getRule = function (selector) {
                    var j, curSS, cs, a, ruleProp = _doc.all ? "rules" : "cssRules",
                        ss = _doc.styleSheets,
                        i = ss.length,
                        pseudo = ":" === selector.charAt(0);
                    for (selector = (pseudo ? "" : ",") + selector.toLowerCase() + ",",
                        pseudo && (a = []); --i > -1;) {
                        try {
                            if (curSS = ss[i][ruleProp],
                                !curSS)
                                continue;
                            j = curSS.length
                        } catch (e) {
                            console.log(e);
                            continue
                        }
                        for (; --j > -1;)
                            if (cs = curSS[j],
                                cs.selectorText && -1 !== ("," + cs.selectorText.split("::").join(":").toLowerCase() + ",").indexOf(selector)) {
                                if (!pseudo)
                                    return cs.style;
                                a.push(cs.style)
                            }
                    }
                    return a
                },
                p._onInitTween = function (target, value, tween) {
                    if (void 0 === target.cssText)
                        return !1;
                    var div = target._gsProxy = target._gsProxy || _doc.createElement("div");
                    return this._ss = target,
                        this._proxy = div.style,
                        div.style.cssText = target.cssText,
                        CSSPlugin.prototype._onInitTween.call(this, div, value, tween),
                        !0
                },
                p.setRatio = function (v) {
                    _superSetRatio.call(this, v),
                        this._ss.cssText = this._proxy.cssText
                },
                TweenPlugin.activate([CSSRulePlugin]),
                CSSRulePlugin
        }, !0)
    }),
    _gsScope._gsDefine && _gsScope._gsQueue.pop()();
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
        "use strict";

        function getDistance(x1, y1, x2, y2) {
            return x2 = parseFloat(x2) - parseFloat(x1),
                y2 = parseFloat(y2) - parseFloat(y1),
                Math.sqrt(x2 * x2 + y2 * y2)
        }

        function unwrap(element) {
            return "string" != typeof element && element.nodeType || (element = _gsScope.TweenLite.selector(element),
                    element.length && (element = element[0])),
                element
        }

        function parse(value, length, defaultStart) {
            var s, e, i = value.indexOf(" ");
            return -1 === i ? (s = void 0 !== defaultStart ? defaultStart + "" : value,
                    e = value) : (s = value.substr(0, i),
                    e = value.substr(i + 1)),
                s = -1 !== s.indexOf("%") ? parseFloat(s) / 100 * length : parseFloat(s),
                e = -1 !== e.indexOf("%") ? parseFloat(e) / 100 * length : parseFloat(e),
                s > e ? [e, s] : [s, e]
        }

        function getLength(element) {
            if (!element)
                return 0;
            element = unwrap(element);
            var length, bbox, points, point, prevPoint, i, rx, ry, type = element.tagName.toLowerCase();
            if ("path" === type)
                prevPoint = element.style.strokeDasharray,
                element.style.strokeDasharray = "none",
                length = element.getTotalLength() || 0,
                element.style.strokeDasharray = prevPoint;
            else if ("rect" === type)
                bbox = element.getBBox(),
                length = 2 * (bbox.width + bbox.height);
            else if ("circle" === type)
                length = 2 * Math.PI * parseFloat(element.getAttribute("r"));
            else if ("line" === type)
                length = getDistance(element.getAttribute("x1"), element.getAttribute("y1"), element.getAttribute("x2"), element.getAttribute("y2"));
            else if ("polyline" === type || "polygon" === type)
                for (points = element.getAttribute("points").split(" "),
                    length = 0,
                    prevPoint = points[0].split(","),
                    "polygon" === type && (points.push(points[0]),
                        -1 === points[0].indexOf(",") && points.push(points[1])),
                    i = 1; i < points.length; i++)
                    point = points[i].split(","),
                    1 === point.length && (point[1] = points[i++]),
                    2 === point.length && (length += getDistance(prevPoint[0], prevPoint[1], point[0], point[1]) || 0,
                        prevPoint = point);
            else
                "ellipse" === type && (rx = parseFloat(element.getAttribute("rx")),
                    ry = parseFloat(element.getAttribute("ry")),
                    length = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry))));
            return length || 0
        }

        function getPosition(element, length) {
            if (!element)
                return [0, 0];
            element = unwrap(element),
                length = length || getLength(element) + 1;
            var cs = _getComputedStyle(element),
                dash = cs.strokeDasharray || "",
                offset = parseFloat(cs.strokeDashoffset),
                i = dash.indexOf(",");
            return 0 > i && (i = dash.indexOf(" ")),
                dash = 0 > i ? length : parseFloat(dash.substr(0, i)) || 1e-5,
                dash > length && (dash = length),
                [Math.max(0, -offset), dash - offset]
        }
        var DrawSVGPlugin, _getComputedStyle = document.defaultView ? document.defaultView.getComputedStyle : function () {};
        DrawSVGPlugin = _gsScope._gsDefine.plugin({
                propName: "drawSVG",
                API: 2,
                version: "0.0.5",
                global: !0,
                overwriteProps: ["drawSVG"],
                init: function (target, value, tween) {
                    if (!target.getBBox)
                        return !1;
                    var start, end, overage, length = getLength(target) + 1;
                    return this._style = target.style,
                        value === !0 || "true" === value ? value = "0 100%" : value ? -1 === (value + "").indexOf(" ") && (value = "0 " + value) : value = "0 0",
                        start = getPosition(target, length),
                        end = parse(value, length, start[0]),
                        this._length = length + 10,
                        0 === start[0] && 0 === end[0] ? (overage = Math.max(1e-5, end[1] - length),
                            this._dash = length + overage,
                            this._offset = length - start[1] + overage,
                            this._addTween(this, "_offset", this._offset, length - end[1] + overage, "drawSVG")) : (this._dash = start[1] - start[0] || 1e-6,
                            this._offset = -start[0],
                            this._addTween(this, "_dash", this._dash, end[1] - end[0] || 1e-5, "drawSVG"),
                            this._addTween(this, "_offset", this._offset, -end[0], "drawSVG")),
                        !0
                },
                set: function (ratio) {
                    this._firstPT && (this._super.setRatio.call(this, ratio),
                        this._style.strokeDashoffset = this._offset,
                        this._style.strokeDasharray = (1 === ratio || 0 === ratio) && this._offset < .001 && this._length - this._dash <= 10 ? "none" : this._dash + "px," + this._length + "px")
                }
            }),
            DrawSVGPlugin.getLength = getLength,
            DrawSVGPlugin.getPosition = getPosition
    }),
    _gsScope._gsDefine && _gsScope._gsQueue.pop()();
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
        "use strict";
        var _doc = document.documentElement,
            _window = window,
            _max = function (element, axis) {
                var dim = "x" === axis ? "Width" : "Height",
                    scroll = "scroll" + dim,
                    client = "client" + dim,
                    body = document.body;
                return element === _window || element === _doc || element === body ? Math.max(_doc[scroll], body[scroll]) - (_window["inner" + dim] || _doc[client] || body[client]) : element[scroll] - element["offset" + dim]
            },
            ScrollToPlugin = _gsScope._gsDefine.plugin({
                propName: "scrollTo",
                API: 2,
                version: "1.7.5",
                init: function (target, value, tween) {
                    return this._wdw = target === _window,
                        this._target = target,
                        this._tween = tween,
                        "object" != typeof value && (value = {
                            y: value
                        }),
                        this.vars = value,
                        this._autoKill = value.autoKill !== !1,
                        this.x = this.xPrev = this.getX(),
                        this.y = this.yPrev = this.getY(),
                        null != value.x ? (this._addTween(this, "x", this.x, "max" === value.x ? _max(target, "x") : value.x, "scrollTo_x", !0),
                            this._overwriteProps.push("scrollTo_x")) : this.skipX = !0,
                        null != value.y ? (this._addTween(this, "y", this.y, "max" === value.y ? _max(target, "y") : value.y, "scrollTo_y", !0),
                            this._overwriteProps.push("scrollTo_y")) : this.skipY = !0,
                        !0
                },
                set: function (v) {
                    this._super.setRatio.call(this, v);
                    var x = this._wdw || !this.skipX ? this.getX() : this.xPrev,
                        y = this._wdw || !this.skipY ? this.getY() : this.yPrev,
                        yDif = y - this.yPrev,
                        xDif = x - this.xPrev;
                    this._autoKill && (!this.skipX && (xDif > 7 || -7 > xDif) && x < _max(this._target, "x") && (this.skipX = !0),
                            !this.skipY && (yDif > 7 || -7 > yDif) && y < _max(this._target, "y") && (this.skipY = !0),
                            this.skipX && this.skipY && (this._tween.kill(),
                                this.vars.onAutoKill && this.vars.onAutoKill.apply(this.vars.onAutoKillScope || this._tween, this.vars.onAutoKillParams || []))),
                        this._wdw ? _window.scrollTo(this.skipX ? x : this.x, this.skipY ? y : this.y) : (this.skipY || (this._target.scrollTop = this.y),
                            this.skipX || (this._target.scrollLeft = this.x)),
                        this.xPrev = this.x,
                        this.yPrev = this.y
                }
            }),
            p = ScrollToPlugin.prototype;
        ScrollToPlugin.max = _max,
            p.getX = function () {
                return this._wdw ? null != _window.pageXOffset ? _window.pageXOffset : null != _doc.scrollLeft ? _doc.scrollLeft : document.body.scrollLeft : this._target.scrollLeft
            },
            p.getY = function () {
                return this._wdw ? null != _window.pageYOffset ? _window.pageYOffset : null != _doc.scrollTop ? _doc.scrollTop : document.body.scrollTop : this._target.scrollTop
            },
            p._kill = function (lookup) {
                return lookup.scrollTo_x && (this.skipX = !0),
                    lookup.scrollTo_y && (this.skipY = !0),
                    this._super._kill.call(this, lookup)
            }
    }),
    _gsScope._gsDefine && _gsScope._gsQueue.pop()();
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
! function (window) {
    "use strict";
    var _globals = window.GreenSockGlobals || window,
        _namespace = function (ns) {
            var i, a = ns.split("."),
                p = _globals;
            for (i = 0; i < a.length; i++)
                p[a[i]] = p = p[a[i]] || {};
            return p
        },
        pkg = _namespace("com.greensock.utils"),
        _getText = function (e) {
            var type = e.nodeType,
                result = "";
            if (1 === type || 9 === type || 11 === type) {
                if ("string" == typeof e.textContent)
                    return e.textContent;
                for (e = e.firstChild; e; e = e.nextSibling)
                    result += _getText(e)
            } else if (3 === type || 4 === type)
                return e.nodeValue;
            return result
        },
        _doc = document,
        _getComputedStyle = _doc.defaultView ? _doc.defaultView.getComputedStyle : function () {},
        _capsExp = /([A-Z])/g,
        _getStyle = function (t, p, cs, str) {
            var result;
            return (cs = cs || _getComputedStyle(t, null)) ? (t = cs.getPropertyValue(p.replace(_capsExp, "-$1").toLowerCase()),
                    result = t || cs.length ? t : cs[p]) : t.currentStyle && (cs = t.currentStyle,
                    result = cs[p]),
                str ? result : parseInt(result, 10) || 0
        },
        _isArrayLike = function (e) {
            return e.length && e[0] && (e[0].nodeType && e[0].style && !e.nodeType || e[0].length && e[0][0]) ? !0 : !1
        },
        _flattenArray = function (a) {
            var i, e, j, result = [],
                l = a.length;
            for (i = 0; l > i; i++)
                if (e = a[i],
                    _isArrayLike(e))
                    for (j = e.length,
                        j = 0; j < e.length; j++)
                        result.push(e[j]);
                else
                    result.push(e);
            return result
        },
        _brSwap = ")eefec303079ad17405c",
        _brExp = /(?:<br>|<br\/>|<br \/>)/gi,
        _isOldIE = _doc.all && !_doc.addEventListener,
        _divStart = "<div style='position:relative;display:inline-block;" + (_isOldIE ? "*display:inline;*zoom:1;'" : "'"),
        _cssClassFunc = function (cssClass) {
            cssClass = cssClass || "";
            var iterate = -1 !== cssClass.indexOf("++"),
                num = 1;
            return iterate && (cssClass = cssClass.split("++").join("")),
                function () {
                    return _divStart + (cssClass ? " class='" + cssClass + (iterate ? num++ : "") + "'>" : ">")
                }
        },
        SplitText = pkg.SplitText = _globals.SplitText = function (element, vars) {
            if ("string" == typeof element && (element = SplitText.selector(element)),
                !element)
                throw "cannot split a null element.";
            this.elements = _isArrayLike(element) ? _flattenArray(element) : [element],
                this.chars = [],
                this.words = [],
                this.lines = [],
                this._originals = [],
                this.vars = vars || {},
                this.split(vars)
        },
        _swapText = function (element, oldText, newText) {
            var type = element.nodeType;
            if (1 === type || 9 === type || 11 === type)
                for (element = element.firstChild; element; element = element.nextSibling)
                    _swapText(element, oldText, newText);
            else
                (3 === type || 4 === type) && (element.nodeValue = element.nodeValue.split(oldText).join(newText))
        },
        _pushReversed = function (a, merge) {
            for (var i = merge.length; --i > -1;)
                a.push(merge[i])
        },
        _split = function (element, vars, allChars, allWords, allLines) {
            _brExp.test(element.innerHTML) && (element.innerHTML = element.innerHTML.replace(_brExp, _brSwap));
            var l, curLine, isChild, splitText, i, j, character, nodes, node, offset, lineNode, style, lineWidth, addWordSpaces, text = _getText(element),
                types = vars.type || vars.split || "chars,words,lines",
                lines = -1 !== types.indexOf("lines") ? [] : null,
                words = -1 !== types.indexOf("words"),
                chars = -1 !== types.indexOf("chars"),
                absolute = "absolute" === vars.position || vars.absolute === !0,
                space = absolute ? "&#173; " : " ",
                lineOffsetY = -999,
                cs = _getComputedStyle(element),
                paddingLeft = _getStyle(element, "paddingLeft", cs),
                borderTopAndBottom = _getStyle(element, "borderBottomWidth", cs) + _getStyle(element, "borderTopWidth", cs),
                borderLeftAndRight = _getStyle(element, "borderLeftWidth", cs) + _getStyle(element, "borderRightWidth", cs),
                padTopAndBottom = _getStyle(element, "paddingTop", cs) + _getStyle(element, "paddingBottom", cs),
                padLeftAndRight = _getStyle(element, "paddingLeft", cs) + _getStyle(element, "paddingRight", cs),
                textAlign = _getStyle(element, "textAlign", cs, !0),
                origHeight = element.clientHeight,
                origWidth = element.clientWidth,
                wordEnd = "</div>",
                wordStart = _cssClassFunc(vars.wordsClass),
                charStart = _cssClassFunc(vars.charsClass),
                iterateLine = -1 !== (vars.linesClass || "").indexOf("++"),
                linesClass = vars.linesClass,
                hasTagStart = -1 !== text.indexOf("<"),
                wordIsOpen = !0,
                charArray = [],
                wordArray = [],
                lineArray = [];
            for (iterateLine && (linesClass = linesClass.split("++").join("")),
                hasTagStart && (text = text.split("<").join("{{LT}}")),
                l = text.length,
                splitText = wordStart(),
                i = 0; l > i; i++)
                if (character = text.charAt(i),
                    ")" === character && text.substr(i, 20) === _brSwap)
                    splitText += (wordIsOpen ? wordEnd : "") + "<BR/>",
                    wordIsOpen = !1,
                    i !== l - 20 && text.substr(i + 20, 20) !== _brSwap && (splitText += " " + wordStart(),
                        wordIsOpen = !0),
                    i += 19;
                else if (" " === character && " " !== text.charAt(i - 1) && i !== l - 1 && text.substr(i - 20, 20) !== _brSwap) {
                for (splitText += wordIsOpen ? wordEnd : "",
                    wordIsOpen = !1;
                    " " === text.charAt(i + 1);)
                    splitText += space,
                    i++;
                (")" !== text.charAt(i + 1) || text.substr(i + 1, 20) !== _brSwap) && (splitText += space + wordStart(),
                    wordIsOpen = !0)
            } else
                splitText += chars && " " !== character ? charStart() + character + "</div>" : character;
            for (element.innerHTML = splitText + (wordIsOpen ? wordEnd : ""),
                hasTagStart && _swapText(element, "{{LT}}", "<"),
                j = element.getElementsByTagName("*"),
                l = j.length,
                nodes = [],
                i = 0; l > i; i++)
                nodes[i] = j[i];
            if (lines || absolute)
                for (i = 0; l > i; i++)
                    node = nodes[i],
                    isChild = node.parentNode === element,
                    (isChild || absolute || chars && !words) && (offset = node.offsetTop,
                        lines && isChild && offset !== lineOffsetY && "BR" !== node.nodeName && (curLine = [],
                            lines.push(curLine),
                            lineOffsetY = offset),
                        absolute && (node._x = node.offsetLeft,
                            node._y = offset,
                            node._w = node.offsetWidth,
                            node._h = node.offsetHeight),
                        lines && (words !== isChild && chars || (curLine.push(node),
                                node._x -= paddingLeft),
                            isChild && i && (nodes[i - 1]._wordEnd = !0),
                            "BR" === node.nodeName && node.nextSibling && "BR" === node.nextSibling.nodeName && lines.push([])));
            for (i = 0; l > i; i++)
                node = nodes[i],
                isChild = node.parentNode === element,
                "BR" !== node.nodeName ? (absolute && (style = node.style,
                        words || isChild || (node._x += node.parentNode._x,
                            node._y += node.parentNode._y),
                        style.left = node._x + "px",
                        style.top = node._y + "px",
                        style.position = "absolute",
                        style.display = "block",
                        style.width = node._w + 1 + "px",
                        style.height = node._h + "px"),
                    words ? isChild && "" !== node.innerHTML ? wordArray.push(node) : chars && charArray.push(node) : isChild ? (element.removeChild(node),
                        nodes.splice(i--, 1),
                        l--) : !isChild && chars && (offset = !lines && !absolute && node.nextSibling,
                        element.appendChild(node),
                        offset || element.appendChild(_doc.createTextNode(" ")),
                        charArray.push(node))) : lines || absolute ? (element.removeChild(node),
                    nodes.splice(i--, 1),
                    l--) : words || element.appendChild(node);
            if (lines) {
                for (absolute && (lineNode = _doc.createElement("div"),
                        element.appendChild(lineNode),
                        lineWidth = lineNode.offsetWidth + "px",
                        offset = lineNode.offsetParent === element ? 0 : element.offsetLeft,
                        element.removeChild(lineNode)),
                    style = element.style.cssText,
                    element.style.cssText = "display:none;"; element.firstChild;)
                    element.removeChild(element.firstChild);
                for (addWordSpaces = !absolute || !words && !chars,
                    i = 0; i < lines.length; i++) {
                    for (curLine = lines[i],
                        lineNode = _doc.createElement("div"),
                        lineNode.style.cssText = "display:block;text-align:" + textAlign + ";position:" + (absolute ? "absolute;" : "relative;"),
                        linesClass && (lineNode.className = linesClass + (iterateLine ? i + 1 : "")),
                        lineArray.push(lineNode),
                        l = curLine.length,
                        j = 0; l > j; j++)
                        "BR" !== curLine[j].nodeName && (node = curLine[j],
                            lineNode.appendChild(node),
                            addWordSpaces && (node._wordEnd || words) && lineNode.appendChild(_doc.createTextNode(" ")),
                            absolute && (0 === j && (lineNode.style.top = node._y + "px",
                                    lineNode.style.left = paddingLeft + offset + "px"),
                                node.style.top = "0px",
                                offset && (node.style.left = node._x - offset + "px")));
                    0 === l && (lineNode.innerHTML = "&nbsp;"),
                        words || chars || (lineNode.innerHTML = _getText(lineNode).split(String.fromCharCode(160)).join(" ")),
                        absolute && (lineNode.style.width = lineWidth,
                            lineNode.style.height = node._h + "px"),
                        element.appendChild(lineNode)
                }
                element.style.cssText = style
            }
            absolute && (origHeight > element.clientHeight && (element.style.height = origHeight - padTopAndBottom + "px",
                        element.clientHeight < origHeight && (element.style.height = origHeight + borderTopAndBottom + "px")),
                    origWidth > element.clientWidth && (element.style.width = origWidth - padLeftAndRight + "px",
                        element.clientWidth < origWidth && (element.style.width = origWidth + borderLeftAndRight + "px"))),
                _pushReversed(allChars, charArray),
                _pushReversed(allWords, wordArray),
                _pushReversed(allLines, lineArray)
        },
        p = SplitText.prototype;
    p.split = function (vars) {
            this.isSplit && this.revert(),
                this.vars = vars || this.vars,
                this._originals.length = this.chars.length = this.words.length = this.lines.length = 0;
            for (var i = this.elements.length; --i > -1;)
                this._originals[i] = this.elements[i].innerHTML,
                _split(this.elements[i], this.vars, this.chars, this.words, this.lines);
            return this.chars.reverse(),
                this.words.reverse(),
                this.lines.reverse(),
                this.isSplit = !0,
                this
        },
        p.revert = function () {
            if (!this._originals)
                throw "revert() call wasn't scoped properly.";
            for (var i = this._originals.length; --i > -1;)
                this.elements[i].innerHTML = this._originals[i];
            return this.chars = [],
                this.words = [],
                this.lines = [],
                this.isSplit = !1,
                this
        },
        SplitText.selector = window.$ || window.jQuery || function (e) {
            var selector = window.$ || window.jQuery;
            return selector ? (SplitText.selector = selector,
                selector(e)) : "undefined" == typeof document ? e : document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById("#" === e.charAt(0) ? e.substr(1) : e)
        },
        SplitText.version = "0.3.3"
}(_gsScope),
function (name) {
    "use strict";
    var getGlobal = function () {
        return (_gsScope.GreenSockGlobals || _gsScope)[name]
    };
    "function" == typeof define && define.amd ? define(["TweenLite"], getGlobal) : "undefined" != typeof module && module.exports && (module.exports = getGlobal())
}("SplitText");
var _gsScope = "undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window;
(_gsScope._gsQueue || (_gsScope._gsQueue = [])).push(function () {
        "use strict";
        _gsScope._gsDefine("TweenMax", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function (Animation, SimpleTimeline, TweenLite) {
                var _slice = function (a) {
                        var i, b = [],
                            l = a.length;
                        for (i = 0; i !== l; b.push(a[i++]))
                        ;
                        return b
                    },
                    TweenMax = function (target, duration, vars) {
                        TweenLite.call(this, target, duration, vars),
                            this._cycle = 0,
                            this._yoyo = this.vars.yoyo === !0,
                            this._repeat = this.vars.repeat || 0,
                            this._repeatDelay = this.vars.repeatDelay || 0,
                            this._dirty = !0,
                            this.render = TweenMax.prototype.render
                    },
                    _tinyNum = 1e-10,
                    TweenLiteInternals = TweenLite._internals,
                    _isSelector = TweenLiteInternals.isSelector,
                    _isArray = TweenLiteInternals.isArray,
                    p = TweenMax.prototype = TweenLite.to({}, .1, {}),
                    _blankArray = [];
                TweenMax.version = "1.17.0",
                    p.constructor = TweenMax,
                    p.kill()._gc = !1,
                    TweenMax.killTweensOf = TweenMax.killDelayedCallsTo = TweenLite.killTweensOf,
                    TweenMax.getTweensOf = TweenLite.getTweensOf,
                    TweenMax.lagSmoothing = TweenLite.lagSmoothing,
                    TweenMax.ticker = TweenLite.ticker,
                    TweenMax.render = TweenLite.render,
                    p.invalidate = function () {
                        return this._yoyo = this.vars.yoyo === !0,
                            this._repeat = this.vars.repeat || 0,
                            this._repeatDelay = this.vars.repeatDelay || 0,
                            this._uncache(!0),
                            TweenLite.prototype.invalidate.call(this)
                    },
                    p.updateTo = function (vars, resetDuration) {
                        var p, curRatio = this.ratio,
                            immediate = this.vars.immediateRender || vars.immediateRender;
                        resetDuration && this._startTime < this._timeline._time && (this._startTime = this._timeline._time,
                            this._uncache(!1),
                            this._gc ? this._enabled(!0, !1) : this._timeline.insert(this, this._startTime - this._delay));
                        for (p in vars)
                            this.vars[p] = vars[p];
                        if (this._initted || immediate)
                            if (resetDuration)
                                this._initted = !1,
                                immediate && this.render(0, !0, !0);
                            else if (this._gc && this._enabled(!0, !1),
                            this._notifyPluginsOfEnabled && this._firstPT && TweenLite._onPluginEvent("_onDisable", this),
                            this._time / this._duration > .998) {
                            var prevTime = this._time;
                            this.render(0, !0, !1),
                                this._initted = !1,
                                this.render(prevTime, !0, !1)
                        } else if (this._time > 0 || immediate) {
                            this._initted = !1,
                                this._init();
                            for (var endValue, inv = 1 / (1 - curRatio), pt = this._firstPT; pt;)
                                endValue = pt.s + pt.c,
                                pt.c *= inv,
                                pt.s = endValue - pt.c,
                                pt = pt._next
                        }
                        return this
                    },
                    p.render = function (time, suppressEvents, force) {
                        this._initted || 0 === this._duration && this.vars.repeat && this.invalidate();
                        var isComplete, callback, pt, cycleDuration, r, type, pow, rawPrevTime, totalDur = this._dirty ? this.totalDuration() : this._totalDuration,
                            prevTime = this._time,
                            prevTotalTime = this._totalTime,
                            prevCycle = this._cycle,
                            duration = this._duration,
                            prevRawPrevTime = this._rawPrevTime;
                        if (time >= totalDur ? (this._totalTime = totalDur,
                                this._cycle = this._repeat,
                                this._yoyo && 0 !== (1 & this._cycle) ? (this._time = 0,
                                    this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0) : (this._time = duration,
                                    this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1),
                                this._reversed || (isComplete = !0,
                                    callback = "onComplete",
                                    force = force || this._timeline.autoRemoveChildren),
                                0 === duration && (this._initted || !this.vars.lazy || force) && (this._startTime === this._timeline._duration && (time = 0),
                                    (0 === time || 0 > prevRawPrevTime || prevRawPrevTime === _tinyNum) && prevRawPrevTime !== time && (force = !0,
                                        prevRawPrevTime > _tinyNum && (callback = "onReverseComplete")),
                                    this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum)) : 1e-7 > time ? (this._totalTime = this._time = this._cycle = 0,
                                this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0,
                                (0 !== prevTotalTime || 0 === duration && prevRawPrevTime > 0) && (callback = "onReverseComplete",
                                    isComplete = this._reversed),
                                0 > time && (this._active = !1,
                                    0 === duration && (this._initted || !this.vars.lazy || force) && (prevRawPrevTime >= 0 && (force = !0),
                                        this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum)),
                                this._initted || (force = !0)) : (this._totalTime = this._time = time,
                                0 !== this._repeat && (cycleDuration = duration + this._repeatDelay,
                                    this._cycle = this._totalTime / cycleDuration >> 0,
                                    0 !== this._cycle && this._cycle === this._totalTime / cycleDuration && this._cycle--,
                                    this._time = this._totalTime - this._cycle * cycleDuration,
                                    this._yoyo && 0 !== (1 & this._cycle) && (this._time = duration - this._time),
                                    this._time > duration ? this._time = duration : this._time < 0 && (this._time = 0)),
                                this._easeType ? (r = this._time / duration,
                                    type = this._easeType,
                                    pow = this._easePower,
                                    (1 === type || 3 === type && r >= .5) && (r = 1 - r),
                                    3 === type && (r *= 2),
                                    1 === pow ? r *= r : 2 === pow ? r *= r * r : 3 === pow ? r *= r * r * r : 4 === pow && (r *= r * r * r * r),
                                    1 === type ? this.ratio = 1 - r : 2 === type ? this.ratio = r : this._time / duration < .5 ? this.ratio = r / 2 : this.ratio = 1 - r / 2) : this.ratio = this._ease.getRatio(this._time / duration)),
                            prevTime === this._time && !force && prevCycle === this._cycle)
                            return void(prevTotalTime !== this._totalTime && this._onUpdate && (suppressEvents || this._callback("onUpdate")));
                        if (!this._initted) {
                            if (this._init(),
                                !this._initted || this._gc)
                                return;
                            if (!force && this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration))
                                return this._time = prevTime,
                                    this._totalTime = prevTotalTime,
                                    this._rawPrevTime = prevRawPrevTime,
                                    this._cycle = prevCycle,
                                    TweenLiteInternals.lazyTweens.push(this),
                                    void(this._lazy = [time, suppressEvents]);
                            this._time && !isComplete ? this.ratio = this._ease.getRatio(this._time / duration) : isComplete && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1))
                        }
                        for (this._lazy !== !1 && (this._lazy = !1),
                            this._active || !this._paused && this._time !== prevTime && time >= 0 && (this._active = !0),
                            0 === prevTotalTime && (2 === this._initted && time > 0 && this._init(),
                                this._startAt && (time >= 0 ? this._startAt.render(time, suppressEvents, force) : callback || (callback = "_dummyGS")),
                                this.vars.onStart && (0 !== this._totalTime || 0 === duration) && (suppressEvents || this._callback("onStart"))),
                            pt = this._firstPT; pt;)
                            pt.f ? pt.t[pt.p](pt.c * this.ratio + pt.s) : pt.t[pt.p] = pt.c * this.ratio + pt.s,
                            pt = pt._next;
                        this._onUpdate && (0 > time && this._startAt && this._startTime && this._startAt.render(time, suppressEvents, force),
                                suppressEvents || (this._totalTime !== prevTotalTime || isComplete) && this._callback("onUpdate")),
                            this._cycle !== prevCycle && (suppressEvents || this._gc || this.vars.onRepeat && this._callback("onRepeat")),
                            callback && (!this._gc || force) && (0 > time && this._startAt && !this._onUpdate && this._startTime && this._startAt.render(time, suppressEvents, force),
                                isComplete && (this._timeline.autoRemoveChildren && this._enabled(!1, !1),
                                    this._active = !1),
                                !suppressEvents && this.vars[callback] && this._callback(callback),
                                0 === duration && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum && (this._rawPrevTime = 0))
                    },
                    TweenMax.to = function (target, duration, vars) {
                        return new TweenMax(target, duration, vars)
                    },
                    TweenMax.from = function (target, duration, vars) {
                        return vars.runBackwards = !0,
                            vars.immediateRender = 0 != vars.immediateRender,
                            new TweenMax(target, duration, vars)
                    },
                    TweenMax.fromTo = function (target, duration, fromVars, toVars) {
                        return toVars.startAt = fromVars,
                            toVars.immediateRender = 0 != toVars.immediateRender && 0 != fromVars.immediateRender,
                            new TweenMax(target, duration, toVars)
                    },
                    TweenMax.staggerTo = TweenMax.allTo = function (targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                        stagger = stagger || 0;
                        var l, copy, i, p, delay = vars.delay || 0,
                            a = [],
                            finalComplete = function () {
                                vars.onComplete && vars.onComplete.apply(vars.onCompleteScope || this, arguments),
                                    onCompleteAll.apply(onCompleteAllScope || vars.callbackScope || this, onCompleteAllParams || _blankArray)
                            };
                        for (_isArray(targets) || ("string" == typeof targets && (targets = TweenLite.selector(targets) || targets),
                                _isSelector(targets) && (targets = _slice(targets))),
                            targets = targets || [],
                            0 > stagger && (targets = _slice(targets),
                                targets.reverse(),
                                stagger *= -1),
                            l = targets.length - 1,
                            i = 0; l >= i; i++) {
                            copy = {};
                            for (p in vars)
                                copy[p] = vars[p];
                            copy.delay = delay,
                                i === l && onCompleteAll && (copy.onComplete = finalComplete),
                                a[i] = new TweenMax(targets[i], duration, copy),
                                delay += stagger
                        }
                        return a
                    },
                    TweenMax.staggerFrom = TweenMax.allFrom = function (targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                        return vars.runBackwards = !0,
                            vars.immediateRender = 0 != vars.immediateRender,
                            TweenMax.staggerTo(targets, duration, vars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope)
                    },
                    TweenMax.staggerFromTo = TweenMax.allFromTo = function (targets, duration, fromVars, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                        return toVars.startAt = fromVars,
                            toVars.immediateRender = 0 != toVars.immediateRender && 0 != fromVars.immediateRender,
                            TweenMax.staggerTo(targets, duration, toVars, stagger, onCompleteAll, onCompleteAllParams, onCompleteAllScope)
                    },
                    TweenMax.delayedCall = function (delay, callback, params, scope, useFrames) {
                        return new TweenMax(callback, 0, {
                            delay: delay,
                            onComplete: callback,
                            onCompleteParams: params,
                            callbackScope: scope,
                            onReverseComplete: callback,
                            onReverseCompleteParams: params,
                            immediateRender: !1,
                            useFrames: useFrames,
                            overwrite: 0
                        })
                    },
                    TweenMax.set = function (target, vars) {
                        return new TweenMax(target, 0, vars)
                    },
                    TweenMax.isTweening = function (target) {
                        return TweenLite.getTweensOf(target, !0).length > 0
                    };
                var _getChildrenOf = function (timeline, includeTimelines) {
                        for (var a = [], cnt = 0, tween = timeline._first; tween;)
                            tween instanceof TweenLite ? a[cnt++] = tween : (includeTimelines && (a[cnt++] = tween),
                                a = a.concat(_getChildrenOf(tween, includeTimelines)),
                                cnt = a.length),
                            tween = tween._next;
                        return a
                    },
                    getAllTweens = TweenMax.getAllTweens = function (includeTimelines) {
                        return _getChildrenOf(Animation._rootTimeline, includeTimelines).concat(_getChildrenOf(Animation._rootFramesTimeline, includeTimelines))
                    };
                TweenMax.killAll = function (complete, tweens, delayedCalls, timelines) {
                        null == tweens && (tweens = !0),
                            null == delayedCalls && (delayedCalls = !0);
                        var isDC, tween, i, a = getAllTweens(0 != timelines),
                            l = a.length,
                            allTrue = tweens && delayedCalls && timelines;
                        for (i = 0; l > i; i++)
                            tween = a[i],
                            (allTrue || tween instanceof SimpleTimeline || (isDC = tween.target === tween.vars.onComplete) && delayedCalls || tweens && !isDC) && (complete ? tween.totalTime(tween._reversed ? 0 : tween.totalDuration()) : tween._enabled(!1, !1))
                    },
                    TweenMax.killChildTweensOf = function (parent, complete) {
                        if (null != parent) {
                            var a, curParent, p, i, l, tl = TweenLiteInternals.tweenLookup;
                            if ("string" == typeof parent && (parent = TweenLite.selector(parent) || parent),
                                _isSelector(parent) && (parent = _slice(parent)),
                                _isArray(parent))
                                for (i = parent.length; --i > -1;)
                                    TweenMax.killChildTweensOf(parent[i], complete);
                            else {
                                a = [];
                                for (p in tl)
                                    for (curParent = tl[p].target.parentNode; curParent;)
                                        curParent === parent && (a = a.concat(tl[p].tweens)),
                                        curParent = curParent.parentNode;
                                for (l = a.length,
                                    i = 0; l > i; i++)
                                    complete && a[i].totalTime(a[i].totalDuration()),
                                    a[i]._enabled(!1, !1)
                            }
                        }
                    };
                var _changePause = function (pause, tweens, delayedCalls, timelines) {
                    tweens = tweens !== !1,
                        delayedCalls = delayedCalls !== !1,
                        timelines = timelines !== !1;
                    for (var isDC, tween, a = getAllTweens(timelines), allTrue = tweens && delayedCalls && timelines, i = a.length; --i > -1;)
                        tween = a[i],
                        (allTrue || tween instanceof SimpleTimeline || (isDC = tween.target === tween.vars.onComplete) && delayedCalls || tweens && !isDC) && tween.paused(pause)
                };
                return TweenMax.pauseAll = function (tweens, delayedCalls, timelines) {
                        _changePause(!0, tweens, delayedCalls, timelines)
                    },
                    TweenMax.resumeAll = function (tweens, delayedCalls, timelines) {
                        _changePause(!1, tweens, delayedCalls, timelines)
                    },
                    TweenMax.globalTimeScale = function (value) {
                        var tl = Animation._rootTimeline,
                            t = TweenLite.ticker.time;
                        return arguments.length ? (value = value || _tinyNum,
                            tl._startTime = t - (t - tl._startTime) * tl._timeScale / value,
                            tl = Animation._rootFramesTimeline,
                            t = TweenLite.ticker.frame,
                            tl._startTime = t - (t - tl._startTime) * tl._timeScale / value,
                            tl._timeScale = Animation._rootTimeline._timeScale = value,
                            value) : tl._timeScale
                    },
                    p.progress = function (value) {
                        return arguments.length ? this.totalTime(this.duration() * (this._yoyo && 0 !== (1 & this._cycle) ? 1 - value : value) + this._cycle * (this._duration + this._repeatDelay), !1) : this._time / this.duration()
                    },
                    p.totalProgress = function (value) {
                        return arguments.length ? this.totalTime(this.totalDuration() * value, !1) : this._totalTime / this.totalDuration()
                    },
                    p.time = function (value, suppressEvents) {
                        return arguments.length ? (this._dirty && this.totalDuration(),
                            value > this._duration && (value = this._duration),
                            this._yoyo && 0 !== (1 & this._cycle) ? value = this._duration - value + this._cycle * (this._duration + this._repeatDelay) : 0 !== this._repeat && (value += this._cycle * (this._duration + this._repeatDelay)),
                            this.totalTime(value, suppressEvents)) : this._time
                    },
                    p.duration = function (value) {
                        return arguments.length ? Animation.prototype.duration.call(this, value) : this._duration
                    },
                    p.totalDuration = function (value) {
                        return arguments.length ? -1 === this._repeat ? this : this.duration((value - this._repeat * this._repeatDelay) / (this._repeat + 1)) : (this._dirty && (this._totalDuration = -1 === this._repeat ? 999999999999 : this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat,
                                this._dirty = !1),
                            this._totalDuration)
                    },
                    p.repeat = function (value) {
                        return arguments.length ? (this._repeat = value,
                            this._uncache(!0)) : this._repeat
                    },
                    p.repeatDelay = function (value) {
                        return arguments.length ? (this._repeatDelay = value,
                            this._uncache(!0)) : this._repeatDelay
                    },
                    p.yoyo = function (value) {
                        return arguments.length ? (this._yoyo = value,
                            this) : this._yoyo
                    },
                    TweenMax
            }, !0),
            _gsScope._gsDefine("TimelineLite", ["core.Animation", "core.SimpleTimeline", "TweenLite"], function (Animation, SimpleTimeline, TweenLite) {
                var TimelineLite = function (vars) {
                        SimpleTimeline.call(this, vars),
                            this._labels = {},
                            this.autoRemoveChildren = this.vars.autoRemoveChildren === !0,
                            this.smoothChildTiming = this.vars.smoothChildTiming === !0,
                            this._sortChildren = !0,
                            this._onUpdate = this.vars.onUpdate;
                        var val, p, v = this.vars;
                        for (p in v)
                            val = v[p],
                            _isArray(val) && -1 !== val.join("").indexOf("{self}") && (v[p] = this._swapSelfInParams(val));
                        _isArray(v.tweens) && this.add(v.tweens, 0, v.align, v.stagger)
                    },
                    _tinyNum = 1e-10,
                    TweenLiteInternals = TweenLite._internals,
                    _internals = TimelineLite._internals = {},
                    _isSelector = TweenLiteInternals.isSelector,
                    _isArray = TweenLiteInternals.isArray,
                    _lazyTweens = TweenLiteInternals.lazyTweens,
                    _lazyRender = TweenLiteInternals.lazyRender,
                    _blankArray = [],
                    _globals = _gsScope._gsDefine.globals,
                    _copy = function (vars) {
                        var p, copy = {};
                        for (p in vars)
                            copy[p] = vars[p];
                        return copy
                    },
                    _pauseCallback = _internals.pauseCallback = function (tween, callback, params, scope) {
                        var sibling, tl = tween._timeline,
                            time = tl._totalTime,
                            startTime = tween._startTime,
                            reversed = tween._rawPrevTime < 0 || 0 === tween._rawPrevTime && tl._reversed,
                            next = reversed ? 0 : _tinyNum,
                            prev = reversed ? _tinyNum : 0;
                        if (callback || !this._forcingPlayhead) {
                            for (tl.pause(startTime),
                                sibling = tween._prev; sibling && sibling._startTime === startTime;)
                                sibling._rawPrevTime = prev,
                                sibling = sibling._prev;
                            for (sibling = tween._next; sibling && sibling._startTime === startTime;)
                                sibling._rawPrevTime = next,
                                sibling = sibling._next;
                            callback && callback.apply(scope || tl.vars.callbackScope || tl, params || _blankArray),
                                (this._forcingPlayhead || !tl._paused) && tl.seek(time)
                        }
                    },
                    _slice = function (a) {
                        var i, b = [],
                            l = a.length;
                        for (i = 0; i !== l; b.push(a[i++]))
                        ;
                        return b
                    },
                    p = TimelineLite.prototype = new SimpleTimeline;
                return TimelineLite.version = "1.17.0",
                    p.constructor = TimelineLite,
                    p.kill()._gc = p._forcingPlayhead = !1,
                    p.to = function (target, duration, vars, position) {
                        var Engine = vars.repeat && _globals.TweenMax || TweenLite;
                        return duration ? this.add(new Engine(target, duration, vars), position) : this.set(target, vars, position)
                    },
                    p.from = function (target, duration, vars, position) {
                        return this.add((vars.repeat && _globals.TweenMax || TweenLite).from(target, duration, vars), position)
                    },
                    p.fromTo = function (target, duration, fromVars, toVars, position) {
                        var Engine = toVars.repeat && _globals.TweenMax || TweenLite;
                        return duration ? this.add(Engine.fromTo(target, duration, fromVars, toVars), position) : this.set(target, toVars, position);
                    },
                    p.staggerTo = function (targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                        var i, tl = new TimelineLite({
                            onComplete: onCompleteAll,
                            onCompleteParams: onCompleteAllParams,
                            callbackScope: onCompleteAllScope,
                            smoothChildTiming: this.smoothChildTiming
                        });
                        for ("string" == typeof targets && (targets = TweenLite.selector(targets) || targets),
                            targets = targets || [],
                            _isSelector(targets) && (targets = _slice(targets)),
                            stagger = stagger || 0,
                            0 > stagger && (targets = _slice(targets),
                                targets.reverse(),
                                stagger *= -1),
                            i = 0; i < targets.length; i++)
                            vars.startAt && (vars.startAt = _copy(vars.startAt)),
                            tl.to(targets[i], duration, _copy(vars), i * stagger);
                        return this.add(tl, position)
                    },
                    p.staggerFrom = function (targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                        return vars.immediateRender = 0 != vars.immediateRender,
                            vars.runBackwards = !0,
                            this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope)
                    },
                    p.staggerFromTo = function (targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope) {
                        return toVars.startAt = fromVars,
                            toVars.immediateRender = 0 != toVars.immediateRender && 0 != fromVars.immediateRender,
                            this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams, onCompleteAllScope)
                    },
                    p.call = function (callback, params, scope, position) {
                        return this.add(TweenLite.delayedCall(0, callback, params, scope), position)
                    },
                    p.set = function (target, vars, position) {
                        return position = this._parseTimeOrLabel(position, 0, !0),
                            null == vars.immediateRender && (vars.immediateRender = position === this._time && !this._paused),
                            this.add(new TweenLite(target, 0, vars), position)
                    },
                    TimelineLite.exportRoot = function (vars, ignoreDelayedCalls) {
                        vars = vars || {},
                            null == vars.smoothChildTiming && (vars.smoothChildTiming = !0);
                        var tween, next, tl = new TimelineLite(vars),
                            root = tl._timeline;
                        for (null == ignoreDelayedCalls && (ignoreDelayedCalls = !0),
                            root._remove(tl, !0),
                            tl._startTime = 0,
                            tl._rawPrevTime = tl._time = tl._totalTime = root._time,
                            tween = root._first; tween;)
                            next = tween._next,
                            ignoreDelayedCalls && tween instanceof TweenLite && tween.target === tween.vars.onComplete || tl.add(tween, tween._startTime - tween._delay),
                            tween = next;
                        return root.add(tl, 0),
                            tl
                    },
                    p.add = function (value, position, align, stagger) {
                        var curTime, l, i, child, tl, beforeRawTime;
                        if ("number" != typeof position && (position = this._parseTimeOrLabel(position, 0, !0, value)),
                            !(value instanceof Animation)) {
                            if (value instanceof Array || value && value.push && _isArray(value)) {
                                for (align = align || "normal",
                                    stagger = stagger || 0,
                                    curTime = position,
                                    l = value.length,
                                    i = 0; l > i; i++)
                                    _isArray(child = value[i]) && (child = new TimelineLite({
                                        tweens: child
                                    })),
                                    this.add(child, curTime),
                                    "string" != typeof child && "function" != typeof child && ("sequence" === align ? curTime = child._startTime + child.totalDuration() / child._timeScale : "start" === align && (child._startTime -= child.delay())),
                                    curTime += stagger;
                                return this._uncache(!0)
                            }
                            if ("string" == typeof value)
                                return this.addLabel(value, position);
                            if ("function" != typeof value)
                                throw "Cannot add " + value + " into the timeline; it is not a tween, timeline, function, or string.";
                            value = TweenLite.delayedCall(0, value)
                        }
                        if (SimpleTimeline.prototype.add.call(this, value, position),
                            (this._gc || this._time === this._duration) && !this._paused && this._duration < this.duration())
                            for (tl = this,
                                beforeRawTime = tl.rawTime() > value._startTime; tl._timeline;)
                                beforeRawTime && tl._timeline.smoothChildTiming ? tl.totalTime(tl._totalTime, !0) : tl._gc && tl._enabled(!0, !1),
                                tl = tl._timeline;
                        return this
                    },
                    p.remove = function (value) {
                        if (value instanceof Animation)
                            return this._remove(value, !1);
                        if (value instanceof Array || value && value.push && _isArray(value)) {
                            for (var i = value.length; --i > -1;)
                                this.remove(value[i]);
                            return this
                        }
                        return "string" == typeof value ? this.removeLabel(value) : this.kill(null, value)
                    },
                    p._remove = function (tween, skipDisable) {
                        SimpleTimeline.prototype._remove.call(this, tween, skipDisable);
                        var last = this._last;
                        return last ? this._time > last._startTime + last._totalDuration / last._timeScale && (this._time = this.duration(),
                                this._totalTime = this._totalDuration) : this._time = this._totalTime = this._duration = this._totalDuration = 0,
                            this
                    },
                    p.append = function (value, offsetOrLabel) {
                        return this.add(value, this._parseTimeOrLabel(null, offsetOrLabel, !0, value))
                    },
                    p.insert = p.insertMultiple = function (value, position, align, stagger) {
                        return this.add(value, position || 0, align, stagger)
                    },
                    p.appendMultiple = function (tweens, offsetOrLabel, align, stagger) {
                        return this.add(tweens, this._parseTimeOrLabel(null, offsetOrLabel, !0, tweens), align, stagger)
                    },
                    p.addLabel = function (label, position) {
                        return this._labels[label] = this._parseTimeOrLabel(position),
                            this
                    },
                    p.addPause = function (position, callback, params, scope) {
                        var t = TweenLite.delayedCall(0, _pauseCallback, ["{self}", callback, params, scope], this);
                        return t.data = "isPause",
                            this.add(t, position)
                    },
                    p.removeLabel = function (label) {
                        return delete this._labels[label],
                            this
                    },
                    p.getLabelTime = function (label) {
                        return null != this._labels[label] ? this._labels[label] : -1
                    },
                    p._parseTimeOrLabel = function (timeOrLabel, offsetOrLabel, appendIfAbsent, ignore) {
                        var i;
                        if (ignore instanceof Animation && ignore.timeline === this)
                            this.remove(ignore);
                        else if (ignore && (ignore instanceof Array || ignore.push && _isArray(ignore)))
                            for (i = ignore.length; --i > -1;)
                                ignore[i] instanceof Animation && ignore[i].timeline === this && this.remove(ignore[i]);
                        if ("string" == typeof offsetOrLabel)
                            return this._parseTimeOrLabel(offsetOrLabel, appendIfAbsent && "number" == typeof timeOrLabel && null == this._labels[offsetOrLabel] ? timeOrLabel - this.duration() : 0, appendIfAbsent);
                        if (offsetOrLabel = offsetOrLabel || 0,
                            "string" != typeof timeOrLabel || !isNaN(timeOrLabel) && null == this._labels[timeOrLabel])
                            null == timeOrLabel && (timeOrLabel = this.duration());
                        else {
                            if (i = timeOrLabel.indexOf("="),
                                -1 === i)
                                return null == this._labels[timeOrLabel] ? appendIfAbsent ? this._labels[timeOrLabel] = this.duration() + offsetOrLabel : offsetOrLabel : this._labels[timeOrLabel] + offsetOrLabel;
                            offsetOrLabel = parseInt(timeOrLabel.charAt(i - 1) + "1", 10) * Number(timeOrLabel.substr(i + 1)),
                                timeOrLabel = i > 1 ? this._parseTimeOrLabel(timeOrLabel.substr(0, i - 1), 0, appendIfAbsent) : this.duration()
                        }
                        return Number(timeOrLabel) + offsetOrLabel
                    },
                    p.seek = function (position, suppressEvents) {
                        return this.totalTime("number" == typeof position ? position : this._parseTimeOrLabel(position), suppressEvents !== !1)
                    },
                    p.stop = function () {
                        return this.paused(!0)
                    },
                    p.gotoAndPlay = function (position, suppressEvents) {
                        return this.play(position, suppressEvents)
                    },
                    p.gotoAndStop = function (position, suppressEvents) {
                        return this.pause(position, suppressEvents)
                    },
                    p.render = function (time, suppressEvents, force) {
                        this._gc && this._enabled(!0, !1);
                        var tween, isComplete, next, callback, internalForce, totalDur = this._dirty ? this.totalDuration() : this._totalDuration,
                            prevTime = this._time,
                            prevStart = this._startTime,
                            prevTimeScale = this._timeScale,
                            prevPaused = this._paused;
                        if (time >= totalDur)
                            this._totalTime = this._time = totalDur,
                            this._reversed || this._hasPausedChild() || (isComplete = !0,
                                callback = "onComplete",
                                internalForce = !!this._timeline.autoRemoveChildren,
                                0 === this._duration && (0 === time || this._rawPrevTime < 0 || this._rawPrevTime === _tinyNum) && this._rawPrevTime !== time && this._first && (internalForce = !0,
                                    this._rawPrevTime > _tinyNum && (callback = "onReverseComplete"))),
                            this._rawPrevTime = this._duration || !suppressEvents || time || this._rawPrevTime === time ? time : _tinyNum,
                            time = totalDur + 1e-4;
                        else if (1e-7 > time)
                            if (this._totalTime = this._time = 0,
                                (0 !== prevTime || 0 === this._duration && this._rawPrevTime !== _tinyNum && (this._rawPrevTime > 0 || 0 > time && this._rawPrevTime >= 0)) && (callback = "onReverseComplete",
                                    isComplete = this._reversed),
                                0 > time)
                                this._active = !1,
                                this._timeline.autoRemoveChildren && this._reversed ? (internalForce = isComplete = !0,
                                    callback = "onReverseComplete") : this._rawPrevTime >= 0 && this._first && (internalForce = !0),
                                this._rawPrevTime = time;
                            else {
                                if (this._rawPrevTime = this._duration || !suppressEvents || time || this._rawPrevTime === time ? time : _tinyNum,
                                    0 === time && isComplete)
                                    for (tween = this._first; tween && 0 === tween._startTime;)
                                        tween._duration || (isComplete = !1),
                                        tween = tween._next;
                                time = 0,
                                    this._initted || (internalForce = !0)
                            }
                        else
                            this._totalTime = this._time = this._rawPrevTime = time;
                        if (this._time !== prevTime && this._first || force || internalForce) {
                            if (this._initted || (this._initted = !0),
                                this._active || !this._paused && this._time !== prevTime && time > 0 && (this._active = !0),
                                0 === prevTime && this.vars.onStart && 0 !== this._time && (suppressEvents || this._callback("onStart")),
                                this._time >= prevTime)
                                for (tween = this._first; tween && (next = tween._next,
                                        !this._paused || prevPaused);)
                                    (tween._active || tween._startTime <= this._time && !tween._paused && !tween._gc) && (tween._reversed ? tween.render((tween._dirty ? tween.totalDuration() : tween._totalDuration) - (time - tween._startTime) * tween._timeScale, suppressEvents, force) : tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force)),
                                    tween = next;
                            else
                                for (tween = this._last; tween && (next = tween._prev,
                                        !this._paused || prevPaused);)
                                    (tween._active || tween._startTime <= prevTime && !tween._paused && !tween._gc) && (tween._reversed ? tween.render((tween._dirty ? tween.totalDuration() : tween._totalDuration) - (time - tween._startTime) * tween._timeScale, suppressEvents, force) : tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force)),
                                    tween = next;
                            this._onUpdate && (suppressEvents || (_lazyTweens.length && _lazyRender(),
                                    this._callback("onUpdate"))),
                                callback && (this._gc || (prevStart === this._startTime || prevTimeScale !== this._timeScale) && (0 === this._time || totalDur >= this.totalDuration()) && (isComplete && (_lazyTweens.length && _lazyRender(),
                                        this._timeline.autoRemoveChildren && this._enabled(!1, !1),
                                        this._active = !1),
                                    !suppressEvents && this.vars[callback] && this._callback(callback)))
                        }
                    },
                    p._hasPausedChild = function () {
                        for (var tween = this._first; tween;) {
                            if (tween._paused || tween instanceof TimelineLite && tween._hasPausedChild())
                                return !0;
                            tween = tween._next
                        }
                        return !1
                    },
                    p.getChildren = function (nested, tweens, timelines, ignoreBeforeTime) {
                        ignoreBeforeTime = ignoreBeforeTime || -9999999999;
                        for (var a = [], tween = this._first, cnt = 0; tween;)
                            tween._startTime < ignoreBeforeTime || (tween instanceof TweenLite ? tweens !== !1 && (a[cnt++] = tween) : (timelines !== !1 && (a[cnt++] = tween),
                                nested !== !1 && (a = a.concat(tween.getChildren(!0, tweens, timelines)),
                                    cnt = a.length))),
                            tween = tween._next;
                        return a
                    },
                    p.getTweensOf = function (target, nested) {
                        var tweens, i, disabled = this._gc,
                            a = [],
                            cnt = 0;
                        for (disabled && this._enabled(!0, !0),
                            tweens = TweenLite.getTweensOf(target),
                            i = tweens.length; --i > -1;)
                            (tweens[i].timeline === this || nested && this._contains(tweens[i])) && (a[cnt++] = tweens[i]);
                        return disabled && this._enabled(!1, !0),
                            a
                    },
                    p.recent = function () {
                        return this._recent
                    },
                    p._contains = function (tween) {
                        for (var tl = tween.timeline; tl;) {
                            if (tl === this)
                                return !0;
                            tl = tl.timeline
                        }
                        return !1
                    },
                    p.shiftChildren = function (amount, adjustLabels, ignoreBeforeTime) {
                        ignoreBeforeTime = ignoreBeforeTime || 0;
                        for (var p, tween = this._first, labels = this._labels; tween;)
                            tween._startTime >= ignoreBeforeTime && (tween._startTime += amount),
                            tween = tween._next;
                        if (adjustLabels)
                            for (p in labels)
                                labels[p] >= ignoreBeforeTime && (labels[p] += amount);
                        return this._uncache(!0)
                    },
                    p._kill = function (vars, target) {
                        if (!vars && !target)
                            return this._enabled(!1, !1);
                        for (var tweens = target ? this.getTweensOf(target) : this.getChildren(!0, !0, !1), i = tweens.length, changed = !1; --i > -1;)
                            tweens[i]._kill(vars, target) && (changed = !0);
                        return changed
                    },
                    p.clear = function (labels) {
                        var tweens = this.getChildren(!1, !0, !0),
                            i = tweens.length;
                        for (this._time = this._totalTime = 0; --i > -1;)
                            tweens[i]._enabled(!1, !1);
                        return labels !== !1 && (this._labels = {}),
                            this._uncache(!0)
                    },
                    p.invalidate = function () {
                        for (var tween = this._first; tween;)
                            tween.invalidate(),
                            tween = tween._next;
                        return Animation.prototype.invalidate.call(this)
                    },
                    p._enabled = function (enabled, ignoreTimeline) {
                        if (enabled === this._gc)
                            for (var tween = this._first; tween;)
                                tween._enabled(enabled, !0),
                                tween = tween._next;
                        return SimpleTimeline.prototype._enabled.call(this, enabled, ignoreTimeline)
                    },
                    p.totalTime = function (time, suppressEvents, uncapped) {
                        this._forcingPlayhead = !0;
                        var val = Animation.prototype.totalTime.apply(this, arguments);
                        return this._forcingPlayhead = !1,
                            val
                    },
                    p.duration = function (value) {
                        return arguments.length ? (0 !== this.duration() && 0 !== value && this.timeScale(this._duration / value),
                            this) : (this._dirty && this.totalDuration(),
                            this._duration)
                    },
                    p.totalDuration = function (value) {
                        if (!arguments.length) {
                            if (this._dirty) {
                                for (var prev, end, max = 0, tween = this._last, prevStart = 999999999999; tween;)
                                    prev = tween._prev,
                                    tween._dirty && tween.totalDuration(),
                                    tween._startTime > prevStart && this._sortChildren && !tween._paused ? this.add(tween, tween._startTime - tween._delay) : prevStart = tween._startTime,
                                    tween._startTime < 0 && !tween._paused && (max -= tween._startTime,
                                        this._timeline.smoothChildTiming && (this._startTime += tween._startTime / this._timeScale),
                                        this.shiftChildren(-tween._startTime, !1, -9999999999),
                                        prevStart = 0),
                                    end = tween._startTime + tween._totalDuration / tween._timeScale,
                                    end > max && (max = end),
                                    tween = prev;
                                this._duration = this._totalDuration = max,
                                    this._dirty = !1
                            }
                            return this._totalDuration
                        }
                        return 0 !== this.totalDuration() && 0 !== value && this.timeScale(this._totalDuration / value),
                            this
                    },
                    p.paused = function (value) {
                        if (!value)
                            for (var tween = this._first, time = this._time; tween;)
                                tween._startTime === time && "isPause" === tween.data && (tween._rawPrevTime = 0),
                                tween = tween._next;
                        return Animation.prototype.paused.apply(this, arguments)
                    },
                    p.usesFrames = function () {
                        for (var tl = this._timeline; tl._timeline;)
                            tl = tl._timeline;
                        return tl === Animation._rootFramesTimeline
                    },
                    p.rawTime = function () {
                        return this._paused ? this._totalTime : (this._timeline.rawTime() - this._startTime) * this._timeScale
                    },
                    TimelineLite
            }, !0),
            _gsScope._gsDefine("TimelineMax", ["TimelineLite", "TweenLite", "easing.Ease"], function (TimelineLite, TweenLite, Ease) {
                var TimelineMax = function (vars) {
                        TimelineLite.call(this, vars),
                            this._repeat = this.vars.repeat || 0,
                            this._repeatDelay = this.vars.repeatDelay || 0,
                            this._cycle = 0,
                            this._yoyo = this.vars.yoyo === !0,
                            this._dirty = !0
                    },
                    _tinyNum = 1e-10,
                    TweenLiteInternals = TweenLite._internals,
                    _lazyTweens = TweenLiteInternals.lazyTweens,
                    _lazyRender = TweenLiteInternals.lazyRender,
                    _easeNone = new Ease(null, null, 1, 0),
                    p = TimelineMax.prototype = new TimelineLite;
                return p.constructor = TimelineMax,
                    p.kill()._gc = !1,
                    TimelineMax.version = "1.17.0",
                    p.invalidate = function () {
                        return this._yoyo = this.vars.yoyo === !0,
                            this._repeat = this.vars.repeat || 0,
                            this._repeatDelay = this.vars.repeatDelay || 0,
                            this._uncache(!0),
                            TimelineLite.prototype.invalidate.call(this)
                    },
                    p.addCallback = function (callback, position, params, scope) {
                        return this.add(TweenLite.delayedCall(0, callback, params, scope), position)
                    },
                    p.removeCallback = function (callback, position) {
                        if (callback)
                            if (null == position)
                                this._kill(null, callback);
                            else
                                for (var a = this.getTweensOf(callback, !1), i = a.length, time = this._parseTimeOrLabel(position); --i > -1;)
                                    a[i]._startTime === time && a[i]._enabled(!1, !1);
                        return this
                    },
                    p.removePause = function (position) {
                        return this.removeCallback(TimelineLite._internals.pauseCallback, position)
                    },
                    p.tweenTo = function (position, vars) {
                        vars = vars || {};
                        var duration, p, t, copy = {
                            ease: _easeNone,
                            useFrames: this.usesFrames(),
                            immediateRender: !1
                        };
                        for (p in vars)
                            copy[p] = vars[p];
                        return copy.time = this._parseTimeOrLabel(position),
                            duration = Math.abs(Number(copy.time) - this._time) / this._timeScale || .001,
                            t = new TweenLite(this, duration, copy),
                            copy.onStart = function () {
                                t.target.paused(!0),
                                    t.vars.time !== t.target.time() && duration === t.duration() && t.duration(Math.abs(t.vars.time - t.target.time()) / t.target._timeScale),
                                    vars.onStart && t._callback("onStart")
                            },
                            t
                    },
                    p.tweenFromTo = function (fromPosition, toPosition, vars) {
                        vars = vars || {},
                            fromPosition = this._parseTimeOrLabel(fromPosition),
                            vars.startAt = {
                                onComplete: this.seek,
                                onCompleteParams: [fromPosition],
                                callbackScope: this
                            },
                            vars.immediateRender = vars.immediateRender !== !1;
                        var t = this.tweenTo(toPosition, vars);
                        return t.duration(Math.abs(t.vars.time - fromPosition) / this._timeScale || .001)
                    },
                    p.render = function (time, suppressEvents, force) {
                        this._gc && this._enabled(!0, !1);
                        var tween, isComplete, next, callback, internalForce, cycleDuration, totalDur = this._dirty ? this.totalDuration() : this._totalDuration,
                            dur = this._duration,
                            prevTime = this._time,
                            prevTotalTime = this._totalTime,
                            prevStart = this._startTime,
                            prevTimeScale = this._timeScale,
                            prevRawPrevTime = this._rawPrevTime,
                            prevPaused = this._paused,
                            prevCycle = this._cycle;
                        if (time >= totalDur)
                            this._locked || (this._totalTime = totalDur,
                                this._cycle = this._repeat),
                            this._reversed || this._hasPausedChild() || (isComplete = !0,
                                callback = "onComplete",
                                internalForce = !!this._timeline.autoRemoveChildren,
                                0 === this._duration && (0 === time || 0 > prevRawPrevTime || prevRawPrevTime === _tinyNum) && prevRawPrevTime !== time && this._first && (internalForce = !0,
                                    prevRawPrevTime > _tinyNum && (callback = "onReverseComplete"))),
                            this._rawPrevTime = this._duration || !suppressEvents || time || this._rawPrevTime === time ? time : _tinyNum,
                            this._yoyo && 0 !== (1 & this._cycle) ? this._time = time = 0 : (this._time = dur,
                                time = dur + 1e-4);
                        else if (1e-7 > time)
                            if (this._locked || (this._totalTime = this._cycle = 0),
                                this._time = 0,
                                (0 !== prevTime || 0 === dur && prevRawPrevTime !== _tinyNum && (prevRawPrevTime > 0 || 0 > time && prevRawPrevTime >= 0) && !this._locked) && (callback = "onReverseComplete",
                                    isComplete = this._reversed),
                                0 > time)
                                this._active = !1,
                                this._timeline.autoRemoveChildren && this._reversed ? (internalForce = isComplete = !0,
                                    callback = "onReverseComplete") : prevRawPrevTime >= 0 && this._first && (internalForce = !0),
                                this._rawPrevTime = time;
                            else {
                                if (this._rawPrevTime = dur || !suppressEvents || time || this._rawPrevTime === time ? time : _tinyNum,
                                    0 === time && isComplete)
                                    for (tween = this._first; tween && 0 === tween._startTime;)
                                        tween._duration || (isComplete = !1),
                                        tween = tween._next;
                                time = 0,
                                    this._initted || (internalForce = !0)
                            }
                        else
                            0 === dur && 0 > prevRawPrevTime && (internalForce = !0),
                            this._time = this._rawPrevTime = time,
                            this._locked || (this._totalTime = time,
                                0 !== this._repeat && (cycleDuration = dur + this._repeatDelay,
                                    this._cycle = this._totalTime / cycleDuration >> 0,
                                    0 !== this._cycle && this._cycle === this._totalTime / cycleDuration && this._cycle--,
                                    this._time = this._totalTime - this._cycle * cycleDuration,
                                    this._yoyo && 0 !== (1 & this._cycle) && (this._time = dur - this._time),
                                    this._time > dur ? (this._time = dur,
                                        time = dur + 1e-4) : this._time < 0 ? this._time = time = 0 : time = this._time));
                        if (this._cycle !== prevCycle && !this._locked) {
                            var backwards = this._yoyo && 0 !== (1 & prevCycle),
                                wrap = backwards === (this._yoyo && 0 !== (1 & this._cycle)),
                                recTotalTime = this._totalTime,
                                recCycle = this._cycle,
                                recRawPrevTime = this._rawPrevTime,
                                recTime = this._time;
                            if (this._totalTime = prevCycle * dur,
                                this._cycle < prevCycle ? backwards = !backwards : this._totalTime += dur,
                                this._time = prevTime,
                                this._rawPrevTime = 0 === dur ? prevRawPrevTime - 1e-4 : prevRawPrevTime,
                                this._cycle = prevCycle,
                                this._locked = !0,
                                prevTime = backwards ? 0 : dur,
                                this.render(prevTime, suppressEvents, 0 === dur),
                                suppressEvents || this._gc || this.vars.onRepeat && this._callback("onRepeat"),
                                wrap && (prevTime = backwards ? dur + 1e-4 : -1e-4,
                                    this.render(prevTime, !0, !1)),
                                this._locked = !1,
                                this._paused && !prevPaused)
                                return;
                            this._time = recTime,
                                this._totalTime = recTotalTime,
                                this._cycle = recCycle,
                                this._rawPrevTime = recRawPrevTime
                        }
                        if (!(this._time !== prevTime && this._first || force || internalForce))
                            return void(prevTotalTime !== this._totalTime && this._onUpdate && (suppressEvents || this._callback("onUpdate")));
                        if (this._initted || (this._initted = !0),
                            this._active || !this._paused && this._totalTime !== prevTotalTime && time > 0 && (this._active = !0),
                            0 === prevTotalTime && this.vars.onStart && 0 !== this._totalTime && (suppressEvents || this._callback("onStart")),
                            this._time >= prevTime)
                            for (tween = this._first; tween && (next = tween._next,
                                    !this._paused || prevPaused);)
                                (tween._active || tween._startTime <= this._time && !tween._paused && !tween._gc) && (tween._reversed ? tween.render((tween._dirty ? tween.totalDuration() : tween._totalDuration) - (time - tween._startTime) * tween._timeScale, suppressEvents, force) : tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force)),
                                tween = next;
                        else
                            for (tween = this._last; tween && (next = tween._prev,
                                    !this._paused || prevPaused);)
                                (tween._active || tween._startTime <= prevTime && !tween._paused && !tween._gc) && (tween._reversed ? tween.render((tween._dirty ? tween.totalDuration() : tween._totalDuration) - (time - tween._startTime) * tween._timeScale, suppressEvents, force) : tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force)),
                                tween = next;
                        this._onUpdate && (suppressEvents || (_lazyTweens.length && _lazyRender(),
                                this._callback("onUpdate"))),
                            callback && (this._locked || this._gc || (prevStart === this._startTime || prevTimeScale !== this._timeScale) && (0 === this._time || totalDur >= this.totalDuration()) && (isComplete && (_lazyTweens.length && _lazyRender(),
                                    this._timeline.autoRemoveChildren && this._enabled(!1, !1),
                                    this._active = !1),
                                !suppressEvents && this.vars[callback] && this._callback(callback)))
                    },
                    p.getActive = function (nested, tweens, timelines) {
                        null == nested && (nested = !0),
                            null == tweens && (tweens = !0),
                            null == timelines && (timelines = !1);
                        var i, tween, a = [],
                            all = this.getChildren(nested, tweens, timelines),
                            cnt = 0,
                            l = all.length;
                        for (i = 0; l > i; i++)
                            tween = all[i],
                            tween.isActive() && (a[cnt++] = tween);
                        return a
                    },
                    p.getLabelAfter = function (time) {
                        time || 0 !== time && (time = this._time);
                        var i, labels = this.getLabelsArray(),
                            l = labels.length;
                        for (i = 0; l > i; i++)
                            if (labels[i].time > time)
                                return labels[i].name;
                        return null
                    },
                    p.getLabelBefore = function (time) {
                        null == time && (time = this._time);
                        for (var labels = this.getLabelsArray(), i = labels.length; --i > -1;)
                            if (labels[i].time < time)
                                return labels[i].name;
                        return null
                    },
                    p.getLabelsArray = function () {
                        var p, a = [],
                            cnt = 0;
                        for (p in this._labels)
                            a[cnt++] = {
                                time: this._labels[p],
                                name: p
                            };
                        return a.sort(function (a, b) {
                                return a.time - b.time
                            }),
                            a
                    },
                    p.progress = function (value, suppressEvents) {
                        return arguments.length ? this.totalTime(this.duration() * (this._yoyo && 0 !== (1 & this._cycle) ? 1 - value : value) + this._cycle * (this._duration + this._repeatDelay), suppressEvents) : this._time / this.duration()
                    },
                    p.totalProgress = function (value, suppressEvents) {
                        return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this._totalTime / this.totalDuration()
                    },
                    p.totalDuration = function (value) {
                        return arguments.length ? -1 === this._repeat ? this : this.duration((value - this._repeat * this._repeatDelay) / (this._repeat + 1)) : (this._dirty && (TimelineLite.prototype.totalDuration.call(this),
                                this._totalDuration = -1 === this._repeat ? 999999999999 : this._duration * (this._repeat + 1) + this._repeatDelay * this._repeat),
                            this._totalDuration)
                    },
                    p.time = function (value, suppressEvents) {
                        return arguments.length ? (this._dirty && this.totalDuration(),
                            value > this._duration && (value = this._duration),
                            this._yoyo && 0 !== (1 & this._cycle) ? value = this._duration - value + this._cycle * (this._duration + this._repeatDelay) : 0 !== this._repeat && (value += this._cycle * (this._duration + this._repeatDelay)),
                            this.totalTime(value, suppressEvents)) : this._time
                    },
                    p.repeat = function (value) {
                        return arguments.length ? (this._repeat = value,
                            this._uncache(!0)) : this._repeat
                    },
                    p.repeatDelay = function (value) {
                        return arguments.length ? (this._repeatDelay = value,
                            this._uncache(!0)) : this._repeatDelay
                    },
                    p.yoyo = function (value) {
                        return arguments.length ? (this._yoyo = value,
                            this) : this._yoyo
                    },
                    p.currentLabel = function (value) {
                        return arguments.length ? this.seek(value, !0) : this.getLabelBefore(this._time + 1e-8)
                    },
                    TimelineMax
            }, !0),
            function () {
                var _RAD2DEG = 180 / Math.PI,
                    _r1 = [],
                    _r2 = [],
                    _r3 = [],
                    _corProps = {},
                    _globals = _gsScope._gsDefine.globals,
                    Segment = function (a, b, c, d) {
                        this.a = a,
                            this.b = b,
                            this.c = c,
                            this.d = d,
                            this.da = d - a,
                            this.ca = c - a,
                            this.ba = b - a
                    },
                    _correlate = ",x,y,z,left,top,right,bottom,marginTop,marginLeft,marginRight,marginBottom,paddingLeft,paddingTop,paddingRight,paddingBottom,backgroundPosition,backgroundPosition_y,",
                    cubicToQuadratic = function (a, b, c, d) {
                        var q1 = {
                                a: a
                            },
                            q2 = {},
                            q3 = {},
                            q4 = {
                                c: d
                            },
                            mab = (a + b) / 2,
                            mbc = (b + c) / 2,
                            mcd = (c + d) / 2,
                            mabc = (mab + mbc) / 2,
                            mbcd = (mbc + mcd) / 2,
                            m8 = (mbcd - mabc) / 8;
                        return q1.b = mab + (a - mab) / 4,
                            q2.b = mabc + m8,
                            q1.c = q2.a = (q1.b + q2.b) / 2,
                            q2.c = q3.a = (mabc + mbcd) / 2,
                            q3.b = mbcd - m8,
                            q4.b = mcd + (d - mcd) / 4,
                            q3.c = q4.a = (q3.b + q4.b) / 2,
                            [q1, q2, q3, q4]
                    },
                    _calculateControlPoints = function (a, curviness, quad, basic, correlate) {
                        var i, p1, p2, p3, seg, m1, m2, mm, cp2, qb, r1, r2, tl, l = a.length - 1,
                            ii = 0,
                            cp1 = a[0].a;
                        for (i = 0; l > i; i++)
                            seg = a[ii],
                            p1 = seg.a,
                            p2 = seg.d,
                            p3 = a[ii + 1].d,
                            correlate ? (r1 = _r1[i],
                                r2 = _r2[i],
                                tl = (r2 + r1) * curviness * .25 / (basic ? .5 : _r3[i] || .5),
                                m1 = p2 - (p2 - p1) * (basic ? .5 * curviness : 0 !== r1 ? tl / r1 : 0),
                                m2 = p2 + (p3 - p2) * (basic ? .5 * curviness : 0 !== r2 ? tl / r2 : 0),
                                mm = p2 - (m1 + ((m2 - m1) * (3 * r1 / (r1 + r2) + .5) / 4 || 0))) : (m1 = p2 - (p2 - p1) * curviness * .5,
                                m2 = p2 + (p3 - p2) * curviness * .5,
                                mm = p2 - (m1 + m2) / 2),
                            m1 += mm,
                            m2 += mm,
                            seg.c = cp2 = m1,
                            0 !== i ? seg.b = cp1 : seg.b = cp1 = seg.a + .6 * (seg.c - seg.a),
                            seg.da = p2 - p1,
                            seg.ca = cp2 - p1,
                            seg.ba = cp1 - p1,
                            quad ? (qb = cubicToQuadratic(p1, cp1, cp2, p2),
                                a.splice(ii, 1, qb[0], qb[1], qb[2], qb[3]),
                                ii += 4) : ii++,
                            cp1 = m2;
                        seg = a[ii],
                            seg.b = cp1,
                            seg.c = cp1 + .4 * (seg.d - cp1),
                            seg.da = seg.d - seg.a,
                            seg.ca = seg.c - seg.a,
                            seg.ba = cp1 - seg.a,
                            quad && (qb = cubicToQuadratic(seg.a, cp1, seg.c, seg.d),
                                a.splice(ii, 1, qb[0], qb[1], qb[2], qb[3]))
                    },
                    _parseAnchors = function (values, p, correlate, prepend) {
                        var l, i, p1, p2, p3, tmp, a = [];
                        if (prepend)
                            for (values = [prepend].concat(values),
                                i = values.length; --i > -1;)
                                "string" == typeof (tmp = values[i][p]) && "=" === tmp.charAt(1) && (values[i][p] = prepend[p] + Number(tmp.charAt(0) + tmp.substr(2)));
                        if (l = values.length - 2,
                            0 > l)
                            return a[0] = new Segment(values[0][p], 0, 0, values[-1 > l ? 0 : 1][p]),
                                a;
                        for (i = 0; l > i; i++)
                            p1 = values[i][p],
                            p2 = values[i + 1][p],
                            a[i] = new Segment(p1, 0, 0, p2),
                            correlate && (p3 = values[i + 2][p],
                                _r1[i] = (_r1[i] || 0) + (p2 - p1) * (p2 - p1),
                                _r2[i] = (_r2[i] || 0) + (p3 - p2) * (p3 - p2));
                        return a[i] = new Segment(values[i][p], 0, 0, values[i + 1][p]),
                            a
                    },
                    bezierThrough = function (values, curviness, quadratic, basic, correlate, prepend) {
                        var i, p, a, j, r, l, seamless, last, obj = {},
                            props = [],
                            first = prepend || values[0];
                        correlate = "string" == typeof correlate ? "," + correlate + "," : _correlate,
                            null == curviness && (curviness = 1);
                        for (p in values[0])
                            props.push(p);
                        if (values.length > 1) {
                            for (last = values[values.length - 1],
                                seamless = !0,
                                i = props.length; --i > -1;)
                                if (p = props[i],
                                    Math.abs(first[p] - last[p]) > .05) {
                                    seamless = !1;
                                    break
                                }
                            seamless && (values = values.concat(),
                                prepend && values.unshift(prepend),
                                values.push(values[1]),
                                prepend = values[values.length - 3])
                        }
                        for (_r1.length = _r2.length = _r3.length = 0,
                            i = props.length; --i > -1;)
                            p = props[i],
                            _corProps[p] = -1 !== correlate.indexOf("," + p + ","),
                            obj[p] = _parseAnchors(values, p, _corProps[p], prepend);
                        for (i = _r1.length; --i > -1;)
                            _r1[i] = Math.sqrt(_r1[i]),
                            _r2[i] = Math.sqrt(_r2[i]);
                        if (!basic) {
                            for (i = props.length; --i > -1;)
                                if (_corProps[p])
                                    for (a = obj[props[i]],
                                        l = a.length - 1,
                                        j = 0; l > j; j++)
                                        r = a[j + 1].da / _r2[j] + a[j].da / _r1[j],
                                        _r3[j] = (_r3[j] || 0) + r * r;
                            for (i = _r3.length; --i > -1;)
                                _r3[i] = Math.sqrt(_r3[i])
                        }
                        for (i = props.length,
                            j = quadratic ? 4 : 1; --i > -1;)
                            p = props[i],
                            a = obj[p],
                            _calculateControlPoints(a, curviness, quadratic, basic, _corProps[p]),
                            seamless && (a.splice(0, j),
                                a.splice(a.length - j, j));
                        return obj
                    },
                    _parseBezierData = function (values, type, prepend) {
                        type = type || "soft";
                        var a, b, c, d, cur, i, j, l, p, cnt, tmp, obj = {},
                            inc = "cubic" === type ? 3 : 2,
                            soft = "soft" === type,
                            props = [];
                        if (soft && prepend && (values = [prepend].concat(values)),
                            null == values || values.length < inc + 1)
                            throw "invalid Bezier data";
                        for (p in values[0])
                            props.push(p);
                        for (i = props.length; --i > -1;) {
                            for (p = props[i],
                                obj[p] = cur = [],
                                cnt = 0,
                                l = values.length,
                                j = 0; l > j; j++)
                                a = null == prepend ? values[j][p] : "string" == typeof (tmp = values[j][p]) && "=" === tmp.charAt(1) ? prepend[p] + Number(tmp.charAt(0) + tmp.substr(2)) : Number(tmp),
                                soft && j > 1 && l - 1 > j && (cur[cnt++] = (a + cur[cnt - 2]) / 2),
                                cur[cnt++] = a;
                            for (l = cnt - inc + 1,
                                cnt = 0,
                                j = 0; l > j; j += inc)
                                a = cur[j],
                                b = cur[j + 1],
                                c = cur[j + 2],
                                d = 2 === inc ? 0 : cur[j + 3],
                                cur[cnt++] = tmp = 3 === inc ? new Segment(a, b, c, d) : new Segment(a, (2 * b + a) / 3, (2 * b + c) / 3, c);
                            cur.length = cnt
                        }
                        return obj
                    },
                    _addCubicLengths = function (a, steps, resolution) {
                        for (var d, d1, s, da, ca, ba, p, i, inv, bez, index, inc = 1 / resolution, j = a.length; --j > -1;)
                            for (bez = a[j],
                                s = bez.a,
                                da = bez.d - s,
                                ca = bez.c - s,
                                ba = bez.b - s,
                                d = d1 = 0,
                                i = 1; resolution >= i; i++)
                                p = inc * i,
                                inv = 1 - p,
                                d = d1 - (d1 = (p * p * da + 3 * inv * (p * ca + inv * ba)) * p),
                                index = j * resolution + i - 1,
                                steps[index] = (steps[index] || 0) + d * d
                    },
                    _parseLengthData = function (obj, resolution) {
                        resolution = resolution >> 0 || 6;
                        var p, i, l, index, a = [],
                            lengths = [],
                            d = 0,
                            total = 0,
                            threshold = resolution - 1,
                            segments = [],
                            curLS = [];
                        for (p in obj)
                            _addCubicLengths(obj[p], a, resolution);
                        for (l = a.length,
                            i = 0; l > i; i++)
                            d += Math.sqrt(a[i]),
                            index = i % resolution,
                            curLS[index] = d,
                            index === threshold && (total += d,
                                index = i / resolution >> 0,
                                segments[index] = curLS,
                                lengths[index] = total,
                                d = 0,
                                curLS = []);
                        return {
                            length: total,
                            lengths: lengths,
                            segments: segments
                        }
                    },
                    BezierPlugin = _gsScope._gsDefine.plugin({
                        propName: "bezier",
                        priority: -1,
                        version: "1.3.4",
                        API: 2,
                        global: !0,
                        init: function (target, vars, tween) {
                            this._target = target,
                                vars instanceof Array && (vars = {
                                    values: vars
                                }),
                                this._func = {},
                                this._round = {},
                                this._props = [],
                                this._timeRes = null == vars.timeResolution ? 6 : parseInt(vars.timeResolution, 10);
                            var p, isFunc, i, j, prepend, values = vars.values || [],
                                first = {},
                                second = values[0],
                                autoRotate = vars.autoRotate || tween.vars.orientToBezier;
                            this._autoRotate = autoRotate ? autoRotate instanceof Array ? autoRotate : [
                                ["x", "y", "rotation", autoRotate === !0 ? 0 : Number(autoRotate) || 0]
                            ] : null;
                            for (p in second)
                                this._props.push(p);
                            for (i = this._props.length; --i > -1;)
                                p = this._props[i],
                                this._overwriteProps.push(p),
                                isFunc = this._func[p] = "function" == typeof target[p],
                                first[p] = isFunc ? target[p.indexOf("set") || "function" != typeof target["get" + p.substr(3)] ? p : "get" + p.substr(3)]() : parseFloat(target[p]),
                                prepend || first[p] !== values[0][p] && (prepend = first);
                            if (this._beziers = "cubic" !== vars.type && "quadratic" !== vars.type && "soft" !== vars.type ? bezierThrough(values, isNaN(vars.curviness) ? 1 : vars.curviness, !1, "thruBasic" === vars.type, vars.correlate, prepend) : _parseBezierData(values, vars.type, first),
                                this._segCount = this._beziers[p].length,
                                this._timeRes) {
                                var ld = _parseLengthData(this._beziers, this._timeRes);
                                this._length = ld.length,
                                    this._lengths = ld.lengths,
                                    this._segments = ld.segments,
                                    this._l1 = this._li = this._s1 = this._si = 0,
                                    this._l2 = this._lengths[0],
                                    this._curSeg = this._segments[0],
                                    this._s2 = this._curSeg[0],
                                    this._prec = 1 / this._curSeg.length
                            }
                            if (autoRotate = this._autoRotate)
                                for (this._initialRotations = [],
                                    autoRotate[0] instanceof Array || (this._autoRotate = autoRotate = [autoRotate]),
                                    i = autoRotate.length; --i > -1;) {
                                    for (j = 0; 3 > j; j++)
                                        p = autoRotate[i][j],
                                        this._func[p] = "function" == typeof target[p] ? target[p.indexOf("set") || "function" != typeof target["get" + p.substr(3)] ? p : "get" + p.substr(3)] : !1;
                                    p = autoRotate[i][2],
                                        this._initialRotations[i] = this._func[p] ? this._func[p].call(this._target) : this._target[p]
                                }
                            return this._startRatio = tween.vars.runBackwards ? 1 : 0,
                                !0
                        },
                        set: function (v) {
                            var curIndex, inv, i, p, b, t, val, l, lengths, curSeg, segments = this._segCount,
                                func = this._func,
                                target = this._target,
                                notStart = v !== this._startRatio;
                            if (this._timeRes) {
                                if (lengths = this._lengths,
                                    curSeg = this._curSeg,
                                    v *= this._length,
                                    i = this._li,
                                    v > this._l2 && segments - 1 > i) {
                                    for (l = segments - 1; l > i && (this._l2 = lengths[++i]) <= v;)
                                    ;
                                    this._l1 = lengths[i - 1],
                                        this._li = i,
                                        this._curSeg = curSeg = this._segments[i],
                                        this._s2 = curSeg[this._s1 = this._si = 0]
                                } else if (v < this._l1 && i > 0) {
                                    for (; i > 0 && (this._l1 = lengths[--i]) >= v;)
                                    ;
                                    0 === i && v < this._l1 ? this._l1 = 0 : i++,
                                        this._l2 = lengths[i],
                                        this._li = i,
                                        this._curSeg = curSeg = this._segments[i],
                                        this._s1 = curSeg[(this._si = curSeg.length - 1) - 1] || 0,
                                        this._s2 = curSeg[this._si]
                                }
                                if (curIndex = i,
                                    v -= this._l1,
                                    i = this._si,
                                    v > this._s2 && i < curSeg.length - 1) {
                                    for (l = curSeg.length - 1; l > i && (this._s2 = curSeg[++i]) <= v;)
                                    ;
                                    this._s1 = curSeg[i - 1],
                                        this._si = i
                                } else if (v < this._s1 && i > 0) {
                                    for (; i > 0 && (this._s1 = curSeg[--i]) >= v;)
                                    ;
                                    0 === i && v < this._s1 ? this._s1 = 0 : i++,
                                        this._s2 = curSeg[i],
                                        this._si = i
                                }
                                t = (i + (v - this._s1) / (this._s2 - this._s1)) * this._prec
                            } else
                                curIndex = 0 > v ? 0 : v >= 1 ? segments - 1 : segments * v >> 0,
                                t = (v - curIndex * (1 / segments)) * segments;
                            for (inv = 1 - t,
                                i = this._props.length; --i > -1;)
                                p = this._props[i],
                                b = this._beziers[p][curIndex],
                                val = (t * t * b.da + 3 * inv * (t * b.ca + inv * b.ba)) * t + b.a,
                                this._round[p] && (val = Math.round(val)),
                                func[p] ? target[p](val) : target[p] = val;
                            if (this._autoRotate) {
                                var b2, x1, y1, x2, y2, add, conv, ar = this._autoRotate;
                                for (i = ar.length; --i > -1;)
                                    p = ar[i][2],
                                    add = ar[i][3] || 0,
                                    conv = ar[i][4] === !0 ? 1 : _RAD2DEG,
                                    b = this._beziers[ar[i][0]],
                                    b2 = this._beziers[ar[i][1]],
                                    b && b2 && (b = b[curIndex],
                                        b2 = b2[curIndex],
                                        x1 = b.a + (b.b - b.a) * t,
                                        x2 = b.b + (b.c - b.b) * t,
                                        x1 += (x2 - x1) * t,
                                        x2 += (b.c + (b.d - b.c) * t - x2) * t,
                                        y1 = b2.a + (b2.b - b2.a) * t,
                                        y2 = b2.b + (b2.c - b2.b) * t,
                                        y1 += (y2 - y1) * t,
                                        y2 += (b2.c + (b2.d - b2.c) * t - y2) * t,
                                        val = notStart ? Math.atan2(y2 - y1, x2 - x1) * conv + add : this._initialRotations[i],
                                        func[p] ? target[p](val) : target[p] = val)
                            }
                        }
                    }),
                    p = BezierPlugin.prototype;
                BezierPlugin.bezierThrough = bezierThrough,
                    BezierPlugin.cubicToQuadratic = cubicToQuadratic,
                    BezierPlugin._autoCSS = !0,
                    BezierPlugin.quadraticToCubic = function (a, b, c) {
                        return new Segment(a, (2 * b + a) / 3, (2 * b + c) / 3, c)
                    },
                    BezierPlugin._cssRegister = function () {
                        var CSSPlugin = _globals.CSSPlugin;
                        if (CSSPlugin) {
                            var _internals = CSSPlugin._internals,
                                _parseToProxy = _internals._parseToProxy,
                                _setPluginRatio = _internals._setPluginRatio,
                                CSSPropTween = _internals.CSSPropTween;
                            _internals._registerComplexSpecialProp("bezier", {
                                parser: function (t, e, prop, cssp, pt, plugin) {
                                    e instanceof Array && (e = {
                                            values: e
                                        }),
                                        plugin = new BezierPlugin;
                                    var i, p, data, values = e.values,
                                        l = values.length - 1,
                                        pluginValues = [],
                                        v = {};
                                    if (0 > l)
                                        return pt;
                                    for (i = 0; l >= i; i++)
                                        data = _parseToProxy(t, values[i], cssp, pt, plugin, l !== i),
                                        pluginValues[i] = data.end;
                                    for (p in e)
                                        v[p] = e[p];
                                    return v.values = pluginValues,
                                        pt = new CSSPropTween(t, "bezier", 0, 0, data.pt, 2),
                                        pt.data = data,
                                        pt.plugin = plugin,
                                        pt.setRatio = _setPluginRatio,
                                        0 === v.autoRotate && (v.autoRotate = !0),
                                        !v.autoRotate || v.autoRotate instanceof Array || (i = v.autoRotate === !0 ? 0 : Number(v.autoRotate),
                                            v.autoRotate = null != data.end.left ? [
                                                ["left", "top", "rotation", i, !1]
                                            ] : null != data.end.x ? [
                                                ["x", "y", "rotation", i, !1]
                                            ] : !1),
                                        v.autoRotate && (cssp._transform || cssp._enableTransforms(!1),
                                            data.autoRotate = cssp._target._gsTransform),
                                        plugin._onInitTween(data.proxy, v, cssp._tween),
                                        pt
                                }
                            })
                        }
                    },
                    p._roundProps = function (lookup, value) {
                        for (var op = this._overwriteProps, i = op.length; --i > -1;)
                            (lookup[op[i]] || lookup.bezier || lookup.bezierThrough) && (this._round[op[i]] = value)
                    },
                    p._kill = function (lookup) {
                        var p, i, a = this._props;
                        for (p in this._beziers)
                            if (p in lookup)
                                for (delete this._beziers[p],
                                    delete this._func[p],
                                    i = a.length; --i > -1;)
                                    a[i] === p && a.splice(i, 1);
                        return this._super._kill.call(this, lookup)
                    }
            }(),
            _gsScope._gsDefine("plugins.CSSPlugin", ["plugins.TweenPlugin", "TweenLite"], function (TweenPlugin, TweenLite) {
                var _hasPriority, _suffixMap, _cs, _overwriteProps, CSSPlugin = function () {
                        TweenPlugin.call(this, "css"),
                            this._overwriteProps.length = 0,
                            this.setRatio = CSSPlugin.prototype.setRatio
                    },
                    _globals = _gsScope._gsDefine.globals,
                    _specialProps = {},
                    p = CSSPlugin.prototype = new TweenPlugin("css");
                p.constructor = CSSPlugin,
                    CSSPlugin.version = "1.17.0",
                    CSSPlugin.API = 2,
                    CSSPlugin.defaultTransformPerspective = 0,
                    CSSPlugin.defaultSkewType = "compensated",
                    CSSPlugin.defaultSmoothOrigin = !0,
                    p = "px",
                    CSSPlugin.suffixMap = {
                        top: p,
                        right: p,
                        bottom: p,
                        left: p,
                        width: p,
                        height: p,
                        fontSize: p,
                        padding: p,
                        margin: p,
                        perspective: p,
                        lineHeight: ""
                    };
                var _autoRound, _reqSafariFix, _isSafari, _isFirefox, _isSafariLT6, _ieVers, _numExp = /(?:\d|\-\d|\.\d|\-\.\d)+/g,
                    _relNumExp = /(?:\d|\-\d|\.\d|\-\.\d|\+=\d|\-=\d|\+=.\d|\-=\.\d)+/g,
                    _valuesExp = /(?:\+=|\-=|\-|\b)[\d\-\.]+[a-zA-Z0-9]*(?:%|\b)/gi,
                    _NaNExp = /(?![+-]?\d*\.?\d+|[+-]|e[+-]\d+)[^0-9]/g,
                    _suffixExp = /(?:\d|\-|\+|=|#|\.)*/g,
                    _opacityExp = /opacity *= *([^)]*)/i,
                    _opacityValExp = /opacity:([^;]*)/i,
                    _alphaFilterExp = /alpha\(opacity *=.+?\)/i,
                    _rgbhslExp = /^(rgb|hsl)/,
                    _capsExp = /([A-Z])/g,
                    _camelExp = /-([a-z])/gi,
                    _urlExp = /(^(?:url\(\"|url\())|(?:(\"\))$|\)$)/gi,
                    _camelFunc = function (s, g) {
                        return g.toUpperCase()
                    },
                    _horizExp = /(?:Left|Right|Width)/i,
                    _ieGetMatrixExp = /(M11|M12|M21|M22)=[\d\-\.e]+/gi,
                    _ieSetMatrixExp = /progid\:DXImageTransform\.Microsoft\.Matrix\(.+?\)/i,
                    _commasOutsideParenExp = /,(?=[^\)]*(?:\(|$))/gi,
                    _DEG2RAD = Math.PI / 180,
                    _RAD2DEG = 180 / Math.PI,
                    _forcePT = {},
                    _doc = document,
                    _createElement = function (type) {
                        return _doc.createElementNS ? _doc.createElementNS("http://www.w3.org/1999/xhtml", type) : _doc.createElement(type)
                    },
                    _tempDiv = _createElement("div"),
                    _tempImg = _createElement("img"),
                    _internals = CSSPlugin._internals = {
                        _specialProps: _specialProps
                    },
                    _agent = navigator.userAgent,
                    _supportsOpacity = function () {
                        var i = _agent.indexOf("Android"),
                            a = _createElement("a");
                        return _isSafari = -1 !== _agent.indexOf("Safari") && -1 === _agent.indexOf("Chrome") && (-1 === i || Number(_agent.substr(i + 8, 1)) > 3),
                            _isSafariLT6 = _isSafari && Number(_agent.substr(_agent.indexOf("Version/") + 8, 1)) < 6,
                            _isFirefox = -1 !== _agent.indexOf("Firefox"),
                            (/MSIE ([0-9]{1,}[\.0-9]{0,})/.exec(_agent) || /Trident\/.*rv:([0-9]{1,}[\.0-9]{0,})/.exec(_agent)) && (_ieVers = parseFloat(RegExp.$1)),
                            a ? (a.style.cssText = "top:1px;opacity:.55;",
                                /^0.55/.test(a.style.opacity)) : !1
                    }(),
                    _getIEOpacity = function (v) {
                        return _opacityExp.test("string" == typeof v ? v : (v.currentStyle ? v.currentStyle.filter : v.style.filter) || "") ? parseFloat(RegExp.$1) / 100 : 1
                    },
                    _log = function (s) {
                        window.console && console.log(s)
                    },
                    _prefixCSS = "",
                    _prefix = "",
                    _checkPropPrefix = function (p, e) {
                        e = e || _tempDiv;
                        var a, i, s = e.style;
                        if (void 0 !== s[p])
                            return p;
                        for (p = p.charAt(0).toUpperCase() + p.substr(1),
                            a = ["O", "Moz", "ms", "Ms", "Webkit"],
                            i = 5; --i > -1 && void 0 === s[a[i] + p];)
                        ;
                        return i >= 0 ? (_prefix = 3 === i ? "ms" : a[i],
                            _prefixCSS = "-" + _prefix.toLowerCase() + "-",
                            _prefix + p) : null
                    },
                    _getComputedStyle = _doc.defaultView ? _doc.defaultView.getComputedStyle : function () {},
                    _getStyle = CSSPlugin.getStyle = function (t, p, cs, calc, dflt) {
                        var rv;
                        return _supportsOpacity || "opacity" !== p ? (!calc && t.style[p] ? rv = t.style[p] : (cs = cs || _getComputedStyle(t)) ? rv = cs[p] || cs.getPropertyValue(p) || cs.getPropertyValue(p.replace(_capsExp, "-$1").toLowerCase()) : t.currentStyle && (rv = t.currentStyle[p]),
                            null == dflt || rv && "none" !== rv && "auto" !== rv && "auto auto" !== rv ? rv : dflt) : _getIEOpacity(t)
                    },
                    _convertToPixels = _internals.convertToPixels = function (t, p, v, sfx, recurse) {
                        if ("px" === sfx || !sfx)
                            return v;
                        if ("auto" === sfx || !v)
                            return 0;
                        var pix, cache, time, horiz = _horizExp.test(p),
                            node = t,
                            style = _tempDiv.style,
                            neg = 0 > v;
                        if (neg && (v = -v),
                            "%" === sfx && -1 !== p.indexOf("border"))
                            pix = v / 100 * (horiz ? t.clientWidth : t.clientHeight);
                        else {
                            if (style.cssText = "border:0 solid red;position:" + _getStyle(t, "position") + ";line-height:0;",
                                "%" !== sfx && node.appendChild)
                                style[horiz ? "borderLeftWidth" : "borderTopWidth"] = v + sfx;
                            else {
                                if (node = t.parentNode || _doc.body,
                                    cache = node._gsCache,
                                    time = TweenLite.ticker.frame,
                                    cache && horiz && cache.time === time)
                                    return cache.width * v / 100;
                                style[horiz ? "width" : "height"] = v + sfx
                            }
                            node.appendChild(_tempDiv),
                                pix = parseFloat(_tempDiv[horiz ? "offsetWidth" : "offsetHeight"]),
                                node.removeChild(_tempDiv),
                                horiz && "%" === sfx && CSSPlugin.cacheWidths !== !1 && (cache = node._gsCache = node._gsCache || {},
                                    cache.time = time,
                                    cache.width = pix / v * 100),
                                0 !== pix || recurse || (pix = _convertToPixels(t, p, v, sfx, !0))
                        }
                        return neg ? -pix : pix
                    },
                    _calculateOffset = _internals.calculateOffset = function (t, p, cs) {
                        if ("absolute" !== _getStyle(t, "position", cs))
                            return 0;
                        var dim = "left" === p ? "Left" : "Top",
                            v = _getStyle(t, "margin" + dim, cs);
                        return t["offset" + dim] - (_convertToPixels(t, p, parseFloat(v), v.replace(_suffixExp, "")) || 0)
                    },
                    _getAllStyles = function (t, cs) {
                        var i, tr, p, s = {};
                        if (cs = cs || _getComputedStyle(t, null))
                            if (i = cs.length)
                                for (; --i > -1;)
                                    p = cs[i],
                                    (-1 === p.indexOf("-transform") || _transformPropCSS === p) && (s[p.replace(_camelExp, _camelFunc)] = cs.getPropertyValue(p));
                            else
                                for (i in cs)
                                    (-1 === i.indexOf("Transform") || _transformProp === i) && (s[i] = cs[i]);
                        else if (cs = t.currentStyle || t.style)
                            for (i in cs)
                                "string" == typeof i && void 0 === s[i] && (s[i.replace(_camelExp, _camelFunc)] = cs[i]);
                        return _supportsOpacity || (s.opacity = _getIEOpacity(t)),
                            tr = _getTransform(t, cs, !1),
                            s.rotation = tr.rotation,
                            s.skewX = tr.skewX,
                            s.scaleX = tr.scaleX,
                            s.scaleY = tr.scaleY,
                            s.x = tr.x,
                            s.y = tr.y,
                            _supports3D && (s.z = tr.z,
                                s.rotationX = tr.rotationX,
                                s.rotationY = tr.rotationY,
                                s.scaleZ = tr.scaleZ),
                            s.filters && delete s.filters,
                            s
                    },
                    _cssDif = function (t, s1, s2, vars, forceLookup) {
                        var val, p, mpt, difs = {},
                            style = t.style;
                        for (p in s2)
                            "cssText" !== p && "length" !== p && isNaN(p) && (s1[p] !== (val = s2[p]) || forceLookup && forceLookup[p]) && -1 === p.indexOf("Origin") && ("number" == typeof val || "string" == typeof val) && (difs[p] = "auto" !== val || "left" !== p && "top" !== p ? "" !== val && "auto" !== val && "none" !== val || "string" != typeof s1[p] || "" === s1[p].replace(_NaNExp, "") ? val : 0 : _calculateOffset(t, p),
                                void 0 !== style[p] && (mpt = new MiniPropTween(style, p, style[p], mpt)));
                        if (vars)
                            for (p in vars)
                                "className" !== p && (difs[p] = vars[p]);
                        return {
                            difs: difs,
                            firstMPT: mpt
                        }
                    },
                    _dimensions = {
                        width: ["Left", "Right"],
                        height: ["Top", "Bottom"]
                    },
                    _margins = ["marginLeft", "marginRight", "marginTop", "marginBottom"],
                    _getDimension = function (t, p, cs) {
                        var v = parseFloat("width" === p ? t.offsetWidth : t.offsetHeight),
                            a = _dimensions[p],
                            i = a.length;
                        for (cs = cs || _getComputedStyle(t, null); --i > -1;)
                            v -= parseFloat(_getStyle(t, "padding" + a[i], cs, !0)) || 0,
                            v -= parseFloat(_getStyle(t, "border" + a[i] + "Width", cs, !0)) || 0;
                        return v
                    },
                    _parsePosition = function (v, recObj) {
                        (null == v || "" === v || "auto" === v || "auto auto" === v) && (v = "0 0");
                        var a = v.split(" "),
                            x = -1 !== v.indexOf("left") ? "0%" : -1 !== v.indexOf("right") ? "100%" : a[0],
                            y = -1 !== v.indexOf("top") ? "0%" : -1 !== v.indexOf("bottom") ? "100%" : a[1];
                        return null == y ? y = "center" === x ? "50%" : "0" : "center" === y && (y = "50%"),
                            ("center" === x || isNaN(parseFloat(x)) && -1 === (x + "").indexOf("=")) && (x = "50%"),
                            v = x + " " + y + (a.length > 2 ? " " + a[2] : ""),
                            recObj && (recObj.oxp = -1 !== x.indexOf("%"),
                                recObj.oyp = -1 !== y.indexOf("%"),
                                recObj.oxr = "=" === x.charAt(1),
                                recObj.oyr = "=" === y.charAt(1),
                                recObj.ox = parseFloat(x.replace(_NaNExp, "")),
                                recObj.oy = parseFloat(y.replace(_NaNExp, "")),
                                recObj.v = v),
                            recObj || v
                    },
                    _parseChange = function (e, b) {
                        return "string" == typeof e && "=" === e.charAt(1) ? parseInt(e.charAt(0) + "1", 10) * parseFloat(e.substr(2)) : parseFloat(e) - parseFloat(b)
                    },
                    _parseVal = function (v, d) {
                        return null == v ? d : "string" == typeof v && "=" === v.charAt(1) ? parseInt(v.charAt(0) + "1", 10) * parseFloat(v.substr(2)) + d : parseFloat(v)
                    },
                    _parseAngle = function (v, d, p, directionalEnd) {
                        var cap, split, dif, result, isRelative, min = 1e-6;
                        return null == v ? result = d : "number" == typeof v ? result = v : (cap = 360,
                                split = v.split("_"),
                                isRelative = "=" === v.charAt(1),
                                dif = (isRelative ? parseInt(v.charAt(0) + "1", 10) * parseFloat(split[0].substr(2)) : parseFloat(split[0])) * (-1 === v.indexOf("rad") ? 1 : _RAD2DEG) - (isRelative ? 0 : d),
                                split.length && (directionalEnd && (directionalEnd[p] = d + dif),
                                    -1 !== v.indexOf("short") && (dif %= cap,
                                        dif !== dif % (cap / 2) && (dif = 0 > dif ? dif + cap : dif - cap)),
                                    -1 !== v.indexOf("_cw") && 0 > dif ? dif = (dif + 9999999999 * cap) % cap - (dif / cap | 0) * cap : -1 !== v.indexOf("ccw") && dif > 0 && (dif = (dif - 9999999999 * cap) % cap - (dif / cap | 0) * cap)),
                                result = d + dif),
                            min > result && result > -min && (result = 0),
                            result
                    },
                    _colorLookup = {
                        aqua: [0, 255, 255],
                        lime: [0, 255, 0],
                        silver: [192, 192, 192],
                        black: [0, 0, 0],
                        maroon: [128, 0, 0],
                        teal: [0, 128, 128],
                        blue: [0, 0, 255],
                        navy: [0, 0, 128],
                        white: [255, 255, 255],
                        fuchsia: [255, 0, 255],
                        olive: [128, 128, 0],
                        yellow: [255, 255, 0],
                        orange: [255, 165, 0],
                        gray: [128, 128, 128],
                        purple: [128, 0, 128],
                        green: [0, 128, 0],
                        red: [255, 0, 0],
                        pink: [255, 192, 203],
                        cyan: [0, 255, 255],
                        transparent: [255, 255, 255, 0]
                    },
                    _hue = function (h, m1, m2) {
                        return h = 0 > h ? h + 1 : h > 1 ? h - 1 : h,
                            255 * (1 > 6 * h ? m1 + (m2 - m1) * h * 6 : .5 > h ? m2 : 2 > 3 * h ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) + .5 | 0
                    },
                    _parseColor = CSSPlugin.parseColor = function (v) {
                        var c1, c2, c3, h, s, l;
                        return v && "" !== v ? "number" == typeof v ? [v >> 16, v >> 8 & 255, 255 & v] : ("," === v.charAt(v.length - 1) && (v = v.substr(0, v.length - 1)),
                            _colorLookup[v] ? _colorLookup[v] : "#" === v.charAt(0) ? (4 === v.length && (c1 = v.charAt(1),
                                    c2 = v.charAt(2),
                                    c3 = v.charAt(3),
                                    v = "#" + c1 + c1 + c2 + c2 + c3 + c3),
                                v = parseInt(v.substr(1), 16),
                                [v >> 16, v >> 8 & 255, 255 & v]) : "hsl" === v.substr(0, 3) ? (v = v.match(_numExp),
                                h = Number(v[0]) % 360 / 360,
                                s = Number(v[1]) / 100,
                                l = Number(v[2]) / 100,
                                c2 = .5 >= l ? l * (s + 1) : l + s - l * s,
                                c1 = 2 * l - c2,
                                v.length > 3 && (v[3] = Number(v[3])),
                                v[0] = _hue(h + 1 / 3, c1, c2),
                                v[1] = _hue(h, c1, c2),
                                v[2] = _hue(h - 1 / 3, c1, c2),
                                v) : (v = v.match(_numExp) || _colorLookup.transparent,
                                v[0] = Number(v[0]),
                                v[1] = Number(v[1]),
                                v[2] = Number(v[2]),
                                v.length > 3 && (v[3] = Number(v[3])),
                                v)) : _colorLookup.black
                    },
                    _colorExp = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#.+?\\b";
                for (p in _colorLookup)
                    _colorExp += "|" + p + "\\b";
                _colorExp = new RegExp(_colorExp + ")", "gi");
                var _getFormatter = function (dflt, clr, collapsible, multi) {
                        if (null == dflt)
                            return function (v) {
                                return v
                            };
                        var formatter, dColor = clr ? (dflt.match(_colorExp) || [""])[0] : "",
                            dVals = dflt.split(dColor).join("").match(_valuesExp) || [],
                            pfx = dflt.substr(0, dflt.indexOf(dVals[0])),
                            sfx = ")" === dflt.charAt(dflt.length - 1) ? ")" : "",
                            delim = -1 !== dflt.indexOf(" ") ? " " : ",",
                            numVals = dVals.length,
                            dSfx = numVals > 0 ? dVals[0].replace(_numExp, "") : "";
                        return numVals ? formatter = clr ? function (v) {
                                var color, vals, i, a;
                                if ("number" == typeof v)
                                    v += dSfx;
                                else if (multi && _commasOutsideParenExp.test(v)) {
                                    for (a = v.replace(_commasOutsideParenExp, "|").split("|"),
                                        i = 0; i < a.length; i++)
                                        a[i] = formatter(a[i]);
                                    return a.join(",")
                                }
                                if (color = (v.match(_colorExp) || [dColor])[0],
                                    vals = v.split(color).join("").match(_valuesExp) || [],
                                    i = vals.length,
                                    numVals > i--)
                                    for (; ++i < numVals;)
                                        vals[i] = collapsible ? vals[(i - 1) / 2 | 0] : dVals[i];
                                return pfx + vals.join(delim) + delim + color + sfx + (-1 !== v.indexOf("inset") ? " inset" : "")
                            } :
                            function (v) {
                                var vals, a, i;
                                if ("number" == typeof v)
                                    v += dSfx;
                                else if (multi && _commasOutsideParenExp.test(v)) {
                                    for (a = v.replace(_commasOutsideParenExp, "|").split("|"),
                                        i = 0; i < a.length; i++)
                                        a[i] = formatter(a[i]);
                                    return a.join(",")
                                }
                                if (vals = v.match(_valuesExp) || [],
                                    i = vals.length,
                                    numVals > i--)
                                    for (; ++i < numVals;)
                                        vals[i] = collapsible ? vals[(i - 1) / 2 | 0] : dVals[i];
                                return pfx + vals.join(delim) + sfx
                            } :
                            function (v) {
                                return v
                            }
                    },
                    _getEdgeParser = function (props) {
                        return props = props.split(","),
                            function (t, e, p, cssp, pt, plugin, vars) {
                                var i, a = (e + "").split(" ");
                                for (vars = {},
                                    i = 0; 4 > i; i++)
                                    vars[props[i]] = a[i] = a[i] || a[(i - 1) / 2 >> 0];
                                return cssp.parse(t, vars, pt, plugin)
                            }
                    },
                    MiniPropTween = (_internals._setPluginRatio = function (v) {
                            this.plugin.setRatio(v);
                            for (var val, pt, i, str, d = this.data, proxy = d.proxy, mpt = d.firstMPT, min = 1e-6; mpt;)
                                val = proxy[mpt.v],
                                mpt.r ? val = Math.round(val) : min > val && val > -min && (val = 0),
                                mpt.t[mpt.p] = val,
                                mpt = mpt._next;
                            if (d.autoRotate && (d.autoRotate.rotation = proxy.rotation),
                                1 === v)
                                for (mpt = d.firstMPT; mpt;) {
                                    if (pt = mpt.t,
                                        pt.type) {
                                        if (1 === pt.type) {
                                            for (str = pt.xs0 + pt.s + pt.xs1,
                                                i = 1; i < pt.l; i++)
                                                str += pt["xn" + i] + pt["xs" + (i + 1)];
                                            pt.e = str
                                        }
                                    } else
                                        pt.e = pt.s + pt.xs0;
                                    mpt = mpt._next
                                }
                        },
                        function (t, p, v, next, r) {
                            this.t = t,
                                this.p = p,
                                this.v = v,
                                this.r = r,
                                next && (next._prev = this,
                                    this._next = next)
                        }
                    ),
                    CSSPropTween = (_internals._parseToProxy = function (t, vars, cssp, pt, plugin, shallow) {
                            var i, p, xp, mpt, firstPT, bpt = pt,
                                start = {},
                                end = {},
                                transform = cssp._transform,
                                oldForce = _forcePT;
                            for (cssp._transform = null,
                                _forcePT = vars,
                                pt = firstPT = cssp.parse(t, vars, pt, plugin),
                                _forcePT = oldForce,
                                shallow && (cssp._transform = transform,
                                    bpt && (bpt._prev = null,
                                        bpt._prev && (bpt._prev._next = null))); pt && pt !== bpt;) {
                                if (pt.type <= 1 && (p = pt.p,
                                        end[p] = pt.s + pt.c,
                                        start[p] = pt.s,
                                        shallow || (mpt = new MiniPropTween(pt, "s", p, mpt, pt.r),
                                            pt.c = 0),
                                        1 === pt.type))
                                    for (i = pt.l; --i > 0;)
                                        xp = "xn" + i,
                                        p = pt.p + "_" + xp,
                                        end[p] = pt.data[xp],
                                        start[p] = pt[xp],
                                        shallow || (mpt = new MiniPropTween(pt, xp, p, mpt, pt.rxp[xp]));
                                pt = pt._next
                            }
                            return {
                                proxy: start,
                                end: end,
                                firstMPT: mpt,
                                pt: firstPT
                            }
                        },
                        _internals.CSSPropTween = function (t, p, s, c, next, type, n, r, pr, b, e) {
                            this.t = t,
                                this.p = p,
                                this.s = s,
                                this.c = c,
                                this.n = n || p,
                                t instanceof CSSPropTween || _overwriteProps.push(this.n),
                                this.r = r,
                                this.type = type || 0,
                                pr && (this.pr = pr,
                                    _hasPriority = !0),
                                this.b = void 0 === b ? s : b,
                                this.e = void 0 === e ? s + c : e,
                                next && (this._next = next,
                                    next._prev = this)
                        }
                    ),
                    _addNonTweeningNumericPT = function (target, prop, start, end, next, overwriteProp) {
                        var pt = new CSSPropTween(target, prop, start, end - start, next, -1, overwriteProp);
                        return pt.b = start,
                            pt.e = pt.xs0 = end,
                            pt
                    },
                    _parseComplex = CSSPlugin.parseComplex = function (t, p, b, e, clrs, dflt, pt, pr, plugin, setRatio) {
                        b = b || dflt || "",
                            pt = new CSSPropTween(t, p, 0, 0, pt, setRatio ? 2 : 1, null, !1, pr, b, e),
                            e += "";
                        var i, xi, ni, bv, ev, bnums, enums, bn, rgba, temp, cv, str, ba = b.split(", ").join(",").split(" "),
                            ea = e.split(", ").join(",").split(" "),
                            l = ba.length,
                            autoRound = _autoRound !== !1;
                        for ((-1 !== e.indexOf(",") || -1 !== b.indexOf(",")) && (ba = ba.join(" ").replace(_commasOutsideParenExp, ", ").split(" "),
                                ea = ea.join(" ").replace(_commasOutsideParenExp, ", ").split(" "),
                                l = ba.length),
                            l !== ea.length && (ba = (dflt || "").split(" "),
                                l = ba.length),
                            pt.plugin = plugin,
                            pt.setRatio = setRatio,
                            i = 0; l > i; i++)
                            if (bv = ba[i],
                                ev = ea[i],
                                bn = parseFloat(bv),
                                bn || 0 === bn)
                                pt.appendXtra("", bn, _parseChange(ev, bn), ev.replace(_relNumExp, ""), autoRound && -1 !== ev.indexOf("px"), !0);
                            else if (clrs && ("#" === bv.charAt(0) || _colorLookup[bv] || _rgbhslExp.test(bv)))
                            str = "," === ev.charAt(ev.length - 1) ? ")," : ")",
                            bv = _parseColor(bv),
                            ev = _parseColor(ev),
                            rgba = bv.length + ev.length > 6,
                            rgba && !_supportsOpacity && 0 === ev[3] ? (pt["xs" + pt.l] += pt.l ? " transparent" : "transparent",
                                pt.e = pt.e.split(ea[i]).join("transparent")) : (_supportsOpacity || (rgba = !1),
                                pt.appendXtra(rgba ? "rgba(" : "rgb(", bv[0], ev[0] - bv[0], ",", !0, !0).appendXtra("", bv[1], ev[1] - bv[1], ",", !0).appendXtra("", bv[2], ev[2] - bv[2], rgba ? "," : str, !0),
                                rgba && (bv = bv.length < 4 ? 1 : bv[3],
                                    pt.appendXtra("", bv, (ev.length < 4 ? 1 : ev[3]) - bv, str, !1)));
                        else if (bnums = bv.match(_numExp)) {
                            if (enums = ev.match(_relNumExp),
                                !enums || enums.length !== bnums.length)
                                return pt;
                            for (ni = 0,
                                xi = 0; xi < bnums.length; xi++)
                                cv = bnums[xi],
                                temp = bv.indexOf(cv, ni),
                                pt.appendXtra(bv.substr(ni, temp - ni), Number(cv), _parseChange(enums[xi], cv), "", autoRound && "px" === bv.substr(temp + cv.length, 2), 0 === xi),
                                ni = temp + cv.length;
                            pt["xs" + pt.l] += bv.substr(ni)
                        } else
                            pt["xs" + pt.l] += pt.l ? " " + bv : bv;
                        if (-1 !== e.indexOf("=") && pt.data) {
                            for (str = pt.xs0 + pt.data.s,
                                i = 1; i < pt.l; i++)
                                str += pt["xs" + i] + pt.data["xn" + i];
                            pt.e = str + pt["xs" + i]
                        }
                        return pt.l || (pt.type = -1,
                                pt.xs0 = pt.e),
                            pt.xfirst || pt
                    },
                    i = 9;
                for (p = CSSPropTween.prototype,
                    p.l = p.pr = 0; --i > 0;)
                    p["xn" + i] = 0,
                    p["xs" + i] = "";
                p.xs0 = "",
                    p._next = p._prev = p.xfirst = p.data = p.plugin = p.setRatio = p.rxp = null,
                    p.appendXtra = function (pfx, s, c, sfx, r, pad) {
                        var pt = this,
                            l = pt.l;
                        return pt["xs" + l] += pad && l ? " " + pfx : pfx || "",
                            c || 0 === l || pt.plugin ? (pt.l++,
                                pt.type = pt.setRatio ? 2 : 1,
                                pt["xs" + pt.l] = sfx || "",
                                l > 0 ? (pt.data["xn" + l] = s + c,
                                    pt.rxp["xn" + l] = r,
                                    pt["xn" + l] = s,
                                    pt.plugin || (pt.xfirst = new CSSPropTween(pt, "xn" + l, s, c, pt.xfirst || pt, 0, pt.n, r, pt.pr),
                                        pt.xfirst.xs0 = 0),
                                    pt) : (pt.data = {
                                        s: s + c
                                    },
                                    pt.rxp = {},
                                    pt.s = s,
                                    pt.c = c,
                                    pt.r = r,
                                    pt)) : (pt["xs" + l] += s + (sfx || ""),
                                pt)
                    };
                var SpecialProp = function (p, options) {
                        options = options || {},
                            this.p = options.prefix ? _checkPropPrefix(p) || p : p,
                            _specialProps[p] = _specialProps[this.p] = this,
                            this.format = options.formatter || _getFormatter(options.defaultValue, options.color, options.collapsible, options.multi),
                            options.parser && (this.parse = options.parser),
                            this.clrs = options.color,
                            this.multi = options.multi,
                            this.keyword = options.keyword,
                            this.dflt = options.defaultValue,
                            this.pr = options.priority || 0
                    },
                    _registerComplexSpecialProp = _internals._registerComplexSpecialProp = function (p, options, defaults) {
                        "object" != typeof options && (options = {
                            parser: defaults
                        });
                        var i, temp, a = p.split(","),
                            d = options.defaultValue;
                        for (defaults = defaults || [d],
                            i = 0; i < a.length; i++)
                            options.prefix = 0 === i && options.prefix,
                            options.defaultValue = defaults[i] || d,
                            temp = new SpecialProp(a[i], options)
                    },
                    _registerPluginProp = function (p) {
                        if (!_specialProps[p]) {
                            var pluginName = p.charAt(0).toUpperCase() + p.substr(1) + "Plugin";
                            _registerComplexSpecialProp(p, {
                                parser: function (t, e, p, cssp, pt, plugin, vars) {
                                    var pluginClass = _globals.com.greensock.plugins[pluginName];
                                    return pluginClass ? (pluginClass._cssRegister(),
                                        _specialProps[p].parse(t, e, p, cssp, pt, plugin, vars)) : (_log("Error: " + pluginName + " js file not loaded."),
                                        pt)
                                }
                            })
                        }
                    };
                p = SpecialProp.prototype,
                    p.parseComplex = function (t, b, e, pt, plugin, setRatio) {
                        var i, ba, ea, l, bi, ei, kwd = this.keyword;
                        if (this.multi && (_commasOutsideParenExp.test(e) || _commasOutsideParenExp.test(b) ? (ba = b.replace(_commasOutsideParenExp, "|").split("|"),
                                ea = e.replace(_commasOutsideParenExp, "|").split("|")) : kwd && (ba = [b],
                                ea = [e])),
                            ea) {
                            for (l = ea.length > ba.length ? ea.length : ba.length,
                                i = 0; l > i; i++)
                                b = ba[i] = ba[i] || this.dflt,
                                e = ea[i] = ea[i] || this.dflt,
                                kwd && (bi = b.indexOf(kwd),
                                    ei = e.indexOf(kwd),
                                    bi !== ei && (-1 === ei ? ba[i] = ba[i].split(kwd).join("") : -1 === bi && (ba[i] += " " + kwd)));
                            b = ba.join(", "),
                                e = ea.join(", ")
                        }
                        return _parseComplex(t, this.p, b, e, this.clrs, this.dflt, pt, this.pr, plugin, setRatio)
                    },
                    p.parse = function (t, e, p, cssp, pt, plugin, vars) {
                        return this.parseComplex(t.style, this.format(_getStyle(t, this.p, _cs, !1, this.dflt)), this.format(e), pt, plugin)
                    },
                    CSSPlugin.registerSpecialProp = function (name, onInitTween, priority) {
                        _registerComplexSpecialProp(name, {
                            parser: function (t, e, p, cssp, pt, plugin, vars) {
                                var rv = new CSSPropTween(t, p, 0, 0, pt, 2, p, !1, priority);
                                return rv.plugin = plugin,
                                    rv.setRatio = onInitTween(t, e, cssp._tween, p),
                                    rv
                            },
                            priority: priority
                        })
                    },
                    CSSPlugin.useSVGTransformAttr = _isSafari || _isFirefox;
                var _useSVGTransformAttr, _transformProps = "scaleX,scaleY,scaleZ,x,y,z,skewX,skewY,rotation,rotationX,rotationY,perspective,xPercent,yPercent".split(","),
                    _transformProp = _checkPropPrefix("transform"),
                    _transformPropCSS = _prefixCSS + "transform",
                    _transformOriginProp = _checkPropPrefix("transformOrigin"),
                    _supports3D = null !== _checkPropPrefix("perspective"),
                    Transform = _internals.Transform = function () {
                        this.perspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0,
                            this.force3D = CSSPlugin.defaultForce3D !== !1 && _supports3D ? CSSPlugin.defaultForce3D || "auto" : !1
                    },
                    _SVGElement = window.SVGElement,
                    _createSVG = function (type, container, attributes) {
                        var p, element = _doc.createElementNS("http://www.w3.org/2000/svg", type),
                            reg = /([a-z])([A-Z])/g;
                        for (p in attributes)
                            element.setAttributeNS(null, p.replace(reg, "$1-$2").toLowerCase(), attributes[p]);
                        return container.appendChild(element),
                            element
                    },
                    _docElement = _doc.documentElement,
                    _forceSVGTransformAttr = function () {
                        var svg, rect, width, force = _ieVers || /Android/i.test(_agent) && !window.chrome;
                        return _doc.createElementNS && !force && (svg = _createSVG("svg", _docElement),
                                rect = _createSVG("rect", svg, {
                                    width: 100,
                                    height: 50,
                                    x: 100
                                }),
                                width = rect.getBoundingClientRect().width,
                                rect.style[_transformOriginProp] = "50% 50%",
                                rect.style[_transformProp] = "scaleX(0.5)",
                                force = width === rect.getBoundingClientRect().width && !(_isFirefox && _supports3D),
                                _docElement.removeChild(svg)),
                            force
                    }(),
                    _parseSVGOrigin = function (e, local, decoratee, absolute, smoothOrigin) {
                        var v, x, y, xOrigin, yOrigin, a, b, c, d, tx, ty, determinant, xOriginOld, yOriginOld, tm = e._gsTransform,
                            m = _getMatrix(e, !0);
                        tm && (xOriginOld = tm.xOrigin,
                                yOriginOld = tm.yOrigin),
                            (!absolute || (v = absolute.split(" ")).length < 2) && (b = e.getBBox(),
                                local = _parsePosition(local).split(" "),
                                v = [(-1 !== local[0].indexOf("%") ? parseFloat(local[0]) / 100 * b.width : parseFloat(local[0])) + b.x, (-1 !== local[1].indexOf("%") ? parseFloat(local[1]) / 100 * b.height : parseFloat(local[1])) + b.y]),
                            decoratee.xOrigin = xOrigin = parseFloat(v[0]),
                            decoratee.yOrigin = yOrigin = parseFloat(v[1]),
                            absolute && m !== _identity2DMatrix && (a = m[0],
                                b = m[1],
                                c = m[2],
                                d = m[3],
                                tx = m[4],
                                ty = m[5],
                                determinant = a * d - b * c,
                                x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant,
                                y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant,
                                xOrigin = decoratee.xOrigin = v[0] = x,
                                yOrigin = decoratee.yOrigin = v[1] = y),
                            tm && (smoothOrigin || smoothOrigin !== !1 && CSSPlugin.defaultSmoothOrigin !== !1 ? (x = xOrigin - xOriginOld,
                                y = yOrigin - yOriginOld,
                                tm.xOffset += x * m[0] + y * m[2] - x,
                                tm.yOffset += x * m[1] + y * m[3] - y) : tm.xOffset = tm.yOffset = 0),
                            e.setAttribute("data-svg-origin", v.join(" "))
                    },
                    _isSVG = function (e) {
                        return !!(_SVGElement && "function" == typeof e.getBBox && e.getCTM && (!e.parentNode || e.parentNode.getBBox && e.parentNode.getCTM))
                    },
                    _identity2DMatrix = [1, 0, 0, 1, 0, 0],
                    _getMatrix = function (e, force2D) {
                        var isDefault, s, m, n, dec, tm = e._gsTransform || new Transform,
                            rnd = 1e5;
                        if (_transformProp ? s = _getStyle(e, _transformPropCSS, null, !0) : e.currentStyle && (s = e.currentStyle.filter.match(_ieGetMatrixExp),
                                s = s && 4 === s.length ? [s[0].substr(4), Number(s[2].substr(4)), Number(s[1].substr(4)), s[3].substr(4), tm.x || 0, tm.y || 0].join(",") : ""),
                            isDefault = !s || "none" === s || "matrix(1, 0, 0, 1, 0, 0)" === s,
                            (tm.svg || e.getBBox && _isSVG(e)) && (isDefault && -1 !== (e.style[_transformProp] + "").indexOf("matrix") && (s = e.style[_transformProp],
                                    isDefault = 0),
                                m = e.getAttribute("transform"),
                                isDefault && m && (-1 !== m.indexOf("matrix") ? (s = m,
                                    isDefault = 0) : -1 !== m.indexOf("translate") && (s = "matrix(1,0,0,1," + m.match(/(?:\-|\b)[\d\-\.e]+\b/gi).join(",") + ")",
                                    isDefault = 0))),
                            isDefault)
                            return _identity2DMatrix;
                        for (m = (s || "").match(/(?:\-|\b)[\d\-\.e]+\b/gi) || [],
                            i = m.length; --i > -1;)
                            n = Number(m[i]),
                            m[i] = (dec = n - (n |= 0)) ? (dec * rnd + (0 > dec ? -.5 : .5) | 0) / rnd + n : n;
                        return force2D && m.length > 6 ? [m[0], m[1], m[4], m[5], m[12], m[13]] : m
                    },
                    _getTransform = _internals.getTransform = function (t, cs, rec, parse) {
                        if (t._gsTransform && rec && !parse)
                            return t._gsTransform;
                        var m, i, scaleX, scaleY, rotation, skewX, tm = rec ? t._gsTransform || new Transform : new Transform,
                            invX = tm.scaleX < 0,
                            min = 2e-5,
                            rnd = 1e5,
                            zOrigin = _supports3D ? parseFloat(_getStyle(t, _transformOriginProp, cs, !1, "0 0 0").split(" ")[2]) || tm.zOrigin || 0 : 0,
                            defaultTransformPerspective = parseFloat(CSSPlugin.defaultTransformPerspective) || 0;
                        if (tm.svg = !(!t.getBBox || !_isSVG(t)),
                            tm.svg && (_parseSVGOrigin(t, _getStyle(t, _transformOriginProp, _cs, !1, "50% 50%") + "", tm, t.getAttribute("data-svg-origin")),
                                _useSVGTransformAttr = CSSPlugin.useSVGTransformAttr || _forceSVGTransformAttr),
                            m = _getMatrix(t),
                            m !== _identity2DMatrix) {
                            if (16 === m.length) {
                                var t1, t2, t3, cos, sin, a11 = m[0],
                                    a21 = m[1],
                                    a31 = m[2],
                                    a41 = m[3],
                                    a12 = m[4],
                                    a22 = m[5],
                                    a32 = m[6],
                                    a42 = m[7],
                                    a13 = m[8],
                                    a23 = m[9],
                                    a33 = m[10],
                                    a14 = m[12],
                                    a24 = m[13],
                                    a34 = m[14],
                                    a43 = m[11],
                                    angle = Math.atan2(a32, a33);
                                tm.zOrigin && (a34 = -tm.zOrigin,
                                        a14 = a13 * a34 - m[12],
                                        a24 = a23 * a34 - m[13],
                                        a34 = a33 * a34 + tm.zOrigin - m[14]),
                                    tm.rotationX = angle * _RAD2DEG,
                                    angle && (cos = Math.cos(-angle),
                                        sin = Math.sin(-angle),
                                        t1 = a12 * cos + a13 * sin,
                                        t2 = a22 * cos + a23 * sin,
                                        t3 = a32 * cos + a33 * sin,
                                        a13 = a12 * -sin + a13 * cos,
                                        a23 = a22 * -sin + a23 * cos,
                                        a33 = a32 * -sin + a33 * cos,
                                        a43 = a42 * -sin + a43 * cos,
                                        a12 = t1,
                                        a22 = t2,
                                        a32 = t3),
                                    angle = Math.atan2(a13, a33),
                                    tm.rotationY = angle * _RAD2DEG,
                                    angle && (cos = Math.cos(-angle),
                                        sin = Math.sin(-angle),
                                        t1 = a11 * cos - a13 * sin,
                                        t2 = a21 * cos - a23 * sin,
                                        t3 = a31 * cos - a33 * sin,
                                        a23 = a21 * sin + a23 * cos,
                                        a33 = a31 * sin + a33 * cos,
                                        a43 = a41 * sin + a43 * cos,
                                        a11 = t1,
                                        a21 = t2,
                                        a31 = t3),
                                    angle = Math.atan2(a21, a11),
                                    tm.rotation = angle * _RAD2DEG,
                                    angle && (cos = Math.cos(-angle),
                                        sin = Math.sin(-angle),
                                        a11 = a11 * cos + a12 * sin,
                                        t2 = a21 * cos + a22 * sin,
                                        a22 = a21 * -sin + a22 * cos,
                                        a32 = a31 * -sin + a32 * cos,
                                        a21 = t2),
                                    tm.rotationX && Math.abs(tm.rotationX) + Math.abs(tm.rotation) > 359.9 && (tm.rotationX = tm.rotation = 0,
                                        tm.rotationY += 180),
                                    tm.scaleX = (Math.sqrt(a11 * a11 + a21 * a21) * rnd + .5 | 0) / rnd,
                                    tm.scaleY = (Math.sqrt(a22 * a22 + a23 * a23) * rnd + .5 | 0) / rnd,
                                    tm.scaleZ = (Math.sqrt(a32 * a32 + a33 * a33) * rnd + .5 | 0) / rnd,
                                    tm.skewX = 0,
                                    tm.perspective = a43 ? 1 / (0 > a43 ? -a43 : a43) : 0,
                                    tm.x = a14,
                                    tm.y = a24,
                                    tm.z = a34,
                                    tm.svg && (tm.x -= tm.xOrigin - (tm.xOrigin * a11 - tm.yOrigin * a12),
                                        tm.y -= tm.yOrigin - (tm.yOrigin * a21 - tm.xOrigin * a22))
                            } else if ((!_supports3D || parse || !m.length || tm.x !== m[4] || tm.y !== m[5] || !tm.rotationX && !tm.rotationY) && (void 0 === tm.x || "none" !== _getStyle(t, "display", cs))) {
                                var k = m.length >= 6,
                                    a = k ? m[0] : 1,
                                    b = m[1] || 0,
                                    c = m[2] || 0,
                                    d = k ? m[3] : 1;
                                tm.x = m[4] || 0,
                                    tm.y = m[5] || 0,
                                    scaleX = Math.sqrt(a * a + b * b),
                                    scaleY = Math.sqrt(d * d + c * c),
                                    rotation = a || b ? Math.atan2(b, a) * _RAD2DEG : tm.rotation || 0,
                                    skewX = c || d ? Math.atan2(c, d) * _RAD2DEG + rotation : tm.skewX || 0,
                                    Math.abs(skewX) > 90 && Math.abs(skewX) < 270 && (invX ? (scaleX *= -1,
                                        skewX += 0 >= rotation ? 180 : -180,
                                        rotation += 0 >= rotation ? 180 : -180) : (scaleY *= -1,
                                        skewX += 0 >= skewX ? 180 : -180)),
                                    tm.scaleX = scaleX,
                                    tm.scaleY = scaleY,
                                    tm.rotation = rotation,
                                    tm.skewX = skewX,
                                    _supports3D && (tm.rotationX = tm.rotationY = tm.z = 0,
                                        tm.perspective = defaultTransformPerspective,
                                        tm.scaleZ = 1),
                                    tm.svg && (tm.x -= tm.xOrigin - (tm.xOrigin * a + tm.yOrigin * c),
                                        tm.y -= tm.yOrigin - (tm.xOrigin * b + tm.yOrigin * d))
                            }
                            tm.zOrigin = zOrigin;
                            for (i in tm)
                                tm[i] < min && tm[i] > -min && (tm[i] = 0)
                        }
                        return rec && (t._gsTransform = tm,
                                tm.svg && (_useSVGTransformAttr && t.style[_transformProp] ? TweenLite.delayedCall(.001, function () {
                                    _removeProp(t.style, _transformProp)
                                }) : !_useSVGTransformAttr && t.getAttribute("transform") && TweenLite.delayedCall(.001, function () {
                                    t.removeAttribute("transform")
                                }))),
                            tm
                    },
                    _setIETransformRatio = function (v) {
                        var filters, val, t = this.data,
                            ang = -t.rotation * _DEG2RAD,
                            skew = ang + t.skewX * _DEG2RAD,
                            rnd = 1e5,
                            a = (Math.cos(ang) * t.scaleX * rnd | 0) / rnd,
                            b = (Math.sin(ang) * t.scaleX * rnd | 0) / rnd,
                            c = (Math.sin(skew) * -t.scaleY * rnd | 0) / rnd,
                            d = (Math.cos(skew) * t.scaleY * rnd | 0) / rnd,
                            style = this.t.style,
                            cs = this.t.currentStyle;
                        if (cs) {
                            val = b,
                                b = -c,
                                c = -val,
                                filters = cs.filter,
                                style.filter = "";
                            var dx, dy, w = this.t.offsetWidth,
                                h = this.t.offsetHeight,
                                clip = "absolute" !== cs.position,
                                m = "progid:DXImageTransform.Microsoft.Matrix(M11=" + a + ", M12=" + b + ", M21=" + c + ", M22=" + d,
                                ox = t.x + w * t.xPercent / 100,
                                oy = t.y + h * t.yPercent / 100;
                            if (null != t.ox && (dx = (t.oxp ? w * t.ox * .01 : t.ox) - w / 2,
                                    dy = (t.oyp ? h * t.oy * .01 : t.oy) - h / 2,
                                    ox += dx - (dx * a + dy * b),
                                    oy += dy - (dx * c + dy * d)),
                                clip ? (dx = w / 2,
                                    dy = h / 2,
                                    m += ", Dx=" + (dx - (dx * a + dy * b) + ox) + ", Dy=" + (dy - (dx * c + dy * d) + oy) + ")") : m += ", sizingMethod='auto expand')",
                                -1 !== filters.indexOf("DXImageTransform.Microsoft.Matrix(") ? style.filter = filters.replace(_ieSetMatrixExp, m) : style.filter = m + " " + filters,
                                (0 === v || 1 === v) && 1 === a && 0 === b && 0 === c && 1 === d && (clip && -1 === m.indexOf("Dx=0, Dy=0") || _opacityExp.test(filters) && 100 !== parseFloat(RegExp.$1) || -1 === filters.indexOf(filters.indexOf("Alpha")) && style.removeAttribute("filter")),
                                !clip) {
                                var marg, prop, dif, mult = 8 > _ieVers ? 1 : -1;
                                for (dx = t.ieOffsetX || 0,
                                    dy = t.ieOffsetY || 0,
                                    t.ieOffsetX = Math.round((w - ((0 > a ? -a : a) * w + (0 > b ? -b : b) * h)) / 2 + ox),
                                    t.ieOffsetY = Math.round((h - ((0 > d ? -d : d) * h + (0 > c ? -c : c) * w)) / 2 + oy),
                                    i = 0; 4 > i; i++)
                                    prop = _margins[i],
                                    marg = cs[prop],
                                    val = -1 !== marg.indexOf("px") ? parseFloat(marg) : _convertToPixels(this.t, prop, parseFloat(marg), marg.replace(_suffixExp, "")) || 0,
                                    dif = val !== t[prop] ? 2 > i ? -t.ieOffsetX : -t.ieOffsetY : 2 > i ? dx - t.ieOffsetX : dy - t.ieOffsetY,
                                    style[prop] = (t[prop] = Math.round(val - dif * (0 === i || 2 === i ? 1 : mult))) + "px"
                            }
                        }
                    },
                    _setTransformRatio = _internals.set3DTransformRatio = _internals.setTransformRatio = function (v) {
                        var a11, a12, a13, a21, a22, a23, a31, a32, a33, a41, a42, a43, zOrigin, min, cos, sin, t1, t2, transform, comma, zero, skew, rnd, t = this.data,
                            style = this.t.style,
                            angle = t.rotation,
                            rotationX = t.rotationX,
                            rotationY = t.rotationY,
                            sx = t.scaleX,
                            sy = t.scaleY,
                            sz = t.scaleZ,
                            x = t.x,
                            y = t.y,
                            z = t.z,
                            isSVG = t.svg,
                            perspective = t.perspective,
                            force3D = t.force3D;
                        if (((1 === v || 0 === v) && "auto" === force3D && (this.tween._totalTime === this.tween._totalDuration || !this.tween._totalTime) || !force3D) && !z && !perspective && !rotationY && !rotationX || _useSVGTransformAttr && isSVG || !_supports3D)
                            return void(angle || t.skewX || isSVG ? (angle *= _DEG2RAD,
                                skew = t.skewX * _DEG2RAD,
                                rnd = 1e5,
                                a11 = Math.cos(angle) * sx,
                                a21 = Math.sin(angle) * sx,
                                a12 = Math.sin(angle - skew) * -sy,
                                a22 = Math.cos(angle - skew) * sy,
                                skew && "simple" === t.skewType && (t1 = Math.tan(skew),
                                    t1 = Math.sqrt(1 + t1 * t1),
                                    a12 *= t1,
                                    a22 *= t1,
                                    t.skewY && (a11 *= t1,
                                        a21 *= t1)),
                                isSVG && (x += t.xOrigin - (t.xOrigin * a11 + t.yOrigin * a12) + t.xOffset,
                                    y += t.yOrigin - (t.xOrigin * a21 + t.yOrigin * a22) + t.yOffset,
                                    _useSVGTransformAttr && (t.xPercent || t.yPercent) && (min = this.t.getBBox(),
                                        x += .01 * t.xPercent * min.width,
                                        y += .01 * t.yPercent * min.height),
                                    min = 1e-6,
                                    min > x && x > -min && (x = 0),
                                    min > y && y > -min && (y = 0)),
                                transform = (a11 * rnd | 0) / rnd + "," + (a21 * rnd | 0) / rnd + "," + (a12 * rnd | 0) / rnd + "," + (a22 * rnd | 0) / rnd + "," + x + "," + y + ")",
                                isSVG && _useSVGTransformAttr ? this.t.setAttribute("transform", "matrix(" + transform) : style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + transform) : style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix(" : "matrix(") + sx + ",0,0," + sy + "," + x + "," + y + ")");
                        if (_isFirefox && (min = 1e-4,
                                min > sx && sx > -min && (sx = sz = 2e-5),
                                min > sy && sy > -min && (sy = sz = 2e-5),
                                !perspective || t.z || t.rotationX || t.rotationY || (perspective = 0)),
                            angle || t.skewX)
                            angle *= _DEG2RAD,
                            cos = a11 = Math.cos(angle),
                            sin = a21 = Math.sin(angle),
                            t.skewX && (angle -= t.skewX * _DEG2RAD,
                                cos = Math.cos(angle),
                                sin = Math.sin(angle),
                                "simple" === t.skewType && (t1 = Math.tan(t.skewX * _DEG2RAD),
                                    t1 = Math.sqrt(1 + t1 * t1),
                                    cos *= t1,
                                    sin *= t1,
                                    t.skewY && (a11 *= t1,
                                        a21 *= t1))),
                            a12 = -sin,
                            a22 = cos;
                        else {
                            if (!(rotationY || rotationX || 1 !== sz || perspective || isSVG))
                                return void(style[_transformProp] = (t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) translate3d(" : "translate3d(") + x + "px," + y + "px," + z + "px)" + (1 !== sx || 1 !== sy ? " scale(" + sx + "," + sy + ")" : ""));
                            a11 = a22 = 1,
                                a12 = a21 = 0
                        }
                        a33 = 1,
                            a13 = a23 = a31 = a32 = a41 = a42 = 0,
                            a43 = perspective ? -1 / perspective : 0,
                            zOrigin = t.zOrigin,
                            min = 1e-6,
                            comma = ",",
                            zero = "0",
                            angle = rotationY * _DEG2RAD,
                            angle && (cos = Math.cos(angle),
                                sin = Math.sin(angle),
                                a31 = -sin,
                                a41 = a43 * -sin,
                                a13 = a11 * sin,
                                a23 = a21 * sin,
                                a33 = cos,
                                a43 *= cos,
                                a11 *= cos,
                                a21 *= cos),
                            angle = rotationX * _DEG2RAD,
                            angle && (cos = Math.cos(angle),
                                sin = Math.sin(angle),
                                t1 = a12 * cos + a13 * sin,
                                t2 = a22 * cos + a23 * sin,
                                a32 = a33 * sin,
                                a42 = a43 * sin,
                                a13 = a12 * -sin + a13 * cos,
                                a23 = a22 * -sin + a23 * cos,
                                a33 *= cos,
                                a43 *= cos,
                                a12 = t1,
                                a22 = t2),
                            1 !== sz && (a13 *= sz,
                                a23 *= sz,
                                a33 *= sz,
                                a43 *= sz),
                            1 !== sy && (a12 *= sy,
                                a22 *= sy,
                                a32 *= sy,
                                a42 *= sy),
                            1 !== sx && (a11 *= sx,
                                a21 *= sx,
                                a31 *= sx,
                                a41 *= sx),
                            (zOrigin || isSVG) && (zOrigin && (x += a13 * -zOrigin,
                                    y += a23 * -zOrigin,
                                    z += a33 * -zOrigin + zOrigin),
                                isSVG && (x += t.xOrigin - (t.xOrigin * a11 + t.yOrigin * a12) + t.xOffset,
                                    y += t.yOrigin - (t.xOrigin * a21 + t.yOrigin * a22) + t.yOffset),
                                min > x && x > -min && (x = zero),
                                min > y && y > -min && (y = zero),
                                min > z && z > -min && (z = 0)),
                            transform = t.xPercent || t.yPercent ? "translate(" + t.xPercent + "%," + t.yPercent + "%) matrix3d(" : "matrix3d(",
                            transform += (min > a11 && a11 > -min ? zero : a11) + comma + (min > a21 && a21 > -min ? zero : a21) + comma + (min > a31 && a31 > -min ? zero : a31),
                            transform += comma + (min > a41 && a41 > -min ? zero : a41) + comma + (min > a12 && a12 > -min ? zero : a12) + comma + (min > a22 && a22 > -min ? zero : a22),
                            rotationX || rotationY ? (transform += comma + (min > a32 && a32 > -min ? zero : a32) + comma + (min > a42 && a42 > -min ? zero : a42) + comma + (min > a13 && a13 > -min ? zero : a13),
                                transform += comma + (min > a23 && a23 > -min ? zero : a23) + comma + (min > a33 && a33 > -min ? zero : a33) + comma + (min > a43 && a43 > -min ? zero : a43) + comma) : transform += ",0,0,0,0,1,0,",
                            transform += x + comma + y + comma + z + comma + (perspective ? 1 + -z / perspective : 1) + ")",
                            style[_transformProp] = transform
                    };
                p = Transform.prototype,
                    p.x = p.y = p.z = p.skewX = p.skewY = p.rotation = p.rotationX = p.rotationY = p.zOrigin = p.xPercent = p.yPercent = p.xOffset = p.yOffset = 0,
                    p.scaleX = p.scaleY = p.scaleZ = 1,
                    _registerComplexSpecialProp("transform,scale,scaleX,scaleY,scaleZ,x,y,z,rotation,rotationX,rotationY,rotationZ,skewX,skewY,shortRotation,shortRotationX,shortRotationY,shortRotationZ,transformOrigin,svgOrigin,transformPerspective,directionalRotation,parseTransform,force3D,skewType,xPercent,yPercent,smoothOrigin", {
                        parser: function (t, e, p, cssp, pt, plugin, vars) {
                            if (cssp._lastParsedTransform === vars)
                                return pt;
                            cssp._lastParsedTransform = vars;
                            var m2, skewY, copy, orig, has3D, hasChange, dr, x, y, originalGSTransform = t._gsTransform,
                                m1 = cssp._transform = _getTransform(t, _cs, !0, vars.parseTransform),
                                style = t.style,
                                min = 1e-6,
                                i = _transformProps.length,
                                v = vars,
                                endRotations = {},
                                transformOriginString = "transformOrigin";
                            if ("string" == typeof v.transform && _transformProp)
                                copy = _tempDiv.style,
                                copy[_transformProp] = v.transform,
                                copy.display = "block",
                                copy.position = "absolute",
                                _doc.body.appendChild(_tempDiv),
                                m2 = _getTransform(_tempDiv, null, !1),
                                _doc.body.removeChild(_tempDiv),
                                null != v.xPercent && (m2.xPercent = _parseVal(v.xPercent, m1.xPercent)),
                                null != v.yPercent && (m2.yPercent = _parseVal(v.yPercent, m1.yPercent));
                            else if ("object" == typeof v) {
                                if (m2 = {
                                        scaleX: _parseVal(null != v.scaleX ? v.scaleX : v.scale, m1.scaleX),
                                        scaleY: _parseVal(null != v.scaleY ? v.scaleY : v.scale, m1.scaleY),
                                        scaleZ: _parseVal(v.scaleZ, m1.scaleZ),
                                        x: _parseVal(v.x, m1.x),
                                        y: _parseVal(v.y, m1.y),
                                        z: _parseVal(v.z, m1.z),
                                        xPercent: _parseVal(v.xPercent, m1.xPercent),
                                        yPercent: _parseVal(v.yPercent, m1.yPercent),
                                        perspective: _parseVal(v.transformPerspective, m1.perspective)
                                    },
                                    dr = v.directionalRotation,
                                    null != dr)
                                    if ("object" == typeof dr)
                                        for (copy in dr)
                                            v[copy] = dr[copy];
                                    else
                                        v.rotation = dr;
                                "string" == typeof v.x && -1 !== v.x.indexOf("%") && (m2.x = 0,
                                        m2.xPercent = _parseVal(v.x, m1.xPercent)),
                                    "string" == typeof v.y && -1 !== v.y.indexOf("%") && (m2.y = 0,
                                        m2.yPercent = _parseVal(v.y, m1.yPercent)),
                                    m2.rotation = _parseAngle("rotation" in v ? v.rotation : "shortRotation" in v ? v.shortRotation + "_short" : "rotationZ" in v ? v.rotationZ : m1.rotation, m1.rotation, "rotation", endRotations),
                                    _supports3D && (m2.rotationX = _parseAngle("rotationX" in v ? v.rotationX : "shortRotationX" in v ? v.shortRotationX + "_short" : m1.rotationX || 0, m1.rotationX, "rotationX", endRotations),
                                        m2.rotationY = _parseAngle("rotationY" in v ? v.rotationY : "shortRotationY" in v ? v.shortRotationY + "_short" : m1.rotationY || 0, m1.rotationY, "rotationY", endRotations)),
                                    m2.skewX = null == v.skewX ? m1.skewX : _parseAngle(v.skewX, m1.skewX),
                                    m2.skewY = null == v.skewY ? m1.skewY : _parseAngle(v.skewY, m1.skewY),
                                    (skewY = m2.skewY - m1.skewY) && (m2.skewX += skewY,
                                        m2.rotation += skewY)
                            }
                            for (_supports3D && null != v.force3D && (m1.force3D = v.force3D,
                                    hasChange = !0),
                                m1.skewType = v.skewType || m1.skewType || CSSPlugin.defaultSkewType,
                                has3D = m1.force3D || m1.z || m1.rotationX || m1.rotationY || m2.z || m2.rotationX || m2.rotationY || m2.perspective,
                                has3D || null == v.scale || (m2.scaleZ = 1); --i > -1;)
                                p = _transformProps[i],
                                orig = m2[p] - m1[p],
                                (orig > min || -min > orig || null != v[p] || null != _forcePT[p]) && (hasChange = !0,
                                    pt = new CSSPropTween(m1, p, m1[p], orig, pt),
                                    p in endRotations && (pt.e = endRotations[p]),
                                    pt.xs0 = 0,
                                    pt.plugin = plugin,
                                    cssp._overwriteProps.push(pt.n));
                            return orig = v.transformOrigin,
                                m1.svg && (orig || v.svgOrigin) && (x = m1.xOffset,
                                    y = m1.yOffset,
                                    _parseSVGOrigin(t, _parsePosition(orig), m2, v.svgOrigin, v.smoothOrigin),
                                    pt = _addNonTweeningNumericPT(m1, "xOrigin", (originalGSTransform ? m1 : m2).xOrigin, m2.xOrigin, pt, transformOriginString),
                                    pt = _addNonTweeningNumericPT(m1, "yOrigin", (originalGSTransform ? m1 : m2).yOrigin, m2.yOrigin, pt, transformOriginString),
                                    (x !== m1.xOffset || y !== m1.yOffset) && (pt = _addNonTweeningNumericPT(m1, "xOffset", originalGSTransform ? x : m1.xOffset, m1.xOffset, pt, transformOriginString),
                                        pt = _addNonTweeningNumericPT(m1, "yOffset", originalGSTransform ? y : m1.yOffset, m1.yOffset, pt, transformOriginString)),
                                    orig = _useSVGTransformAttr ? null : "0px 0px"),
                                (orig || _supports3D && has3D && m1.zOrigin) && (_transformProp ? (hasChange = !0,
                                    p = _transformOriginProp,
                                    orig = (orig || _getStyle(t, p, _cs, !1, "50% 50%")) + "",
                                    pt = new CSSPropTween(style, p, 0, 0, pt, -1, transformOriginString),
                                    pt.b = style[p],
                                    pt.plugin = plugin,
                                    _supports3D ? (copy = m1.zOrigin,
                                        orig = orig.split(" "),
                                        m1.zOrigin = (orig.length > 2 && (0 === copy || "0px" !== orig[2]) ? parseFloat(orig[2]) : copy) || 0,
                                        pt.xs0 = pt.e = orig[0] + " " + (orig[1] || "50%") + " 0px",
                                        pt = new CSSPropTween(m1, "zOrigin", 0, 0, pt, -1, pt.n),
                                        pt.b = copy,
                                        pt.xs0 = pt.e = m1.zOrigin) : pt.xs0 = pt.e = orig) : _parsePosition(orig + "", m1)),
                                hasChange && (cssp._transformType = m1.svg && _useSVGTransformAttr || !has3D && 3 !== this._transformType ? 2 : 3),
                                pt
                        },
                        prefix: !0
                    }),
                    _registerComplexSpecialProp("boxShadow", {
                        defaultValue: "0px 0px 0px 0px #999",
                        prefix: !0,
                        color: !0,
                        multi: !0,
                        keyword: "inset"
                    }),
                    _registerComplexSpecialProp("borderRadius", {
                        defaultValue: "0px",
                        parser: function (t, e, p, cssp, pt, plugin) {
                            e = this.format(e);
                            var ea1, i, es2, bs2, bs, es, bn, en, w, h, esfx, bsfx, rel, hn, vn, em, props = ["borderTopLeftRadius", "borderTopRightRadius", "borderBottomRightRadius", "borderBottomLeftRadius"],
                                style = t.style;
                            for (w = parseFloat(t.offsetWidth),
                                h = parseFloat(t.offsetHeight),
                                ea1 = e.split(" "),
                                i = 0; i < props.length; i++)
                                this.p.indexOf("border") && (props[i] = _checkPropPrefix(props[i])),
                                bs = bs2 = _getStyle(t, props[i], _cs, !1, "0px"),
                                -1 !== bs.indexOf(" ") && (bs2 = bs.split(" "),
                                    bs = bs2[0],
                                    bs2 = bs2[1]),
                                es = es2 = ea1[i],
                                bn = parseFloat(bs),
                                bsfx = bs.substr((bn + "").length),
                                rel = "=" === es.charAt(1),
                                rel ? (en = parseInt(es.charAt(0) + "1", 10),
                                    es = es.substr(2),
                                    en *= parseFloat(es),
                                    esfx = es.substr((en + "").length - (0 > en ? 1 : 0)) || "") : (en = parseFloat(es),
                                    esfx = es.substr((en + "").length)),
                                "" === esfx && (esfx = _suffixMap[p] || bsfx),
                                esfx !== bsfx && (hn = _convertToPixels(t, "borderLeft", bn, bsfx),
                                    vn = _convertToPixels(t, "borderTop", bn, bsfx),
                                    "%" === esfx ? (bs = hn / w * 100 + "%",
                                        bs2 = vn / h * 100 + "%") : "em" === esfx ? (em = _convertToPixels(t, "borderLeft", 1, "em"),
                                        bs = hn / em + "em",
                                        bs2 = vn / em + "em") : (bs = hn + "px",
                                        bs2 = vn + "px"),
                                    rel && (es = parseFloat(bs) + en + esfx,
                                        es2 = parseFloat(bs2) + en + esfx)),
                                pt = _parseComplex(style, props[i], bs + " " + bs2, es + " " + es2, !1, "0px", pt);
                            return pt
                        },
                        prefix: !0,
                        formatter: _getFormatter("0px 0px 0px 0px", !1, !0)
                    }),
                    _registerComplexSpecialProp("backgroundPosition", {
                        defaultValue: "0 0",
                        parser: function (t, e, p, cssp, pt, plugin) {
                            var ba, ea, i, pct, overlap, src, bp = "background-position",
                                cs = _cs || _getComputedStyle(t, null),
                                bs = this.format((cs ? _ieVers ? cs.getPropertyValue(bp + "-x") + " " + cs.getPropertyValue(bp + "-y") : cs.getPropertyValue(bp) : t.currentStyle.backgroundPositionX + " " + t.currentStyle.backgroundPositionY) || "0 0"),
                                es = this.format(e);
                            if (-1 !== bs.indexOf("%") != (-1 !== es.indexOf("%")) && (src = _getStyle(t, "backgroundImage").replace(_urlExp, ""),
                                    src && "none" !== src)) {
                                for (ba = bs.split(" "),
                                    ea = es.split(" "),
                                    _tempImg.setAttribute("src", src),
                                    i = 2; --i > -1;)
                                    bs = ba[i],
                                    pct = -1 !== bs.indexOf("%"),
                                    pct !== (-1 !== ea[i].indexOf("%")) && (overlap = 0 === i ? t.offsetWidth - _tempImg.width : t.offsetHeight - _tempImg.height,
                                        ba[i] = pct ? parseFloat(bs) / 100 * overlap + "px" : parseFloat(bs) / overlap * 100 + "%");
                                bs = ba.join(" ")
                            }
                            return this.parseComplex(t.style, bs, es, pt, plugin)
                        },
                        formatter: _parsePosition
                    }),
                    _registerComplexSpecialProp("backgroundSize", {
                        defaultValue: "0 0",
                        formatter: _parsePosition
                    }),
                    _registerComplexSpecialProp("perspective", {
                        defaultValue: "0px",
                        prefix: !0
                    }),
                    _registerComplexSpecialProp("perspectiveOrigin", {
                        defaultValue: "50% 50%",
                        prefix: !0
                    }),
                    _registerComplexSpecialProp("transformStyle", {
                        prefix: !0
                    }),
                    _registerComplexSpecialProp("backfaceVisibility", {
                        prefix: !0
                    }),
                    _registerComplexSpecialProp("userSelect", {
                        prefix: !0
                    }),
                    _registerComplexSpecialProp("margin", {
                        parser: _getEdgeParser("marginTop,marginRight,marginBottom,marginLeft")
                    }),
                    _registerComplexSpecialProp("padding", {
                        parser: _getEdgeParser("paddingTop,paddingRight,paddingBottom,paddingLeft")
                    }),
                    _registerComplexSpecialProp("clip", {
                        defaultValue: "rect(0px,0px,0px,0px)",
                        parser: function (t, e, p, cssp, pt, plugin) {
                            var b, cs, delim;
                            return 9 > _ieVers ? (cs = t.currentStyle,
                                    delim = 8 > _ieVers ? " " : ",",
                                    b = "rect(" + cs.clipTop + delim + cs.clipRight + delim + cs.clipBottom + delim + cs.clipLeft + ")",
                                    e = this.format(e).split(",").join(delim)) : (b = this.format(_getStyle(t, this.p, _cs, !1, this.dflt)),
                                    e = this.format(e)),
                                this.parseComplex(t.style, b, e, pt, plugin)
                        }
                    }),
                    _registerComplexSpecialProp("textShadow", {
                        defaultValue: "0px 0px 0px #999",
                        color: !0,
                        multi: !0
                    }),
                    _registerComplexSpecialProp("autoRound,strictUnits", {
                        parser: function (t, e, p, cssp, pt) {
                            return pt
                        }
                    }),
                    _registerComplexSpecialProp("border", {
                        defaultValue: "0px solid #000",
                        parser: function (t, e, p, cssp, pt, plugin) {
                            return this.parseComplex(t.style, this.format(_getStyle(t, "borderTopWidth", _cs, !1, "0px") + " " + _getStyle(t, "borderTopStyle", _cs, !1, "solid") + " " + _getStyle(t, "borderTopColor", _cs, !1, "#000")), this.format(e), pt, plugin)
                        },
                        color: !0,
                        formatter: function (v) {
                            var a = v.split(" ");
                            return a[0] + " " + (a[1] || "solid") + " " + (v.match(_colorExp) || ["#000"])[0]
                        }
                    }),
                    _registerComplexSpecialProp("borderWidth", {
                        parser: _getEdgeParser("borderTopWidth,borderRightWidth,borderBottomWidth,borderLeftWidth")
                    }),
                    _registerComplexSpecialProp("float,cssFloat,styleFloat", {
                        parser: function (t, e, p, cssp, pt, plugin) {
                            var s = t.style,
                                prop = "cssFloat" in s ? "cssFloat" : "styleFloat";
                            return new CSSPropTween(s, prop, 0, 0, pt, -1, p, !1, 0, s[prop], e)
                        }
                    });
                var _setIEOpacityRatio = function (v) {
                    var skip, t = this.t,
                        filters = t.filter || _getStyle(this.data, "filter") || "",
                        val = this.s + this.c * v | 0;
                    100 === val && (-1 === filters.indexOf("atrix(") && -1 === filters.indexOf("radient(") && -1 === filters.indexOf("oader(") ? (t.removeAttribute("filter"),
                            skip = !_getStyle(this.data, "filter")) : (t.filter = filters.replace(_alphaFilterExp, ""),
                            skip = !0)),
                        skip || (this.xn1 && (t.filter = filters = filters || "alpha(opacity=" + val + ")"),
                            -1 === filters.indexOf("pacity") ? 0 === val && this.xn1 || (t.filter = filters + " alpha(opacity=" + val + ")") : t.filter = filters.replace(_opacityExp, "opacity=" + val))
                };
                _registerComplexSpecialProp("opacity,alpha,autoAlpha", {
                    defaultValue: "1",
                    parser: function (t, e, p, cssp, pt, plugin) {
                        var b = parseFloat(_getStyle(t, "opacity", _cs, !1, "1")),
                            style = t.style,
                            isAutoAlpha = "autoAlpha" === p;
                        return "string" == typeof e && "=" === e.charAt(1) && (e = ("-" === e.charAt(0) ? -1 : 1) * parseFloat(e.substr(2)) + b),
                            isAutoAlpha && 1 === b && "hidden" === _getStyle(t, "visibility", _cs) && 0 !== e && (b = 0),
                            _supportsOpacity ? pt = new CSSPropTween(style, "opacity", b, e - b, pt) : (pt = new CSSPropTween(style, "opacity", 100 * b, 100 * (e - b), pt),
                                pt.xn1 = isAutoAlpha ? 1 : 0,
                                style.zoom = 1,
                                pt.type = 2,
                                pt.b = "alpha(opacity=" + pt.s + ")",
                                pt.e = "alpha(opacity=" + (pt.s + pt.c) + ")",
                                pt.data = t,
                                pt.plugin = plugin,
                                pt.setRatio = _setIEOpacityRatio),
                            isAutoAlpha && (pt = new CSSPropTween(style, "visibility", 0, 0, pt, -1, null, !1, 0, 0 !== b ? "inherit" : "hidden", 0 === e ? "hidden" : "inherit"),
                                pt.xs0 = "inherit",
                                cssp._overwriteProps.push(pt.n),
                                cssp._overwriteProps.push(p)),
                            pt
                    }
                });
                var _removeProp = function (s, p) {
                        p && (s.removeProperty ? (("ms" === p.substr(0, 2) || "webkit" === p.substr(0, 6)) && (p = "-" + p),
                            s.removeProperty(p.replace(_capsExp, "-$1").toLowerCase())) : s.removeAttribute(p))
                    },
                    _setClassNameRatio = function (v) {
                        if (this.t._gsClassPT = this,
                            1 === v || 0 === v) {
                            this.t.setAttribute("class", 0 === v ? this.b : this.e);
                            for (var mpt = this.data, s = this.t.style; mpt;)
                                mpt.v ? s[mpt.p] = mpt.v : _removeProp(s, mpt.p),
                                mpt = mpt._next;
                            1 === v && this.t._gsClassPT === this && (this.t._gsClassPT = null)
                        } else
                            this.t.getAttribute("class") !== this.e && this.t.setAttribute("class", this.e)
                    };
                _registerComplexSpecialProp("className", {
                    parser: function (t, e, p, cssp, pt, plugin, vars) {
                        var difData, bs, cnpt, cnptLookup, mpt, b = t.getAttribute("class") || "",
                            cssText = t.style.cssText;
                        if (pt = cssp._classNamePT = new CSSPropTween(t, p, 0, 0, pt, 2),
                            pt.setRatio = _setClassNameRatio,
                            pt.pr = -11,
                            _hasPriority = !0,
                            pt.b = b,
                            bs = _getAllStyles(t, _cs),
                            cnpt = t._gsClassPT) {
                            for (cnptLookup = {},
                                mpt = cnpt.data; mpt;)
                                cnptLookup[mpt.p] = 1,
                                mpt = mpt._next;
                            cnpt.setRatio(1)
                        }
                        return t._gsClassPT = pt,
                            pt.e = "=" !== e.charAt(1) ? e : b.replace(new RegExp("\\s*\\b" + e.substr(2) + "\\b"), "") + ("+" === e.charAt(0) ? " " + e.substr(2) : ""),
                            t.setAttribute("class", pt.e),
                            difData = _cssDif(t, bs, _getAllStyles(t), vars, cnptLookup),
                            t.setAttribute("class", b),
                            pt.data = difData.firstMPT,
                            t.style.cssText = cssText,
                            pt = pt.xfirst = cssp.parse(t, difData.difs, pt, plugin)
                    }
                });
                var _setClearPropsRatio = function (v) {
                    if ((1 === v || 0 === v) && this.data._totalTime === this.data._totalDuration && "isFromStart" !== this.data.data) {
                        var a, p, i, clearTransform, transform, s = this.t.style,
                            transformParse = _specialProps.transform.parse;
                        if ("all" === this.e)
                            s.cssText = "",
                            clearTransform = !0;
                        else
                            for (a = this.e.split(" ").join("").split(","),
                                i = a.length; --i > -1;)
                                p = a[i],
                                _specialProps[p] && (_specialProps[p].parse === transformParse ? clearTransform = !0 : p = "transformOrigin" === p ? _transformOriginProp : _specialProps[p].p),
                                _removeProp(s, p);
                        clearTransform && (_removeProp(s, _transformProp),
                            transform = this.t._gsTransform,
                            transform && (transform.svg && this.t.removeAttribute("data-svg-origin"),
                                delete this.t._gsTransform))
                    }
                };
                for (_registerComplexSpecialProp("clearProps", {
                        parser: function (t, e, p, cssp, pt) {
                            return pt = new CSSPropTween(t, p, 0, 0, pt, 2),
                                pt.setRatio = _setClearPropsRatio,
                                pt.e = e,
                                pt.pr = -10,
                                pt.data = cssp._tween,
                                _hasPriority = !0,
                                pt
                        }
                    }),
                    p = "bezier,throwProps,physicsProps,physics2D".split(","),
                    i = p.length; i--;)
                    _registerPluginProp(p[i]);
                p = CSSPlugin.prototype,
                    p._firstPT = p._lastParsedTransform = p._transform = null,
                    p._onInitTween = function (target, vars, tween) {
                        if (!target.nodeType)
                            return !1;
                        this._target = target,
                            this._tween = tween,
                            this._vars = vars,
                            _autoRound = vars.autoRound,
                            _hasPriority = !1,
                            _suffixMap = vars.suffixMap || CSSPlugin.suffixMap,
                            _cs = _getComputedStyle(target, ""),
                            _overwriteProps = this._overwriteProps;
                        var v, pt, pt2, first, last, next, zIndex, tpt, threeD, style = target.style;
                        if (_reqSafariFix && "" === style.zIndex && (v = _getStyle(target, "zIndex", _cs),
                                ("auto" === v || "" === v) && this._addLazySet(style, "zIndex", 0)),
                            "string" == typeof vars && (first = style.cssText,
                                v = _getAllStyles(target, _cs),
                                style.cssText = first + ";" + vars,
                                v = _cssDif(target, v, _getAllStyles(target)).difs,
                                !_supportsOpacity && _opacityValExp.test(vars) && (v.opacity = parseFloat(RegExp.$1)),
                                vars = v,
                                style.cssText = first),
                            vars.className ? this._firstPT = pt = _specialProps.className.parse(target, vars.className, "className", this, null, null, vars) : this._firstPT = pt = this.parse(target, vars, null),
                            this._transformType) {
                            for (threeD = 3 === this._transformType,
                                _transformProp ? _isSafari && (_reqSafariFix = !0,
                                    "" === style.zIndex && (zIndex = _getStyle(target, "zIndex", _cs),
                                        ("auto" === zIndex || "" === zIndex) && this._addLazySet(style, "zIndex", 0)),
                                    _isSafariLT6 && this._addLazySet(style, "WebkitBackfaceVisibility", this._vars.WebkitBackfaceVisibility || (threeD ? "visible" : "hidden"))) : style.zoom = 1,
                                pt2 = pt; pt2 && pt2._next;)
                                pt2 = pt2._next;
                            tpt = new CSSPropTween(target, "transform", 0, 0, null, 2),
                                this._linkCSSP(tpt, null, pt2),
                                tpt.setRatio = _transformProp ? _setTransformRatio : _setIETransformRatio,
                                tpt.data = this._transform || _getTransform(target, _cs, !0),
                                tpt.tween = tween,
                                tpt.pr = -1,
                                _overwriteProps.pop()
                        }
                        if (_hasPriority) {
                            for (; pt;) {
                                for (next = pt._next,
                                    pt2 = first; pt2 && pt2.pr > pt.pr;)
                                    pt2 = pt2._next;
                                (pt._prev = pt2 ? pt2._prev : last) ? pt._prev._next = pt: first = pt,
                                    (pt._next = pt2) ? pt2._prev = pt : last = pt,
                                    pt = next
                            }
                            this._firstPT = first
                        }
                        return !0
                    },
                    p.parse = function (target, vars, pt, plugin) {
                        var p, sp, bn, en, bs, es, bsfx, esfx, isStr, rel, style = target.style;
                        for (p in vars)
                            es = vars[p],
                            sp = _specialProps[p],
                            sp ? pt = sp.parse(target, es, p, this, pt, plugin, vars) : (bs = _getStyle(target, p, _cs) + "",
                                isStr = "string" == typeof es,
                                "color" === p || "fill" === p || "stroke" === p || -1 !== p.indexOf("Color") || isStr && _rgbhslExp.test(es) ? (isStr || (es = _parseColor(es),
                                        es = (es.length > 3 ? "rgba(" : "rgb(") + es.join(",") + ")"),
                                    pt = _parseComplex(style, p, bs, es, !0, "transparent", pt, 0, plugin)) : !isStr || -1 === es.indexOf(" ") && -1 === es.indexOf(",") ? (bn = parseFloat(bs),
                                    bsfx = bn || 0 === bn ? bs.substr((bn + "").length) : "",
                                    ("" === bs || "auto" === bs) && ("width" === p || "height" === p ? (bn = _getDimension(target, p, _cs),
                                        bsfx = "px") : "left" === p || "top" === p ? (bn = _calculateOffset(target, p, _cs),
                                        bsfx = "px") : (bn = "opacity" !== p ? 0 : 1,
                                        bsfx = "")),
                                    rel = isStr && "=" === es.charAt(1),
                                    rel ? (en = parseInt(es.charAt(0) + "1", 10),
                                        es = es.substr(2),
                                        en *= parseFloat(es),
                                        esfx = es.replace(_suffixExp, "")) : (en = parseFloat(es),
                                        esfx = isStr ? es.replace(_suffixExp, "") : ""),
                                    "" === esfx && (esfx = p in _suffixMap ? _suffixMap[p] : bsfx),
                                    es = en || 0 === en ? (rel ? en + bn : en) + esfx : vars[p],
                                    bsfx !== esfx && "" !== esfx && (en || 0 === en) && bn && (bn = _convertToPixels(target, p, bn, bsfx),
                                        "%" === esfx ? (bn /= _convertToPixels(target, p, 100, "%") / 100,
                                            vars.strictUnits !== !0 && (bs = bn + "%")) : "em" === esfx ? bn /= _convertToPixels(target, p, 1, "em") : "px" !== esfx && (en = _convertToPixels(target, p, en, esfx),
                                            esfx = "px"),
                                        rel && (en || 0 === en) && (es = en + bn + esfx)),
                                    rel && (en += bn),
                                    !bn && 0 !== bn || !en && 0 !== en ? void 0 !== style[p] && (es || es + "" != "NaN" && null != es) ? (pt = new CSSPropTween(style, p, en || bn || 0, 0, pt, -1, p, !1, 0, bs, es),
                                        pt.xs0 = "none" !== es || "display" !== p && -1 === p.indexOf("Style") ? es : bs) : _log("invalid " + p + " tween value: " + vars[p]) : (pt = new CSSPropTween(style, p, bn, en - bn, pt, 0, p, _autoRound !== !1 && ("px" === esfx || "zIndex" === p), 0, bs, es),
                                        pt.xs0 = esfx)) : pt = _parseComplex(style, p, bs, es, !0, null, pt, 0, plugin)),
                            plugin && pt && !pt.plugin && (pt.plugin = plugin);
                        return pt
                    },
                    p.setRatio = function (v) {
                        var val, str, i, pt = this._firstPT,
                            min = 1e-6;
                        if (1 !== v || this._tween._time !== this._tween._duration && 0 !== this._tween._time)
                            if (v || this._tween._time !== this._tween._duration && 0 !== this._tween._time || this._tween._rawPrevTime === -1e-6)
                                for (; pt;) {
                                    if (val = pt.c * v + pt.s,
                                        pt.r ? val = Math.round(val) : min > val && val > -min && (val = 0),
                                        pt.type)
                                        if (1 === pt.type)
                                            if (i = pt.l,
                                                2 === i)
                                                pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2;
                                            else if (3 === i)
                                        pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3;
                                    else if (4 === i)
                                        pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4;
                                    else if (5 === i)
                                        pt.t[pt.p] = pt.xs0 + val + pt.xs1 + pt.xn1 + pt.xs2 + pt.xn2 + pt.xs3 + pt.xn3 + pt.xs4 + pt.xn4 + pt.xs5;
                                    else {
                                        for (str = pt.xs0 + val + pt.xs1,
                                            i = 1; i < pt.l; i++)
                                            str += pt["xn" + i] + pt["xs" + (i + 1)];
                                        pt.t[pt.p] = str
                                    } else
                                        -1 === pt.type ? pt.t[pt.p] = pt.xs0 : pt.setRatio && pt.setRatio(v);
                                    else
                                        pt.t[pt.p] = val + pt.xs0;
                                    pt = pt._next
                                }
                        else
                            for (; pt;)
                                2 !== pt.type ? pt.t[pt.p] = pt.b : pt.setRatio(v),
                                pt = pt._next;
                        else
                            for (; pt;) {
                                if (2 !== pt.type)
                                    if (pt.r && -1 !== pt.type)
                                        if (val = Math.round(pt.s + pt.c),
                                            pt.type) {
                                            if (1 === pt.type) {
                                                for (i = pt.l,
                                                    str = pt.xs0 + val + pt.xs1,
                                                    i = 1; i < pt.l; i++)
                                                    str += pt["xn" + i] + pt["xs" + (i + 1)];
                                                pt.t[pt.p] = str
                                            }
                                        } else
                                            pt.t[pt.p] = val + pt.xs0;
                                else
                                    pt.t[pt.p] = pt.e;
                                else
                                    pt.setRatio(v);
                                pt = pt._next
                            }
                    },
                    p._enableTransforms = function (threeD) {
                        this._transform = this._transform || _getTransform(this._target, _cs, !0),
                            this._transformType = this._transform.svg && _useSVGTransformAttr || !threeD && 3 !== this._transformType ? 2 : 3
                    };
                var lazySet = function (v) {
                    this.t[this.p] = this.e,
                        this.data._linkCSSP(this, this._next, null, !0)
                };
                p._addLazySet = function (t, p, v) {
                        var pt = this._firstPT = new CSSPropTween(t, p, 0, 0, this._firstPT, 2);
                        pt.e = v,
                            pt.setRatio = lazySet,
                            pt.data = this
                    },
                    p._linkCSSP = function (pt, next, prev, remove) {
                        return pt && (next && (next._prev = pt),
                                pt._next && (pt._next._prev = pt._prev),
                                pt._prev ? pt._prev._next = pt._next : this._firstPT === pt && (this._firstPT = pt._next,
                                    remove = !0),
                                prev ? prev._next = pt : remove || null !== this._firstPT || (this._firstPT = pt),
                                pt._next = next,
                                pt._prev = prev),
                            pt
                    },
                    p._kill = function (lookup) {
                        var pt, p, xfirst, copy = lookup;
                        if (lookup.autoAlpha || lookup.alpha) {
                            copy = {};
                            for (p in lookup)
                                copy[p] = lookup[p];
                            copy.opacity = 1,
                                copy.autoAlpha && (copy.visibility = 1)
                        }
                        return lookup.className && (pt = this._classNamePT) && (xfirst = pt.xfirst,
                                xfirst && xfirst._prev ? this._linkCSSP(xfirst._prev, pt._next, xfirst._prev._prev) : xfirst === this._firstPT && (this._firstPT = pt._next),
                                pt._next && this._linkCSSP(pt._next, pt._next._next, xfirst._prev),
                                this._classNamePT = null),
                            TweenPlugin.prototype._kill.call(this, copy)
                    };
                var _getChildStyles = function (e, props, targets) {
                    var children, i, child, type;
                    if (e.slice)
                        for (i = e.length; --i > -1;)
                            _getChildStyles(e[i], props, targets);
                    else
                        for (children = e.childNodes,
                            i = children.length; --i > -1;)
                            child = children[i],
                            type = child.type,
                            child.style && (props.push(_getAllStyles(child)),
                                targets && targets.push(child)),
                            1 !== type && 9 !== type && 11 !== type || !child.childNodes.length || _getChildStyles(child, props, targets)
                };
                return CSSPlugin.cascadeTo = function (target, duration, vars) {
                        var i, difs, p, from, tween = TweenLite.to(target, duration, vars),
                            results = [tween],
                            b = [],
                            e = [],
                            targets = [],
                            _reservedProps = TweenLite._internals.reservedProps;
                        for (target = tween._targets || tween.target,
                            _getChildStyles(target, b, targets),
                            tween.render(duration, !0, !0),
                            _getChildStyles(target, e),
                            tween.render(0, !0, !0),
                            tween._enabled(!0),
                            i = targets.length; --i > -1;)
                            if (difs = _cssDif(targets[i], b[i], e[i]),
                                difs.firstMPT) {
                                difs = difs.difs;
                                for (p in vars)
                                    _reservedProps[p] && (difs[p] = vars[p]);
                                from = {};
                                for (p in difs)
                                    from[p] = b[i][p];
                                results.push(TweenLite.fromTo(targets[i], duration, from, difs))
                            }
                        return results
                    },
                    TweenPlugin.activate([CSSPlugin]),
                    CSSPlugin
            }, !0),
            function () {
                var RoundPropsPlugin = _gsScope._gsDefine.plugin({
                        propName: "roundProps",
                        priority: -1,
                        API: 2,
                        init: function (target, value, tween) {
                            return this._tween = tween,
                                !0
                        }
                    }),
                    p = RoundPropsPlugin.prototype;
                p._onInitAllProps = function () {
                        for (var prop, pt, next, tween = this._tween, rp = tween.vars.roundProps instanceof Array ? tween.vars.roundProps : tween.vars.roundProps.split(","), i = rp.length, lookup = {}, rpt = tween._propLookup.roundProps; --i > -1;)
                            lookup[rp[i]] = 1;
                        for (i = rp.length; --i > -1;)
                            for (prop = rp[i],
                                pt = tween._firstPT; pt;)
                                next = pt._next,
                                pt.pg ? pt.t._roundProps(lookup, !0) : pt.n === prop && (this._add(pt.t, prop, pt.s, pt.c),
                                    next && (next._prev = pt._prev),
                                    pt._prev ? pt._prev._next = next : tween._firstPT === pt && (tween._firstPT = next),
                                    pt._next = pt._prev = null,
                                    tween._propLookup[prop] = rpt),
                                pt = next;
                        return !1
                    },
                    p._add = function (target, p, s, c) {
                        this._addTween(target, p, s, s + c, p, !0),
                            this._overwriteProps.push(p)
                    }
            }(),
            function () {
                var _numExp = /(?:\d|\-|\+|=|#|\.)*/g,
                    _suffixExp = /[A-Za-z%]/g;
                _gsScope._gsDefine.plugin({
                    propName: "attr",
                    API: 2,
                    version: "0.4.0",
                    init: function (target, value, tween) {
                        var p, start, end, suffix, i;
                        if ("function" != typeof target.setAttribute)
                            return !1;
                        this._target = target,
                            this._proxy = {},
                            this._start = {},
                            this._end = {},
                            this._suffix = {};
                        for (p in value)
                            this._start[p] = this._proxy[p] = start = target.getAttribute(p) + "",
                            this._end[p] = end = value[p] + "",
                            this._suffix[p] = suffix = _suffixExp.test(end) ? end.replace(_numExp, "") : _suffixExp.test(start) ? start.replace(_numExp, "") : "",
                            suffix && (i = end.indexOf(suffix),
                                -1 !== i && (end = end.substr(0, i))),
                            this._addTween(this._proxy, p, parseFloat(start), end, p) || (this._suffix[p] = ""),
                            "=" === end.charAt(1) && (this._end[p] = this._firstPT.s + this._firstPT.c + suffix),
                            this._overwriteProps.push(p);
                        return !0
                    },
                    set: function (ratio) {
                        this._super.setRatio.call(this, ratio);
                        for (var p, props = this._overwriteProps, i = props.length, lookup = 1 === ratio ? this._end : ratio ? this._proxy : this._start, useSuffix = lookup === this._proxy; --i > -1;)
                            p = props[i],
                            this._target.setAttribute(p, lookup[p] + (useSuffix ? this._suffix[p] : ""))
                    }
                })
            }(),
            _gsScope._gsDefine.plugin({
                propName: "directionalRotation",
                version: "0.2.1",
                API: 2,
                init: function (target, value, tween) {
                    "object" != typeof value && (value = {
                            rotation: value
                        }),
                        this.finals = {};
                    var p, v, start, end, dif, split, cap = value.useRadians === !0 ? 2 * Math.PI : 360,
                        min = 1e-6;
                    for (p in value)
                        "useRadians" !== p && (split = (value[p] + "").split("_"),
                            v = split[0],
                            start = parseFloat("function" != typeof target[p] ? target[p] : target[p.indexOf("set") || "function" != typeof target["get" + p.substr(3)] ? p : "get" + p.substr(3)]()),
                            end = this.finals[p] = "string" == typeof v && "=" === v.charAt(1) ? start + parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : Number(v) || 0,
                            dif = end - start,
                            split.length && (v = split.join("_"),
                                -1 !== v.indexOf("short") && (dif %= cap,
                                    dif !== dif % (cap / 2) && (dif = 0 > dif ? dif + cap : dif - cap)),
                                -1 !== v.indexOf("_cw") && 0 > dif ? dif = (dif + 9999999999 * cap) % cap - (dif / cap | 0) * cap : -1 !== v.indexOf("ccw") && dif > 0 && (dif = (dif - 9999999999 * cap) % cap - (dif / cap | 0) * cap)),
                            (dif > min || -min > dif) && (this._addTween(target, p, start, start + dif, p),
                                this._overwriteProps.push(p)));
                    return !0
                },
                set: function (ratio) {
                    var pt;
                    if (1 !== ratio)
                        this._super.setRatio.call(this, ratio);
                    else
                        for (pt = this._firstPT; pt;)
                            pt.f ? pt.t[pt.p](this.finals[pt.p]) : pt.t[pt.p] = this.finals[pt.p],
                            pt = pt._next
                }
            })._autoCSS = !0,
            _gsScope._gsDefine("easing.Back", ["easing.Ease"], function (Ease) {
                var SteppedEase, RoughEase, _createElastic, w = _gsScope.GreenSockGlobals || _gsScope,
                    gs = w.com.greensock,
                    _2PI = 2 * Math.PI,
                    _HALF_PI = Math.PI / 2,
                    _class = gs._class,
                    _create = function (n, f) {
                        var C = _class("easing." + n, function () {}, !0),
                            p = C.prototype = new Ease;
                        return p.constructor = C,
                            p.getRatio = f,
                            C
                    },
                    _easeReg = Ease.register || function () {},
                    _wrap = function (name, EaseOut, EaseIn, EaseInOut, aliases) {
                        var C = _class("easing." + name, {
                            easeOut: new EaseOut,
                            easeIn: new EaseIn,
                            easeInOut: new EaseInOut
                        }, !0);
                        return _easeReg(C, name),
                            C
                    },
                    EasePoint = function (time, value, next) {
                        this.t = time,
                            this.v = value,
                            next && (this.next = next,
                                next.prev = this,
                                this.c = next.v - value,
                                this.gap = next.t - time)
                    },
                    _createBack = function (n, f) {
                        var C = _class("easing." + n, function (overshoot) {
                                this._p1 = overshoot || 0 === overshoot ? overshoot : 1.70158,
                                    this._p2 = 1.525 * this._p1
                            }, !0),
                            p = C.prototype = new Ease;
                        return p.constructor = C,
                            p.getRatio = f,
                            p.config = function (overshoot) {
                                return new C(overshoot)
                            },
                            C
                    },
                    Back = _wrap("Back", _createBack("BackOut", function (p) {
                        return (p -= 1) * p * ((this._p1 + 1) * p + this._p1) + 1
                    }), _createBack("BackIn", function (p) {
                        return p * p * ((this._p1 + 1) * p - this._p1)
                    }), _createBack("BackInOut", function (p) {
                        return (p *= 2) < 1 ? .5 * p * p * ((this._p2 + 1) * p - this._p2) : .5 * ((p -= 2) * p * ((this._p2 + 1) * p + this._p2) + 2)
                    })),
                    SlowMo = _class("easing.SlowMo", function (linearRatio, power, yoyoMode) {
                        power = power || 0 === power ? power : .7,
                            null == linearRatio ? linearRatio = .7 : linearRatio > 1 && (linearRatio = 1),
                            this._p = 1 !== linearRatio ? power : 0,
                            this._p1 = (1 - linearRatio) / 2,
                            this._p2 = linearRatio,
                            this._p3 = this._p1 + this._p2,
                            this._calcEnd = yoyoMode === !0
                    }, !0),
                    p = SlowMo.prototype = new Ease;
                return p.constructor = SlowMo,
                    p.getRatio = function (p) {
                        var r = p + (.5 - p) * this._p;
                        return p < this._p1 ? this._calcEnd ? 1 - (p = 1 - p / this._p1) * p : r - (p = 1 - p / this._p1) * p * p * p * r : p > this._p3 ? this._calcEnd ? 1 - (p = (p - this._p3) / this._p1) * p : r + (p - r) * (p = (p - this._p3) / this._p1) * p * p * p : this._calcEnd ? 1 : r
                    },
                    SlowMo.ease = new SlowMo(.7, .7),
                    p.config = SlowMo.config = function (linearRatio, power, yoyoMode) {
                        return new SlowMo(linearRatio, power, yoyoMode)
                    },
                    SteppedEase = _class("easing.SteppedEase", function (steps) {
                        steps = steps || 1,
                            this._p1 = 1 / steps,
                            this._p2 = steps + 1
                    }, !0),
                    p = SteppedEase.prototype = new Ease,
                    p.constructor = SteppedEase,
                    p.getRatio = function (p) {
                        return 0 > p ? p = 0 : p >= 1 && (p = .999999999),
                            (this._p2 * p >> 0) * this._p1
                    },
                    p.config = SteppedEase.config = function (steps) {
                        return new SteppedEase(steps)
                    },
                    RoughEase = _class("easing.RoughEase", function (vars) {
                        vars = vars || {};
                        for (var x, y, bump, invX, obj, pnt, taper = vars.taper || "none", a = [], cnt = 0, points = 0 | (vars.points || 20), i = points, randomize = vars.randomize !== !1, clamp = vars.clamp === !0, template = vars.template instanceof Ease ? vars.template : null, strength = "number" == typeof vars.strength ? .4 * vars.strength : .4; --i > -1;)
                            x = randomize ? Math.random() : 1 / points * i,
                            y = template ? template.getRatio(x) : x,
                            "none" === taper ? bump = strength : "out" === taper ? (invX = 1 - x,
                                bump = invX * invX * strength) : "in" === taper ? bump = x * x * strength : .5 > x ? (invX = 2 * x,
                                bump = invX * invX * .5 * strength) : (invX = 2 * (1 - x),
                                bump = invX * invX * .5 * strength),
                            randomize ? y += Math.random() * bump - .5 * bump : i % 2 ? y += .5 * bump : y -= .5 * bump,
                            clamp && (y > 1 ? y = 1 : 0 > y && (y = 0)),
                            a[cnt++] = {
                                x: x,
                                y: y
                            };
                        for (a.sort(function (a, b) {
                                return a.x - b.x
                            }),
                            pnt = new EasePoint(1, 1, null),
                            i = points; --i > -1;)
                            obj = a[i],
                            pnt = new EasePoint(obj.x, obj.y, pnt);
                        this._prev = new EasePoint(0, 0, 0 !== pnt.t ? pnt : pnt.next)
                    }, !0),
                    p = RoughEase.prototype = new Ease,
                    p.constructor = RoughEase,
                    p.getRatio = function (p) {
                        var pnt = this._prev;
                        if (p > pnt.t) {
                            for (; pnt.next && p >= pnt.t;)
                                pnt = pnt.next;
                            pnt = pnt.prev
                        } else
                            for (; pnt.prev && p <= pnt.t;)
                                pnt = pnt.prev;
                        return this._prev = pnt,
                            pnt.v + (p - pnt.t) / pnt.gap * pnt.c
                    },
                    p.config = function (vars) {
                        return new RoughEase(vars)
                    },
                    RoughEase.ease = new RoughEase,
                    _wrap("Bounce", _create("BounceOut", function (p) {
                        return 1 / 2.75 > p ? 7.5625 * p * p : 2 / 2.75 > p ? 7.5625 * (p -= 1.5 / 2.75) * p + .75 : 2.5 / 2.75 > p ? 7.5625 * (p -= 2.25 / 2.75) * p + .9375 : 7.5625 * (p -= 2.625 / 2.75) * p + .984375
                    }), _create("BounceIn", function (p) {
                        return (p = 1 - p) < 1 / 2.75 ? 1 - 7.5625 * p * p : 2 / 2.75 > p ? 1 - (7.5625 * (p -= 1.5 / 2.75) * p + .75) : 2.5 / 2.75 > p ? 1 - (7.5625 * (p -= 2.25 / 2.75) * p + .9375) : 1 - (7.5625 * (p -= 2.625 / 2.75) * p + .984375)
                    }), _create("BounceInOut", function (p) {
                        var invert = .5 > p;
                        return p = invert ? 1 - 2 * p : 2 * p - 1,
                            p = 1 / 2.75 > p ? 7.5625 * p * p : 2 / 2.75 > p ? 7.5625 * (p -= 1.5 / 2.75) * p + .75 : 2.5 / 2.75 > p ? 7.5625 * (p -= 2.25 / 2.75) * p + .9375 : 7.5625 * (p -= 2.625 / 2.75) * p + .984375,
                            invert ? .5 * (1 - p) : .5 * p + .5
                    })),
                    _wrap("Circ", _create("CircOut", function (p) {
                        return Math.sqrt(1 - (p -= 1) * p)
                    }), _create("CircIn", function (p) {
                        return -(Math.sqrt(1 - p * p) - 1)
                    }), _create("CircInOut", function (p) {
                        return (p *= 2) < 1 ? -.5 * (Math.sqrt(1 - p * p) - 1) : .5 * (Math.sqrt(1 - (p -= 2) * p) + 1)
                    })),
                    _createElastic = function (n, f, def) {
                        var C = _class("easing." + n, function (amplitude, period) {
                                this._p1 = amplitude >= 1 ? amplitude : 1,
                                    this._p2 = (period || def) / (1 > amplitude ? amplitude : 1),
                                    this._p3 = this._p2 / _2PI * (Math.asin(1 / this._p1) || 0),
                                    this._p2 = _2PI / this._p2
                            }, !0),
                            p = C.prototype = new Ease;
                        return p.constructor = C,
                            p.getRatio = f,
                            p.config = function (amplitude, period) {
                                return new C(amplitude, period)
                            },
                            C
                    },
                    _wrap("Elastic", _createElastic("ElasticOut", function (p) {
                        return this._p1 * Math.pow(2, -10 * p) * Math.sin((p - this._p3) * this._p2) + 1
                    }, .3), _createElastic("ElasticIn", function (p) {
                        return -(this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin((p - this._p3) * this._p2))
                    }, .3), _createElastic("ElasticInOut", function (p) {
                        return (p *= 2) < 1 ? -.5 * (this._p1 * Math.pow(2, 10 * (p -= 1)) * Math.sin((p - this._p3) * this._p2)) : this._p1 * Math.pow(2, -10 * (p -= 1)) * Math.sin((p - this._p3) * this._p2) * .5 + 1
                    }, .45)),
                    _wrap("Expo", _create("ExpoOut", function (p) {
                        return 1 - Math.pow(2, -10 * p)
                    }), _create("ExpoIn", function (p) {
                        return Math.pow(2, 10 * (p - 1)) - .001
                    }), _create("ExpoInOut", function (p) {
                        return (p *= 2) < 1 ? .5 * Math.pow(2, 10 * (p - 1)) : .5 * (2 - Math.pow(2, -10 * (p - 1)))
                    })),
                    _wrap("Sine", _create("SineOut", function (p) {
                        return Math.sin(p * _HALF_PI)
                    }), _create("SineIn", function (p) {
                        return -Math.cos(p * _HALF_PI) + 1
                    }), _create("SineInOut", function (p) {
                        return -.5 * (Math.cos(Math.PI * p) - 1)
                    })),
                    _class("easing.EaseLookup", {
                        find: function (s) {
                            return Ease.map[s]
                        }
                    }, !0),
                    _easeReg(w.SlowMo, "SlowMo", "ease,"),
                    _easeReg(RoughEase, "RoughEase", "ease,"),
                    _easeReg(SteppedEase, "SteppedEase", "ease,"),
                    Back
            }, !0)
    }),
    _gsScope._gsDefine && _gsScope._gsQueue.pop()(),
    function (window, moduleName) {
        "use strict";
        var _globals = window.GreenSockGlobals = window.GreenSockGlobals || window;
        if (!_globals.TweenLite) {
            var a, i, p, _ticker, _tickerActive, _namespace = function (ns) {
                    var i, a = ns.split("."),
                        p = _globals;
                    for (i = 0; i < a.length; i++)
                        p[a[i]] = p = p[a[i]] || {};
                    return p
                },
                gs = _namespace("com.greensock"),
                _tinyNum = 1e-10,
                _slice = function (a) {
                    var i, b = [],
                        l = a.length;
                    for (i = 0; i !== l; b.push(a[i++]))
                    ;
                    return b
                },
                _emptyFunc = function () {},
                _isArray = function () {
                    var toString = Object.prototype.toString,
                        array = toString.call([]);
                    return function (obj) {
                        return null != obj && (obj instanceof Array || "object" == typeof obj && !!obj.push && toString.call(obj) === array)
                    }
                }(),
                _defLookup = {},
                Definition = function (ns, dependencies, func, global) {
                    this.sc = _defLookup[ns] ? _defLookup[ns].sc : [],
                        _defLookup[ns] = this,
                        this.gsClass = null,
                        this.func = func;
                    var _classes = [];
                    this.check = function (init) {
                            for (var cur, a, n, cl, i = dependencies.length, missing = i; --i > -1;)
                                (cur = _defLookup[dependencies[i]] || new Definition(dependencies[i], [])).gsClass ? (_classes[i] = cur.gsClass,
                                    missing--) : init && cur.sc.push(this);
                            if (0 === missing && func)
                                for (a = ("com.greensock." + ns).split("."),
                                    n = a.pop(),
                                    cl = _namespace(a.join("."))[n] = this.gsClass = func.apply(func, _classes),
                                    global && (_globals[n] = cl,
                                        "function" == typeof define && define.amd ? define((window.GreenSockAMDPath ? window.GreenSockAMDPath + "/" : "") + ns.split(".").pop(), [], function () {
                                            return cl
                                        }) : ns === moduleName && "undefined" != typeof module && module.exports && (module.exports = cl)),
                                    i = 0; i < this.sc.length; i++)
                                    this.sc[i].check()
                        },
                        this.check(!0)
                },
                _gsDefine = window._gsDefine = function (ns, dependencies, func, global) {
                    return new Definition(ns, dependencies, func, global)
                },
                _class = gs._class = function (ns, func, global) {
                    return func = func || function () {},
                        _gsDefine(ns, [], function () {
                            return func
                        }, global),
                        func
                };
            _gsDefine.globals = _globals;
            var _baseParams = [0, 0, 1, 1],
                _blankArray = [],
                Ease = _class("easing.Ease", function (func, extraParams, type, power) {
                    this._func = func,
                        this._type = type || 0,
                        this._power = power || 0,
                        this._params = extraParams ? _baseParams.concat(extraParams) : _baseParams
                }, !0),
                _easeMap = Ease.map = {},
                _easeReg = Ease.register = function (ease, names, types, create) {
                    for (var e, name, j, type, na = names.split(","), i = na.length, ta = (types || "easeIn,easeOut,easeInOut").split(","); --i > -1;)
                        for (name = na[i],
                            e = create ? _class("easing." + name, null, !0) : gs.easing[name] || {},
                            j = ta.length; --j > -1;)
                            type = ta[j],
                            _easeMap[name + "." + type] = _easeMap[type + name] = e[type] = ease.getRatio ? ease : ease[type] || new ease
                };
            for (p = Ease.prototype,
                p._calcEnd = !1,
                p.getRatio = function (p) {
                    if (this._func)
                        return this._params[0] = p,
                            this._func.apply(null, this._params);
                    var t = this._type,
                        pw = this._power,
                        r = 1 === t ? 1 - p : 2 === t ? p : .5 > p ? 2 * p : 2 * (1 - p);
                    return 1 === pw ? r *= r : 2 === pw ? r *= r * r : 3 === pw ? r *= r * r * r : 4 === pw && (r *= r * r * r * r),
                        1 === t ? 1 - r : 2 === t ? r : .5 > p ? r / 2 : 1 - r / 2
                },
                a = ["Linear", "Quad", "Cubic", "Quart", "Quint,Strong"],
                i = a.length; --i > -1;)
                p = a[i] + ",Power" + i,
                _easeReg(new Ease(null, null, 1, i), p, "easeOut", !0),
                _easeReg(new Ease(null, null, 2, i), p, "easeIn" + (0 === i ? ",easeNone" : "")),
                _easeReg(new Ease(null, null, 3, i), p, "easeInOut");
            _easeMap.linear = gs.easing.Linear.easeIn,
                _easeMap.swing = gs.easing.Quad.easeInOut;
            var EventDispatcher = _class("events.EventDispatcher", function (target) {
                this._listeners = {},
                    this._eventTarget = target || this
            });
            p = EventDispatcher.prototype,
                p.addEventListener = function (type, callback, scope, useParam, priority) {
                    priority = priority || 0;
                    var listener, i, list = this._listeners[type],
                        index = 0;
                    for (null == list && (this._listeners[type] = list = []),
                        i = list.length; --i > -1;)
                        listener = list[i],
                        listener.c === callback && listener.s === scope ? list.splice(i, 1) : 0 === index && listener.pr < priority && (index = i + 1);
                    list.splice(index, 0, {
                            c: callback,
                            s: scope,
                            up: useParam,
                            pr: priority
                        }),
                        this !== _ticker || _tickerActive || _ticker.wake()
                },
                p.removeEventListener = function (type, callback) {
                    var i, list = this._listeners[type];
                    if (list)
                        for (i = list.length; --i > -1;)
                            if (list[i].c === callback)
                                return void list.splice(i, 1)
                },
                p.dispatchEvent = function (type) {
                    var i, t, listener, list = this._listeners[type];
                    if (list)
                        for (i = list.length,
                            t = this._eventTarget; --i > -1;)
                            listener = list[i],
                            listener && (listener.up ? listener.c.call(listener.s || t, {
                                type: type,
                                target: t
                            }) : listener.c.call(listener.s || t))
                };
            var _reqAnimFrame = window.requestAnimationFrame,
                _cancelAnimFrame = window.cancelAnimationFrame,
                _getTime = Date.now || function () {
                    return (new Date).getTime()
                },
                _lastUpdate = _getTime();
            for (a = ["ms", "moz", "webkit", "o"],
                i = a.length; --i > -1 && !_reqAnimFrame;)
                _reqAnimFrame = window[a[i] + "RequestAnimationFrame"],
                _cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
            _class("Ticker", function (fps, useRAF) {
                    var _fps, _req, _id, _gap, _nextTime, _self = this,
                        _startTime = _getTime(),
                        _useRAF = useRAF !== !1 && _reqAnimFrame,
                        _lagThreshold = 500,
                        _adjustedLag = 33,
                        _tickWord = "tick",
                        _tick = function (manual) {
                            var overlap, dispatch, elapsed = _getTime() - _lastUpdate;
                            elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag),
                                _lastUpdate += elapsed,
                                _self.time = (_lastUpdate - _startTime) / 1e3,
                                overlap = _self.time - _nextTime,
                                (!_fps || overlap > 0 || manual === !0) && (_self.frame++,
                                    _nextTime += overlap + (overlap >= _gap ? .004 : _gap - overlap),
                                    dispatch = !0),
                                manual !== !0 && (_id = _req(_tick)),
                                dispatch && _self.dispatchEvent(_tickWord)
                        };
                    EventDispatcher.call(_self),
                        _self.time = _self.frame = 0,
                        _self.tick = function () {
                            _tick(!0)
                        },
                        _self.lagSmoothing = function (threshold, adjustedLag) {
                            _lagThreshold = threshold || 1 / _tinyNum,
                                _adjustedLag = Math.min(adjustedLag, _lagThreshold, 0)
                        },
                        _self.sleep = function () {
                            null != _id && (_useRAF && _cancelAnimFrame ? _cancelAnimFrame(_id) : clearTimeout(_id),
                                _req = _emptyFunc,
                                _id = null,
                                _self === _ticker && (_tickerActive = !1))
                        },
                        _self.wake = function () {
                            null !== _id ? _self.sleep() : _self.frame > 10 && (_lastUpdate = _getTime() - _lagThreshold + 5),
                                _req = 0 === _fps ? _emptyFunc : _useRAF && _reqAnimFrame ? _reqAnimFrame : function (f) {
                                    return setTimeout(f, 1e3 * (_nextTime - _self.time) + 1 | 0)
                                },
                                _self === _ticker && (_tickerActive = !0),
                                _tick(2)
                        },
                        _self.fps = function (value) {
                            return arguments.length ? (_fps = value,
                                _gap = 1 / (_fps || 60),
                                _nextTime = this.time + _gap,
                                void _self.wake()) : _fps
                        },
                        _self.useRAF = function (value) {
                            return arguments.length ? (_self.sleep(),
                                _useRAF = value,
                                void _self.fps(_fps)) : _useRAF
                        },
                        _self.fps(fps),
                        setTimeout(function () {
                            _useRAF && _self.frame < 5 && _self.useRAF(!1)
                        }, 1500)
                }),
                p = gs.Ticker.prototype = new gs.events.EventDispatcher,
                p.constructor = gs.Ticker;
            var Animation = _class("core.Animation", function (duration, vars) {
                if (this.vars = vars = vars || {},
                    this._duration = this._totalDuration = duration || 0,
                    this._delay = Number(vars.delay) || 0,
                    this._timeScale = 1,
                    this._active = vars.immediateRender === !0,
                    this.data = vars.data,
                    this._reversed = vars.reversed === !0,
                    _rootTimeline) {
                    _tickerActive || _ticker.wake();
                    var tl = this.vars.useFrames ? _rootFramesTimeline : _rootTimeline;
                    tl.add(this, tl._time),
                        this.vars.paused && this.paused(!0)
                }
            });
            _ticker = Animation.ticker = new gs.Ticker,
                p = Animation.prototype,
                p._dirty = p._gc = p._initted = p._paused = !1,
                p._totalTime = p._time = 0,
                p._rawPrevTime = -1,
                p._next = p._last = p._onUpdate = p._timeline = p.timeline = null,
                p._paused = !1;
            var _checkTimeout = function () {
                _tickerActive && _getTime() - _lastUpdate > 2e3 && _ticker.wake(),
                    setTimeout(_checkTimeout, 2e3)
            };
            _checkTimeout(),
                p.play = function (from, suppressEvents) {
                    return null != from && this.seek(from, suppressEvents),
                        this.reversed(!1).paused(!1)
                },
                p.pause = function (atTime, suppressEvents) {
                    return null != atTime && this.seek(atTime, suppressEvents),
                        this.paused(!0)
                },
                p.resume = function (from, suppressEvents) {
                    return null != from && this.seek(from, suppressEvents),
                        this.paused(!1)
                },
                p.seek = function (time, suppressEvents) {
                    return this.totalTime(Number(time), suppressEvents !== !1)
                },
                p.restart = function (includeDelay, suppressEvents) {
                    return this.reversed(!1).paused(!1).totalTime(includeDelay ? -this._delay : 0, suppressEvents !== !1, !0)
                },
                p.reverse = function (from, suppressEvents) {
                    return null != from && this.seek(from || this.totalDuration(), suppressEvents),
                        this.reversed(!0).paused(!1)
                },
                p.render = function (time, suppressEvents, force) {},
                p.invalidate = function () {
                    return this._time = this._totalTime = 0,
                        this._initted = this._gc = !1,
                        this._rawPrevTime = -1,
                        (this._gc || !this.timeline) && this._enabled(!0),
                        this
                },
                p.isActive = function () {
                    var rawTime, tl = this._timeline,
                        startTime = this._startTime;
                    return !tl || !this._gc && !this._paused && tl.isActive() && (rawTime = tl.rawTime()) >= startTime && rawTime < startTime + this.totalDuration() / this._timeScale
                },
                p._enabled = function (enabled, ignoreTimeline) {
                    return _tickerActive || _ticker.wake(),
                        this._gc = !enabled,
                        this._active = this.isActive(),
                        ignoreTimeline !== !0 && (enabled && !this.timeline ? this._timeline.add(this, this._startTime - this._delay) : !enabled && this.timeline && this._timeline._remove(this, !0)),
                        !1
                },
                p._kill = function (vars, target) {
                    return this._enabled(!1, !1)
                },
                p.kill = function (vars, target) {
                    return this._kill(vars, target),
                        this
                },
                p._uncache = function (includeSelf) {
                    for (var tween = includeSelf ? this : this.timeline; tween;)
                        tween._dirty = !0,
                        tween = tween.timeline;
                    return this
                },
                p._swapSelfInParams = function (params) {
                    for (var i = params.length, copy = params.concat(); --i > -1;)
                        "{self}" === params[i] && (copy[i] = this);
                    return copy
                },
                p._callback = function (type) {
                    var v = this.vars;
                    v[type].apply(v[type + "Scope"] || v.callbackScope || this, v[type + "Params"] || _blankArray)
                },
                p.eventCallback = function (type, callback, params, scope) {
                    if ("on" === (type || "").substr(0, 2)) {
                        var v = this.vars;
                        if (1 === arguments.length)
                            return v[type];
                        null == callback ? delete v[type] : (v[type] = callback,
                                v[type + "Params"] = _isArray(params) && -1 !== params.join("").indexOf("{self}") ? this._swapSelfInParams(params) : params,
                                v[type + "Scope"] = scope),
                            "onUpdate" === type && (this._onUpdate = callback)
                    }
                    return this
                },
                p.delay = function (value) {
                    return arguments.length ? (this._timeline.smoothChildTiming && this.startTime(this._startTime + value - this._delay),
                        this._delay = value,
                        this) : this._delay
                },
                p.duration = function (value) {
                    return arguments.length ? (this._duration = this._totalDuration = value,
                        this._uncache(!0),
                        this._timeline.smoothChildTiming && this._time > 0 && this._time < this._duration && 0 !== value && this.totalTime(this._totalTime * (value / this._duration), !0),
                        this) : (this._dirty = !1,
                        this._duration)
                },
                p.totalDuration = function (value) {
                    return this._dirty = !1,
                        arguments.length ? this.duration(value) : this._totalDuration
                },
                p.time = function (value, suppressEvents) {
                    return arguments.length ? (this._dirty && this.totalDuration(),
                        this.totalTime(value > this._duration ? this._duration : value, suppressEvents)) : this._time
                },
                p.totalTime = function (time, suppressEvents, uncapped) {
                    if (_tickerActive || _ticker.wake(),
                        !arguments.length)
                        return this._totalTime;
                    if (this._timeline) {
                        if (0 > time && !uncapped && (time += this.totalDuration()),
                            this._timeline.smoothChildTiming) {
                            this._dirty && this.totalDuration();
                            var totalDuration = this._totalDuration,
                                tl = this._timeline;
                            if (time > totalDuration && !uncapped && (time = totalDuration),
                                this._startTime = (this._paused ? this._pauseTime : tl._time) - (this._reversed ? totalDuration - time : time) / this._timeScale,
                                tl._dirty || this._uncache(!1),
                                tl._timeline)
                                for (; tl._timeline;)
                                    tl._timeline._time !== (tl._startTime + tl._totalTime) / tl._timeScale && tl.totalTime(tl._totalTime, !0),
                                    tl = tl._timeline
                        }
                        this._gc && this._enabled(!0, !1),
                            (this._totalTime !== time || 0 === this._duration) && (this.render(time, suppressEvents, !1),
                                _lazyTweens.length && _lazyRender())
                    }
                    return this
                },
                p.progress = p.totalProgress = function (value, suppressEvents) {
                    return arguments.length ? this.totalTime(this.duration() * value, suppressEvents) : this._time / this.duration()
                },
                p.startTime = function (value) {
                    return arguments.length ? (value !== this._startTime && (this._startTime = value,
                            this.timeline && this.timeline._sortChildren && this.timeline.add(this, value - this._delay)),
                        this) : this._startTime
                },
                p.endTime = function (includeRepeats) {
                    return this._startTime + (0 != includeRepeats ? this.totalDuration() : this.duration()) / this._timeScale
                },
                p.timeScale = function (value) {
                    if (!arguments.length)
                        return this._timeScale;
                    if (value = value || _tinyNum,
                        this._timeline && this._timeline.smoothChildTiming) {
                        var pauseTime = this._pauseTime,
                            t = pauseTime || 0 === pauseTime ? pauseTime : this._timeline.totalTime();
                        this._startTime = t - (t - this._startTime) * this._timeScale / value
                    }
                    return this._timeScale = value,
                        this._uncache(!1)
                },
                p.reversed = function (value) {
                    return arguments.length ? (value != this._reversed && (this._reversed = value,
                            this.totalTime(this._timeline && !this._timeline.smoothChildTiming ? this.totalDuration() - this._totalTime : this._totalTime, !0)),
                        this) : this._reversed
                },
                p.paused = function (value) {
                    if (!arguments.length)
                        return this._paused;
                    var raw, elapsed, tl = this._timeline;
                    return value != this._paused && tl && (_tickerActive || value || _ticker.wake(),
                            raw = tl.rawTime(),
                            elapsed = raw - this._pauseTime,
                            !value && tl.smoothChildTiming && (this._startTime += elapsed,
                                this._uncache(!1)),
                            this._pauseTime = value ? raw : null,
                            this._paused = value,
                            this._active = this.isActive(),
                            !value && 0 !== elapsed && this._initted && this.duration() && this.render(tl.smoothChildTiming ? this._totalTime : (raw - this._startTime) / this._timeScale, !0, !0)),
                        this._gc && !value && this._enabled(!0, !1),
                        this
                };
            var SimpleTimeline = _class("core.SimpleTimeline", function (vars) {
                Animation.call(this, 0, vars),
                    this.autoRemoveChildren = this.smoothChildTiming = !0
            });
            p = SimpleTimeline.prototype = new Animation,
                p.constructor = SimpleTimeline,
                p.kill()._gc = !1,
                p._first = p._last = p._recent = null,
                p._sortChildren = !1,
                p.add = p.insert = function (child, position, align, stagger) {
                    var prevTween, st;
                    if (child._startTime = Number(position || 0) + child._delay,
                        child._paused && this !== child._timeline && (child._pauseTime = child._startTime + (this.rawTime() - child._startTime) / child._timeScale),
                        child.timeline && child.timeline._remove(child, !0),
                        child.timeline = child._timeline = this,
                        child._gc && child._enabled(!0, !0),
                        prevTween = this._last,
                        this._sortChildren)
                        for (st = child._startTime; prevTween && prevTween._startTime > st;)
                            prevTween = prevTween._prev;
                    return prevTween ? (child._next = prevTween._next,
                            prevTween._next = child) : (child._next = this._first,
                            this._first = child),
                        child._next ? child._next._prev = child : this._last = child,
                        child._prev = prevTween,
                        this._recent = child,
                        this._timeline && this._uncache(!0),
                        this
                },
                p._remove = function (tween, skipDisable) {
                    return tween.timeline === this && (skipDisable || tween._enabled(!1, !0),
                            tween._prev ? tween._prev._next = tween._next : this._first === tween && (this._first = tween._next),
                            tween._next ? tween._next._prev = tween._prev : this._last === tween && (this._last = tween._prev),
                            tween._next = tween._prev = tween.timeline = null,
                            tween === this._recent && (this._recent = this._last),
                            this._timeline && this._uncache(!0)),
                        this
                },
                p.render = function (time, suppressEvents, force) {
                    var next, tween = this._first;
                    for (this._totalTime = this._time = this._rawPrevTime = time; tween;)
                        next = tween._next,
                        (tween._active || time >= tween._startTime && !tween._paused) && (tween._reversed ? tween.render((tween._dirty ? tween.totalDuration() : tween._totalDuration) - (time - tween._startTime) * tween._timeScale, suppressEvents, force) : tween.render((time - tween._startTime) * tween._timeScale, suppressEvents, force)),
                        tween = next
                },
                p.rawTime = function () {
                    return _tickerActive || _ticker.wake(),
                        this._totalTime
                };
            var TweenLite = _class("TweenLite", function (target, duration, vars) {
                    if (Animation.call(this, duration, vars),
                        this.render = TweenLite.prototype.render,
                        null == target)
                        throw "Cannot tween a null target.";
                    this.target = target = "string" != typeof target ? target : TweenLite.selector(target) || target;
                    var i, targ, targets, isSelector = target.jquery || target.length && target !== window && target[0] && (target[0] === window || target[0].nodeType && target[0].style && !target.nodeType),
                        overwrite = this.vars.overwrite;
                    if (this._overwrite = overwrite = null == overwrite ? _overwriteLookup[TweenLite.defaultOverwrite] : "number" == typeof overwrite ? overwrite >> 0 : _overwriteLookup[overwrite],
                        (isSelector || target instanceof Array || target.push && _isArray(target)) && "number" != typeof target[0])
                        for (this._targets = targets = _slice(target),
                            this._propLookup = [],
                            this._siblings = [],
                            i = 0; i < targets.length; i++)
                            targ = targets[i],
                            targ ? "string" != typeof targ ? targ.length && targ !== window && targ[0] && (targ[0] === window || targ[0].nodeType && targ[0].style && !targ.nodeType) ? (targets.splice(i--, 1),
                                this._targets = targets = targets.concat(_slice(targ))) : (this._siblings[i] = _register(targ, this, !1),
                                1 === overwrite && this._siblings[i].length > 1 && _applyOverwrite(targ, this, null, 1, this._siblings[i])) : (targ = targets[i--] = TweenLite.selector(targ),
                                "string" == typeof targ && targets.splice(i + 1, 1)) : targets.splice(i--, 1);
                    else
                        this._propLookup = {},
                        this._siblings = _register(target, this, !1),
                        1 === overwrite && this._siblings.length > 1 && _applyOverwrite(target, this, null, 1, this._siblings);
                    (this.vars.immediateRender || 0 === duration && 0 === this._delay && this.vars.immediateRender !== !1) && (this._time = -_tinyNum,
                        this.render(-this._delay))
                }, !0),
                _isSelector = function (v) {
                    return v && v.length && v !== window && v[0] && (v[0] === window || v[0].nodeType && v[0].style && !v.nodeType)
                },
                _autoCSS = function (vars, target) {
                    var p, css = {};
                    for (p in vars)
                        _reservedProps[p] || p in target && "transform" !== p && "x" !== p && "y" !== p && "width" !== p && "height" !== p && "className" !== p && "border" !== p || !(!_plugins[p] || _plugins[p] && _plugins[p]._autoCSS) || (css[p] = vars[p],
                            delete vars[p]);
                    vars.css = css
                };
            p = TweenLite.prototype = new Animation,
                p.constructor = TweenLite,
                p.kill()._gc = !1,
                p.ratio = 0,
                p._firstPT = p._targets = p._overwrittenProps = p._startAt = null,
                p._notifyPluginsOfEnabled = p._lazy = !1,
                TweenLite.version = "1.17.0",
                TweenLite.defaultEase = p._ease = new Ease(null, null, 1, 1),
                TweenLite.defaultOverwrite = "auto",
                TweenLite.ticker = _ticker,
                TweenLite.autoSleep = 120,
                TweenLite.lagSmoothing = function (threshold, adjustedLag) {
                    _ticker.lagSmoothing(threshold, adjustedLag)
                },
                TweenLite.selector = window.$ || window.jQuery || function (e) {
                    var selector = window.$ || window.jQuery;
                    return selector ? (TweenLite.selector = selector,
                        selector(e)) : "undefined" == typeof document ? e : document.querySelectorAll ? document.querySelectorAll(e) : document.getElementById("#" === e.charAt(0) ? e.substr(1) : e)
                };
            var _lazyTweens = [],
                _lazyLookup = {},
                _internals = TweenLite._internals = {
                    isArray: _isArray,
                    isSelector: _isSelector,
                    lazyTweens: _lazyTweens
                },
                _plugins = TweenLite._plugins = {},
                _tweenLookup = _internals.tweenLookup = {},
                _tweenLookupNum = 0,
                _reservedProps = _internals.reservedProps = {
                    ease: 1,
                    delay: 1,
                    overwrite: 1,
                    onComplete: 1,
                    onCompleteParams: 1,
                    onCompleteScope: 1,
                    useFrames: 1,
                    runBackwards: 1,
                    startAt: 1,
                    onUpdate: 1,
                    onUpdateParams: 1,
                    onUpdateScope: 1,
                    onStart: 1,
                    onStartParams: 1,
                    onStartScope: 1,
                    onReverseComplete: 1,
                    onReverseCompleteParams: 1,
                    onReverseCompleteScope: 1,
                    onRepeat: 1,
                    onRepeatParams: 1,
                    onRepeatScope: 1,
                    easeParams: 1,
                    yoyo: 1,
                    immediateRender: 1,
                    repeat: 1,
                    repeatDelay: 1,
                    data: 1,
                    paused: 1,
                    reversed: 1,
                    autoCSS: 1,
                    lazy: 1,
                    onOverwrite: 1,
                    callbackScope: 1
                },
                _overwriteLookup = {
                    none: 0,
                    all: 1,
                    auto: 2,
                    concurrent: 3,
                    allOnStart: 4,
                    preexisting: 5,
                    "true": 1,
                    "false": 0
                },
                _rootFramesTimeline = Animation._rootFramesTimeline = new SimpleTimeline,
                _rootTimeline = Animation._rootTimeline = new SimpleTimeline,
                _nextGCFrame = 30,
                _lazyRender = _internals.lazyRender = function () {
                    var tween, i = _lazyTweens.length;
                    for (_lazyLookup = {}; --i > -1;)
                        tween = _lazyTweens[i],
                        tween && tween._lazy !== !1 && (tween.render(tween._lazy[0], tween._lazy[1], !0),
                            tween._lazy = !1);
                    _lazyTweens.length = 0
                };
            _rootTimeline._startTime = _ticker.time,
                _rootFramesTimeline._startTime = _ticker.frame,
                _rootTimeline._active = _rootFramesTimeline._active = !0,
                setTimeout(_lazyRender, 1),
                Animation._updateRoot = TweenLite.render = function () {
                    var i, a, p;
                    if (_lazyTweens.length && _lazyRender(),
                        _rootTimeline.render((_ticker.time - _rootTimeline._startTime) * _rootTimeline._timeScale, !1, !1),
                        _rootFramesTimeline.render((_ticker.frame - _rootFramesTimeline._startTime) * _rootFramesTimeline._timeScale, !1, !1),
                        _lazyTweens.length && _lazyRender(),
                        _ticker.frame >= _nextGCFrame) {
                        _nextGCFrame = _ticker.frame + (parseInt(TweenLite.autoSleep, 10) || 120);
                        for (p in _tweenLookup) {
                            for (a = _tweenLookup[p].tweens,
                                i = a.length; --i > -1;)
                                a[i]._gc && a.splice(i, 1);
                            0 === a.length && delete _tweenLookup[p]
                        }
                        if (p = _rootTimeline._first,
                            (!p || p._paused) && TweenLite.autoSleep && !_rootFramesTimeline._first && 1 === _ticker._listeners.tick.length) {
                            for (; p && p._paused;)
                                p = p._next;
                            p || _ticker.sleep()
                        }
                    }
                },
                _ticker.addEventListener("tick", Animation._updateRoot);
            var _register = function (target, tween, scrub) {
                    var a, i, id = target._gsTweenID;
                    if (_tweenLookup[id || (target._gsTweenID = id = "t" + _tweenLookupNum++)] || (_tweenLookup[id] = {
                            target: target,
                            tweens: []
                        }),
                        tween && (a = _tweenLookup[id].tweens,
                            a[i = a.length] = tween,
                            scrub))
                        for (; --i > -1;)
                            a[i] === tween && a.splice(i, 1);
                    return _tweenLookup[id].tweens
                },
                _onOverwrite = function (overwrittenTween, overwritingTween, target, killedProps) {
                    var r1, r2, func = overwrittenTween.vars.onOverwrite;
                    return func && (r1 = func(overwrittenTween, overwritingTween, target, killedProps)),
                        func = TweenLite.onOverwrite,
                        func && (r2 = func(overwrittenTween, overwritingTween, target, killedProps)),
                        r1 !== !1 && r2 !== !1
                },
                _applyOverwrite = function (target, tween, props, mode, siblings) {
                    var i, changed, curTween, l;
                    if (1 === mode || mode >= 4) {
                        for (l = siblings.length,
                            i = 0; l > i; i++)
                            if ((curTween = siblings[i]) !== tween)
                                curTween._gc || curTween._kill(null, target, tween) && (changed = !0);
                            else if (5 === mode)
                            break;
                        return changed
                    }
                    var globalStart, startTime = tween._startTime + _tinyNum,
                        overlaps = [],
                        oCount = 0,
                        zeroDur = 0 === tween._duration;
                    for (i = siblings.length; --i > -1;)
                        (curTween = siblings[i]) === tween || curTween._gc || curTween._paused || (curTween._timeline !== tween._timeline ? (globalStart = globalStart || _checkOverlap(tween, 0, zeroDur),
                            0 === _checkOverlap(curTween, globalStart, zeroDur) && (overlaps[oCount++] = curTween)) : curTween._startTime <= startTime && curTween._startTime + curTween.totalDuration() / curTween._timeScale > startTime && ((zeroDur || !curTween._initted) && startTime - curTween._startTime <= 2e-10 || (overlaps[oCount++] = curTween)));
                    for (i = oCount; --i > -1;)
                        if (curTween = overlaps[i],
                            2 === mode && curTween._kill(props, target, tween) && (changed = !0),
                            2 !== mode || !curTween._firstPT && curTween._initted) {
                            if (2 !== mode && !_onOverwrite(curTween, tween))
                                continue;
                            curTween._enabled(!1, !1) && (changed = !0)
                        }
                    return changed
                },
                _checkOverlap = function (tween, reference, zeroDur) {
                    for (var tl = tween._timeline, ts = tl._timeScale, t = tween._startTime; tl._timeline;) {
                        if (t += tl._startTime,
                            ts *= tl._timeScale,
                            tl._paused)
                            return -100;
                        tl = tl._timeline
                    }
                    return t /= ts,
                        t > reference ? t - reference : zeroDur && t === reference || !tween._initted && 2 * _tinyNum > t - reference ? _tinyNum : (t += tween.totalDuration() / tween._timeScale / ts) > reference + _tinyNum ? 0 : t - reference - _tinyNum
                };
            p._init = function () {
                    var i, initPlugins, pt, p, startVars, v = this.vars,
                        op = this._overwrittenProps,
                        dur = this._duration,
                        immediate = !!v.immediateRender,
                        ease = v.ease;
                    if (v.startAt) {
                        this._startAt && (this._startAt.render(-1, !0),
                                this._startAt.kill()),
                            startVars = {};
                        for (p in v.startAt)
                            startVars[p] = v.startAt[p];
                        if (startVars.overwrite = !1,
                            startVars.immediateRender = !0,
                            startVars.lazy = immediate && v.lazy !== !1,
                            startVars.startAt = startVars.delay = null,
                            this._startAt = TweenLite.to(this.target, 0, startVars),
                            immediate)
                            if (this._time > 0)
                                this._startAt = null;
                            else if (0 !== dur)
                            return
                    } else if (v.runBackwards && 0 !== dur)
                        if (this._startAt)
                            this._startAt.render(-1, !0),
                            this._startAt.kill(),
                            this._startAt = null;
                        else {
                            0 !== this._time && (immediate = !1),
                                pt = {};
                            for (p in v)
                                _reservedProps[p] && "autoCSS" !== p || (pt[p] = v[p]);
                            if (pt.overwrite = 0,
                                pt.data = "isFromStart",
                                pt.lazy = immediate && v.lazy !== !1,
                                pt.immediateRender = immediate,
                                this._startAt = TweenLite.to(this.target, 0, pt),
                                immediate) {
                                if (0 === this._time)
                                    return
                            } else
                                this._startAt._init(),
                                this._startAt._enabled(!1),
                                this.vars.immediateRender && (this._startAt = null)
                        }
                    if (this._ease = ease = ease ? ease instanceof Ease ? ease : "function" == typeof ease ? new Ease(ease, v.easeParams) : _easeMap[ease] || TweenLite.defaultEase : TweenLite.defaultEase,
                        v.easeParams instanceof Array && ease.config && (this._ease = ease.config.apply(ease, v.easeParams)),
                        this._easeType = this._ease._type,
                        this._easePower = this._ease._power,
                        this._firstPT = null,
                        this._targets)
                        for (i = this._targets.length; --i > -1;)
                            this._initProps(this._targets[i], this._propLookup[i] = {}, this._siblings[i], op ? op[i] : null) && (initPlugins = !0);
                    else
                        initPlugins = this._initProps(this.target, this._propLookup, this._siblings, op);
                    if (initPlugins && TweenLite._onPluginEvent("_onInitAllProps", this),
                        op && (this._firstPT || "function" != typeof this.target && this._enabled(!1, !1)),
                        v.runBackwards)
                        for (pt = this._firstPT; pt;)
                            pt.s += pt.c,
                            pt.c = -pt.c,
                            pt = pt._next;
                    this._onUpdate = v.onUpdate,
                        this._initted = !0
                },
                p._initProps = function (target, propLookup, siblings, overwrittenProps) {
                    var p, i, initPlugins, plugin, pt, v;
                    if (null == target)
                        return !1;
                    _lazyLookup[target._gsTweenID] && _lazyRender(),
                        this.vars.css || target.style && target !== window && target.nodeType && _plugins.css && this.vars.autoCSS !== !1 && _autoCSS(this.vars, target);
                    for (p in this.vars) {
                        if (v = this.vars[p],
                            _reservedProps[p])
                            v && (v instanceof Array || v.push && _isArray(v)) && -1 !== v.join("").indexOf("{self}") && (this.vars[p] = v = this._swapSelfInParams(v, this));
                        else if (_plugins[p] && (plugin = new _plugins[p])._onInitTween(target, this.vars[p], this)) {
                            for (this._firstPT = pt = {
                                    _next: this._firstPT,
                                    t: plugin,
                                    p: "setRatio",
                                    s: 0,
                                    c: 1,
                                    f: !0,
                                    n: p,
                                    pg: !0,
                                    pr: plugin._priority
                                },
                                i = plugin._overwriteProps.length; --i > -1;)
                                propLookup[plugin._overwriteProps[i]] = this._firstPT;
                            (plugin._priority || plugin._onInitAllProps) && (initPlugins = !0),
                            (plugin._onDisable || plugin._onEnable) && (this._notifyPluginsOfEnabled = !0)
                        } else
                            this._firstPT = propLookup[p] = pt = {
                                _next: this._firstPT,
                                t: target,
                                p: p,
                                f: "function" == typeof target[p],
                                n: p,
                                pg: !1,
                                pr: 0
                            },
                            pt.s = pt.f ? target[p.indexOf("set") || "function" != typeof target["get" + p.substr(3)] ? p : "get" + p.substr(3)]() : parseFloat(target[p]),
                            pt.c = "string" == typeof v && "=" === v.charAt(1) ? parseInt(v.charAt(0) + "1", 10) * Number(v.substr(2)) : Number(v) - pt.s || 0;
                        pt && pt._next && (pt._next._prev = pt)
                    }
                    return overwrittenProps && this._kill(overwrittenProps, target) ? this._initProps(target, propLookup, siblings, overwrittenProps) : this._overwrite > 1 && this._firstPT && siblings.length > 1 && _applyOverwrite(target, this, propLookup, this._overwrite, siblings) ? (this._kill(propLookup, target),
                        this._initProps(target, propLookup, siblings, overwrittenProps)) : (this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration) && (_lazyLookup[target._gsTweenID] = !0),
                        initPlugins)
                },
                p.render = function (time, suppressEvents, force) {
                    var isComplete, callback, pt, rawPrevTime, prevTime = this._time,
                        duration = this._duration,
                        prevRawPrevTime = this._rawPrevTime;
                    if (time >= duration)
                        this._totalTime = this._time = duration,
                        this.ratio = this._ease._calcEnd ? this._ease.getRatio(1) : 1,
                        this._reversed || (isComplete = !0,
                            callback = "onComplete",
                            force = force || this._timeline.autoRemoveChildren),
                        0 === duration && (this._initted || !this.vars.lazy || force) && (this._startTime === this._timeline._duration && (time = 0),
                            (0 === time || 0 > prevRawPrevTime || prevRawPrevTime === _tinyNum && "isPause" !== this.data) && prevRawPrevTime !== time && (force = !0,
                                prevRawPrevTime > _tinyNum && (callback = "onReverseComplete")),
                            this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum);
                    else if (1e-7 > time)
                        this._totalTime = this._time = 0,
                        this.ratio = this._ease._calcEnd ? this._ease.getRatio(0) : 0,
                        (0 !== prevTime || 0 === duration && prevRawPrevTime > 0) && (callback = "onReverseComplete",
                            isComplete = this._reversed),
                        0 > time && (this._active = !1,
                            0 === duration && (this._initted || !this.vars.lazy || force) && (prevRawPrevTime >= 0 && (prevRawPrevTime !== _tinyNum || "isPause" !== this.data) && (force = !0),
                                this._rawPrevTime = rawPrevTime = !suppressEvents || time || prevRawPrevTime === time ? time : _tinyNum)),
                        this._initted || (force = !0);
                    else if (this._totalTime = this._time = time,
                        this._easeType) {
                        var r = time / duration,
                            type = this._easeType,
                            pow = this._easePower;
                        (1 === type || 3 === type && r >= .5) && (r = 1 - r),
                        3 === type && (r *= 2),
                            1 === pow ? r *= r : 2 === pow ? r *= r * r : 3 === pow ? r *= r * r * r : 4 === pow && (r *= r * r * r * r),
                            1 === type ? this.ratio = 1 - r : 2 === type ? this.ratio = r : .5 > time / duration ? this.ratio = r / 2 : this.ratio = 1 - r / 2
                    } else
                        this.ratio = this._ease.getRatio(time / duration);
                    if (this._time !== prevTime || force) {
                        if (!this._initted) {
                            if (this._init(),
                                !this._initted || this._gc)
                                return;
                            if (!force && this._firstPT && (this.vars.lazy !== !1 && this._duration || this.vars.lazy && !this._duration))
                                return this._time = this._totalTime = prevTime,
                                    this._rawPrevTime = prevRawPrevTime,
                                    _lazyTweens.push(this),
                                    void(this._lazy = [time, suppressEvents]);
                            this._time && !isComplete ? this.ratio = this._ease.getRatio(this._time / duration) : isComplete && this._ease._calcEnd && (this.ratio = this._ease.getRatio(0 === this._time ? 0 : 1))
                        }
                        for (this._lazy !== !1 && (this._lazy = !1),
                            this._active || !this._paused && this._time !== prevTime && time >= 0 && (this._active = !0),
                            0 === prevTime && (this._startAt && (time >= 0 ? this._startAt.render(time, suppressEvents, force) : callback || (callback = "_dummyGS")),
                                this.vars.onStart && (0 !== this._time || 0 === duration) && (suppressEvents || this._callback("onStart"))),
                            pt = this._firstPT; pt;)
                            pt.f ? pt.t[pt.p](pt.c * this.ratio + pt.s) : pt.t[pt.p] = pt.c * this.ratio + pt.s,
                            pt = pt._next;
                        this._onUpdate && (0 > time && this._startAt && time !== -1e-4 && this._startAt.render(time, suppressEvents, force),
                                suppressEvents || (this._time !== prevTime || isComplete) && this._callback("onUpdate")),
                            callback && (!this._gc || force) && (0 > time && this._startAt && !this._onUpdate && time !== -1e-4 && this._startAt.render(time, suppressEvents, force),
                                isComplete && (this._timeline.autoRemoveChildren && this._enabled(!1, !1),
                                    this._active = !1),
                                !suppressEvents && this.vars[callback] && this._callback(callback),
                                0 === duration && this._rawPrevTime === _tinyNum && rawPrevTime !== _tinyNum && (this._rawPrevTime = 0))
                    }
                },
                p._kill = function (vars, target, overwritingTween) {
                    if ("all" === vars && (vars = null),
                        null == vars && (null == target || target === this.target))
                        return this._lazy = !1,
                            this._enabled(!1, !1);
                    target = "string" != typeof target ? target || this._targets || this.target : TweenLite.selector(target) || target;
                    var i, overwrittenProps, p, pt, propLookup, changed, killProps, record, killed, simultaneousOverwrite = overwritingTween && this._time && overwritingTween._startTime === this._startTime && this._timeline === overwritingTween._timeline;
                    if ((_isArray(target) || _isSelector(target)) && "number" != typeof target[0])
                        for (i = target.length; --i > -1;)
                            this._kill(vars, target[i], overwritingTween) && (changed = !0);
                    else {
                        if (this._targets) {
                            for (i = this._targets.length; --i > -1;)
                                if (target === this._targets[i]) {
                                    propLookup = this._propLookup[i] || {},
                                        this._overwrittenProps = this._overwrittenProps || [],
                                        overwrittenProps = this._overwrittenProps[i] = vars ? this._overwrittenProps[i] || {} : "all";
                                    break
                                }
                        } else {
                            if (target !== this.target)
                                return !1;
                            propLookup = this._propLookup,
                                overwrittenProps = this._overwrittenProps = vars ? this._overwrittenProps || {} : "all"
                        }
                        if (propLookup) {
                            if (killProps = vars || propLookup,
                                record = vars !== overwrittenProps && "all" !== overwrittenProps && vars !== propLookup && ("object" != typeof vars || !vars._tempKill),
                                overwritingTween && (TweenLite.onOverwrite || this.vars.onOverwrite)) {
                                for (p in killProps)
                                    propLookup[p] && (killed || (killed = []),
                                        killed.push(p));
                                if ((killed || !vars) && !_onOverwrite(this, overwritingTween, target, killed))
                                    return !1
                            }
                            for (p in killProps)
                                (pt = propLookup[p]) && (simultaneousOverwrite && (pt.f ? pt.t[pt.p](pt.s) : pt.t[pt.p] = pt.s,
                                        changed = !0),
                                    pt.pg && pt.t._kill(killProps) && (changed = !0),
                                    pt.pg && 0 !== pt.t._overwriteProps.length || (pt._prev ? pt._prev._next = pt._next : pt === this._firstPT && (this._firstPT = pt._next),
                                        pt._next && (pt._next._prev = pt._prev),
                                        pt._next = pt._prev = null),
                                    delete propLookup[p]),
                                record && (overwrittenProps[p] = 1);
                            !this._firstPT && this._initted && this._enabled(!1, !1)
                        }
                    }
                    return changed
                },
                p.invalidate = function () {
                    return this._notifyPluginsOfEnabled && TweenLite._onPluginEvent("_onDisable", this),
                        this._firstPT = this._overwrittenProps = this._startAt = this._onUpdate = null,
                        this._notifyPluginsOfEnabled = this._active = this._lazy = !1,
                        this._propLookup = this._targets ? {} : [],
                        Animation.prototype.invalidate.call(this),
                        this.vars.immediateRender && (this._time = -_tinyNum,
                            this.render(-this._delay)),
                        this
                },
                p._enabled = function (enabled, ignoreTimeline) {
                    if (_tickerActive || _ticker.wake(),
                        enabled && this._gc) {
                        var i, targets = this._targets;
                        if (targets)
                            for (i = targets.length; --i > -1;)
                                this._siblings[i] = _register(targets[i], this, !0);
                        else
                            this._siblings = _register(this.target, this, !0)
                    }
                    return Animation.prototype._enabled.call(this, enabled, ignoreTimeline),
                        this._notifyPluginsOfEnabled && this._firstPT ? TweenLite._onPluginEvent(enabled ? "_onEnable" : "_onDisable", this) : !1
                },
                TweenLite.to = function (target, duration, vars) {
                    return new TweenLite(target, duration, vars)
                },
                TweenLite.from = function (target, duration, vars) {
                    return vars.runBackwards = !0,
                        vars.immediateRender = 0 != vars.immediateRender,
                        new TweenLite(target, duration, vars)
                },
                TweenLite.fromTo = function (target, duration, fromVars, toVars) {
                    return toVars.startAt = fromVars,
                        toVars.immediateRender = 0 != toVars.immediateRender && 0 != fromVars.immediateRender,
                        new TweenLite(target, duration, toVars)
                },
                TweenLite.delayedCall = function (delay, callback, params, scope, useFrames) {
                    return new TweenLite(callback, 0, {
                        delay: delay,
                        onComplete: callback,
                        onCompleteParams: params,
                        callbackScope: scope,
                        onReverseComplete: callback,
                        onReverseCompleteParams: params,
                        immediateRender: !1,
                        lazy: !1,
                        useFrames: useFrames,
                        overwrite: 0
                    })
                },
                TweenLite.set = function (target, vars) {
                    return new TweenLite(target, 0, vars)
                },
                TweenLite.getTweensOf = function (target, onlyActive) {
                    if (null == target)
                        return [];
                    target = "string" != typeof target ? target : TweenLite.selector(target) || target;
                    var i, a, j, t;
                    if ((_isArray(target) || _isSelector(target)) && "number" != typeof target[0]) {
                        for (i = target.length,
                            a = []; --i > -1;)
                            a = a.concat(TweenLite.getTweensOf(target[i], onlyActive));
                        for (i = a.length; --i > -1;)
                            for (t = a[i],
                                j = i; --j > -1;)
                                t === a[j] && a.splice(i, 1)
                    } else
                        for (a = _register(target).concat(),
                            i = a.length; --i > -1;)
                            (a[i]._gc || onlyActive && !a[i].isActive()) && a.splice(i, 1);
                    return a
                },
                TweenLite.killTweensOf = TweenLite.killDelayedCallsTo = function (target, onlyActive, vars) {
                    "object" == typeof onlyActive && (vars = onlyActive,
                        onlyActive = !1);
                    for (var a = TweenLite.getTweensOf(target, onlyActive), i = a.length; --i > -1;)
                        a[i]._kill(vars, target)
                };
            var TweenPlugin = _class("plugins.TweenPlugin", function (props, priority) {
                this._overwriteProps = (props || "").split(","),
                    this._propName = this._overwriteProps[0],
                    this._priority = priority || 0,
                    this._super = TweenPlugin.prototype
            }, !0);
            if (p = TweenPlugin.prototype,
                TweenPlugin.version = "1.10.1",
                TweenPlugin.API = 2,
                p._firstPT = null,
                p._addTween = function (target, prop, start, end, overwriteProp, round) {
                    var c, pt;
                    return null != end && (c = "number" == typeof end || "=" !== end.charAt(1) ? Number(end) - Number(start) : parseInt(end.charAt(0) + "1", 10) * Number(end.substr(2))) ? (this._firstPT = pt = {
                            _next: this._firstPT,
                            t: target,
                            p: prop,
                            s: start,
                            c: c,
                            f: "function" == typeof target[prop],
                            n: overwriteProp || prop,
                            r: round
                        },
                        pt._next && (pt._next._prev = pt),
                        pt) : void 0
                },
                p.setRatio = function (v) {
                    for (var val, pt = this._firstPT, min = 1e-6; pt;)
                        val = pt.c * v + pt.s,
                        pt.r ? val = Math.round(val) : min > val && val > -min && (val = 0),
                        pt.f ? pt.t[pt.p](val) : pt.t[pt.p] = val,
                        pt = pt._next
                },
                p._kill = function (lookup) {
                    var i, a = this._overwriteProps,
                        pt = this._firstPT;
                    if (null != lookup[this._propName])
                        this._overwriteProps = [];
                    else
                        for (i = a.length; --i > -1;)
                            null != lookup[a[i]] && a.splice(i, 1);
                    for (; pt;)
                        null != lookup[pt.n] && (pt._next && (pt._next._prev = pt._prev),
                            pt._prev ? (pt._prev._next = pt._next,
                                pt._prev = null) : this._firstPT === pt && (this._firstPT = pt._next)),
                        pt = pt._next;
                    return !1
                },
                p._roundProps = function (lookup, value) {
                    for (var pt = this._firstPT; pt;)
                        (lookup[this._propName] || null != pt.n && lookup[pt.n.split(this._propName + "_").join("")]) && (pt.r = value),
                        pt = pt._next
                },
                TweenLite._onPluginEvent = function (type, tween) {
                    var changed, pt2, first, last, next, pt = tween._firstPT;
                    if ("_onInitAllProps" === type) {
                        for (; pt;) {
                            for (next = pt._next,
                                pt2 = first; pt2 && pt2.pr > pt.pr;)
                                pt2 = pt2._next;
                            (pt._prev = pt2 ? pt2._prev : last) ? pt._prev._next = pt: first = pt,
                                (pt._next = pt2) ? pt2._prev = pt : last = pt,
                                pt = next
                        }
                        pt = tween._firstPT = first
                    }
                    for (; pt;)
                        pt.pg && "function" == typeof pt.t[type] && pt.t[type]() && (changed = !0),
                        pt = pt._next;
                    return changed
                },
                TweenPlugin.activate = function (plugins) {
                    for (var i = plugins.length; --i > -1;)
                        plugins[i].API === TweenPlugin.API && (_plugins[(new plugins[i])._propName] = plugins[i]);
                    return !0
                },
                _gsDefine.plugin = function (config) {
                    if (!(config && config.propName && config.init && config.API))
                        throw "illegal plugin definition.";
                    var prop, propName = config.propName,
                        priority = config.priority || 0,
                        overwriteProps = config.overwriteProps,
                        map = {
                            init: "_onInitTween",
                            set: "setRatio",
                            kill: "_kill",
                            round: "_roundProps",
                            initAll: "_onInitAllProps"
                        },
                        Plugin = _class("plugins." + propName.charAt(0).toUpperCase() + propName.substr(1) + "Plugin", function () {
                            TweenPlugin.call(this, propName, priority),
                                this._overwriteProps = overwriteProps || []
                        }, config.global === !0),
                        p = Plugin.prototype = new TweenPlugin(propName);
                    p.constructor = Plugin,
                        Plugin.API = config.API;
                    for (prop in map)
                        "function" == typeof config[prop] && (p[map[prop]] = config[prop]);
                    return Plugin.version = config.version,
                        TweenPlugin.activate([Plugin]),
                        Plugin
                },
                a = window._gsQueue) {
                for (i = 0; i < a.length; i++)
                    a[i]();
                for (p in _defLookup)
                    _defLookup[p].func || window.console.log("GSAP encountered missing dependency: com.greensock." + p)
            }
            _tickerActive = !1
        }
    }("undefined" != typeof module && module.exports && "undefined" != typeof global ? global : this || window, "TweenMax"),
    function (global, factory) {
        "object" == typeof module && "object" == typeof module.exports ? module.exports = global.document ? factory(global, !0) : function (w) {
                if (!w.document)
                    throw new Error("jQuery requires a window with a document");
                return factory(w);
            } :
            factory(global)
    }("undefined" != typeof window ? window : this, function (window, noGlobal) {
        function isArraylike(obj) {
            var length = "length" in obj && obj.length,
                type = jQuery.type(obj);
            return "function" === type || jQuery.isWindow(obj) ? !1 : 1 === obj.nodeType && length ? !0 : "array" === type || 0 === length || "number" == typeof length && length > 0 && length - 1 in obj
        }

        function winnow(elements, qualifier, not) {
            if (jQuery.isFunction(qualifier))
                return jQuery.grep(elements, function (elem, i) {
                    return !!qualifier.call(elem, i, elem) !== not
                });
            if (qualifier.nodeType)
                return jQuery.grep(elements, function (elem) {
                    return elem === qualifier !== not
                });
            if ("string" == typeof qualifier) {
                if (risSimple.test(qualifier))
                    return jQuery.filter(qualifier, elements, not);
                qualifier = jQuery.filter(qualifier, elements)
            }
            return jQuery.grep(elements, function (elem) {
                return jQuery.inArray(elem, qualifier) >= 0 !== not
            })
        }

        function sibling(cur, dir) {
            do
                cur = cur[dir];
            while (cur && 1 !== cur.nodeType);
            return cur
        }

        function createOptions(options) {
            var object = optionsCache[options] = {};
            return jQuery.each(options.match(rnotwhite) || [], function (_, flag) {
                    object[flag] = !0
                }),
                object
        }

        function detach() {
            document.addEventListener ? (document.removeEventListener("DOMContentLoaded", completed, !1),
                window.removeEventListener("load", completed, !1)) : (document.detachEvent("onreadystatechange", completed),
                window.detachEvent("onload", completed))
        }

        function completed() {
            (document.addEventListener || "load" === event.type || "complete" === document.readyState) && (detach(),
                jQuery.ready())
        }

        function dataAttr(elem, key, data) {
            if (void 0 === data && 1 === elem.nodeType) {
                var name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
                if (data = elem.getAttribute(name),
                    "string" == typeof data) {
                    try {
                        data = "true" === data ? !0 : "false" === data ? !1 : "null" === data ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery.parseJSON(data) : data
                    } catch (e) {}
                    jQuery.data(elem, key, data)
                } else
                    data = void 0
            }
            return data
        }

        function isEmptyDataObject(obj) {
            var name;
            for (name in obj)
                if (("data" !== name || !jQuery.isEmptyObject(obj[name])) && "toJSON" !== name)
                    return !1;
            return !0
        }

        function internalData(elem, name, data, pvt) {
            if (jQuery.acceptData(elem)) {
                var ret, thisCache, internalKey = jQuery.expando,
                    isNode = elem.nodeType,
                    cache = isNode ? jQuery.cache : elem,
                    id = isNode ? elem[internalKey] : elem[internalKey] && internalKey;
                if (id && cache[id] && (pvt || cache[id].data) || void 0 !== data || "string" != typeof name)
                    return id || (id = isNode ? elem[internalKey] = deletedIds.pop() || jQuery.guid++ : internalKey),
                        cache[id] || (cache[id] = isNode ? {} : {
                            toJSON: jQuery.noop
                        }),
                        ("object" == typeof name || "function" == typeof name) && (pvt ? cache[id] = jQuery.extend(cache[id], name) : cache[id].data = jQuery.extend(cache[id].data, name)),
                        thisCache = cache[id],
                        pvt || (thisCache.data || (thisCache.data = {}),
                            thisCache = thisCache.data),
                        void 0 !== data && (thisCache[jQuery.camelCase(name)] = data),
                        "string" == typeof name ? (ret = thisCache[name],
                            null == ret && (ret = thisCache[jQuery.camelCase(name)])) : ret = thisCache,
                        ret
            }
        }

        function internalRemoveData(elem, name, pvt) {
            if (jQuery.acceptData(elem)) {
                var thisCache, i, isNode = elem.nodeType,
                    cache = isNode ? jQuery.cache : elem,
                    id = isNode ? elem[jQuery.expando] : jQuery.expando;
                if (cache[id]) {
                    if (name && (thisCache = pvt ? cache[id] : cache[id].data)) {
                        jQuery.isArray(name) ? name = name.concat(jQuery.map(name, jQuery.camelCase)) : name in thisCache ? name = [name] : (name = jQuery.camelCase(name),
                                name = name in thisCache ? [name] : name.split(" ")),
                            i = name.length;
                        for (; i--;)
                            delete thisCache[name[i]];
                        if (pvt ? !isEmptyDataObject(thisCache) : !jQuery.isEmptyObject(thisCache))
                            return
                    }
                    (pvt || (delete cache[id].data,
                        isEmptyDataObject(cache[id]))) && (isNode ? jQuery.cleanData([elem], !0) : support.deleteExpando || cache != cache.window ? delete cache[id] : cache[id] = null)
                }
            }
        }

        function returnTrue() {
            return !0
        }

        function returnFalse() {
            return !1
        }

        function safeActiveElement() {
            try {
                return document.activeElement
            } catch (err) {}
        }

        function createSafeFragment(document) {
            var list = nodeNames.split("|"),
                safeFrag = document.createDocumentFragment();
            if (safeFrag.createElement)
                for (; list.length;)
                    safeFrag.createElement(list.pop());
            return safeFrag
        }

        function getAll(context, tag) {
            var elems, elem, i = 0,
                found = typeof context.getElementsByTagName !== strundefined ? context.getElementsByTagName(tag || "*") : typeof context.querySelectorAll !== strundefined ? context.querySelectorAll(tag || "*") : void 0;
            if (!found)
                for (found = [],
                    elems = context.childNodes || context; null != (elem = elems[i]); i++)
                    !tag || jQuery.nodeName(elem, tag) ? found.push(elem) : jQuery.merge(found, getAll(elem, tag));
            return void 0 === tag || tag && jQuery.nodeName(context, tag) ? jQuery.merge([context], found) : found
        }

        function fixDefaultChecked(elem) {
            rcheckableType.test(elem.type) && (elem.defaultChecked = elem.checked)
        }

        function manipulationTarget(elem, content) {
            return jQuery.nodeName(elem, "table") && jQuery.nodeName(11 !== content.nodeType ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem
        }

        function disableScript(elem) {
            return elem.type = (null !== jQuery.find.attr(elem, "type")) + "/" + elem.type,
                elem
        }

        function restoreScript(elem) {
            var match = rscriptTypeMasked.exec(elem.type);
            return match ? elem.type = match[1] : elem.removeAttribute("type"),
                elem
        }

        function setGlobalEval(elems, refElements) {
            for (var elem, i = 0; null != (elem = elems[i]); i++)
                jQuery._data(elem, "globalEval", !refElements || jQuery._data(refElements[i], "globalEval"))
        }

        function cloneCopyEvent(src, dest) {
            if (1 === dest.nodeType && jQuery.hasData(src)) {
                var type, i, l, oldData = jQuery._data(src),
                    curData = jQuery._data(dest, oldData),
                    events = oldData.events;
                if (events) {
                    delete curData.handle,
                        curData.events = {};
                    for (type in events)
                        for (i = 0,
                            l = events[type].length; l > i; i++)
                            jQuery.event.add(dest, type, events[type][i])
                }
                curData.data && (curData.data = jQuery.extend({}, curData.data))
            }
        }

        function fixCloneNodeIssues(src, dest) {
            var nodeName, e, data;
            if (1 === dest.nodeType) {
                if (nodeName = dest.nodeName.toLowerCase(),
                    !support.noCloneEvent && dest[jQuery.expando]) {
                    data = jQuery._data(dest);
                    for (e in data.events)
                        jQuery.removeEvent(dest, e, data.handle);
                    dest.removeAttribute(jQuery.expando)
                }
                "script" === nodeName && dest.text !== src.text ? (disableScript(dest).text = src.text,
                    restoreScript(dest)) : "object" === nodeName ? (dest.parentNode && (dest.outerHTML = src.outerHTML),
                    support.html5Clone && src.innerHTML && !jQuery.trim(dest.innerHTML) && (dest.innerHTML = src.innerHTML)) : "input" === nodeName && rcheckableType.test(src.type) ? (dest.defaultChecked = dest.checked = src.checked,
                    dest.value !== src.value && (dest.value = src.value)) : "option" === nodeName ? dest.defaultSelected = dest.selected = src.defaultSelected : ("input" === nodeName || "textarea" === nodeName) && (dest.defaultValue = src.defaultValue)
            }
        }

        function actualDisplay(name, doc) {
            var style, elem = jQuery(doc.createElement(name)).appendTo(doc.body),
                display = window.getDefaultComputedStyle && (style = window.getDefaultComputedStyle(elem[0])) ? style.display : jQuery.css(elem[0], "display");
            return elem.detach(),
                display
        }

        function defaultDisplay(nodeName) {
            var doc = document,
                display = elemdisplay[nodeName];
            return display || (display = actualDisplay(nodeName, doc),
                    "none" !== display && display || (iframe = (iframe || jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement),
                        doc = (iframe[0].contentWindow || iframe[0].contentDocument).document,
                        doc.write(),
                        doc.close(),
                        display = actualDisplay(nodeName, doc),
                        iframe.detach()),
                    elemdisplay[nodeName] = display),
                display
        }

        function addGetHookIf(conditionFn, hookFn) {
            return {
                get: function () {
                    var condition = conditionFn();
                    if (null != condition)
                        return condition ? void delete this.get : (this.get = hookFn).apply(this, arguments)
                }
            }
        }

        function vendorPropName(style, name) {
            if (name in style)
                return name;
            for (var capName = name.charAt(0).toUpperCase() + name.slice(1), origName = name, i = cssPrefixes.length; i--;)
                if (name = cssPrefixes[i] + capName,
                    name in style)
                    return name;
            return origName
        }

        function showHide(elements, show) {
            for (var display, elem, hidden, values = [], index = 0, length = elements.length; length > index; index++)
                elem = elements[index],
                elem.style && (values[index] = jQuery._data(elem, "olddisplay"),
                    display = elem.style.display,
                    show ? (values[index] || "none" !== display || (elem.style.display = ""),
                        "" === elem.style.display && isHidden(elem) && (values[index] = jQuery._data(elem, "olddisplay", defaultDisplay(elem.nodeName)))) : (hidden = isHidden(elem),
                        (display && "none" !== display || !hidden) && jQuery._data(elem, "olddisplay", hidden ? display : jQuery.css(elem, "display"))));
            for (index = 0; length > index; index++)
                elem = elements[index],
                elem.style && (show && "none" !== elem.style.display && "" !== elem.style.display || (elem.style.display = show ? values[index] || "" : "none"));
            return elements
        }

        function setPositiveNumber(elem, value, subtract) {
            var matches = rnumsplit.exec(value);
            return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value
        }

        function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
            for (var i = extra === (isBorderBox ? "border" : "content") ? 4 : "width" === name ? 1 : 0, val = 0; 4 > i; i += 2)
                "margin" === extra && (val += jQuery.css(elem, extra + cssExpand[i], !0, styles)),
                isBorderBox ? ("content" === extra && (val -= jQuery.css(elem, "padding" + cssExpand[i], !0, styles)),
                    "margin" !== extra && (val -= jQuery.css(elem, "border" + cssExpand[i] + "Width", !0, styles))) : (val += jQuery.css(elem, "padding" + cssExpand[i], !0, styles),
                    "padding" !== extra && (val += jQuery.css(elem, "border" + cssExpand[i] + "Width", !0, styles)));
            return val
        }

        function getWidthOrHeight(elem, name, extra) {
            var valueIsBorderBox = !0,
                val = "width" === name ? elem.offsetWidth : elem.offsetHeight,
                styles = getStyles(elem),
                isBorderBox = support.boxSizing && "border-box" === jQuery.css(elem, "boxSizing", !1, styles);
            if (0 >= val || null == val) {
                if (val = curCSS(elem, name, styles),
                    (0 > val || null == val) && (val = elem.style[name]),
                    rnumnonpx.test(val))
                    return val;
                valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]),
                    val = parseFloat(val) || 0
            }
            return val + augmentWidthOrHeight(elem, name, extra || (isBorderBox ? "border" : "content"), valueIsBorderBox, styles) + "px"
        }

        function Tween(elem, options, prop, end, easing) {
            return new Tween.prototype.init(elem, options, prop, end, easing)
        }

        function createFxNow() {
            return setTimeout(function () {
                    fxNow = void 0
                }),
                fxNow = jQuery.now()
        }

        function genFx(type, includeWidth) {
            var which, attrs = {
                    height: type
                },
                i = 0;
            for (includeWidth = includeWidth ? 1 : 0; 4 > i; i += 2 - includeWidth)
                which = cssExpand[i],
                attrs["margin" + which] = attrs["padding" + which] = type;
            return includeWidth && (attrs.opacity = attrs.width = type),
                attrs
        }

        function createTween(value, prop, animation) {
            for (var tween, collection = (tweeners[prop] || []).concat(tweeners["*"]), index = 0, length = collection.length; length > index; index++)
                if (tween = collection[index].call(animation, prop, value))
                    return tween
        }

        function defaultPrefilter(elem, props, opts) {
            var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay, anim = this,
                orig = {},
                style = elem.style,
                hidden = elem.nodeType && isHidden(elem),
                dataShow = jQuery._data(elem, "fxshow");
            opts.queue || (hooks = jQuery._queueHooks(elem, "fx"),
                    null == hooks.unqueued && (hooks.unqueued = 0,
                        oldfire = hooks.empty.fire,
                        hooks.empty.fire = function () {
                            hooks.unqueued || oldfire()
                        }
                    ),
                    hooks.unqueued++,
                    anim.always(function () {
                        anim.always(function () {
                            hooks.unqueued--,
                                jQuery.queue(elem, "fx").length || hooks.empty.fire()
                        })
                    })),
                1 === elem.nodeType && ("height" in props || "width" in props) && (opts.overflow = [style.overflow, style.overflowX, style.overflowY],
                    display = jQuery.css(elem, "display"),
                    checkDisplay = "none" === display ? jQuery._data(elem, "olddisplay") || defaultDisplay(elem.nodeName) : display,
                    "inline" === checkDisplay && "none" === jQuery.css(elem, "float") && (support.inlineBlockNeedsLayout && "inline" !== defaultDisplay(elem.nodeName) ? style.zoom = 1 : style.display = "inline-block")),
                opts.overflow && (style.overflow = "hidden",
                    support.shrinkWrapBlocks() || anim.always(function () {
                        style.overflow = opts.overflow[0],
                            style.overflowX = opts.overflow[1],
                            style.overflowY = opts.overflow[2]
                    }));
            for (prop in props)
                if (value = props[prop],
                    rfxtypes.exec(value)) {
                    if (delete props[prop],
                        toggle = toggle || "toggle" === value,
                        value === (hidden ? "hide" : "show")) {
                        if ("show" !== value || !dataShow || void 0 === dataShow[prop])
                            continue;
                        hidden = !0
                    }
                    orig[prop] = dataShow && dataShow[prop] || jQuery.style(elem, prop)
                } else
                    display = void 0;
            if (jQuery.isEmptyObject(orig))
                "inline" === ("none" === display ? defaultDisplay(elem.nodeName) : display) && (style.display = display);
            else {
                dataShow ? "hidden" in dataShow && (hidden = dataShow.hidden) : dataShow = jQuery._data(elem, "fxshow", {}),
                    toggle && (dataShow.hidden = !hidden),
                    hidden ? jQuery(elem).show() : anim.done(function () {
                        jQuery(elem).hide()
                    }),
                    anim.done(function () {
                        var prop;
                        jQuery._removeData(elem, "fxshow");
                        for (prop in orig)
                            jQuery.style(elem, prop, orig[prop])
                    });
                for (prop in orig)
                    tween = createTween(hidden ? dataShow[prop] : 0, prop, anim),
                    prop in dataShow || (dataShow[prop] = tween.start,
                        hidden && (tween.end = tween.start,
                            tween.start = "width" === prop || "height" === prop ? 1 : 0))
            }
        }

        function propFilter(props, specialEasing) {
            var index, name, easing, value, hooks;
            for (index in props)
                if (name = jQuery.camelCase(index),
                    easing = specialEasing[name],
                    value = props[index],
                    jQuery.isArray(value) && (easing = value[1],
                        value = props[index] = value[0]),
                    index !== name && (props[name] = value,
                        delete props[index]),
                    hooks = jQuery.cssHooks[name],
                    hooks && "expand" in hooks) {
                    value = hooks.expand(value),
                        delete props[name];
                    for (index in value)
                        index in props || (props[index] = value[index],
                            specialEasing[index] = easing)
                } else
                    specialEasing[name] = easing
        }

        function Animation(elem, properties, options) {
            var result, stopped, index = 0,
                length = animationPrefilters.length,
                deferred = jQuery.Deferred().always(function () {
                    delete tick.elem
                }),
                tick = function () {
                    if (stopped)
                        return !1;
                    for (var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index = 0, length = animation.tweens.length; length > index; index++)
                        animation.tweens[index].run(percent);
                    return deferred.notifyWith(elem, [animation, percent, remaining]),
                        1 > percent && length ? remaining : (deferred.resolveWith(elem, [animation]),
                            !1)
                },
                animation = deferred.promise({
                    elem: elem,
                    props: jQuery.extend({}, properties),
                    opts: jQuery.extend(!0, {
                        specialEasing: {}
                    }, options),
                    originalProperties: properties,
                    originalOptions: options,
                    startTime: fxNow || createFxNow(),
                    duration: options.duration,
                    tweens: [],
                    createTween: function (prop, end) {
                        var tween = jQuery.Tween(elem, animation.opts, prop, end, animation.opts.specialEasing[prop] || animation.opts.easing);
                        return animation.tweens.push(tween),
                            tween
                    },
                    stop: function (gotoEnd) {
                        var index = 0,
                            length = gotoEnd ? animation.tweens.length : 0;
                        if (stopped)
                            return this;
                        for (stopped = !0; length > index; index++)
                            animation.tweens[index].run(1);
                        return gotoEnd ? deferred.resolveWith(elem, [animation, gotoEnd]) : deferred.rejectWith(elem, [animation, gotoEnd]),
                            this
                    }
                }),
                props = animation.props;
            for (propFilter(props, animation.opts.specialEasing); length > index; index++)
                if (result = animationPrefilters[index].call(animation, elem, props, animation.opts))
                    return result;
            return jQuery.map(props, createTween, animation),
                jQuery.isFunction(animation.opts.start) && animation.opts.start.call(elem, animation),
                jQuery.fx.timer(jQuery.extend(tick, {
                    elem: elem,
                    anim: animation,
                    queue: animation.opts.queue
                })),
                animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always)
        }

        function addToPrefiltersOrTransports(structure) {
            return function (dataTypeExpression, func) {
                "string" != typeof dataTypeExpression && (func = dataTypeExpression,
                    dataTypeExpression = "*");
                var dataType, i = 0,
                    dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
                if (jQuery.isFunction(func))
                    for (; dataType = dataTypes[i++];)
                        "+" === dataType.charAt(0) ? (dataType = dataType.slice(1) || "*",
                            (structure[dataType] = structure[dataType] || []).unshift(func)) : (structure[dataType] = structure[dataType] || []).push(func)
            }
        }

        function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
            function inspect(dataType) {
                var selected;
                return inspected[dataType] = !0,
                    jQuery.each(structure[dataType] || [], function (_, prefilterOrFactory) {
                        var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
                        return "string" != typeof dataTypeOrTransport || seekingTransport || inspected[dataTypeOrTransport] ? seekingTransport ? !(selected = dataTypeOrTransport) : void 0 : (options.dataTypes.unshift(dataTypeOrTransport),
                            inspect(dataTypeOrTransport),
                            !1)
                    }),
                    selected
            }
            var inspected = {},
                seekingTransport = structure === transports;
            return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*")
        }

        function ajaxExtend(target, src) {
            var deep, key, flatOptions = jQuery.ajaxSettings.flatOptions || {};
            for (key in src)
                void 0 !== src[key] && ((flatOptions[key] ? target : deep || (deep = {}))[key] = src[key]);
            return deep && jQuery.extend(!0, target, deep),
                target
        }

        function ajaxHandleResponses(s, jqXHR, responses) {
            for (var firstDataType, ct, finalDataType, type, contents = s.contents, dataTypes = s.dataTypes;
                "*" === dataTypes[0];)
                dataTypes.shift(),
                void 0 === ct && (ct = s.mimeType || jqXHR.getResponseHeader("Content-Type"));
            if (ct)
                for (type in contents)
                    if (contents[type] && contents[type].test(ct)) {
                        dataTypes.unshift(type);
                        break
                    }
            if (dataTypes[0] in responses)
                finalDataType = dataTypes[0];
            else {
                for (type in responses) {
                    if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                        finalDataType = type;
                        break
                    }
                    firstDataType || (firstDataType = type)
                }
                finalDataType = finalDataType || firstDataType
            }
            return finalDataType ? (finalDataType !== dataTypes[0] && dataTypes.unshift(finalDataType),
                responses[finalDataType]) : void 0
        }

        function ajaxConvert(s, response, jqXHR, isSuccess) {
            var conv2, current, conv, tmp, prev, converters = {},
                dataTypes = s.dataTypes.slice();
            if (dataTypes[1])
                for (conv in s.converters)
                    converters[conv.toLowerCase()] = s.converters[conv];
            for (current = dataTypes.shift(); current;)
                if (s.responseFields[current] && (jqXHR[s.responseFields[current]] = response),
                    !prev && isSuccess && s.dataFilter && (response = s.dataFilter(response, s.dataType)),
                    prev = current,
                    current = dataTypes.shift())
                    if ("*" === current)
                        current = prev;
                    else if ("*" !== prev && prev !== current) {
                if (conv = converters[prev + " " + current] || converters["* " + current],
                    !conv)
                    for (conv2 in converters)
                        if (tmp = conv2.split(" "),
                            tmp[1] === current && (conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]])) {
                            conv === !0 ? conv = converters[conv2] : converters[conv2] !== !0 && (current = tmp[0],
                                dataTypes.unshift(tmp[1]));
                            break
                        }
                if (conv !== !0)
                    if (conv && s["throws"])
                        response = conv(response);
                    else
                        try {
                            response = conv(response)
                        } catch (e) {
                            return {
                                state: "parsererror",
                                error: conv ? e : "No conversion from " + prev + " to " + current
                            }
                        }
            }
            return {
                state: "success",
                data: response
            }
        }

        function buildParams(prefix, obj, traditional, add) {
            var name;
            if (jQuery.isArray(obj))
                jQuery.each(obj, function (i, v) {
                    traditional || rbracket.test(prefix) ? add(prefix, v) : buildParams(prefix + "[" + ("object" == typeof v ? i : "") + "]", v, traditional, add)
                });
            else if (traditional || "object" !== jQuery.type(obj))
                add(prefix, obj);
            else
                for (name in obj)
                    buildParams(prefix + "[" + name + "]", obj[name], traditional, add)
        }

        function createStandardXHR() {
            try {
                return new window.XMLHttpRequest
            } catch (e) {}
        }

        function createActiveXHR() {
            try {
                return new window.ActiveXObject("Microsoft.XMLHTTP")
            } catch (e) {}
        }

        function getWindow(elem) {
            return jQuery.isWindow(elem) ? elem : 9 === elem.nodeType ? elem.defaultView || elem.parentWindow : !1
        }
        var deletedIds = [],
            slice = deletedIds.slice,
            concat = deletedIds.concat,
            push = deletedIds.push,
            indexOf = deletedIds.indexOf,
            class2type = {},
            toString = class2type.toString,
            hasOwn = class2type.hasOwnProperty,
            support = {},
            version = "1.11.3",
            jQuery = function (selector, context) {
                return new jQuery.fn.init(selector, context)
            },
            rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
            rmsPrefix = /^-ms-/,
            rdashAlpha = /-([\da-z])/gi,
            fcamelCase = function (all, letter) {
                return letter.toUpperCase()
            };
        jQuery.fn = jQuery.prototype = {
                jquery: version,
                constructor: jQuery,
                selector: "",
                length: 0,
                toArray: function () {
                    return slice.call(this)
                },
                get: function (num) {
                    return null != num ? 0 > num ? this[num + this.length] : this[num] : slice.call(this)
                },
                pushStack: function (elems) {
                    var ret = jQuery.merge(this.constructor(), elems);
                    return ret.prevObject = this,
                        ret.context = this.context,
                        ret
                },
                each: function (callback, args) {
                    return jQuery.each(this, callback, args)
                },
                map: function (callback) {
                    return this.pushStack(jQuery.map(this, function (elem, i) {
                        return callback.call(elem, i, elem)
                    }))
                },
                slice: function () {
                    return this.pushStack(slice.apply(this, arguments))
                },
                first: function () {
                    return this.eq(0)
                },
                last: function () {
                    return this.eq(-1)
                },
                eq: function (i) {
                    var len = this.length,
                        j = +i + (0 > i ? len : 0);
                    return this.pushStack(j >= 0 && len > j ? [this[j]] : [])
                },
                end: function () {
                    return this.prevObject || this.constructor(null)
                },
                push: push,
                sort: deletedIds.sort,
                splice: deletedIds.splice
            },
            jQuery.extend = jQuery.fn.extend = function () {
                var src, copyIsArray, copy, name, options, clone, target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = !1;
                for ("boolean" == typeof target && (deep = target,
                        target = arguments[i] || {},
                        i++),
                    "object" == typeof target || jQuery.isFunction(target) || (target = {}),
                    i === length && (target = this,
                        i--); length > i; i++)
                    if (null != (options = arguments[i]))
                        for (name in options)
                            src = target[name],
                            copy = options[name],
                            target !== copy && (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy))) ? (copyIsArray ? (copyIsArray = !1,
                                    clone = src && jQuery.isArray(src) ? src : []) : clone = src && jQuery.isPlainObject(src) ? src : {},
                                target[name] = jQuery.extend(deep, clone, copy)) : void 0 !== copy && (target[name] = copy));
                return target
            },
            jQuery.extend({
                expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
                isReady: !0,
                error: function (msg) {
                    throw new Error(msg)
                },
                noop: function () {},
                isFunction: function (obj) {
                    return "function" === jQuery.type(obj)
                },
                isArray: Array.isArray || function (obj) {
                    return "array" === jQuery.type(obj)
                },
                isWindow: function (obj) {
                    return null != obj && obj == obj.window
                },
                isNumeric: function (obj) {
                    return !jQuery.isArray(obj) && obj - parseFloat(obj) + 1 >= 0
                },
                isEmptyObject: function (obj) {
                    var name;
                    for (name in obj)
                        return !1;
                    return !0
                },
                isPlainObject: function (obj) {
                    var key;
                    if (!obj || "object" !== jQuery.type(obj) || obj.nodeType || jQuery.isWindow(obj))
                        return !1;
                    try {
                        if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf"))
                            return !1
                    } catch (e) {
                        return !1
                    }
                    if (support.ownLast)
                        for (key in obj)
                            return hasOwn.call(obj, key);
                    for (key in obj)
                    ;
                    return void 0 === key || hasOwn.call(obj, key)
                },
                type: function (obj) {
                    return null == obj ? obj + "" : "object" == typeof obj || "function" == typeof obj ? class2type[toString.call(obj)] || "object" : typeof obj
                },
                globalEval: function (data) {
                    data && jQuery.trim(data) && (window.execScript || function (data) {
                        window.eval.call(window, data)
                    })(data)
                },
                camelCase: function (string) {
                    return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase)
                },
                nodeName: function (elem, name) {
                    return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase()
                },
                each: function (obj, callback, args) {
                    var value, i = 0,
                        length = obj.length,
                        isArray = isArraylike(obj);
                    if (args) {
                        if (isArray)
                            for (; length > i && (value = callback.apply(obj[i], args),
                                    value !== !1); i++)
                        ;
                        else
                            for (i in obj)
                                if (value = callback.apply(obj[i], args),
                                    value === !1)
                                    break
                    } else if (isArray)
                        for (; length > i && (value = callback.call(obj[i], i, obj[i]),
                                value !== !1); i++)
                    ;
                    else
                        for (i in obj)
                            if (value = callback.call(obj[i], i, obj[i]),
                                value === !1)
                                break;
                    return obj
                },
                trim: function (text) {
                    return null == text ? "" : (text + "").replace(rtrim, "")
                },
                makeArray: function (arr, results) {
                    var ret = results || [];
                    return null != arr && (isArraylike(Object(arr)) ? jQuery.merge(ret, "string" == typeof arr ? [arr] : arr) : push.call(ret, arr)),
                        ret
                },
                inArray: function (elem, arr, i) {
                    var len;
                    if (arr) {
                        if (indexOf)
                            return indexOf.call(arr, elem, i);
                        for (len = arr.length,
                            i = i ? 0 > i ? Math.max(0, len + i) : i : 0; len > i; i++)
                            if (i in arr && arr[i] === elem)
                                return i
                    }
                    return -1
                },
                merge: function (first, second) {
                    for (var len = +second.length, j = 0, i = first.length; len > j;)
                        first[i++] = second[j++];
                    if (len !== len)
                        for (; void 0 !== second[j];)
                            first[i++] = second[j++];
                    return first.length = i,
                        first
                },
                grep: function (elems, callback, invert) {
                    for (var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert; length > i; i++)
                        callbackInverse = !callback(elems[i], i),
                        callbackInverse !== callbackExpect && matches.push(elems[i]);
                    return matches
                },
                map: function (elems, callback, arg) {
                    var value, i = 0,
                        length = elems.length,
                        isArray = isArraylike(elems),
                        ret = [];
                    if (isArray)
                        for (; length > i; i++)
                            value = callback(elems[i], i, arg),
                            null != value && ret.push(value);
                    else
                        for (i in elems)
                            value = callback(elems[i], i, arg),
                            null != value && ret.push(value);
                    return concat.apply([], ret)
                },
                guid: 1,
                proxy: function (fn, context) {
                    var args, proxy, tmp;
                    return "string" == typeof context && (tmp = fn[context],
                            context = fn,
                            fn = tmp),
                        jQuery.isFunction(fn) ? (args = slice.call(arguments, 2),
                            proxy = function () {
                                return fn.apply(context || this, args.concat(slice.call(arguments)))
                            },
                            proxy.guid = fn.guid = fn.guid || jQuery.guid++,
                            proxy) : void 0
                },
                now: function () {
                    return +new Date
                },
                support: support
            }),
            jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function (i, name) {
                class2type["[object " + name + "]"] = name.toLowerCase()
            });
        var Sizzle = function (window) {
            function Sizzle(selector, context, results, seed) {
                var match, elem, m, nodeType, i, groups, old, nid, newContext, newSelector;
                if ((context ? context.ownerDocument || context : preferredDoc) !== document && setDocument(context),
                    context = context || document,
                    results = results || [],
                    nodeType = context.nodeType,
                    "string" != typeof selector || !selector || 1 !== nodeType && 9 !== nodeType && 11 !== nodeType)
                    return results;
                if (!seed && documentIsHTML) {
                    if (11 !== nodeType && (match = rquickExpr.exec(selector)))
                        if (m = match[1]) {
                            if (9 === nodeType) {
                                if (elem = context.getElementById(m),
                                    !elem || !elem.parentNode)
                                    return results;
                                if (elem.id === m)
                                    return results.push(elem),
                                        results
                            } else if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m)
                                return results.push(elem),
                                    results
                        } else {
                            if (match[2])
                                return push.apply(results, context.getElementsByTagName(selector)),
                                    results;
                            if ((m = match[3]) && support.getElementsByClassName)
                                return push.apply(results, context.getElementsByClassName(m)),
                                    results
                        }
                    if (support.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                        if (nid = old = expando,
                            newContext = context,
                            newSelector = 1 !== nodeType && selector,
                            1 === nodeType && "object" !== context.nodeName.toLowerCase()) {
                            for (groups = tokenize(selector),
                                (old = context.getAttribute("id")) ? nid = old.replace(rescape, "\\$&") : context.setAttribute("id", nid),
                                nid = "[id='" + nid + "'] ",
                                i = groups.length; i--;)
                                groups[i] = nid + toSelector(groups[i]);
                            newContext = rsibling.test(selector) && testContext(context.parentNode) || context,
                                newSelector = groups.join(",")
                        }
                        if (newSelector)
                            try {
                                return push.apply(results, newContext.querySelectorAll(newSelector)),
                                    results
                            } catch (qsaError) {} finally {
                                old || context.removeAttribute("id")
                            }
                    }
                }
                return select(selector.replace(rtrim, "$1"), context, results, seed)
            }

            function createCache() {
                function cache(key, value) {
                    return keys.push(key + " ") > Expr.cacheLength && delete cache[keys.shift()],
                        cache[key + " "] = value
                }
                var keys = [];
                return cache
            }

            function markFunction(fn) {
                return fn[expando] = !0,
                    fn
            }

            function assert(fn) {
                var div = document.createElement("div");
                try {
                    return !!fn(div)
                } catch (e) {
                    return !1
                } finally {
                    div.parentNode && div.parentNode.removeChild(div),
                        div = null
                }
            }

            function addHandle(attrs, handler) {
                for (var arr = attrs.split("|"), i = attrs.length; i--;)
                    Expr.attrHandle[arr[i]] = handler
            }

            function siblingCheck(a, b) {
                var cur = b && a,
                    diff = cur && 1 === a.nodeType && 1 === b.nodeType && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
                if (diff)
                    return diff;
                if (cur)
                    for (; cur = cur.nextSibling;)
                        if (cur === b)
                            return -1;
                return a ? 1 : -1
            }

            function createInputPseudo(type) {
                return function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return "input" === name && elem.type === type
                }
            }

            function createButtonPseudo(type) {
                return function (elem) {
                    var name = elem.nodeName.toLowerCase();
                    return ("input" === name || "button" === name) && elem.type === type
                }
            }

            function createPositionalPseudo(fn) {
                return markFunction(function (argument) {
                    return argument = +argument,
                        markFunction(function (seed, matches) {
                            for (var j, matchIndexes = fn([], seed.length, argument), i = matchIndexes.length; i--;)
                                seed[j = matchIndexes[i]] && (seed[j] = !(matches[j] = seed[j]))
                        })
                })
            }

            function testContext(context) {
                return context && "undefined" != typeof context.getElementsByTagName && context
            }

            function setFilters() {}

            function toSelector(tokens) {
                for (var i = 0, len = tokens.length, selector = ""; len > i; i++)
                    selector += tokens[i].value;
                return selector
            }

            function addCombinator(matcher, combinator, base) {
                var dir = combinator.dir,
                    checkNonElements = base && "parentNode" === dir,
                    doneName = done++;
                return combinator.first ? function (elem, context, xml) {
                        for (; elem = elem[dir];)
                            if (1 === elem.nodeType || checkNonElements)
                                return matcher(elem, context, xml)
                    } :
                    function (elem, context, xml) {
                        var oldCache, outerCache, newCache = [dirruns, doneName];
                        if (xml) {
                            for (; elem = elem[dir];)
                                if ((1 === elem.nodeType || checkNonElements) && matcher(elem, context, xml))
                                    return !0
                        } else
                            for (; elem = elem[dir];)
                                if (1 === elem.nodeType || checkNonElements) {
                                    if (outerCache = elem[expando] || (elem[expando] = {}),
                                        (oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName)
                                        return newCache[2] = oldCache[2];
                                    if (outerCache[dir] = newCache,
                                        newCache[2] = matcher(elem, context, xml))
                                        return !0
                                }
                    }
            }

            function elementMatcher(matchers) {
                return matchers.length > 1 ? function (elem, context, xml) {
                        for (var i = matchers.length; i--;)
                            if (!matchers[i](elem, context, xml))
                                return !1;
                        return !0
                    } :
                    matchers[0]
            }

            function multipleContexts(selector, contexts, results) {
                for (var i = 0, len = contexts.length; len > i; i++)
                    Sizzle(selector, contexts[i], results);
                return results
            }

            function condense(unmatched, map, filter, context, xml) {
                for (var elem, newUnmatched = [], i = 0, len = unmatched.length, mapped = null != map; len > i; i++)
                    (elem = unmatched[i]) && (!filter || filter(elem, context, xml)) && (newUnmatched.push(elem),
                        mapped && map.push(i));
                return newUnmatched
            }

            function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
                return postFilter && !postFilter[expando] && (postFilter = setMatcher(postFilter)),
                    postFinder && !postFinder[expando] && (postFinder = setMatcher(postFinder, postSelector)),
                    markFunction(function (seed, results, context, xml) {
                        var temp, i, elem, preMap = [],
                            postMap = [],
                            preexisting = results.length,
                            elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []),
                            matcherIn = !preFilter || !seed && selector ? elems : condense(elems, preMap, preFilter, context, xml),
                            matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
                        if (matcher && matcher(matcherIn, matcherOut, context, xml),
                            postFilter)
                            for (temp = condense(matcherOut, postMap),
                                postFilter(temp, [], context, xml),
                                i = temp.length; i--;)
                                (elem = temp[i]) && (matcherOut[postMap[i]] = !(matcherIn[postMap[i]] = elem));
                        if (seed) {
                            if (postFinder || preFilter) {
                                if (postFinder) {
                                    for (temp = [],
                                        i = matcherOut.length; i--;)
                                        (elem = matcherOut[i]) && temp.push(matcherIn[i] = elem);
                                    postFinder(null, matcherOut = [], temp, xml)
                                }
                                for (i = matcherOut.length; i--;)
                                    (elem = matcherOut[i]) && (temp = postFinder ? indexOf(seed, elem) : preMap[i]) > -1 && (seed[temp] = !(results[temp] = elem))
                            }
                        } else
                            matcherOut = condense(matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut),
                            postFinder ? postFinder(null, results, matcherOut, xml) : push.apply(results, matcherOut)
                    })
            }

            function matcherFromTokens(tokens) {
                for (var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i = leadingRelative ? 1 : 0, matchContext = addCombinator(function (elem) {
                        return elem === checkContext
                    }, implicitRelative, !0), matchAnyContext = addCombinator(function (elem) {
                        return indexOf(checkContext, elem) > -1
                    }, implicitRelative, !0), matchers = [function (elem, context, xml) {
                        var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
                        return checkContext = null,
                            ret
                    }]; len > i; i++)
                    if (matcher = Expr.relative[tokens[i].type])
                        matchers = [addCombinator(elementMatcher(matchers), matcher)];
                    else {
                        if (matcher = Expr.filter[tokens[i].type].apply(null, tokens[i].matches),
                            matcher[expando]) {
                            for (j = ++i; len > j && !Expr.relative[tokens[j].type]; j++)
                            ;
                            return setMatcher(i > 1 && elementMatcher(matchers), i > 1 && toSelector(tokens.slice(0, i - 1).concat({
                                value: " " === tokens[i - 2].type ? "*" : ""
                            })).replace(rtrim, "$1"), matcher, j > i && matcherFromTokens(tokens.slice(i, j)), len > j && matcherFromTokens(tokens = tokens.slice(j)), len > j && toSelector(tokens))
                        }
                        matchers.push(matcher)
                    }
                return elementMatcher(matchers)
            }

            function matcherFromGroupMatchers(elementMatchers, setMatchers) {
                var bySet = setMatchers.length > 0,
                    byElement = elementMatchers.length > 0,
                    superMatcher = function (seed, context, xml, results, outermost) {
                        var elem, j, matcher, matchedCount = 0,
                            i = "0",
                            unmatched = seed && [],
                            setMatched = [],
                            contextBackup = outermostContext,
                            elems = seed || byElement && Expr.find.TAG("*", outermost),
                            dirrunsUnique = dirruns += null == contextBackup ? 1 : Math.random() || .1,
                            len = elems.length;
                        for (outermost && (outermostContext = context !== document && context); i !== len && null != (elem = elems[i]); i++) {
                            if (byElement && elem) {
                                for (j = 0; matcher = elementMatchers[j++];)
                                    if (matcher(elem, context, xml)) {
                                        results.push(elem);
                                        break
                                    }
                                outermost && (dirruns = dirrunsUnique)
                            }
                            bySet && ((elem = !matcher && elem) && matchedCount--,
                                seed && unmatched.push(elem))
                        }
                        if (matchedCount += i,
                            bySet && i !== matchedCount) {
                            for (j = 0; matcher = setMatchers[j++];)
                                matcher(unmatched, setMatched, context, xml);
                            if (seed) {
                                if (matchedCount > 0)
                                    for (; i--;)
                                        unmatched[i] || setMatched[i] || (setMatched[i] = pop.call(results));
                                setMatched = condense(setMatched)
                            }
                            push.apply(results, setMatched),
                                outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1 && Sizzle.uniqueSort(results)
                        }
                        return outermost && (dirruns = dirrunsUnique,
                                outermostContext = contextBackup),
                            unmatched
                    };
                return bySet ? markFunction(superMatcher) : superMatcher
            }
            var i, support, Expr, getText, isXML, tokenize, compile, select, outermostContext, sortInput, hasDuplicate, setDocument, document, docElem, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = "sizzle" + 1 * new Date,
                preferredDoc = window.document,
                dirruns = 0,
                done = 0,
                classCache = createCache(),
                tokenCache = createCache(),
                compilerCache = createCache(),
                sortOrder = function (a, b) {
                    return a === b && (hasDuplicate = !0),
                        0
                },
                MAX_NEGATIVE = 1 << 31,
                hasOwn = {}.hasOwnProperty,
                arr = [],
                pop = arr.pop,
                push_native = arr.push,
                push = arr.push,
                slice = arr.slice,
                indexOf = function (list, elem) {
                    for (var i = 0, len = list.length; len > i; i++)
                        if (list[i] === elem)
                            return i;
                    return -1
                },
                booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",
                whitespace = "[\\x20\\t\\r\\n\\f]",
                characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",
                identifier = characterEncoding.replace("w", "w#"),
                attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + "*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace + "*\\]",
                pseudos = ":(" + characterEncoding + ")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|.*)\\)|)",
                rwhitespace = new RegExp(whitespace + "+", "g"),
                rtrim = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"),
                rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"),
                rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"),
                rattributeQuotes = new RegExp("=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g"),
                rpseudo = new RegExp(pseudos),
                ridentifier = new RegExp("^" + identifier + "$"),
                matchExpr = {
                    ID: new RegExp("^#(" + characterEncoding + ")"),
                    CLASS: new RegExp("^\\.(" + characterEncoding + ")"),
                    TAG: new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
                    ATTR: new RegExp("^" + attributes),
                    PSEUDO: new RegExp("^" + pseudos),
                    CHILD: new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
                    bool: new RegExp("^(?:" + booleans + ")$", "i"),
                    needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
                },
                rinputs = /^(?:input|select|textarea|button)$/i,
                rheader = /^h\d$/i,
                rnative = /^[^{]+\{\s*\[native \w/,
                rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,
                rsibling = /[+~]/,
                rescape = /'|\\/g,
                runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"),
                funescape = function (_, escaped, escapedWhitespace) {
                    var high = "0x" + escaped - 65536;
                    return high !== high || escapedWhitespace ? escaped : 0 > high ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, 1023 & high | 56320)
                },
                unloadHandler = function () {
                    setDocument()
                };
            try {
                push.apply(arr = slice.call(preferredDoc.childNodes), preferredDoc.childNodes),
                    arr[preferredDoc.childNodes.length].nodeType
            } catch (e) {
                push = {
                    apply: arr.length ? function (target, els) {
                            push_native.apply(target, slice.call(els))
                        } :
                        function (target, els) {
                            for (var j = target.length, i = 0; target[j++] = els[i++];)
                            ;
                            target.length = j - 1
                        }
                }
            }
            support = Sizzle.support = {},
                isXML = Sizzle.isXML = function (elem) {
                    var documentElement = elem && (elem.ownerDocument || elem).documentElement;
                    return documentElement ? "HTML" !== documentElement.nodeName : !1
                },
                setDocument = Sizzle.setDocument = function (node) {
                    var hasCompare, parent, doc = node ? node.ownerDocument || node : preferredDoc;
                    return doc !== document && 9 === doc.nodeType && doc.documentElement ? (document = doc,
                        docElem = doc.documentElement,
                        parent = doc.defaultView,
                        parent && parent !== parent.top && (parent.addEventListener ? parent.addEventListener("unload", unloadHandler, !1) : parent.attachEvent && parent.attachEvent("onunload", unloadHandler)),
                        documentIsHTML = !isXML(doc),
                        support.attributes = assert(function (div) {
                            return div.className = "i",
                                !div.getAttribute("className")
                        }),
                        support.getElementsByTagName = assert(function (div) {
                            return div.appendChild(doc.createComment("")),
                                !div.getElementsByTagName("*").length
                        }),
                        support.getElementsByClassName = rnative.test(doc.getElementsByClassName),
                        support.getById = assert(function (div) {
                            return docElem.appendChild(div).id = expando,
                                !doc.getElementsByName || !doc.getElementsByName(expando).length
                        }),
                        support.getById ? (Expr.find.ID = function (id, context) {
                                if ("undefined" != typeof context.getElementById && documentIsHTML) {
                                    var m = context.getElementById(id);
                                    return m && m.parentNode ? [m] : []
                                }
                            },
                            Expr.filter.ID = function (id) {
                                var attrId = id.replace(runescape, funescape);
                                return function (elem) {
                                    return elem.getAttribute("id") === attrId
                                }
                            }
                        ) : (delete Expr.find.ID,
                            Expr.filter.ID = function (id) {
                                var attrId = id.replace(runescape, funescape);
                                return function (elem) {
                                    var node = "undefined" != typeof elem.getAttributeNode && elem.getAttributeNode("id");
                                    return node && node.value === attrId
                                }
                            }
                        ),
                        Expr.find.TAG = support.getElementsByTagName ? function (tag, context) {
                            return "undefined" != typeof context.getElementsByTagName ? context.getElementsByTagName(tag) : support.qsa ? context.querySelectorAll(tag) : void 0
                        } :
                        function (tag, context) {
                            var elem, tmp = [],
                                i = 0,
                                results = context.getElementsByTagName(tag);
                            if ("*" === tag) {
                                for (; elem = results[i++];)
                                    1 === elem.nodeType && tmp.push(elem);
                                return tmp
                            }
                            return results
                        },
                        Expr.find.CLASS = support.getElementsByClassName && function (className, context) {
                            return documentIsHTML ? context.getElementsByClassName(className) : void 0
                        },
                        rbuggyMatches = [],
                        rbuggyQSA = [],
                        (support.qsa = rnative.test(doc.querySelectorAll)) && (assert(function (div) {
                                docElem.appendChild(div).innerHTML = "<a id='" + expando + "'></a><select id='" + expando + "-\f]' msallowcapture=''><option selected=''></option></select>",
                                    div.querySelectorAll("[msallowcapture^='']").length && rbuggyQSA.push("[*^$]=" + whitespace + "*(?:''|\"\")"),
                                    div.querySelectorAll("[selected]").length || rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")"),
                                    div.querySelectorAll("[id~=" + expando + "-]").length || rbuggyQSA.push("~="),
                                    div.querySelectorAll(":checked").length || rbuggyQSA.push(":checked"),
                                    div.querySelectorAll("a#" + expando + "+*").length || rbuggyQSA.push(".#.+[+~]")
                            }),
                            assert(function (div) {
                                var input = doc.createElement("input");
                                input.setAttribute("type", "hidden"),
                                    div.appendChild(input).setAttribute("name", "D"),
                                    div.querySelectorAll("[name=d]").length && rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?="),
                                    div.querySelectorAll(":enabled").length || rbuggyQSA.push(":enabled", ":disabled"),
                                    div.querySelectorAll("*,:x"),
                                    rbuggyQSA.push(",.*:")
                            })),
                        (support.matchesSelector = rnative.test(matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector)) && assert(function (div) {
                            support.disconnectedMatch = matches.call(div, "div"),
                                matches.call(div, "[s!='']:x"),
                                rbuggyMatches.push("!=", pseudos)
                        }),
                        rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|")),
                        rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|")),
                        hasCompare = rnative.test(docElem.compareDocumentPosition),
                        contains = hasCompare || rnative.test(docElem.contains) ? function (a, b) {
                            var adown = 9 === a.nodeType ? a.documentElement : a,
                                bup = b && b.parentNode;
                            return a === bup || !(!bup || 1 !== bup.nodeType || !(adown.contains ? adown.contains(bup) : a.compareDocumentPosition && 16 & a.compareDocumentPosition(bup)))
                        } :
                        function (a, b) {
                            if (b)
                                for (; b = b.parentNode;)
                                    if (b === a)
                                        return !0;
                            return !1
                        },
                        sortOrder = hasCompare ? function (a, b) {
                            if (a === b)
                                return hasDuplicate = !0,
                                    0;
                            var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
                            return compare ? compare : (compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1,
                                1 & compare || !support.sortDetached && b.compareDocumentPosition(a) === compare ? a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ? -1 : b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0 : 4 & compare ? -1 : 1)
                        } :
                        function (a, b) {
                            if (a === b)
                                return hasDuplicate = !0,
                                    0;
                            var cur, i = 0,
                                aup = a.parentNode,
                                bup = b.parentNode,
                                ap = [a],
                                bp = [b];
                            if (!aup || !bup)
                                return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf(sortInput, a) - indexOf(sortInput, b) : 0;
                            if (aup === bup)
                                return siblingCheck(a, b);
                            for (cur = a; cur = cur.parentNode;)
                                ap.unshift(cur);
                            for (cur = b; cur = cur.parentNode;)
                                bp.unshift(cur);
                            for (; ap[i] === bp[i];)
                                i++;
                            return i ? siblingCheck(ap[i], bp[i]) : ap[i] === preferredDoc ? -1 : bp[i] === preferredDoc ? 1 : 0
                        },
                        doc) : document
                },
                Sizzle.matches = function (expr, elements) {
                    return Sizzle(expr, null, null, elements)
                },
                Sizzle.matchesSelector = function (elem, expr) {
                    if ((elem.ownerDocument || elem) !== document && setDocument(elem),
                        expr = expr.replace(rattributeQuotes, "='$1']"),
                        support.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr)))
                        try {
                            var ret = matches.call(elem, expr);
                            if (ret || support.disconnectedMatch || elem.document && 11 !== elem.document.nodeType)
                                return ret
                        } catch (e) {}
                    return Sizzle(expr, document, null, [elem]).length > 0
                },
                Sizzle.contains = function (context, elem) {
                    return (context.ownerDocument || context) !== document && setDocument(context),
                        contains(context, elem)
                },
                Sizzle.attr = function (elem, name) {
                    (elem.ownerDocument || elem) !== document && setDocument(elem);
                    var fn = Expr.attrHandle[name.toLowerCase()],
                        val = fn && hasOwn.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
                    return void 0 !== val ? val : support.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null
                },
                Sizzle.error = function (msg) {
                    throw new Error("Syntax error, unrecognized expression: " + msg)
                },
                Sizzle.uniqueSort = function (results) {
                    var elem, duplicates = [],
                        j = 0,
                        i = 0;
                    if (hasDuplicate = !support.detectDuplicates,
                        sortInput = !support.sortStable && results.slice(0),
                        results.sort(sortOrder),
                        hasDuplicate) {
                        for (; elem = results[i++];)
                            elem === results[i] && (j = duplicates.push(i));
                        for (; j--;)
                            results.splice(duplicates[j], 1)
                    }
                    return sortInput = null,
                        results
                },
                getText = Sizzle.getText = function (elem) {
                    var node, ret = "",
                        i = 0,
                        nodeType = elem.nodeType;
                    if (nodeType) {
                        if (1 === nodeType || 9 === nodeType || 11 === nodeType) {
                            if ("string" == typeof elem.textContent)
                                return elem.textContent;
                            for (elem = elem.firstChild; elem; elem = elem.nextSibling)
                                ret += getText(elem)
                        } else if (3 === nodeType || 4 === nodeType)
                            return elem.nodeValue
                    } else
                        for (; node = elem[i++];)
                            ret += getText(node);
                    return ret
                },
                Expr = Sizzle.selectors = {
                    cacheLength: 50,
                    createPseudo: markFunction,
                    match: matchExpr,
                    attrHandle: {},
                    find: {},
                    relative: {
                        ">": {
                            dir: "parentNode",
                            first: !0
                        },
                        " ": {
                            dir: "parentNode"
                        },
                        "+": {
                            dir: "previousSibling",
                            first: !0
                        },
                        "~": {
                            dir: "previousSibling"
                        }
                    },
                    preFilter: {
                        ATTR: function (match) {
                            return match[1] = match[1].replace(runescape, funescape),
                                match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape),
                                "~=" === match[2] && (match[3] = " " + match[3] + " "),
                                match.slice(0, 4)
                        },
                        CHILD: function (match) {
                            return match[1] = match[1].toLowerCase(),
                                "nth" === match[1].slice(0, 3) ? (match[3] || Sizzle.error(match[0]),
                                    match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * ("even" === match[3] || "odd" === match[3])),
                                    match[5] = +(match[7] + match[8] || "odd" === match[3])) : match[3] && Sizzle.error(match[0]),
                                match
                        },
                        PSEUDO: function (match) {
                            var excess, unquoted = !match[6] && match[2];
                            return matchExpr.CHILD.test(match[0]) ? null : (match[3] ? match[2] = match[4] || match[5] || "" : unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, !0)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length) && (match[0] = match[0].slice(0, excess),
                                    match[2] = unquoted.slice(0, excess)),
                                match.slice(0, 3))
                        }
                    },
                    filter: {
                        TAG: function (nodeNameSelector) {
                            var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                            return "*" === nodeNameSelector ? function () {
                                    return !0
                                } :
                                function (elem) {
                                    return elem.nodeName && elem.nodeName.toLowerCase() === nodeName
                                }
                        },
                        CLASS: function (className) {
                            var pattern = classCache[className + " "];
                            return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function (elem) {
                                return pattern.test("string" == typeof elem.className && elem.className || "undefined" != typeof elem.getAttribute && elem.getAttribute("class") || "")
                            })
                        },
                        ATTR: function (name, operator, check) {
                            return function (elem) {
                                var result = Sizzle.attr(elem, name);
                                return null == result ? "!=" === operator : operator ? (result += "",
                                    "=" === operator ? result === check : "!=" === operator ? result !== check : "^=" === operator ? check && 0 === result.indexOf(check) : "*=" === operator ? check && result.indexOf(check) > -1 : "$=" === operator ? check && result.slice(-check.length) === check : "~=" === operator ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : "|=" === operator ? result === check || result.slice(0, check.length + 1) === check + "-" : !1) : !0
                            }
                        },
                        CHILD: function (type, what, argument, first, last) {
                            var simple = "nth" !== type.slice(0, 3),
                                forward = "last" !== type.slice(-4),
                                ofType = "of-type" === what;
                            return 1 === first && 0 === last ? function (elem) {
                                    return !!elem.parentNode
                                } :
                                function (elem, context, xml) {
                                    var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? "nextSibling" : "previousSibling",
                                        parent = elem.parentNode,
                                        name = ofType && elem.nodeName.toLowerCase(),
                                        useCache = !xml && !ofType;
                                    if (parent) {
                                        if (simple) {
                                            for (; dir;) {
                                                for (node = elem; node = node[dir];)
                                                    if (ofType ? node.nodeName.toLowerCase() === name : 1 === node.nodeType)
                                                        return !1;
                                                start = dir = "only" === type && !start && "nextSibling"
                                            }
                                            return !0
                                        }
                                        if (start = [forward ? parent.firstChild : parent.lastChild],
                                            forward && useCache) {
                                            for (outerCache = parent[expando] || (parent[expando] = {}),
                                                cache = outerCache[type] || [],
                                                nodeIndex = cache[0] === dirruns && cache[1],
                                                diff = cache[0] === dirruns && cache[2],
                                                node = nodeIndex && parent.childNodes[nodeIndex]; node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop();)
                                                if (1 === node.nodeType && ++diff && node === elem) {
                                                    outerCache[type] = [dirruns, nodeIndex, diff];
                                                    break
                                                }
                                        } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns)
                                            diff = cache[1];
                                        else
                                            for (;
                                                (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) && ((ofType ? node.nodeName.toLowerCase() !== name : 1 !== node.nodeType) || !++diff || (useCache && ((node[expando] || (node[expando] = {}))[type] = [dirruns, diff]),
                                                    node !== elem));)
                                        ;
                                        return diff -= last,
                                            diff === first || diff % first === 0 && diff / first >= 0
                                    }
                                }
                        },
                        PSEUDO: function (pseudo, argument) {
                            var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle.error("unsupported pseudo: " + pseudo);
                            return fn[expando] ? fn(argument) : fn.length > 1 ? (args = [pseudo, pseudo, "", argument],
                                Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function (seed, matches) {
                                    for (var idx, matched = fn(seed, argument), i = matched.length; i--;)
                                        idx = indexOf(seed, matched[i]),
                                        seed[idx] = !(matches[idx] = matched[i])
                                }) : function (elem) {
                                    return fn(elem, 0, args)
                                }
                            ) : fn
                        }
                    },
                    pseudos: {
                        not: markFunction(function (selector) {
                            var input = [],
                                results = [],
                                matcher = compile(selector.replace(rtrim, "$1"));
                            return matcher[expando] ? markFunction(function (seed, matches, context, xml) {
                                for (var elem, unmatched = matcher(seed, null, xml, []), i = seed.length; i--;)
                                    (elem = unmatched[i]) && (seed[i] = !(matches[i] = elem))
                            }) : function (elem, context, xml) {
                                return input[0] = elem,
                                    matcher(input, null, xml, results),
                                    input[0] = null,
                                    !results.pop()
                            }
                        }),
                        has: markFunction(function (selector) {
                            return function (elem) {
                                return Sizzle(selector, elem).length > 0
                            }
                        }),
                        contains: markFunction(function (text) {
                            return text = text.replace(runescape, funescape),
                                function (elem) {
                                    return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1
                                }
                        }),
                        lang: markFunction(function (lang) {
                            return ridentifier.test(lang || "") || Sizzle.error("unsupported lang: " + lang),
                                lang = lang.replace(runescape, funescape).toLowerCase(),
                                function (elem) {
                                    var elemLang;
                                    do
                                        if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang"))
                                            return elemLang = elemLang.toLowerCase(),
                                                elemLang === lang || 0 === elemLang.indexOf(lang + "-");
                                    while ((elem = elem.parentNode) && 1 === elem.nodeType);
                                    return !1
                                }
                        }),
                        target: function (elem) {
                            var hash = window.location && window.location.hash;
                            return hash && hash.slice(1) === elem.id
                        },
                        root: function (elem) {
                            return elem === docElem
                        },
                        focus: function (elem) {
                            return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex)
                        },
                        enabled: function (elem) {
                            return elem.disabled === !1
                        },
                        disabled: function (elem) {
                            return elem.disabled === !0
                        },
                        checked: function (elem) {
                            var nodeName = elem.nodeName.toLowerCase();
                            return "input" === nodeName && !!elem.checked || "option" === nodeName && !!elem.selected
                        },
                        selected: function (elem) {
                            return elem.parentNode && elem.parentNode.selectedIndex,
                                elem.selected === !0
                        },
                        empty: function (elem) {
                            for (elem = elem.firstChild; elem; elem = elem.nextSibling)
                                if (elem.nodeType < 6)
                                    return !1;
                            return !0
                        },
                        parent: function (elem) {
                            return !Expr.pseudos.empty(elem)
                        },
                        header: function (elem) {
                            return rheader.test(elem.nodeName)
                        },
                        input: function (elem) {
                            return rinputs.test(elem.nodeName)
                        },
                        button: function (elem) {
                            var name = elem.nodeName.toLowerCase();
                            return "input" === name && "button" === elem.type || "button" === name
                        },
                        text: function (elem) {
                            var attr;
                            return "input" === elem.nodeName.toLowerCase() && "text" === elem.type && (null == (attr = elem.getAttribute("type")) || "text" === attr.toLowerCase())
                        },
                        first: createPositionalPseudo(function () {
                            return [0]
                        }),
                        last: createPositionalPseudo(function (matchIndexes, length) {
                            return [length - 1]
                        }),
                        eq: createPositionalPseudo(function (matchIndexes, length, argument) {
                            return [0 > argument ? argument + length : argument]
                        }),
                        even: createPositionalPseudo(function (matchIndexes, length) {
                            for (var i = 0; length > i; i += 2)
                                matchIndexes.push(i);
                            return matchIndexes
                        }),
                        odd: createPositionalPseudo(function (matchIndexes, length) {
                            for (var i = 1; length > i; i += 2)
                                matchIndexes.push(i);
                            return matchIndexes
                        }),
                        lt: createPositionalPseudo(function (matchIndexes, length, argument) {
                            for (var i = 0 > argument ? argument + length : argument; --i >= 0;)
                                matchIndexes.push(i);
                            return matchIndexes
                        }),
                        gt: createPositionalPseudo(function (matchIndexes, length, argument) {
                            for (var i = 0 > argument ? argument + length : argument; ++i < length;)
                                matchIndexes.push(i);
                            return matchIndexes
                        })
                    }
                },
                Expr.pseudos.nth = Expr.pseudos.eq;
            for (i in {
                    radio: !0,
                    checkbox: !0,
                    file: !0,
                    password: !0,
                    image: !0
                })
                Expr.pseudos[i] = createInputPseudo(i);
            for (i in {
                    submit: !0,
                    reset: !0
                })
                Expr.pseudos[i] = createButtonPseudo(i);
            return setFilters.prototype = Expr.filters = Expr.pseudos,
                Expr.setFilters = new setFilters,
                tokenize = Sizzle.tokenize = function (selector, parseOnly) {
                    var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
                    if (cached)
                        return parseOnly ? 0 : cached.slice(0);
                    for (soFar = selector,
                        groups = [],
                        preFilters = Expr.preFilter; soFar;) {
                        (!matched || (match = rcomma.exec(soFar))) && (match && (soFar = soFar.slice(match[0].length) || soFar),
                            groups.push(tokens = [])),
                        matched = !1,
                            (match = rcombinators.exec(soFar)) && (matched = match.shift(),
                                tokens.push({
                                    value: matched,
                                    type: match[0].replace(rtrim, " ")
                                }),
                                soFar = soFar.slice(matched.length));
                        for (type in Expr.filter)
                            !(match = matchExpr[type].exec(soFar)) || preFilters[type] && !(match = preFilters[type](match)) || (matched = match.shift(),
                                tokens.push({
                                    value: matched,
                                    type: type,
                                    matches: match
                                }),
                                soFar = soFar.slice(matched.length));
                        if (!matched)
                            break
                    }
                    return parseOnly ? soFar.length : soFar ? Sizzle.error(selector) : tokenCache(selector, groups).slice(0)
                },
                compile = Sizzle.compile = function (selector, match) {
                    var i, setMatchers = [],
                        elementMatchers = [],
                        cached = compilerCache[selector + " "];
                    if (!cached) {
                        for (match || (match = tokenize(selector)),
                            i = match.length; i--;)
                            cached = matcherFromTokens(match[i]),
                            cached[expando] ? setMatchers.push(cached) : elementMatchers.push(cached);
                        cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers)),
                            cached.selector = selector
                    }
                    return cached
                },
                select = Sizzle.select = function (selector, context, results, seed) {
                    var i, tokens, token, type, find, compiled = "function" == typeof selector && selector,
                        match = !seed && tokenize(selector = compiled.selector || selector);
                    if (results = results || [],
                        1 === match.length) {
                        if (tokens = match[0] = match[0].slice(0),
                            tokens.length > 2 && "ID" === (token = tokens[0]).type && support.getById && 9 === context.nodeType && documentIsHTML && Expr.relative[tokens[1].type]) {
                            if (context = (Expr.find.ID(token.matches[0].replace(runescape, funescape), context) || [])[0],
                                !context)
                                return results;
                            compiled && (context = context.parentNode),
                                selector = selector.slice(tokens.shift().value.length)
                        }
                        for (i = matchExpr.needsContext.test(selector) ? 0 : tokens.length; i-- && (token = tokens[i],
                                !Expr.relative[type = token.type]);)
                            if ((find = Expr.find[type]) && (seed = find(token.matches[0].replace(runescape, funescape), rsibling.test(tokens[0].type) && testContext(context.parentNode) || context))) {
                                if (tokens.splice(i, 1),
                                    selector = seed.length && toSelector(tokens),
                                    !selector)
                                    return push.apply(results, seed),
                                        results;
                                break
                            }
                    }
                    return (compiled || compile(selector, match))(seed, context, !documentIsHTML, results, rsibling.test(selector) && testContext(context.parentNode) || context),
                        results
                },
                support.sortStable = expando.split("").sort(sortOrder).join("") === expando,
                support.detectDuplicates = !!hasDuplicate,
                setDocument(),
                support.sortDetached = assert(function (div1) {
                    return 1 & div1.compareDocumentPosition(document.createElement("div"))
                }),
                assert(function (div) {
                    return div.innerHTML = "<a href='#'></a>",
                        "#" === div.firstChild.getAttribute("href")
                }) || addHandle("type|href|height|width", function (elem, name, isXML) {
                    return isXML ? void 0 : elem.getAttribute(name, "type" === name.toLowerCase() ? 1 : 2)
                }),
                support.attributes && assert(function (div) {
                    return div.innerHTML = "<input/>",
                        div.firstChild.setAttribute("value", ""),
                        "" === div.firstChild.getAttribute("value")
                }) || addHandle("value", function (elem, name, isXML) {
                    return isXML || "input" !== elem.nodeName.toLowerCase() ? void 0 : elem.defaultValue
                }),
                assert(function (div) {
                    return null == div.getAttribute("disabled")
                }) || addHandle(booleans, function (elem, name, isXML) {
                    var val;
                    return isXML ? void 0 : elem[name] === !0 ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null
                }),
                Sizzle
        }(window);
        jQuery.find = Sizzle,
            jQuery.expr = Sizzle.selectors,
            jQuery.expr[":"] = jQuery.expr.pseudos,
            jQuery.unique = Sizzle.uniqueSort,
            jQuery.text = Sizzle.getText,
            jQuery.isXMLDoc = Sizzle.isXML,
            jQuery.contains = Sizzle.contains;
        var rneedsContext = jQuery.expr.match.needsContext,
            rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
            risSimple = /^.[^:#\[\.,]*$/;
        jQuery.filter = function (expr, elems, not) {
                var elem = elems[0];
                return not && (expr = ":not(" + expr + ")"),
                    1 === elems.length && 1 === elem.nodeType ? jQuery.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery.find.matches(expr, jQuery.grep(elems, function (elem) {
                        return 1 === elem.nodeType
                    }))
            },
            jQuery.fn.extend({
                find: function (selector) {
                    var i, ret = [],
                        self = this,
                        len = self.length;
                    if ("string" != typeof selector)
                        return this.pushStack(jQuery(selector).filter(function () {
                            for (i = 0; len > i; i++)
                                if (jQuery.contains(self[i], this))
                                    return !0
                        }));
                    for (i = 0; len > i; i++)
                        jQuery.find(selector, self[i], ret);
                    return ret = this.pushStack(len > 1 ? jQuery.unique(ret) : ret),
                        ret.selector = this.selector ? this.selector + " " + selector : selector,
                        ret
                },
                filter: function (selector) {
                    return this.pushStack(winnow(this, selector || [], !1))
                },
                not: function (selector) {
                    return this.pushStack(winnow(this, selector || [], !0))
                },
                is: function (selector) {
                    return !!winnow(this, "string" == typeof selector && rneedsContext.test(selector) ? jQuery(selector) : selector || [], !1).length
                }
            });
        var rootjQuery, document = window.document,
            rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,
            init = jQuery.fn.init = function (selector, context) {
                var match, elem;
                if (!selector)
                    return this;
                if ("string" == typeof selector) {
                    if (match = "<" === selector.charAt(0) && ">" === selector.charAt(selector.length - 1) && selector.length >= 3 ? [null, selector, null] : rquickExpr.exec(selector),
                        !match || !match[1] && context)
                        return !context || context.jquery ? (context || rootjQuery).find(selector) : this.constructor(context).find(selector);
                    if (match[1]) {
                        if (context = context instanceof jQuery ? context[0] : context,
                            jQuery.merge(this, jQuery.parseHTML(match[1], context && context.nodeType ? context.ownerDocument || context : document, !0)),
                            rsingleTag.test(match[1]) && jQuery.isPlainObject(context))
                            for (match in context)
                                jQuery.isFunction(this[match]) ? this[match](context[match]) : this.attr(match, context[match]);
                        return this
                    }
                    if (elem = document.getElementById(match[2]),
                        elem && elem.parentNode) {
                        if (elem.id !== match[2])
                            return rootjQuery.find(selector);
                        this.length = 1,
                            this[0] = elem
                    }
                    return this.context = document,
                        this.selector = selector,
                        this
                }
                return selector.nodeType ? (this.context = this[0] = selector,
                    this.length = 1,
                    this) : jQuery.isFunction(selector) ? "undefined" != typeof rootjQuery.ready ? rootjQuery.ready(selector) : selector(jQuery) : (void 0 !== selector.selector && (this.selector = selector.selector,
                        this.context = selector.context),
                    jQuery.makeArray(selector, this))
            };
        init.prototype = jQuery.fn,
            rootjQuery = jQuery(document);
        var rparentsprev = /^(?:parents|prev(?:Until|All))/,
            guaranteedUnique = {
                children: !0,
                contents: !0,
                next: !0,
                prev: !0
            };
        jQuery.extend({
                dir: function (elem, dir, until) {
                    for (var matched = [], cur = elem[dir]; cur && 9 !== cur.nodeType && (void 0 === until || 1 !== cur.nodeType || !jQuery(cur).is(until));)
                        1 === cur.nodeType && matched.push(cur),
                        cur = cur[dir];
                    return matched
                },
                sibling: function (n, elem) {
                    for (var r = []; n; n = n.nextSibling)
                        1 === n.nodeType && n !== elem && r.push(n);
                    return r
                }
            }),
            jQuery.fn.extend({
                has: function (target) {
                    var i, targets = jQuery(target, this),
                        len = targets.length;
                    return this.filter(function () {
                        for (i = 0; len > i; i++)
                            if (jQuery.contains(this, targets[i]))
                                return !0
                    })
                },
                closest: function (selectors, context) {
                    for (var cur, i = 0, l = this.length, matched = [], pos = rneedsContext.test(selectors) || "string" != typeof selectors ? jQuery(selectors, context || this.context) : 0; l > i; i++)
                        for (cur = this[i]; cur && cur !== context; cur = cur.parentNode)
                            if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : 1 === cur.nodeType && jQuery.find.matchesSelector(cur, selectors))) {
                                matched.push(cur);
                                break
                            }
                    return this.pushStack(matched.length > 1 ? jQuery.unique(matched) : matched)
                },
                index: function (elem) {
                    return elem ? "string" == typeof elem ? jQuery.inArray(this[0], jQuery(elem)) : jQuery.inArray(elem.jquery ? elem[0] : elem, this) : this[0] && this[0].parentNode ? this.first().prevAll().length : -1
                },
                add: function (selector, context) {
                    return this.pushStack(jQuery.unique(jQuery.merge(this.get(), jQuery(selector, context))))
                },
                addBack: function (selector) {
                    return this.add(null == selector ? this.prevObject : this.prevObject.filter(selector))
                }
            }),
            jQuery.each({
                parent: function (elem) {
                    var parent = elem.parentNode;
                    return parent && 11 !== parent.nodeType ? parent : null
                },
                parents: function (elem) {
                    return jQuery.dir(elem, "parentNode")
                },
                parentsUntil: function (elem, i, until) {
                    return jQuery.dir(elem, "parentNode", until)
                },
                next: function (elem) {
                    return sibling(elem, "nextSibling")
                },
                prev: function (elem) {
                    return sibling(elem, "previousSibling")
                },
                nextAll: function (elem) {
                    return jQuery.dir(elem, "nextSibling")
                },
                prevAll: function (elem) {
                    return jQuery.dir(elem, "previousSibling")
                },
                nextUntil: function (elem, i, until) {
                    return jQuery.dir(elem, "nextSibling", until)
                },
                prevUntil: function (elem, i, until) {
                    return jQuery.dir(elem, "previousSibling", until)
                },
                siblings: function (elem) {
                    return jQuery.sibling((elem.parentNode || {}).firstChild, elem)
                },
                children: function (elem) {
                    return jQuery.sibling(elem.firstChild)
                },
                contents: function (elem) {
                    return jQuery.nodeName(elem, "iframe") ? elem.contentDocument || elem.contentWindow.document : jQuery.merge([], elem.childNodes)
                }
            }, function (name, fn) {
                jQuery.fn[name] = function (until, selector) {
                    var ret = jQuery.map(this, fn, until);
                    return "Until" !== name.slice(-5) && (selector = until),
                        selector && "string" == typeof selector && (ret = jQuery.filter(selector, ret)),
                        this.length > 1 && (guaranteedUnique[name] || (ret = jQuery.unique(ret)),
                            rparentsprev.test(name) && (ret = ret.reverse())),
                        this.pushStack(ret)
                }
            });
        var rnotwhite = /\S+/g,
            optionsCache = {};
        jQuery.Callbacks = function (options) {
                options = "string" == typeof options ? optionsCache[options] || createOptions(options) : jQuery.extend({}, options);
                var firing, memory, fired, firingLength, firingIndex, firingStart, list = [],
                    stack = !options.once && [],
                    fire = function (data) {
                        for (memory = options.memory && data,
                            fired = !0,
                            firingIndex = firingStart || 0,
                            firingStart = 0,
                            firingLength = list.length,
                            firing = !0; list && firingLength > firingIndex; firingIndex++)
                            if (list[firingIndex].apply(data[0], data[1]) === !1 && options.stopOnFalse) {
                                memory = !1;
                                break
                            }
                        firing = !1,
                            list && (stack ? stack.length && fire(stack.shift()) : memory ? list = [] : self.disable())
                    },
                    self = {
                        add: function () {
                            if (list) {
                                var start = list.length;
                                ! function add(args) {
                                    jQuery.each(args, function (_, arg) {
                                        var type = jQuery.type(arg);
                                        "function" === type ? options.unique && self.has(arg) || list.push(arg) : arg && arg.length && "string" !== type && add(arg)
                                    })
                                }(arguments),
                                firing ? firingLength = list.length : memory && (firingStart = start,
                                    fire(memory))
                            }
                            return this
                        },
                        remove: function () {
                            return list && jQuery.each(arguments, function (_, arg) {
                                    for (var index;
                                        (index = jQuery.inArray(arg, list, index)) > -1;)
                                        list.splice(index, 1),
                                        firing && (firingLength >= index && firingLength--,
                                            firingIndex >= index && firingIndex--)
                                }),
                                this
                        },
                        has: function (fn) {
                            return fn ? jQuery.inArray(fn, list) > -1 : !(!list || !list.length)
                        },
                        empty: function () {
                            return list = [],
                                firingLength = 0,
                                this
                        },
                        disable: function () {
                            return list = stack = memory = void 0,
                                this
                        },
                        disabled: function () {
                            return !list
                        },
                        lock: function () {
                            return stack = void 0,
                                memory || self.disable(),
                                this
                        },
                        locked: function () {
                            return !stack
                        },
                        fireWith: function (context, args) {
                            return !list || fired && !stack || (args = args || [],
                                    args = [context, args.slice ? args.slice() : args],
                                    firing ? stack.push(args) : fire(args)),
                                this
                        },
                        fire: function () {
                            return self.fireWith(this, arguments),
                                this
                        },
                        fired: function () {
                            return !!fired
                        }
                    };
                return self
            },
            jQuery.extend({
                Deferred: function (func) {
                    var tuples = [
                            ["resolve", "done", jQuery.Callbacks("once memory"), "resolved"],
                            ["reject", "fail", jQuery.Callbacks("once memory"), "rejected"],
                            ["notify", "progress", jQuery.Callbacks("memory")]
                        ],
                        state = "pending",
                        promise = {
                            state: function () {
                                return state
                            },
                            always: function () {
                                return deferred.done(arguments).fail(arguments),
                                    this
                            },
                            then: function () {
                                var fns = arguments;
                                return jQuery.Deferred(function (newDefer) {
                                    jQuery.each(tuples, function (i, tuple) {
                                            var fn = jQuery.isFunction(fns[i]) && fns[i];
                                            deferred[tuple[1]](function () {
                                                var returned = fn && fn.apply(this, arguments);
                                                returned && jQuery.isFunction(returned.promise) ? returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify) : newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments)
                                            })
                                        }),
                                        fns = null
                                }).promise()
                            },
                            promise: function (obj) {
                                return null != obj ? jQuery.extend(obj, promise) : promise
                            }
                        },
                        deferred = {};
                    return promise.pipe = promise.then,
                        jQuery.each(tuples, function (i, tuple) {
                            var list = tuple[2],
                                stateString = tuple[3];
                            promise[tuple[1]] = list.add,
                                stateString && list.add(function () {
                                    state = stateString
                                }, tuples[1 ^ i][2].disable, tuples[2][2].lock),
                                deferred[tuple[0]] = function () {
                                    return deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments),
                                        this
                                },
                                deferred[tuple[0] + "With"] = list.fireWith
                        }),
                        promise.promise(deferred),
                        func && func.call(deferred, deferred),
                        deferred
                },
                when: function (subordinate) {
                    var progressValues, progressContexts, resolveContexts, i = 0,
                        resolveValues = slice.call(arguments),
                        length = resolveValues.length,
                        remaining = 1 !== length || subordinate && jQuery.isFunction(subordinate.promise) ? length : 0,
                        deferred = 1 === remaining ? subordinate : jQuery.Deferred(),
                        updateFunc = function (i, contexts, values) {
                            return function (value) {
                                contexts[i] = this,
                                    values[i] = arguments.length > 1 ? slice.call(arguments) : value,
                                    values === progressValues ? deferred.notifyWith(contexts, values) : --remaining || deferred.resolveWith(contexts, values)
                            }
                        };
                    if (length > 1)
                        for (progressValues = new Array(length),
                            progressContexts = new Array(length),
                            resolveContexts = new Array(length); length > i; i++)
                            resolveValues[i] && jQuery.isFunction(resolveValues[i].promise) ? resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues)) : --remaining;
                    return remaining || deferred.resolveWith(resolveContexts, resolveValues),
                        deferred.promise()
                }
            });
        var readyList;
        jQuery.fn.ready = function (fn) {
                return jQuery.ready.promise().done(fn),
                    this
            },
            jQuery.extend({
                isReady: !1,
                readyWait: 1,
                holdReady: function (hold) {
                    hold ? jQuery.readyWait++ : jQuery.ready(!0)
                },
                ready: function (wait) {
                    if (wait === !0 ? !--jQuery.readyWait : !jQuery.isReady) {
                        if (!document.body)
                            return setTimeout(jQuery.ready);
                        jQuery.isReady = !0,
                            wait !== !0 && --jQuery.readyWait > 0 || (readyList.resolveWith(document, [jQuery]),
                                jQuery.fn.triggerHandler && (jQuery(document).triggerHandler("ready"),
                                    jQuery(document).off("ready")))
                    }
                }
            }),
            jQuery.ready.promise = function (obj) {
                if (!readyList)
                    if (readyList = jQuery.Deferred(),
                        "complete" === document.readyState)
                        setTimeout(jQuery.ready);
                    else if (document.addEventListener)
                    document.addEventListener("DOMContentLoaded", completed, !1),
                    window.addEventListener("load", completed, !1);
                else {
                    document.attachEvent("onreadystatechange", completed),
                        window.attachEvent("onload", completed);
                    var top = !1;
                    try {
                        top = null == window.frameElement && document.documentElement;
                    } catch (e) {}
                    top && top.doScroll && ! function doScrollCheck() {
                        if (!jQuery.isReady) {
                            try {
                                top.doScroll("left")
                            } catch (e) {
                                return setTimeout(doScrollCheck, 50)
                            }
                            detach(),
                                jQuery.ready()
                        }
                    }()
                }
                return readyList.promise(obj)
            };
        var i, strundefined = "undefined";
        for (i in jQuery(support))
            break;
        support.ownLast = "0" !== i,
            support.inlineBlockNeedsLayout = !1,
            jQuery(function () {
                var val, div, body, container;
                body = document.getElementsByTagName("body")[0],
                    body && body.style && (div = document.createElement("div"),
                        container = document.createElement("div"),
                        container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px",
                        body.appendChild(container).appendChild(div),
                        typeof div.style.zoom !== strundefined && (div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1",
                            support.inlineBlockNeedsLayout = val = 3 === div.offsetWidth,
                            val && (body.style.zoom = 1)),
                        body.removeChild(container))
            }),
            function () {
                var div = document.createElement("div");
                if (null == support.deleteExpando) {
                    support.deleteExpando = !0;
                    try {
                        delete div.test
                    } catch (e) {
                        support.deleteExpando = !1
                    }
                }
                div = null
            }(),
            jQuery.acceptData = function (elem) {
                var noData = jQuery.noData[(elem.nodeName + " ").toLowerCase()],
                    nodeType = +elem.nodeType || 1;
                return 1 !== nodeType && 9 !== nodeType ? !1 : !noData || noData !== !0 && elem.getAttribute("classid") === noData
            };
        var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
            rmultiDash = /([A-Z])/g;
        jQuery.extend({
                cache: {},
                noData: {
                    "applet ": !0,
                    "embed ": !0,
                    "object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
                },
                hasData: function (elem) {
                    return elem = elem.nodeType ? jQuery.cache[elem[jQuery.expando]] : elem[jQuery.expando],
                        !!elem && !isEmptyDataObject(elem)
                },
                data: function (elem, name, data) {
                    return internalData(elem, name, data)
                },
                removeData: function (elem, name) {
                    return internalRemoveData(elem, name)
                },
                _data: function (elem, name, data) {
                    return internalData(elem, name, data, !0)
                },
                _removeData: function (elem, name) {
                    return internalRemoveData(elem, name, !0)
                }
            }),
            jQuery.fn.extend({
                data: function (key, value) {
                    var i, name, data, elem = this[0],
                        attrs = elem && elem.attributes;
                    if (void 0 === key) {
                        if (this.length && (data = jQuery.data(elem),
                                1 === elem.nodeType && !jQuery._data(elem, "parsedAttrs"))) {
                            for (i = attrs.length; i--;)
                                attrs[i] && (name = attrs[i].name,
                                    0 === name.indexOf("data-") && (name = jQuery.camelCase(name.slice(5)),
                                        dataAttr(elem, name, data[name])));
                            jQuery._data(elem, "parsedAttrs", !0)
                        }
                        return data
                    }
                    return "object" == typeof key ? this.each(function () {
                        jQuery.data(this, key)
                    }) : arguments.length > 1 ? this.each(function () {
                        jQuery.data(this, key, value)
                    }) : elem ? dataAttr(elem, key, jQuery.data(elem, key)) : void 0
                },
                removeData: function (key) {
                    return this.each(function () {
                        jQuery.removeData(this, key)
                    })
                }
            }),
            jQuery.extend({
                queue: function (elem, type, data) {
                    var queue;
                    return elem ? (type = (type || "fx") + "queue",
                        queue = jQuery._data(elem, type),
                        data && (!queue || jQuery.isArray(data) ? queue = jQuery._data(elem, type, jQuery.makeArray(data)) : queue.push(data)),
                        queue || []) : void 0
                },
                dequeue: function (elem, type) {
                    type = type || "fx";
                    var queue = jQuery.queue(elem, type),
                        startLength = queue.length,
                        fn = queue.shift(),
                        hooks = jQuery._queueHooks(elem, type),
                        next = function () {
                            jQuery.dequeue(elem, type)
                        };
                    "inprogress" === fn && (fn = queue.shift(),
                            startLength--),
                        fn && ("fx" === type && queue.unshift("inprogress"),
                            delete hooks.stop,
                            fn.call(elem, next, hooks)),
                        !startLength && hooks && hooks.empty.fire()
                },
                _queueHooks: function (elem, type) {
                    var key = type + "queueHooks";
                    return jQuery._data(elem, key) || jQuery._data(elem, key, {
                        empty: jQuery.Callbacks("once memory").add(function () {
                            jQuery._removeData(elem, type + "queue"),
                                jQuery._removeData(elem, key)
                        })
                    })
                }
            }),
            jQuery.fn.extend({
                queue: function (type, data) {
                    var setter = 2;
                    return "string" != typeof type && (data = type,
                            type = "fx",
                            setter--),
                        arguments.length < setter ? jQuery.queue(this[0], type) : void 0 === data ? this : this.each(function () {
                            var queue = jQuery.queue(this, type, data);
                            jQuery._queueHooks(this, type),
                                "fx" === type && "inprogress" !== queue[0] && jQuery.dequeue(this, type)
                        })
                },
                dequeue: function (type) {
                    return this.each(function () {
                        jQuery.dequeue(this, type)
                    })
                },
                clearQueue: function (type) {
                    return this.queue(type || "fx", [])
                },
                promise: function (type, obj) {
                    var tmp, count = 1,
                        defer = jQuery.Deferred(),
                        elements = this,
                        i = this.length,
                        resolve = function () {
                            --count || defer.resolveWith(elements, [elements])
                        };
                    for ("string" != typeof type && (obj = type,
                            type = void 0),
                        type = type || "fx"; i--;)
                        tmp = jQuery._data(elements[i], type + "queueHooks"),
                        tmp && tmp.empty && (count++,
                            tmp.empty.add(resolve));
                    return resolve(),
                        defer.promise(obj)
                }
            });
        var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,
            cssExpand = ["Top", "Right", "Bottom", "Left"],
            isHidden = function (elem, el) {
                return elem = el || elem,
                    "none" === jQuery.css(elem, "display") || !jQuery.contains(elem.ownerDocument, elem)
            },
            access = jQuery.access = function (elems, fn, key, value, chainable, emptyGet, raw) {
                var i = 0,
                    length = elems.length,
                    bulk = null == key;
                if ("object" === jQuery.type(key)) {
                    chainable = !0;
                    for (i in key)
                        jQuery.access(elems, fn, i, key[i], !0, emptyGet, raw)
                } else if (void 0 !== value && (chainable = !0,
                        jQuery.isFunction(value) || (raw = !0),
                        bulk && (raw ? (fn.call(elems, value),
                            fn = null) : (bulk = fn,
                            fn = function (elem, key, value) {
                                return bulk.call(jQuery(elem), value)
                            }
                        )),
                        fn))
                    for (; length > i; i++)
                        fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
                return chainable ? elems : bulk ? fn.call(elems) : length ? fn(elems[0], key) : emptyGet
            },
            rcheckableType = /^(?:checkbox|radio)$/i;
        ! function () {
            var input = document.createElement("input"),
                div = document.createElement("div"),
                fragment = document.createDocumentFragment();
            if (div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",
                support.leadingWhitespace = 3 === div.firstChild.nodeType,
                support.tbody = !div.getElementsByTagName("tbody").length,
                support.htmlSerialize = !!div.getElementsByTagName("link").length,
                support.html5Clone = "<:nav></:nav>" !== document.createElement("nav").cloneNode(!0).outerHTML,
                input.type = "checkbox",
                input.checked = !0,
                fragment.appendChild(input),
                support.appendChecked = input.checked,
                div.innerHTML = "<textarea>x</textarea>",
                support.noCloneChecked = !!div.cloneNode(!0).lastChild.defaultValue,
                fragment.appendChild(div),
                div.innerHTML = "<input type='radio' checked='checked' name='t'/>",
                support.checkClone = div.cloneNode(!0).cloneNode(!0).lastChild.checked,
                support.noCloneEvent = !0,
                div.attachEvent && (div.attachEvent("onclick", function () {
                        support.noCloneEvent = !1
                    }),
                    div.cloneNode(!0).click()),
                null == support.deleteExpando) {
                support.deleteExpando = !0;
                try {
                    delete div.test
                } catch (e) {
                    support.deleteExpando = !1
                }
            }
        }(),
        function () {
            var i, eventName, div = document.createElement("div");
            for (i in {
                    submit: !0,
                    change: !0,
                    focusin: !0
                })
                eventName = "on" + i,
                (support[i + "Bubbles"] = eventName in window) || (div.setAttribute(eventName, "t"),
                    support[i + "Bubbles"] = div.attributes[eventName].expando === !1);
            div = null
        }();
        var rformElems = /^(?:input|select|textarea)$/i,
            rkeyEvent = /^key/,
            rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
            rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
            rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
        jQuery.event = {
                global: {},
                add: function (elem, types, handler, data, selector) {
                    var tmp, events, t, handleObjIn, special, eventHandle, handleObj, handlers, type, namespaces, origType, elemData = jQuery._data(elem);
                    if (elemData) {
                        for (handler.handler && (handleObjIn = handler,
                                handler = handleObjIn.handler,
                                selector = handleObjIn.selector),
                            handler.guid || (handler.guid = jQuery.guid++),
                            (events = elemData.events) || (events = elemData.events = {}),
                            (eventHandle = elemData.handle) || (eventHandle = elemData.handle = function (e) {
                                    return typeof jQuery === strundefined || e && jQuery.event.triggered === e.type ? void 0 : jQuery.event.dispatch.apply(eventHandle.elem, arguments)
                                },
                                eventHandle.elem = elem),
                            types = (types || "").match(rnotwhite) || [""],
                            t = types.length; t--;)
                            tmp = rtypenamespace.exec(types[t]) || [],
                            type = origType = tmp[1],
                            namespaces = (tmp[2] || "").split(".").sort(),
                            type && (special = jQuery.event.special[type] || {},
                                type = (selector ? special.delegateType : special.bindType) || type,
                                special = jQuery.event.special[type] || {},
                                handleObj = jQuery.extend({
                                    type: type,
                                    origType: origType,
                                    data: data,
                                    handler: handler,
                                    guid: handler.guid,
                                    selector: selector,
                                    needsContext: selector && jQuery.expr.match.needsContext.test(selector),
                                    namespace: namespaces.join(".")
                                }, handleObjIn),
                                (handlers = events[type]) || (handlers = events[type] = [],
                                    handlers.delegateCount = 0,
                                    special.setup && special.setup.call(elem, data, namespaces, eventHandle) !== !1 || (elem.addEventListener ? elem.addEventListener(type, eventHandle, !1) : elem.attachEvent && elem.attachEvent("on" + type, eventHandle))),
                                special.add && (special.add.call(elem, handleObj),
                                    handleObj.handler.guid || (handleObj.handler.guid = handler.guid)),
                                selector ? handlers.splice(handlers.delegateCount++, 0, handleObj) : handlers.push(handleObj),
                                jQuery.event.global[type] = !0);
                        elem = null
                    }
                },
                remove: function (elem, types, handler, selector, mappedTypes) {
                    var j, handleObj, tmp, origCount, t, events, special, handlers, type, namespaces, origType, elemData = jQuery.hasData(elem) && jQuery._data(elem);
                    if (elemData && (events = elemData.events)) {
                        for (types = (types || "").match(rnotwhite) || [""],
                            t = types.length; t--;)
                            if (tmp = rtypenamespace.exec(types[t]) || [],
                                type = origType = tmp[1],
                                namespaces = (tmp[2] || "").split(".").sort(),
                                type) {
                                for (special = jQuery.event.special[type] || {},
                                    type = (selector ? special.delegateType : special.bindType) || type,
                                    handlers = events[type] || [],
                                    tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)"),
                                    origCount = j = handlers.length; j--;)
                                    handleObj = handlers[j],
                                    !mappedTypes && origType !== handleObj.origType || handler && handler.guid !== handleObj.guid || tmp && !tmp.test(handleObj.namespace) || selector && selector !== handleObj.selector && ("**" !== selector || !handleObj.selector) || (handlers.splice(j, 1),
                                        handleObj.selector && handlers.delegateCount--,
                                        special.remove && special.remove.call(elem, handleObj));
                                origCount && !handlers.length && (special.teardown && special.teardown.call(elem, namespaces, elemData.handle) !== !1 || jQuery.removeEvent(elem, type, elemData.handle),
                                    delete events[type])
                            } else
                                for (type in events)
                                    jQuery.event.remove(elem, type + types[t], handler, selector, !0);
                        jQuery.isEmptyObject(events) && (delete elemData.handle,
                            jQuery._removeData(elem, "events"))
                    }
                },
                trigger: function (event, data, elem, onlyHandlers) {
                    var handle, ontype, cur, bubbleType, special, tmp, i, eventPath = [elem || document],
                        type = hasOwn.call(event, "type") ? event.type : event,
                        namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
                    if (cur = tmp = elem = elem || document,
                        3 !== elem.nodeType && 8 !== elem.nodeType && !rfocusMorph.test(type + jQuery.event.triggered) && (type.indexOf(".") >= 0 && (namespaces = type.split("."),
                                type = namespaces.shift(),
                                namespaces.sort()),
                            ontype = type.indexOf(":") < 0 && "on" + type,
                            event = event[jQuery.expando] ? event : new jQuery.Event(type, "object" == typeof event && event),
                            event.isTrigger = onlyHandlers ? 2 : 3,
                            event.namespace = namespaces.join("."),
                            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null,
                            event.result = void 0,
                            event.target || (event.target = elem),
                            data = null == data ? [event] : jQuery.makeArray(data, [event]),
                            special = jQuery.event.special[type] || {},
                            onlyHandlers || !special.trigger || special.trigger.apply(elem, data) !== !1)) {
                        if (!onlyHandlers && !special.noBubble && !jQuery.isWindow(elem)) {
                            for (bubbleType = special.delegateType || type,
                                rfocusMorph.test(bubbleType + type) || (cur = cur.parentNode); cur; cur = cur.parentNode)
                                eventPath.push(cur),
                                tmp = cur;
                            tmp === (elem.ownerDocument || document) && eventPath.push(tmp.defaultView || tmp.parentWindow || window)
                        }
                        for (i = 0;
                            (cur = eventPath[i++]) && !event.isPropagationStopped();)
                            event.type = i > 1 ? bubbleType : special.bindType || type,
                            handle = (jQuery._data(cur, "events") || {})[event.type] && jQuery._data(cur, "handle"),
                            handle && handle.apply(cur, data),
                            handle = ontype && cur[ontype],
                            handle && handle.apply && jQuery.acceptData(cur) && (event.result = handle.apply(cur, data),
                                event.result === !1 && event.preventDefault());
                        if (event.type = type,
                            !onlyHandlers && !event.isDefaultPrevented() && (!special._default || special._default.apply(eventPath.pop(), data) === !1) && jQuery.acceptData(elem) && ontype && elem[type] && !jQuery.isWindow(elem)) {
                            tmp = elem[ontype],
                                tmp && (elem[ontype] = null),
                                jQuery.event.triggered = type;
                            try {
                                elem[type]()
                            } catch (e) {}
                            jQuery.event.triggered = void 0,
                                tmp && (elem[ontype] = tmp)
                        }
                        return event.result
                    }
                },
                dispatch: function (event) {
                    event = jQuery.event.fix(event);
                    var i, ret, handleObj, matched, j, handlerQueue = [],
                        args = slice.call(arguments),
                        handlers = (jQuery._data(this, "events") || {})[event.type] || [],
                        special = jQuery.event.special[event.type] || {};
                    if (args[0] = event,
                        event.delegateTarget = this,
                        !special.preDispatch || special.preDispatch.call(this, event) !== !1) {
                        for (handlerQueue = jQuery.event.handlers.call(this, event, handlers),
                            i = 0;
                            (matched = handlerQueue[i++]) && !event.isPropagationStopped();)
                            for (event.currentTarget = matched.elem,
                                j = 0;
                                (handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped();)
                                (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) && (event.handleObj = handleObj,
                                    event.data = handleObj.data,
                                    ret = ((jQuery.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args),
                                    void 0 !== ret && (event.result = ret) === !1 && (event.preventDefault(),
                                        event.stopPropagation()));
                        return special.postDispatch && special.postDispatch.call(this, event),
                            event.result
                    }
                },
                handlers: function (event, handlers) {
                    var sel, handleObj, matches, i, handlerQueue = [],
                        delegateCount = handlers.delegateCount,
                        cur = event.target;
                    if (delegateCount && cur.nodeType && (!event.button || "click" !== event.type))
                        for (; cur != this; cur = cur.parentNode || this)
                            if (1 === cur.nodeType && (cur.disabled !== !0 || "click" !== event.type)) {
                                for (matches = [],
                                    i = 0; delegateCount > i; i++)
                                    handleObj = handlers[i],
                                    sel = handleObj.selector + " ",
                                    void 0 === matches[sel] && (matches[sel] = handleObj.needsContext ? jQuery(sel, this).index(cur) >= 0 : jQuery.find(sel, this, null, [cur]).length),
                                    matches[sel] && matches.push(handleObj);
                                matches.length && handlerQueue.push({
                                    elem: cur,
                                    handlers: matches
                                })
                            }
                    return delegateCount < handlers.length && handlerQueue.push({
                            elem: this,
                            handlers: handlers.slice(delegateCount)
                        }),
                        handlerQueue
                },
                fix: function (event) {
                    if (event[jQuery.expando])
                        return event;
                    var i, prop, copy, type = event.type,
                        originalEvent = event,
                        fixHook = this.fixHooks[type];
                    for (fixHook || (this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {}),
                        copy = fixHook.props ? this.props.concat(fixHook.props) : this.props,
                        event = new jQuery.Event(originalEvent),
                        i = copy.length; i--;)
                        prop = copy[i],
                        event[prop] = originalEvent[prop];
                    return event.target || (event.target = originalEvent.srcElement || document),
                        3 === event.target.nodeType && (event.target = event.target.parentNode),
                        event.metaKey = !!event.metaKey,
                        fixHook.filter ? fixHook.filter(event, originalEvent) : event
                },
                props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
                fixHooks: {},
                keyHooks: {
                    props: "char charCode key keyCode".split(" "),
                    filter: function (event, original) {
                        return null == event.which && (event.which = null != original.charCode ? original.charCode : original.keyCode),
                            event
                    }
                },
                mouseHooks: {
                    props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
                    filter: function (event, original) {
                        var body, eventDoc, doc, button = original.button,
                            fromElement = original.fromElement;
                        return null == event.pageX && null != original.clientX && (eventDoc = event.target.ownerDocument || document,
                                doc = eventDoc.documentElement,
                                body = eventDoc.body,
                                event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0),
                                event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0)),
                            !event.relatedTarget && fromElement && (event.relatedTarget = fromElement === event.target ? original.toElement : fromElement),
                            event.which || void 0 === button || (event.which = 1 & button ? 1 : 2 & button ? 3 : 4 & button ? 2 : 0),
                            event
                    }
                },
                special: {
                    load: {
                        noBubble: !0
                    },
                    focus: {
                        trigger: function () {
                            if (this !== safeActiveElement() && this.focus)
                                try {
                                    return this.focus(),
                                        !1
                                } catch (e) {}
                        },
                        delegateType: "focusin"
                    },
                    blur: {
                        trigger: function () {
                            return this === safeActiveElement() && this.blur ? (this.blur(),
                                !1) : void 0
                        },
                        delegateType: "focusout"
                    },
                    click: {
                        trigger: function () {
                            return jQuery.nodeName(this, "input") && "checkbox" === this.type && this.click ? (this.click(),
                                !1) : void 0
                        },
                        _default: function (event) {
                            return jQuery.nodeName(event.target, "a")
                        }
                    },
                    beforeunload: {
                        postDispatch: function (event) {
                            void 0 !== event.result && event.originalEvent && (event.originalEvent.returnValue = event.result)
                        }
                    }
                },
                simulate: function (type, elem, event, bubble) {
                    var e = jQuery.extend(new jQuery.Event, event, {
                        type: type,
                        isSimulated: !0,
                        originalEvent: {}
                    });
                    bubble ? jQuery.event.trigger(e, null, elem) : jQuery.event.dispatch.call(elem, e),
                        e.isDefaultPrevented() && event.preventDefault()
                }
            },
            jQuery.removeEvent = document.removeEventListener ? function (elem, type, handle) {
                elem.removeEventListener && elem.removeEventListener(type, handle, !1)
            } :
            function (elem, type, handle) {
                var name = "on" + type;
                elem.detachEvent && (typeof elem[name] === strundefined && (elem[name] = null),
                    elem.detachEvent(name, handle))
            },
            jQuery.Event = function (src, props) {
                return this instanceof jQuery.Event ? (src && src.type ? (this.originalEvent = src,
                        this.type = src.type,
                        this.isDefaultPrevented = src.defaultPrevented || void 0 === src.defaultPrevented && src.returnValue === !1 ? returnTrue : returnFalse) : this.type = src,
                    props && jQuery.extend(this, props),
                    this.timeStamp = src && src.timeStamp || jQuery.now(),
                    void(this[jQuery.expando] = !0)) : new jQuery.Event(src, props)
            },
            jQuery.Event.prototype = {
                isDefaultPrevented: returnFalse,
                isPropagationStopped: returnFalse,
                isImmediatePropagationStopped: returnFalse,
                preventDefault: function () {
                    var e = this.originalEvent;
                    this.isDefaultPrevented = returnTrue,
                        e && (e.preventDefault ? e.preventDefault() : e.returnValue = !1)
                },
                stopPropagation: function () {
                    var e = this.originalEvent;
                    this.isPropagationStopped = returnTrue,
                        e && (e.stopPropagation && e.stopPropagation(),
                            e.cancelBubble = !0)
                },
                stopImmediatePropagation: function () {
                    var e = this.originalEvent;
                    this.isImmediatePropagationStopped = returnTrue,
                        e && e.stopImmediatePropagation && e.stopImmediatePropagation(),
                        this.stopPropagation()
                }
            },
            jQuery.each({
                mouseenter: "mouseover",
                mouseleave: "mouseout",
                pointerenter: "pointerover",
                pointerleave: "pointerout"
            }, function (orig, fix) {
                jQuery.event.special[orig] = {
                    delegateType: fix,
                    bindType: fix,
                    handle: function (event) {
                        var ret, target = this,
                            related = event.relatedTarget,
                            handleObj = event.handleObj;
                        return (!related || related !== target && !jQuery.contains(target, related)) && (event.type = handleObj.origType,
                                ret = handleObj.handler.apply(this, arguments),
                                event.type = fix),
                            ret
                    }
                }
            }),
            support.submitBubbles || (jQuery.event.special.submit = {
                setup: function () {
                    return jQuery.nodeName(this, "form") ? !1 : void jQuery.event.add(this, "click._submit keypress._submit", function (e) {
                        var elem = e.target,
                            form = jQuery.nodeName(elem, "input") || jQuery.nodeName(elem, "button") ? elem.form : void 0;
                        form && !jQuery._data(form, "submitBubbles") && (jQuery.event.add(form, "submit._submit", function (event) {
                                event._submit_bubble = !0
                            }),
                            jQuery._data(form, "submitBubbles", !0))
                    })
                },
                postDispatch: function (event) {
                    event._submit_bubble && (delete event._submit_bubble,
                        this.parentNode && !event.isTrigger && jQuery.event.simulate("submit", this.parentNode, event, !0))
                },
                teardown: function () {
                    return jQuery.nodeName(this, "form") ? !1 : void jQuery.event.remove(this, "._submit")
                }
            }),
            support.changeBubbles || (jQuery.event.special.change = {
                setup: function () {
                    return rformElems.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (jQuery.event.add(this, "propertychange._change", function (event) {
                                "checked" === event.originalEvent.propertyName && (this._just_changed = !0)
                            }),
                            jQuery.event.add(this, "click._change", function (event) {
                                this._just_changed && !event.isTrigger && (this._just_changed = !1),
                                    jQuery.event.simulate("change", this, event, !0)
                            })),
                        !1) : void jQuery.event.add(this, "beforeactivate._change", function (e) {
                        var elem = e.target;
                        rformElems.test(elem.nodeName) && !jQuery._data(elem, "changeBubbles") && (jQuery.event.add(elem, "change._change", function (event) {
                                !this.parentNode || event.isSimulated || event.isTrigger || jQuery.event.simulate("change", this.parentNode, event, !0)
                            }),
                            jQuery._data(elem, "changeBubbles", !0))
                    })
                },
                handle: function (event) {
                    var elem = event.target;
                    return this !== elem || event.isSimulated || event.isTrigger || "radio" !== elem.type && "checkbox" !== elem.type ? event.handleObj.handler.apply(this, arguments) : void 0
                },
                teardown: function () {
                    return jQuery.event.remove(this, "._change"),
                        !rformElems.test(this.nodeName)
                }
            }),
            support.focusinBubbles || jQuery.each({
                focus: "focusin",
                blur: "focusout"
            }, function (orig, fix) {
                var handler = function (event) {
                    jQuery.event.simulate(fix, event.target, jQuery.event.fix(event), !0)
                };
                jQuery.event.special[fix] = {
                    setup: function () {
                        var doc = this.ownerDocument || this,
                            attaches = jQuery._data(doc, fix);
                        attaches || doc.addEventListener(orig, handler, !0),
                            jQuery._data(doc, fix, (attaches || 0) + 1)
                    },
                    teardown: function () {
                        var doc = this.ownerDocument || this,
                            attaches = jQuery._data(doc, fix) - 1;
                        attaches ? jQuery._data(doc, fix, attaches) : (doc.removeEventListener(orig, handler, !0),
                            jQuery._removeData(doc, fix))
                    }
                }
            }),
            jQuery.fn.extend({
                on: function (types, selector, data, fn, one) {
                    var type, origFn;
                    if ("object" == typeof types) {
                        "string" != typeof selector && (data = data || selector,
                            selector = void 0);
                        for (type in types)
                            this.on(type, selector, data, types[type], one);
                        return this
                    }
                    if (null == data && null == fn ? (fn = selector,
                            data = selector = void 0) : null == fn && ("string" == typeof selector ? (fn = data,
                            data = void 0) : (fn = data,
                            data = selector,
                            selector = void 0)),
                        fn === !1)
                        fn = returnFalse;
                    else if (!fn)
                        return this;
                    return 1 === one && (origFn = fn,
                            fn = function (event) {
                                return jQuery().off(event),
                                    origFn.apply(this, arguments)
                            },
                            fn.guid = origFn.guid || (origFn.guid = jQuery.guid++)),
                        this.each(function () {
                            jQuery.event.add(this, types, fn, data, selector)
                        })
                },
                one: function (types, selector, data, fn) {
                    return this.on(types, selector, data, fn, 1)
                },
                off: function (types, selector, fn) {
                    var handleObj, type;
                    if (types && types.preventDefault && types.handleObj)
                        return handleObj = types.handleObj,
                            jQuery(types.delegateTarget).off(handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType, handleObj.selector, handleObj.handler),
                            this;
                    if ("object" == typeof types) {
                        for (type in types)
                            this.off(type, selector, types[type]);
                        return this
                    }
                    return (selector === !1 || "function" == typeof selector) && (fn = selector,
                            selector = void 0),
                        fn === !1 && (fn = returnFalse),
                        this.each(function () {
                            jQuery.event.remove(this, types, fn, selector)
                        })
                },
                trigger: function (type, data) {
                    return this.each(function () {
                        jQuery.event.trigger(type, data, this)
                    })
                },
                triggerHandler: function (type, data) {
                    var elem = this[0];
                    return elem ? jQuery.event.trigger(type, data, elem, !0) : void 0
                }
            });
        var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
            rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
            rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
            rleadingWhitespace = /^\s+/,
            rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            rtagName = /<([\w:]+)/,
            rtbody = /<tbody/i,
            rhtml = /<|&#?\w+;/,
            rnoInnerhtml = /<(?:script|style|link)/i,
            rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
            rscriptType = /^$|\/(?:java|ecma)script/i,
            rscriptTypeMasked = /^true\/(.*)/,
            rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
            wrapMap = {
                option: [1, "<select multiple='multiple'>", "</select>"],
                legend: [1, "<fieldset>", "</fieldset>"],
                area: [1, "<map>", "</map>"],
                param: [1, "<object>", "</object>"],
                thead: [1, "<table>", "</table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                _default: support.htmlSerialize ? [0, "", ""] : [1, "X<div>", "</div>"]
            },
            safeFragment = createSafeFragment(document),
            fragmentDiv = safeFragment.appendChild(document.createElement("div"));
        wrapMap.optgroup = wrapMap.option,
            wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead,
            wrapMap.th = wrapMap.td,
            jQuery.extend({
                clone: function (elem, dataAndEvents, deepDataAndEvents) {
                    var destElements, node, clone, i, srcElements, inPage = jQuery.contains(elem.ownerDocument, elem);
                    if (support.html5Clone || jQuery.isXMLDoc(elem) || !rnoshimcache.test("<" + elem.nodeName + ">") ? clone = elem.cloneNode(!0) : (fragmentDiv.innerHTML = elem.outerHTML,
                            fragmentDiv.removeChild(clone = fragmentDiv.firstChild)),
                        !(support.noCloneEvent && support.noCloneChecked || 1 !== elem.nodeType && 11 !== elem.nodeType || jQuery.isXMLDoc(elem)))
                        for (destElements = getAll(clone),
                            srcElements = getAll(elem),
                            i = 0; null != (node = srcElements[i]); ++i)
                            destElements[i] && fixCloneNodeIssues(node, destElements[i]);
                    if (dataAndEvents)
                        if (deepDataAndEvents)
                            for (srcElements = srcElements || getAll(elem),
                                destElements = destElements || getAll(clone),
                                i = 0; null != (node = srcElements[i]); i++)
                                cloneCopyEvent(node, destElements[i]);
                        else
                            cloneCopyEvent(elem, clone);
                    return destElements = getAll(clone, "script"),
                        destElements.length > 0 && setGlobalEval(destElements, !inPage && getAll(elem, "script")),
                        destElements = srcElements = node = null,
                        clone
                },
                buildFragment: function (elems, context, scripts, selection) {
                    for (var j, elem, contains, tmp, tag, tbody, wrap, l = elems.length, safe = createSafeFragment(context), nodes = [], i = 0; l > i; i++)
                        if (elem = elems[i],
                            elem || 0 === elem)
                            if ("object" === jQuery.type(elem))
                                jQuery.merge(nodes, elem.nodeType ? [elem] : elem);
                            else if (rhtml.test(elem)) {
                        for (tmp = tmp || safe.appendChild(context.createElement("div")),
                            tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase(),
                            wrap = wrapMap[tag] || wrapMap._default,
                            tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2],
                            j = wrap[0]; j--;)
                            tmp = tmp.lastChild;
                        if (!support.leadingWhitespace && rleadingWhitespace.test(elem) && nodes.push(context.createTextNode(rleadingWhitespace.exec(elem)[0])),
                            !support.tbody)
                            for (elem = "table" !== tag || rtbody.test(elem) ? "<table>" !== wrap[1] || rtbody.test(elem) ? 0 : tmp : tmp.firstChild,
                                j = elem && elem.childNodes.length; j--;)
                                jQuery.nodeName(tbody = elem.childNodes[j], "tbody") && !tbody.childNodes.length && elem.removeChild(tbody);
                        for (jQuery.merge(nodes, tmp.childNodes),
                            tmp.textContent = ""; tmp.firstChild;)
                            tmp.removeChild(tmp.firstChild);
                        tmp = safe.lastChild
                    } else
                        nodes.push(context.createTextNode(elem));
                    for (tmp && safe.removeChild(tmp),
                        support.appendChecked || jQuery.grep(getAll(nodes, "input"), fixDefaultChecked),
                        i = 0; elem = nodes[i++];)
                        if ((!selection || -1 === jQuery.inArray(elem, selection)) && (contains = jQuery.contains(elem.ownerDocument, elem),
                                tmp = getAll(safe.appendChild(elem), "script"),
                                contains && setGlobalEval(tmp),
                                scripts))
                            for (j = 0; elem = tmp[j++];)
                                rscriptType.test(elem.type || "") && scripts.push(elem);
                    return tmp = null,
                        safe
                },
                cleanData: function (elems, acceptData) {
                    for (var elem, type, id, data, i = 0, internalKey = jQuery.expando, cache = jQuery.cache, deleteExpando = support.deleteExpando, special = jQuery.event.special; null != (elem = elems[i]); i++)
                        if ((acceptData || jQuery.acceptData(elem)) && (id = elem[internalKey],
                                data = id && cache[id])) {
                            if (data.events)
                                for (type in data.events)
                                    special[type] ? jQuery.event.remove(elem, type) : jQuery.removeEvent(elem, type, data.handle);
                            cache[id] && (delete cache[id],
                                deleteExpando ? delete elem[internalKey] : typeof elem.removeAttribute !== strundefined ? elem.removeAttribute(internalKey) : elem[internalKey] = null,
                                deletedIds.push(id))
                        }
                }
            }),
            jQuery.fn.extend({
                text: function (value) {
                    return access(this, function (value) {
                        return void 0 === value ? jQuery.text(this) : this.empty().append((this[0] && this[0].ownerDocument || document).createTextNode(value))
                    }, null, value, arguments.length)
                },
                append: function () {
                    return this.domManip(arguments, function (elem) {
                        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                            var target = manipulationTarget(this, elem);
                            target.appendChild(elem)
                        }
                    })
                },
                prepend: function () {
                    return this.domManip(arguments, function (elem) {
                        if (1 === this.nodeType || 11 === this.nodeType || 9 === this.nodeType) {
                            var target = manipulationTarget(this, elem);
                            target.insertBefore(elem, target.firstChild)
                        }
                    })
                },
                before: function () {
                    return this.domManip(arguments, function (elem) {
                        this.parentNode && this.parentNode.insertBefore(elem, this)
                    })
                },
                after: function () {
                    return this.domManip(arguments, function (elem) {
                        this.parentNode && this.parentNode.insertBefore(elem, this.nextSibling)
                    })
                },
                remove: function (selector, keepData) {
                    for (var elem, elems = selector ? jQuery.filter(selector, this) : this, i = 0; null != (elem = elems[i]); i++)
                        keepData || 1 !== elem.nodeType || jQuery.cleanData(getAll(elem)),
                        elem.parentNode && (keepData && jQuery.contains(elem.ownerDocument, elem) && setGlobalEval(getAll(elem, "script")),
                            elem.parentNode.removeChild(elem));
                    return this
                },
                empty: function () {
                    for (var elem, i = 0; null != (elem = this[i]); i++) {
                        for (1 === elem.nodeType && jQuery.cleanData(getAll(elem, !1)); elem.firstChild;)
                            elem.removeChild(elem.firstChild);
                        elem.options && jQuery.nodeName(elem, "select") && (elem.options.length = 0)
                    }
                    return this
                },
                clone: function (dataAndEvents, deepDataAndEvents) {
                    return dataAndEvents = null == dataAndEvents ? !1 : dataAndEvents,
                        deepDataAndEvents = null == deepDataAndEvents ? dataAndEvents : deepDataAndEvents,
                        this.map(function () {
                            return jQuery.clone(this, dataAndEvents, deepDataAndEvents)
                        })
                },
                html: function (value) {
                    return access(this, function (value) {
                        var elem = this[0] || {},
                            i = 0,
                            l = this.length;
                        if (void 0 === value)
                            return 1 === elem.nodeType ? elem.innerHTML.replace(rinlinejQuery, "") : void 0;
                        if ("string" == typeof value && !rnoInnerhtml.test(value) && (support.htmlSerialize || !rnoshimcache.test(value)) && (support.leadingWhitespace || !rleadingWhitespace.test(value)) && !wrapMap[(rtagName.exec(value) || ["", ""])[1].toLowerCase()]) {
                            value = value.replace(rxhtmlTag, "<$1></$2>");
                            try {
                                for (; l > i; i++)
                                    elem = this[i] || {},
                                    1 === elem.nodeType && (jQuery.cleanData(getAll(elem, !1)),
                                        elem.innerHTML = value);
                                elem = 0
                            } catch (e) {}
                        }
                        elem && this.empty().append(value)
                    }, null, value, arguments.length)
                },
                replaceWith: function () {
                    var arg = arguments[0];
                    return this.domManip(arguments, function (elem) {
                            arg = this.parentNode,
                                jQuery.cleanData(getAll(this)),
                                arg && arg.replaceChild(elem, this)
                        }),
                        arg && (arg.length || arg.nodeType) ? this : this.remove()
                },
                detach: function (selector) {
                    return this.remove(selector, !0)
                },
                domManip: function (args, callback) {
                    args = concat.apply([], args);
                    var first, node, hasScripts, scripts, doc, fragment, i = 0,
                        l = this.length,
                        set = this,
                        iNoClone = l - 1,
                        value = args[0],
                        isFunction = jQuery.isFunction(value);
                    if (isFunction || l > 1 && "string" == typeof value && !support.checkClone && rchecked.test(value))
                        return this.each(function (index) {
                            var self = set.eq(index);
                            isFunction && (args[0] = value.call(this, index, self.html())),
                                self.domManip(args, callback)
                        });
                    if (l && (fragment = jQuery.buildFragment(args, this[0].ownerDocument, !1, this),
                            first = fragment.firstChild,
                            1 === fragment.childNodes.length && (fragment = first),
                            first)) {
                        for (scripts = jQuery.map(getAll(fragment, "script"), disableScript),
                            hasScripts = scripts.length; l > i; i++)
                            node = fragment,
                            i !== iNoClone && (node = jQuery.clone(node, !0, !0),
                                hasScripts && jQuery.merge(scripts, getAll(node, "script"))),
                            callback.call(this[i], node, i);
                        if (hasScripts)
                            for (doc = scripts[scripts.length - 1].ownerDocument,
                                jQuery.map(scripts, restoreScript),
                                i = 0; hasScripts > i; i++)
                                node = scripts[i],
                                rscriptType.test(node.type || "") && !jQuery._data(node, "globalEval") && jQuery.contains(doc, node) && (node.src ? jQuery._evalUrl && jQuery._evalUrl(node.src) : jQuery.globalEval((node.text || node.textContent || node.innerHTML || "").replace(rcleanScript, "")));
                        fragment = first = null
                    }
                    return this
                }
            }),
            jQuery.each({
                appendTo: "append",
                prependTo: "prepend",
                insertBefore: "before",
                insertAfter: "after",
                replaceAll: "replaceWith"
            }, function (name, original) {
                jQuery.fn[name] = function (selector) {
                    for (var elems, i = 0, ret = [], insert = jQuery(selector), last = insert.length - 1; last >= i; i++)
                        elems = i === last ? this : this.clone(!0),
                        jQuery(insert[i])[original](elems),
                        push.apply(ret, elems.get());
                    return this.pushStack(ret)
                }
            });
        var iframe, elemdisplay = {};
        ! function () {
            var shrinkWrapBlocksVal;
            support.shrinkWrapBlocks = function () {
                if (null != shrinkWrapBlocksVal)
                    return shrinkWrapBlocksVal;
                shrinkWrapBlocksVal = !1;
                var div, body, container;
                return body = document.getElementsByTagName("body")[0],
                    body && body.style ? (div = document.createElement("div"),
                        container = document.createElement("div"),
                        container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px",
                        body.appendChild(container).appendChild(div),
                        typeof div.style.zoom !== strundefined && (div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1",
                            div.appendChild(document.createElement("div")).style.width = "5px",
                            shrinkWrapBlocksVal = 3 !== div.offsetWidth),
                        body.removeChild(container),
                        shrinkWrapBlocksVal) : void 0
            }
        }();
        var getStyles, curCSS, rmargin = /^margin/,
            rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i"),
            rposition = /^(top|right|bottom|left)$/;
        window.getComputedStyle ? (getStyles = function (elem) {
                    return elem.ownerDocument.defaultView.opener ? elem.ownerDocument.defaultView.getComputedStyle(elem, null) : window.getComputedStyle(elem, null)
                },
                curCSS = function (elem, name, computed) {
                    var width, minWidth, maxWidth, ret, style = elem.style;
                    return computed = computed || getStyles(elem),
                        ret = computed ? computed.getPropertyValue(name) || computed[name] : void 0,
                        computed && ("" !== ret || jQuery.contains(elem.ownerDocument, elem) || (ret = jQuery.style(elem, name)),
                            rnumnonpx.test(ret) && rmargin.test(name) && (width = style.width,
                                minWidth = style.minWidth,
                                maxWidth = style.maxWidth,
                                style.minWidth = style.maxWidth = style.width = ret,
                                ret = computed.width,
                                style.width = width,
                                style.minWidth = minWidth,
                                style.maxWidth = maxWidth)),
                        void 0 === ret ? ret : ret + ""
                }
            ) : document.documentElement.currentStyle && (getStyles = function (elem) {
                    return elem.currentStyle
                },
                curCSS = function (elem, name, computed) {
                    var left, rs, rsLeft, ret, style = elem.style;
                    return computed = computed || getStyles(elem),
                        ret = computed ? computed[name] : void 0,
                        null == ret && style && style[name] && (ret = style[name]),
                        rnumnonpx.test(ret) && !rposition.test(name) && (left = style.left,
                            rs = elem.runtimeStyle,
                            rsLeft = rs && rs.left,
                            rsLeft && (rs.left = elem.currentStyle.left),
                            style.left = "fontSize" === name ? "1em" : ret,
                            ret = style.pixelLeft + "px",
                            style.left = left,
                            rsLeft && (rs.left = rsLeft)),
                        void 0 === ret ? ret : ret + "" || "auto"
                }
            ),
            function () {
                function computeStyleTests() {
                    var div, body, container, contents;
                    body = document.getElementsByTagName("body")[0],
                        body && body.style && (div = document.createElement("div"),
                            container = document.createElement("div"),
                            container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px",
                            body.appendChild(container).appendChild(div),
                            div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",
                            pixelPositionVal = boxSizingReliableVal = !1,
                            reliableMarginRightVal = !0,
                            window.getComputedStyle && (pixelPositionVal = "1%" !== (window.getComputedStyle(div, null) || {}).top,
                                boxSizingReliableVal = "4px" === (window.getComputedStyle(div, null) || {
                                    width: "4px"
                                }).width,
                                contents = div.appendChild(document.createElement("div")),
                                contents.style.cssText = div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",
                                contents.style.marginRight = contents.style.width = "0",
                                div.style.width = "1px",
                                reliableMarginRightVal = !parseFloat((window.getComputedStyle(contents, null) || {}).marginRight),
                                div.removeChild(contents)),
                            div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>",
                            contents = div.getElementsByTagName("td"),
                            contents[0].style.cssText = "margin:0;border:0;padding:0;display:none",
                            reliableHiddenOffsetsVal = 0 === contents[0].offsetHeight,
                            reliableHiddenOffsetsVal && (contents[0].style.display = "",
                                contents[1].style.display = "none",
                                reliableHiddenOffsetsVal = 0 === contents[0].offsetHeight),
                            body.removeChild(container))
                }
                var div, style, a, pixelPositionVal, boxSizingReliableVal, reliableHiddenOffsetsVal, reliableMarginRightVal;
                div = document.createElement("div"),
                    div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",
                    a = div.getElementsByTagName("a")[0],
                    style = a && a.style,
                    style && (style.cssText = "float:left;opacity:.5",
                        support.opacity = "0.5" === style.opacity,
                        support.cssFloat = !!style.cssFloat,
                        div.style.backgroundClip = "content-box",
                        div.cloneNode(!0).style.backgroundClip = "",
                        support.clearCloneStyle = "content-box" === div.style.backgroundClip,
                        support.boxSizing = "" === style.boxSizing || "" === style.MozBoxSizing || "" === style.WebkitBoxSizing,
                        jQuery.extend(support, {
                            reliableHiddenOffsets: function () {
                                return null == reliableHiddenOffsetsVal && computeStyleTests(),
                                    reliableHiddenOffsetsVal
                            },
                            boxSizingReliable: function () {
                                return null == boxSizingReliableVal && computeStyleTests(),
                                    boxSizingReliableVal
                            },
                            pixelPosition: function () {
                                return null == pixelPositionVal && computeStyleTests(),
                                    pixelPositionVal
                            },
                            reliableMarginRight: function () {
                                return null == reliableMarginRightVal && computeStyleTests(),
                                    reliableMarginRightVal
                            }
                        }))
            }(),
            jQuery.swap = function (elem, options, callback, args) {
                var ret, name, old = {};
                for (name in options)
                    old[name] = elem.style[name],
                    elem.style[name] = options[name];
                ret = callback.apply(elem, args || []);
                for (name in options)
                    elem.style[name] = old[name];
                return ret
            };
        var ralpha = /alpha\([^)]*\)/i,
            ropacity = /opacity\s*=\s*([^)]*)/,
            rdisplayswap = /^(none|table(?!-c[ea]).+)/,
            rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"),
            rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"),
            cssShow = {
                position: "absolute",
                visibility: "hidden",
                display: "block"
            },
            cssNormalTransform = {
                letterSpacing: "0",
                fontWeight: "400"
            },
            cssPrefixes = ["Webkit", "O", "Moz", "ms"];
        jQuery.extend({
                cssHooks: {
                    opacity: {
                        get: function (elem, computed) {
                            if (computed) {
                                var ret = curCSS(elem, "opacity");
                                return "" === ret ? "1" : ret
                            }
                        }
                    }
                },
                cssNumber: {
                    columnCount: !0,
                    fillOpacity: !0,
                    flexGrow: !0,
                    flexShrink: !0,
                    fontWeight: !0,
                    lineHeight: !0,
                    opacity: !0,
                    order: !0,
                    orphans: !0,
                    widows: !0,
                    zIndex: !0,
                    zoom: !0
                },
                cssProps: {
                    "float": support.cssFloat ? "cssFloat" : "styleFloat"
                },
                style: function (elem, name, value, extra) {
                    if (elem && 3 !== elem.nodeType && 8 !== elem.nodeType && elem.style) {
                        var ret, type, hooks, origName = jQuery.camelCase(name),
                            style = elem.style;
                        if (name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(style, origName)),
                            hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName],
                            void 0 === value)
                            return hooks && "get" in hooks && void 0 !== (ret = hooks.get(elem, !1, extra)) ? ret : style[name];
                        if (type = typeof value,
                            "string" === type && (ret = rrelNum.exec(value)) && (value = (ret[1] + 1) * ret[2] + parseFloat(jQuery.css(elem, name)),
                                type = "number"),
                            null != value && value === value && ("number" !== type || jQuery.cssNumber[origName] || (value += "px"),
                                support.clearCloneStyle || "" !== value || 0 !== name.indexOf("background") || (style[name] = "inherit"),
                                !(hooks && "set" in hooks && void 0 === (value = hooks.set(elem, value, extra)))))
                            try {
                                style[name] = value
                            } catch (e) {}
                    }
                },
                css: function (elem, name, extra, styles) {
                    var num, val, hooks, origName = jQuery.camelCase(name);
                    return name = jQuery.cssProps[origName] || (jQuery.cssProps[origName] = vendorPropName(elem.style, origName)),
                        hooks = jQuery.cssHooks[name] || jQuery.cssHooks[origName],
                        hooks && "get" in hooks && (val = hooks.get(elem, !0, extra)),
                        void 0 === val && (val = curCSS(elem, name, styles)),
                        "normal" === val && name in cssNormalTransform && (val = cssNormalTransform[name]),
                        "" === extra || extra ? (num = parseFloat(val),
                            extra === !0 || jQuery.isNumeric(num) ? num || 0 : val) : val
                }
            }),
            jQuery.each(["height", "width"], function (i, name) {
                jQuery.cssHooks[name] = {
                    get: function (elem, computed, extra) {
                        return computed ? rdisplayswap.test(jQuery.css(elem, "display")) && 0 === elem.offsetWidth ? jQuery.swap(elem, cssShow, function () {
                            return getWidthOrHeight(elem, name, extra)
                        }) : getWidthOrHeight(elem, name, extra) : void 0
                    },
                    set: function (elem, value, extra) {
                        var styles = extra && getStyles(elem);
                        return setPositiveNumber(elem, value, extra ? augmentWidthOrHeight(elem, name, extra, support.boxSizing && "border-box" === jQuery.css(elem, "boxSizing", !1, styles), styles) : 0)
                    }
                }
            }),
            support.opacity || (jQuery.cssHooks.opacity = {
                get: function (elem, computed) {
                    return ropacity.test((computed && elem.currentStyle ? elem.currentStyle.filter : elem.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : computed ? "1" : ""
                },
                set: function (elem, value) {
                    var style = elem.style,
                        currentStyle = elem.currentStyle,
                        opacity = jQuery.isNumeric(value) ? "alpha(opacity=" + 100 * value + ")" : "",
                        filter = currentStyle && currentStyle.filter || style.filter || "";
                    style.zoom = 1,
                        (value >= 1 || "" === value) && "" === jQuery.trim(filter.replace(ralpha, "")) && style.removeAttribute && (style.removeAttribute("filter"),
                            "" === value || currentStyle && !currentStyle.filter) || (style.filter = ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + " " + opacity)
                }
            }),
            jQuery.cssHooks.marginRight = addGetHookIf(support.reliableMarginRight, function (elem, computed) {
                return computed ? jQuery.swap(elem, {
                    display: "inline-block"
                }, curCSS, [elem, "marginRight"]) : void 0
            }),
            jQuery.each({
                margin: "",
                padding: "",
                border: "Width"
            }, function (prefix, suffix) {
                jQuery.cssHooks[prefix + suffix] = {
                        expand: function (value) {
                            for (var i = 0, expanded = {}, parts = "string" == typeof value ? value.split(" ") : [value]; 4 > i; i++)
                                expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
                            return expanded
                        }
                    },
                    rmargin.test(prefix) || (jQuery.cssHooks[prefix + suffix].set = setPositiveNumber)
            }),
            jQuery.fn.extend({
                css: function (name, value) {
                    return access(this, function (elem, name, value) {
                        var styles, len, map = {},
                            i = 0;
                        if (jQuery.isArray(name)) {
                            for (styles = getStyles(elem),
                                len = name.length; len > i; i++)
                                map[name[i]] = jQuery.css(elem, name[i], !1, styles);
                            return map
                        }
                        return void 0 !== value ? jQuery.style(elem, name, value) : jQuery.css(elem, name)
                    }, name, value, arguments.length > 1)
                },
                show: function () {
                    return showHide(this, !0)
                },
                hide: function () {
                    return showHide(this)
                },
                toggle: function (state) {
                    return "boolean" == typeof state ? state ? this.show() : this.hide() : this.each(function () {
                        isHidden(this) ? jQuery(this).show() : jQuery(this).hide()
                    })
                }
            }),
            jQuery.Tween = Tween,
            Tween.prototype = {
                constructor: Tween,
                init: function (elem, options, prop, end, easing, unit) {
                    this.elem = elem,
                        this.prop = prop,
                        this.easing = easing || "swing",
                        this.options = options,
                        this.start = this.now = this.cur(),
                        this.end = end,
                        this.unit = unit || (jQuery.cssNumber[prop] ? "" : "px")
                },
                cur: function () {
                    var hooks = Tween.propHooks[this.prop];
                    return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this)
                },
                run: function (percent) {
                    var eased, hooks = Tween.propHooks[this.prop];
                    return this.options.duration ? this.pos = eased = jQuery.easing[this.easing](percent, this.options.duration * percent, 0, 1, this.options.duration) : this.pos = eased = percent,
                        this.now = (this.end - this.start) * eased + this.start,
                        this.options.step && this.options.step.call(this.elem, this.now, this),
                        hooks && hooks.set ? hooks.set(this) : Tween.propHooks._default.set(this),
                        this
                }
            },
            Tween.prototype.init.prototype = Tween.prototype,
            Tween.propHooks = {
                _default: {
                    get: function (tween) {
                        var result;
                        return null == tween.elem[tween.prop] || tween.elem.style && null != tween.elem.style[tween.prop] ? (result = jQuery.css(tween.elem, tween.prop, ""),
                            result && "auto" !== result ? result : 0) : tween.elem[tween.prop]
                    },
                    set: function (tween) {
                        jQuery.fx.step[tween.prop] ? jQuery.fx.step[tween.prop](tween) : tween.elem.style && (null != tween.elem.style[jQuery.cssProps[tween.prop]] || jQuery.cssHooks[tween.prop]) ? jQuery.style(tween.elem, tween.prop, tween.now + tween.unit) : tween.elem[tween.prop] = tween.now
                    }
                }
            },
            Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
                set: function (tween) {
                    tween.elem.nodeType && tween.elem.parentNode && (tween.elem[tween.prop] = tween.now)
                }
            },
            jQuery.easing = {
                linear: function (p) {
                    return p
                },
                swing: function (p) {
                    return .5 - Math.cos(p * Math.PI) / 2
                }
            },
            jQuery.fx = Tween.prototype.init,
            jQuery.fx.step = {};
        var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/,
            rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"),
            rrun = /queueHooks$/,
            animationPrefilters = [defaultPrefilter],
            tweeners = {
                "*": [function (prop, value) {
                    var tween = this.createTween(prop, value),
                        target = tween.cur(),
                        parts = rfxnum.exec(value),
                        unit = parts && parts[3] || (jQuery.cssNumber[prop] ? "" : "px"),
                        start = (jQuery.cssNumber[prop] || "px" !== unit && +target) && rfxnum.exec(jQuery.css(tween.elem, prop)),
                        scale = 1,
                        maxIterations = 20;
                    if (start && start[3] !== unit) {
                        unit = unit || start[3],
                            parts = parts || [],
                            start = +target || 1;
                        do
                            scale = scale || ".5",
                            start /= scale,
                            jQuery.style(tween.elem, prop, start + unit);
                        while (scale !== (scale = tween.cur() / target) && 1 !== scale && --maxIterations)
                    }
                    return parts && (start = tween.start = +start || +target || 0,
                            tween.unit = unit,
                            tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2]),
                        tween
                }]
            };
        jQuery.Animation = jQuery.extend(Animation, {
                tweener: function (props, callback) {
                    jQuery.isFunction(props) ? (callback = props,
                        props = ["*"]) : props = props.split(" ");
                    for (var prop, index = 0, length = props.length; length > index; index++)
                        prop = props[index],
                        tweeners[prop] = tweeners[prop] || [],
                        tweeners[prop].unshift(callback)
                },
                prefilter: function (callback, prepend) {
                    prepend ? animationPrefilters.unshift(callback) : animationPrefilters.push(callback)
                }
            }),
            jQuery.speed = function (speed, easing, fn) {
                var opt = speed && "object" == typeof speed ? jQuery.extend({}, speed) : {
                    complete: fn || !fn && easing || jQuery.isFunction(speed) && speed,
                    duration: speed,
                    easing: fn && easing || easing && !jQuery.isFunction(easing) && easing
                };
                return opt.duration = jQuery.fx.off ? 0 : "number" == typeof opt.duration ? opt.duration : opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[opt.duration] : jQuery.fx.speeds._default,
                    (null == opt.queue || opt.queue === !0) && (opt.queue = "fx"),
                    opt.old = opt.complete,
                    opt.complete = function () {
                        jQuery.isFunction(opt.old) && opt.old.call(this),
                            opt.queue && jQuery.dequeue(this, opt.queue)
                    },
                    opt
            },
            jQuery.fn.extend({
                fadeTo: function (speed, to, easing, callback) {
                    return this.filter(isHidden).css("opacity", 0).show().end().animate({
                        opacity: to
                    }, speed, easing, callback)
                },
                animate: function (prop, speed, easing, callback) {
                    var empty = jQuery.isEmptyObject(prop),
                        optall = jQuery.speed(speed, easing, callback),
                        doAnimation = function () {
                            var anim = Animation(this, jQuery.extend({}, prop), optall);
                            (empty || jQuery._data(this, "finish")) && anim.stop(!0)
                        };
                    return doAnimation.finish = doAnimation,
                        empty || optall.queue === !1 ? this.each(doAnimation) : this.queue(optall.queue, doAnimation)
                },
                stop: function (type, clearQueue, gotoEnd) {
                    var stopQueue = function (hooks) {
                        var stop = hooks.stop;
                        delete hooks.stop,
                            stop(gotoEnd)
                    };
                    return "string" != typeof type && (gotoEnd = clearQueue,
                            clearQueue = type,
                            type = void 0),
                        clearQueue && type !== !1 && this.queue(type || "fx", []),
                        this.each(function () {
                            var dequeue = !0,
                                index = null != type && type + "queueHooks",
                                timers = jQuery.timers,
                                data = jQuery._data(this);
                            if (index)
                                data[index] && data[index].stop && stopQueue(data[index]);
                            else
                                for (index in data)
                                    data[index] && data[index].stop && rrun.test(index) && stopQueue(data[index]);
                            for (index = timers.length; index--;)
                                timers[index].elem !== this || null != type && timers[index].queue !== type || (timers[index].anim.stop(gotoEnd),
                                    dequeue = !1,
                                    timers.splice(index, 1));
                            (dequeue || !gotoEnd) && jQuery.dequeue(this, type)
                        })
                },
                finish: function (type) {
                    return type !== !1 && (type = type || "fx"),
                        this.each(function () {
                            var index, data = jQuery._data(this),
                                queue = data[type + "queue"],
                                hooks = data[type + "queueHooks"],
                                timers = jQuery.timers,
                                length = queue ? queue.length : 0;
                            for (data.finish = !0,
                                jQuery.queue(this, type, []),
                                hooks && hooks.stop && hooks.stop.call(this, !0),
                                index = timers.length; index--;)
                                timers[index].elem === this && timers[index].queue === type && (timers[index].anim.stop(!0),
                                    timers.splice(index, 1));
                            for (index = 0; length > index; index++)
                                queue[index] && queue[index].finish && queue[index].finish.call(this);
                            delete data.finish
                        })
                }
            }),
            jQuery.each(["toggle", "show", "hide"], function (i, name) {
                var cssFn = jQuery.fn[name];
                jQuery.fn[name] = function (speed, easing, callback) {
                    return null == speed || "boolean" == typeof speed ? cssFn.apply(this, arguments) : this.animate(genFx(name, !0), speed, easing, callback)
                }
            }),
            jQuery.each({
                slideDown: genFx("show"),
                slideUp: genFx("hide"),
                slideToggle: genFx("toggle"),
                fadeIn: {
                    opacity: "show"
                },
                fadeOut: {
                    opacity: "hide"
                },
                fadeToggle: {
                    opacity: "toggle"
                }
            }, function (name, props) {
                jQuery.fn[name] = function (speed, easing, callback) {
                    return this.animate(props, speed, easing, callback)
                }
            }),
            jQuery.timers = [],
            jQuery.fx.tick = function () {
                var timer, timers = jQuery.timers,
                    i = 0;
                for (fxNow = jQuery.now(); i < timers.length; i++)
                    timer = timers[i],
                    timer() || timers[i] !== timer || timers.splice(i--, 1);
                timers.length || jQuery.fx.stop(),
                    fxNow = void 0
            },
            jQuery.fx.timer = function (timer) {
                jQuery.timers.push(timer),
                    timer() ? jQuery.fx.start() : jQuery.timers.pop()
            },
            jQuery.fx.interval = 13,
            jQuery.fx.start = function () {
                timerId || (timerId = setInterval(jQuery.fx.tick, jQuery.fx.interval))
            },
            jQuery.fx.stop = function () {
                clearInterval(timerId),
                    timerId = null
            },
            jQuery.fx.speeds = {
                slow: 600,
                fast: 200,
                _default: 400
            },
            jQuery.fn.delay = function (time, type) {
                return time = jQuery.fx ? jQuery.fx.speeds[time] || time : time,
                    type = type || "fx",
                    this.queue(type, function (next, hooks) {
                        var timeout = setTimeout(next, time);
                        hooks.stop = function () {
                            clearTimeout(timeout)
                        }
                    })
            },
            function () {
                var input, div, select, a, opt;
                div = document.createElement("div"),
                    div.setAttribute("className", "t"),
                    div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",
                    a = div.getElementsByTagName("a")[0],
                    select = document.createElement("select"),
                    opt = select.appendChild(document.createElement("option")),
                    input = div.getElementsByTagName("input")[0],
                    a.style.cssText = "top:1px",
                    support.getSetAttribute = "t" !== div.className,
                    support.style = /top/.test(a.getAttribute("style")),
                    support.hrefNormalized = "/a" === a.getAttribute("href"),
                    support.checkOn = !!input.value,
                    support.optSelected = opt.selected,
                    support.enctype = !!document.createElement("form").enctype,
                    select.disabled = !0,
                    support.optDisabled = !opt.disabled,
                    input = document.createElement("input"),
                    input.setAttribute("value", ""),
                    support.input = "" === input.getAttribute("value"),
                    input.value = "t",
                    input.setAttribute("type", "radio"),
                    support.radioValue = "t" === input.value
            }();
        var rreturn = /\r/g;
        jQuery.fn.extend({
                val: function (value) {
                    var hooks, ret, isFunction, elem = this[0]; {
                        if (arguments.length)
                            return isFunction = jQuery.isFunction(value),
                                this.each(function (i) {
                                    var val;
                                    1 === this.nodeType && (val = isFunction ? value.call(this, i, jQuery(this).val()) : value,
                                        null == val ? val = "" : "number" == typeof val ? val += "" : jQuery.isArray(val) && (val = jQuery.map(val, function (value) {
                                            return null == value ? "" : value + ""
                                        })),
                                        hooks = jQuery.valHooks[this.type] || jQuery.valHooks[this.nodeName.toLowerCase()],
                                        hooks && "set" in hooks && void 0 !== hooks.set(this, val, "value") || (this.value = val))
                                });
                        if (elem)
                            return hooks = jQuery.valHooks[elem.type] || jQuery.valHooks[elem.nodeName.toLowerCase()],
                                hooks && "get" in hooks && void 0 !== (ret = hooks.get(elem, "value")) ? ret : (ret = elem.value,
                                    "string" == typeof ret ? ret.replace(rreturn, "") : null == ret ? "" : ret)
                    }
                }
            }),
            jQuery.extend({
                valHooks: {
                    option: {
                        get: function (elem) {
                            var val = jQuery.find.attr(elem, "value");
                            return null != val ? val : jQuery.trim(jQuery.text(elem))
                        }
                    },
                    select: {
                        get: function (elem) {
                            for (var value, option, options = elem.options, index = elem.selectedIndex, one = "select-one" === elem.type || 0 > index, values = one ? null : [], max = one ? index + 1 : options.length, i = 0 > index ? max : one ? index : 0; max > i; i++)
                                if (option = options[i],
                                    (option.selected || i === index) && (support.optDisabled ? !option.disabled : null === option.getAttribute("disabled")) && (!option.parentNode.disabled || !jQuery.nodeName(option.parentNode, "optgroup"))) {
                                    if (value = jQuery(option).val(),
                                        one)
                                        return value;
                                    values.push(value)
                                }
                            return values
                        },
                        set: function (elem, value) {
                            for (var optionSet, option, options = elem.options, values = jQuery.makeArray(value), i = options.length; i--;)
                                if (option = options[i],
                                    jQuery.inArray(jQuery.valHooks.option.get(option), values) >= 0)
                                    try {
                                        option.selected = optionSet = !0
                                    } catch (_) {
                                        option.scrollHeight
                                    }
                            else
                                option.selected = !1;
                            return optionSet || (elem.selectedIndex = -1),
                                options
                        }
                    }
                }
            }),
            jQuery.each(["radio", "checkbox"], function () {
                jQuery.valHooks[this] = {
                        set: function (elem, value) {
                            return jQuery.isArray(value) ? elem.checked = jQuery.inArray(jQuery(elem).val(), value) >= 0 : void 0
                        }
                    },
                    support.checkOn || (jQuery.valHooks[this].get = function (elem) {
                        return null === elem.getAttribute("value") ? "on" : elem.value
                    })
            });
        var nodeHook, boolHook, attrHandle = jQuery.expr.attrHandle,
            ruseDefault = /^(?:checked|selected)$/i,
            getSetAttribute = support.getSetAttribute,
            getSetInput = support.input;
        jQuery.fn.extend({
                attr: function (name, value) {
                    return access(this, jQuery.attr, name, value, arguments.length > 1)
                },
                removeAttr: function (name) {
                    return this.each(function () {
                        jQuery.removeAttr(this, name)
                    })
                }
            }),
            jQuery.extend({
                attr: function (elem, name, value) {
                    var hooks, ret, nType = elem.nodeType;
                    if (elem && 3 !== nType && 8 !== nType && 2 !== nType)
                        return typeof elem.getAttribute === strundefined ? jQuery.prop(elem, name, value) : (1 === nType && jQuery.isXMLDoc(elem) || (name = name.toLowerCase(),
                                hooks = jQuery.attrHooks[name] || (jQuery.expr.match.bool.test(name) ? boolHook : nodeHook)),
                            void 0 === value ? hooks && "get" in hooks && null !== (ret = hooks.get(elem, name)) ? ret : (ret = jQuery.find.attr(elem, name),
                                null == ret ? void 0 : ret) : null !== value ? hooks && "set" in hooks && void 0 !== (ret = hooks.set(elem, value, name)) ? ret : (elem.setAttribute(name, value + ""),
                                value) : void jQuery.removeAttr(elem, name))
                },
                removeAttr: function (elem, value) {
                    var name, propName, i = 0,
                        attrNames = value && value.match(rnotwhite);
                    if (attrNames && 1 === elem.nodeType)
                        for (; name = attrNames[i++];)
                            propName = jQuery.propFix[name] || name,
                            jQuery.expr.match.bool.test(name) ? getSetInput && getSetAttribute || !ruseDefault.test(name) ? elem[propName] = !1 : elem[jQuery.camelCase("default-" + name)] = elem[propName] = !1 : jQuery.attr(elem, name, ""),
                            elem.removeAttribute(getSetAttribute ? name : propName)
                },
                attrHooks: {
                    type: {
                        set: function (elem, value) {
                            if (!support.radioValue && "radio" === value && jQuery.nodeName(elem, "input")) {
                                var val = elem.value;
                                return elem.setAttribute("type", value),
                                    val && (elem.value = val),
                                    value
                            }
                        }
                    }
                }
            }),
            boolHook = {
                set: function (elem, value, name) {
                    return value === !1 ? jQuery.removeAttr(elem, name) : getSetInput && getSetAttribute || !ruseDefault.test(name) ? elem.setAttribute(!getSetAttribute && jQuery.propFix[name] || name, name) : elem[jQuery.camelCase("default-" + name)] = elem[name] = !0,
                        name
                }
            },
            jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g), function (i, name) {
                var getter = attrHandle[name] || jQuery.find.attr;
                attrHandle[name] = getSetInput && getSetAttribute || !ruseDefault.test(name) ? function (elem, name, isXML) {
                        var ret, handle;
                        return isXML || (handle = attrHandle[name],
                                attrHandle[name] = ret,
                                ret = null != getter(elem, name, isXML) ? name.toLowerCase() : null,
                                attrHandle[name] = handle),
                            ret
                    } :
                    function (elem, name, isXML) {
                        return isXML ? void 0 : elem[jQuery.camelCase("default-" + name)] ? name.toLowerCase() : null
                    }
            }),
            getSetInput && getSetAttribute || (jQuery.attrHooks.value = {
                set: function (elem, value, name) {
                    return jQuery.nodeName(elem, "input") ? void(elem.defaultValue = value) : nodeHook && nodeHook.set(elem, value, name)
                }
            }),
            getSetAttribute || (nodeHook = {
                    set: function (elem, value, name) {
                        var ret = elem.getAttributeNode(name);
                        return ret || elem.setAttributeNode(ret = elem.ownerDocument.createAttribute(name)),
                            ret.value = value += "",
                            "value" === name || value === elem.getAttribute(name) ? value : void 0
                    }
                },
                attrHandle.id = attrHandle.name = attrHandle.coords = function (elem, name, isXML) {
                    var ret;
                    return isXML ? void 0 : (ret = elem.getAttributeNode(name)) && "" !== ret.value ? ret.value : null
                },
                jQuery.valHooks.button = {
                    get: function (elem, name) {
                        var ret = elem.getAttributeNode(name);
                        return ret && ret.specified ? ret.value : void 0
                    },
                    set: nodeHook.set
                },
                jQuery.attrHooks.contenteditable = {
                    set: function (elem, value, name) {
                        nodeHook.set(elem, "" === value ? !1 : value, name)
                    }
                },
                jQuery.each(["width", "height"], function (i, name) {
                    jQuery.attrHooks[name] = {
                        set: function (elem, value) {
                            return "" === value ? (elem.setAttribute(name, "auto"),
                                value) : void 0
                        }
                    }
                })),
            support.style || (jQuery.attrHooks.style = {
                get: function (elem) {
                    return elem.style.cssText || void 0
                },
                set: function (elem, value) {
                    return elem.style.cssText = value + ""
                }
            });
        var rfocusable = /^(?:input|select|textarea|button|object)$/i,
            rclickable = /^(?:a|area)$/i;
        jQuery.fn.extend({
                prop: function (name, value) {
                    return access(this, jQuery.prop, name, value, arguments.length > 1)
                },
                removeProp: function (name) {
                    return name = jQuery.propFix[name] || name,
                        this.each(function () {
                            try {
                                this[name] = void 0,
                                    delete this[name]
                            } catch (e) {}
                        })
                }
            }),
            jQuery.extend({
                propFix: {
                    "for": "htmlFor",
                    "class": "className"
                },
                prop: function (elem, name, value) {
                    var ret, hooks, notxml, nType = elem.nodeType;
                    if (elem && 3 !== nType && 8 !== nType && 2 !== nType)
                        return notxml = 1 !== nType || !jQuery.isXMLDoc(elem),
                            notxml && (name = jQuery.propFix[name] || name,
                                hooks = jQuery.propHooks[name]),
                            void 0 !== value ? hooks && "set" in hooks && void 0 !== (ret = hooks.set(elem, value, name)) ? ret : elem[name] = value : hooks && "get" in hooks && null !== (ret = hooks.get(elem, name)) ? ret : elem[name]
                },
                propHooks: {
                    tabIndex: {
                        get: function (elem) {
                            var tabindex = jQuery.find.attr(elem, "tabindex");
                            return tabindex ? parseInt(tabindex, 10) : rfocusable.test(elem.nodeName) || rclickable.test(elem.nodeName) && elem.href ? 0 : -1
                        }
                    }
                }
            }),
            support.hrefNormalized || jQuery.each(["href", "src"], function (i, name) {
                jQuery.propHooks[name] = {
                    get: function (elem) {
                        return elem.getAttribute(name, 4)
                    }
                }
            }),
            support.optSelected || (jQuery.propHooks.selected = {
                get: function (elem) {
                    var parent = elem.parentNode;
                    return parent && (parent.selectedIndex,
                            parent.parentNode && parent.parentNode.selectedIndex),
                        null
                }
            }),
            jQuery.each(["tabIndex", "readOnly", "maxLength", "cellSpacing", "cellPadding", "rowSpan", "colSpan", "useMap", "frameBorder", "contentEditable"], function () {
                jQuery.propFix[this.toLowerCase()] = this
            }),
            support.enctype || (jQuery.propFix.enctype = "encoding");
        var rclass = /[\t\r\n\f]/g;
        jQuery.fn.extend({
                addClass: function (value) {
                    var classes, elem, cur, clazz, j, finalValue, i = 0,
                        len = this.length,
                        proceed = "string" == typeof value && value;
                    if (jQuery.isFunction(value))
                        return this.each(function (j) {
                            jQuery(this).addClass(value.call(this, j, this.className))
                        });
                    if (proceed)
                        for (classes = (value || "").match(rnotwhite) || []; len > i; i++)
                            if (elem = this[i],
                                cur = 1 === elem.nodeType && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ")) {
                                for (j = 0; clazz = classes[j++];)
                                    cur.indexOf(" " + clazz + " ") < 0 && (cur += clazz + " ");
                                finalValue = jQuery.trim(cur),
                                    elem.className !== finalValue && (elem.className = finalValue)
                            }
                    return this
                },
                removeClass: function (value) {
                    var classes, elem, cur, clazz, j, finalValue, i = 0,
                        len = this.length,
                        proceed = 0 === arguments.length || "string" == typeof value && value;
                    if (jQuery.isFunction(value))
                        return this.each(function (j) {
                            jQuery(this).removeClass(value.call(this, j, this.className))
                        });
                    if (proceed)
                        for (classes = (value || "").match(rnotwhite) || []; len > i; i++)
                            if (elem = this[i],
                                cur = 1 === elem.nodeType && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "")) {
                                for (j = 0; clazz = classes[j++];)
                                    for (; cur.indexOf(" " + clazz + " ") >= 0;)
                                        cur = cur.replace(" " + clazz + " ", " ");
                                finalValue = value ? jQuery.trim(cur) : "",
                                    elem.className !== finalValue && (elem.className = finalValue)
                            }
                    return this
                },
                toggleClass: function (value, stateVal) {
                    var type = typeof value;
                    return "boolean" == typeof stateVal && "string" === type ? stateVal ? this.addClass(value) : this.removeClass(value) : jQuery.isFunction(value) ? this.each(function (i) {
                        jQuery(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal)
                    }) : this.each(function () {
                        if ("string" === type)
                            for (var className, i = 0, self = jQuery(this), classNames = value.match(rnotwhite) || []; className = classNames[i++];)
                                self.hasClass(className) ? self.removeClass(className) : self.addClass(className);
                        else
                            (type === strundefined || "boolean" === type) && (this.className && jQuery._data(this, "__className__", this.className),
                                this.className = this.className || value === !1 ? "" : jQuery._data(this, "__className__") || "")
                    })
                },
                hasClass: function (selector) {
                    for (var className = " " + selector + " ", i = 0, l = this.length; l > i; i++)
                        if (1 === this[i].nodeType && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0)
                            return !0;
                    return !1
                }
            }),
            jQuery.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function (i, name) {
                jQuery.fn[name] = function (data, fn) {
                    return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name)
                }
            }),
            jQuery.fn.extend({
                hover: function (fnOver, fnOut) {
                    return this.mouseenter(fnOver).mouseleave(fnOut || fnOver)
                },
                bind: function (types, data, fn) {
                    return this.on(types, null, data, fn)
                },
                unbind: function (types, fn) {
                    return this.off(types, null, fn)
                },
                delegate: function (selector, types, data, fn) {
                    return this.on(types, selector, data, fn)
                },
                undelegate: function (selector, types, fn) {
                    return 1 === arguments.length ? this.off(selector, "**") : this.off(types, selector || "**", fn)
                }
            });
        var nonce = jQuery.now(),
            rquery = /\?/,
            rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;
        jQuery.parseJSON = function (data) {
                if (window.JSON && window.JSON.parse)
                    return window.JSON.parse(data + "");
                var requireNonComma, depth = null,
                    str = jQuery.trim(data + "");
                return str && !jQuery.trim(str.replace(rvalidtokens, function (token, comma, open, close) {
                    return requireNonComma && comma && (depth = 0),
                        0 === depth ? token : (requireNonComma = open || comma,
                            depth += !close - !open,
                            "")
                })) ? Function("return " + str)() : jQuery.error("Invalid JSON: " + data)
            },
            jQuery.parseXML = function (data) {
                var xml, tmp;
                if (!data || "string" != typeof data)
                    return null;
                try {
                    window.DOMParser ? (tmp = new DOMParser,
                        xml = tmp.parseFromString(data, "text/xml")) : (xml = new ActiveXObject("Microsoft.XMLDOM"),
                        xml.async = "false",
                        xml.loadXML(data))
                } catch (e) {
                    xml = void 0
                }
                return xml && xml.documentElement && !xml.getElementsByTagName("parsererror").length || jQuery.error("Invalid XML: " + data),
                    xml
            };
        var ajaxLocParts, ajaxLocation, rhash = /#.*$/,
            rts = /([?&])_=[^&]*/,
            rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
            rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
            rnoContent = /^(?:GET|HEAD)$/,
            rprotocol = /^\/\//,
            rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
            prefilters = {},
            transports = {},
            allTypes = "*/".concat("*");
        try {
            ajaxLocation = location.href
        } catch (e) {
            ajaxLocation = document.createElement("a"),
                ajaxLocation.href = "",
                ajaxLocation = ajaxLocation.href
        }
        ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [],
            jQuery.extend({
                active: 0,
                lastModified: {},
                etag: {},
                ajaxSettings: {
                    url: ajaxLocation,
                    type: "GET",
                    isLocal: rlocalProtocol.test(ajaxLocParts[1]),
                    global: !0,
                    processData: !0,
                    async: !0,
                    contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                    accepts: {
                        "*": allTypes,
                        text: "text/plain",
                        html: "text/html",
                        xml: "application/xml, text/xml",
                        json: "application/json, text/javascript"
                    },
                    contents: {
                        xml: /xml/,
                        html: /html/,
                        json: /json/
                    },
                    responseFields: {
                        xml: "responseXML",
                        text: "responseText",
                        json: "responseJSON"
                    },
                    converters: {
                        "* text": String,
                        "text html": !0,
                        "text json": jQuery.parseJSON,
                        "text xml": jQuery.parseXML
                    },
                    flatOptions: {
                        url: !0,
                        context: !0
                    }
                },
                ajaxSetup: function (target, settings) {
                    return settings ? ajaxExtend(ajaxExtend(target, jQuery.ajaxSettings), settings) : ajaxExtend(jQuery.ajaxSettings, target)
                },
                ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
                ajaxTransport: addToPrefiltersOrTransports(transports),
                ajax: function (url, options) {
                    function done(status, nativeStatusText, responses, headers) {
                        var isSuccess, success, error, response, modified, statusText = nativeStatusText;
                        2 !== state && (state = 2,
                            timeoutTimer && clearTimeout(timeoutTimer),
                            transport = void 0,
                            responseHeadersString = headers || "",
                            jqXHR.readyState = status > 0 ? 4 : 0,
                            isSuccess = status >= 200 && 300 > status || 304 === status,
                            responses && (response = ajaxHandleResponses(s, jqXHR, responses)),
                            response = ajaxConvert(s, response, jqXHR, isSuccess),
                            isSuccess ? (s.ifModified && (modified = jqXHR.getResponseHeader("Last-Modified"),
                                    modified && (jQuery.lastModified[cacheURL] = modified),
                                    modified = jqXHR.getResponseHeader("etag"),
                                    modified && (jQuery.etag[cacheURL] = modified)),
                                204 === status || "HEAD" === s.type ? statusText = "nocontent" : 304 === status ? statusText = "notmodified" : (statusText = response.state,
                                    success = response.data,
                                    error = response.error,
                                    isSuccess = !error)) : (error = statusText,
                                (status || !statusText) && (statusText = "error",
                                    0 > status && (status = 0))),
                            jqXHR.status = status,
                            jqXHR.statusText = (nativeStatusText || statusText) + "",
                            isSuccess ? deferred.resolveWith(callbackContext, [success, statusText, jqXHR]) : deferred.rejectWith(callbackContext, [jqXHR, statusText, error]),
                            jqXHR.statusCode(statusCode),
                            statusCode = void 0,
                            fireGlobals && globalEventContext.trigger(isSuccess ? "ajaxSuccess" : "ajaxError", [jqXHR, s, isSuccess ? success : error]),
                            completeDeferred.fireWith(callbackContext, [jqXHR, statusText]),
                            fireGlobals && (globalEventContext.trigger("ajaxComplete", [jqXHR, s]),
                                --jQuery.active || jQuery.event.trigger("ajaxStop")))
                    }
                    "object" == typeof url && (options = url,
                            url = void 0),
                        options = options || {};
                    var parts, i, cacheURL, responseHeadersString, timeoutTimer, fireGlobals, transport, responseHeaders, s = jQuery.ajaxSetup({}, options),
                        callbackContext = s.context || s,
                        globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery(callbackContext) : jQuery.event,
                        deferred = jQuery.Deferred(),
                        completeDeferred = jQuery.Callbacks("once memory"),
                        statusCode = s.statusCode || {},
                        requestHeaders = {},
                        requestHeadersNames = {},
                        state = 0,
                        strAbort = "canceled",
                        jqXHR = {
                            readyState: 0,
                            getResponseHeader: function (key) {
                                var match;
                                if (2 === state) {
                                    if (!responseHeaders)
                                        for (responseHeaders = {}; match = rheaders.exec(responseHeadersString);)
                                            responseHeaders[match[1].toLowerCase()] = match[2];
                                    match = responseHeaders[key.toLowerCase()]
                                }
                                return null == match ? null : match
                            },
                            getAllResponseHeaders: function () {
                                return 2 === state ? responseHeadersString : null
                            },
                            setRequestHeader: function (name, value) {
                                var lname = name.toLowerCase();
                                return state || (name = requestHeadersNames[lname] = requestHeadersNames[lname] || name,
                                        requestHeaders[name] = value),
                                    this
                            },
                            overrideMimeType: function (type) {
                                return state || (s.mimeType = type),
                                    this
                            },
                            statusCode: function (map) {
                                var code;
                                if (map)
                                    if (2 > state)
                                        for (code in map)
                                            statusCode[code] = [statusCode[code], map[code]];
                                    else
                                        jqXHR.always(map[jqXHR.status]);
                                return this
                            },
                            abort: function (statusText) {
                                var finalText = statusText || strAbort;
                                return transport && transport.abort(finalText),
                                    done(0, finalText),
                                    this
                            }
                        };
                    if (deferred.promise(jqXHR).complete = completeDeferred.add,
                        jqXHR.success = jqXHR.done,
                        jqXHR.error = jqXHR.fail,
                        s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//"),
                        s.type = options.method || options.type || s.method || s.type,
                        s.dataTypes = jQuery.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""],
                        null == s.crossDomain && (parts = rurl.exec(s.url.toLowerCase()),
                            s.crossDomain = !(!parts || parts[1] === ajaxLocParts[1] && parts[2] === ajaxLocParts[2] && (parts[3] || ("http:" === parts[1] ? "80" : "443")) === (ajaxLocParts[3] || ("http:" === ajaxLocParts[1] ? "80" : "443")))),
                        s.data && s.processData && "string" != typeof s.data && (s.data = jQuery.param(s.data, s.traditional)),
                        inspectPrefiltersOrTransports(prefilters, s, options, jqXHR),
                        2 === state)
                        return jqXHR;
                    fireGlobals = jQuery.event && s.global,
                        fireGlobals && 0 === jQuery.active++ && jQuery.event.trigger("ajaxStart"),
                        s.type = s.type.toUpperCase(),
                        s.hasContent = !rnoContent.test(s.type),
                        cacheURL = s.url,
                        s.hasContent || (s.data && (cacheURL = s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data,
                                delete s.data),
                            s.cache === !1 && (s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + nonce++) : cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++)),
                        s.ifModified && (jQuery.lastModified[cacheURL] && jqXHR.setRequestHeader("If-Modified-Since", jQuery.lastModified[cacheURL]),
                            jQuery.etag[cacheURL] && jqXHR.setRequestHeader("If-None-Match", jQuery.etag[cacheURL])),
                        (s.data && s.hasContent && s.contentType !== !1 || options.contentType) && jqXHR.setRequestHeader("Content-Type", s.contentType),
                        jqXHR.setRequestHeader("Accept", s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + ("*" !== s.dataTypes[0] ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]);
                    for (i in s.headers)
                        jqXHR.setRequestHeader(i, s.headers[i]);
                    if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === !1 || 2 === state))
                        return jqXHR.abort();
                    strAbort = "abort";
                    for (i in {
                            success: 1,
                            error: 1,
                            complete: 1
                        })
                        jqXHR[i](s[i]);
                    if (transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR)) {
                        jqXHR.readyState = 1,
                            fireGlobals && globalEventContext.trigger("ajaxSend", [jqXHR, s]),
                            s.async && s.timeout > 0 && (timeoutTimer = setTimeout(function () {
                                jqXHR.abort("timeout")
                            }, s.timeout));
                        try {
                            state = 1,
                                transport.send(requestHeaders, done)
                        } catch (e) {
                            if (!(2 > state))
                                throw e;
                            done(-1, e)
                        }
                    } else
                        done(-1, "No Transport");
                    return jqXHR
                },
                getJSON: function (url, data, callback) {
                    return jQuery.get(url, data, callback, "json")
                },
                getScript: function (url, callback) {
                    return jQuery.get(url, void 0, callback, "script")
                }
            }),
            jQuery.each(["get", "post"], function (i, method) {
                jQuery[method] = function (url, data, callback, type) {
                    return jQuery.isFunction(data) && (type = type || callback,
                            callback = data,
                            data = void 0),
                        jQuery.ajax({
                            url: url,
                            type: method,
                            dataType: type,
                            data: data,
                            success: callback
                        })
                }
            }),
            jQuery._evalUrl = function (url) {
                return jQuery.ajax({
                    url: url,
                    type: "GET",
                    dataType: "script",
                    async: !1,
                    global: !1,
                    "throws": !0
                })
            },
            jQuery.fn.extend({
                wrapAll: function (html) {
                    if (jQuery.isFunction(html))
                        return this.each(function (i) {
                            jQuery(this).wrapAll(html.call(this, i))
                        });
                    if (this[0]) {
                        var wrap = jQuery(html, this[0].ownerDocument).eq(0).clone(!0);
                        this[0].parentNode && wrap.insertBefore(this[0]),
                            wrap.map(function () {
                                for (var elem = this; elem.firstChild && 1 === elem.firstChild.nodeType;)
                                    elem = elem.firstChild;
                                return elem
                            }).append(this)
                    }
                    return this
                },
                wrapInner: function (html) {
                    return jQuery.isFunction(html) ? this.each(function (i) {
                        jQuery(this).wrapInner(html.call(this, i))
                    }) : this.each(function () {
                        var self = jQuery(this),
                            contents = self.contents();
                        contents.length ? contents.wrapAll(html) : self.append(html)
                    })
                },
                wrap: function (html) {
                    var isFunction = jQuery.isFunction(html);
                    return this.each(function (i) {
                        jQuery(this).wrapAll(isFunction ? html.call(this, i) : html)
                    })
                },
                unwrap: function () {
                    return this.parent().each(function () {
                        jQuery.nodeName(this, "body") || jQuery(this).replaceWith(this.childNodes)
                    }).end()
                }
            }),
            jQuery.expr.filters.hidden = function (elem) {
                return elem.offsetWidth <= 0 && elem.offsetHeight <= 0 || !support.reliableHiddenOffsets() && "none" === (elem.style && elem.style.display || jQuery.css(elem, "display"))
            },
            jQuery.expr.filters.visible = function (elem) {
                return !jQuery.expr.filters.hidden(elem)
            };
        var r20 = /%20/g,
            rbracket = /\[\]$/,
            rCRLF = /\r?\n/g,
            rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
            rsubmittable = /^(?:input|select|textarea|keygen)/i;
        jQuery.param = function (a, traditional) {
                var prefix, s = [],
                    add = function (key, value) {
                        value = jQuery.isFunction(value) ? value() : null == value ? "" : value,
                            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value)
                    };
                if (void 0 === traditional && (traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional),
                    jQuery.isArray(a) || a.jquery && !jQuery.isPlainObject(a))
                    jQuery.each(a, function () {
                        add(this.name, this.value)
                    });
                else
                    for (prefix in a)
                        buildParams(prefix, a[prefix], traditional, add);
                return s.join("&").replace(r20, "+")
            },
            jQuery.fn.extend({
                serialize: function () {
                    return jQuery.param(this.serializeArray())
                },
                serializeArray: function () {
                    return this.map(function () {
                        var elements = jQuery.prop(this, "elements");
                        return elements ? jQuery.makeArray(elements) : this
                    }).filter(function () {
                        var type = this.type;
                        return this.name && !jQuery(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type))
                    }).map(function (i, elem) {
                        var val = jQuery(this).val();
                        return null == val ? null : jQuery.isArray(val) ? jQuery.map(val, function (val) {
                            return {
                                name: elem.name,
                                value: val.replace(rCRLF, "\r\n")
                            }
                        }) : {
                            name: elem.name,
                            value: val.replace(rCRLF, "\r\n")
                        }
                    }).get()
                }
            }),
            jQuery.ajaxSettings.xhr = void 0 !== window.ActiveXObject ? function () {
                return !this.isLocal && /^(get|post|head|put|delete|options)$/i.test(this.type) && createStandardXHR() || createActiveXHR()
            } :
            createStandardXHR;
        var xhrId = 0,
            xhrCallbacks = {},
            xhrSupported = jQuery.ajaxSettings.xhr();
        window.attachEvent && window.attachEvent("onunload", function () {
                for (var key in xhrCallbacks)
                    xhrCallbacks[key](void 0, !0)
            }),
            support.cors = !!xhrSupported && "withCredentials" in xhrSupported,
            xhrSupported = support.ajax = !!xhrSupported,
            xhrSupported && jQuery.ajaxTransport(function (options) {
                if (!options.crossDomain || support.cors) {
                    var callback;
                    return {
                        send: function (headers, complete) {
                            var i, xhr = options.xhr(),
                                id = ++xhrId;
                            if (xhr.open(options.type, options.url, options.async, options.username, options.password),
                                options.xhrFields)
                                for (i in options.xhrFields)
                                    xhr[i] = options.xhrFields[i];
                            options.mimeType && xhr.overrideMimeType && xhr.overrideMimeType(options.mimeType),
                                options.crossDomain || headers["X-Requested-With"] || (headers["X-Requested-With"] = "XMLHttpRequest");
                            for (i in headers)
                                void 0 !== headers[i] && xhr.setRequestHeader(i, headers[i] + "");
                            xhr.send(options.hasContent && options.data || null),
                                callback = function (_, isAbort) {
                                    var status, statusText, responses;
                                    if (callback && (isAbort || 4 === xhr.readyState))
                                        if (delete xhrCallbacks[id],
                                            callback = void 0,
                                            xhr.onreadystatechange = jQuery.noop,
                                            isAbort)
                                            4 !== xhr.readyState && xhr.abort();
                                        else {
                                            responses = {},
                                                status = xhr.status,
                                                "string" == typeof xhr.responseText && (responses.text = xhr.responseText);
                                            try {
                                                statusText = xhr.statusText
                                            } catch (e) {
                                                statusText = ""
                                            }
                                            status || !options.isLocal || options.crossDomain ? 1223 === status && (status = 204) : status = responses.text ? 200 : 404
                                        }
                                    responses && complete(status, statusText, responses, xhr.getAllResponseHeaders())
                                },
                                options.async ? 4 === xhr.readyState ? setTimeout(callback) : xhr.onreadystatechange = xhrCallbacks[id] = callback : callback()
                        },
                        abort: function () {
                            callback && callback(void 0, !0)
                        }
                    }
                }
            }),
            jQuery.ajaxSetup({
                accepts: {
                    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
                },
                contents: {
                    script: /(?:java|ecma)script/
                },
                converters: {
                    "text script": function (text) {
                        return jQuery.globalEval(text),
                            text
                    }
                }
            }),
            jQuery.ajaxPrefilter("script", function (s) {
                void 0 === s.cache && (s.cache = !1),
                    s.crossDomain && (s.type = "GET",
                        s.global = !1)
            }),
            jQuery.ajaxTransport("script", function (s) {
                if (s.crossDomain) {
                    var script, head = document.head || jQuery("head")[0] || document.documentElement;
                    return {
                        send: function (_, callback) {
                            script = document.createElement("script"),
                                script.async = !0,
                                s.scriptCharset && (script.charset = s.scriptCharset),
                                script.src = s.url,
                                script.onload = script.onreadystatechange = function (_, isAbort) {
                                    (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) && (script.onload = script.onreadystatechange = null,
                                        script.parentNode && script.parentNode.removeChild(script),
                                        script = null,
                                        isAbort || callback(200, "success"))
                                },
                                head.insertBefore(script, head.firstChild)
                        },
                        abort: function () {
                            script && script.onload(void 0, !0)
                        }
                    }
                }
            });
        var oldCallbacks = [],
            rjsonp = /(=)\?(?=&|$)|\?\?/;
        jQuery.ajaxSetup({
                jsonp: "callback",
                jsonpCallback: function () {
                    var callback = oldCallbacks.pop() || jQuery.expando + "_" + nonce++;
                    return this[callback] = !0,
                        callback
                }
            }),
            jQuery.ajaxPrefilter("json jsonp", function (s, originalSettings, jqXHR) {
                var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== !1 && (rjsonp.test(s.url) ? "url" : "string" == typeof s.data && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
                return jsonProp || "jsonp" === s.dataTypes[0] ? (callbackName = s.jsonpCallback = jQuery.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback,
                    jsonProp ? s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName) : s.jsonp !== !1 && (s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName),
                    s.converters["script json"] = function () {
                        return responseContainer || jQuery.error(callbackName + " was not called"),
                            responseContainer[0]
                    },
                    s.dataTypes[0] = "json",
                    overwritten = window[callbackName],
                    window[callbackName] = function () {
                        responseContainer = arguments
                    },
                    jqXHR.always(function () {
                        window[callbackName] = overwritten,
                            s[callbackName] && (s.jsonpCallback = originalSettings.jsonpCallback,
                                oldCallbacks.push(callbackName)),
                            responseContainer && jQuery.isFunction(overwritten) && overwritten(responseContainer[0]),
                            responseContainer = overwritten = void 0
                    }),
                    "script") : void 0
            }),
            jQuery.parseHTML = function (data, context, keepScripts) {
                if (!data || "string" != typeof data)
                    return null;
                "boolean" == typeof context && (keepScripts = context,
                        context = !1),
                    context = context || document;
                var parsed = rsingleTag.exec(data),
                    scripts = !keepScripts && [];
                return parsed ? [context.createElement(parsed[1])] : (parsed = jQuery.buildFragment([data], context, scripts),
                    scripts && scripts.length && jQuery(scripts).remove(),
                    jQuery.merge([], parsed.childNodes))
            };
        var _load = jQuery.fn.load;
        jQuery.fn.load = function (url, params, callback) {
                if ("string" != typeof url && _load)
                    return _load.apply(this, arguments);
                var selector, response, type, self = this,
                    off = url.indexOf(" ");
                return off >= 0 && (selector = jQuery.trim(url.slice(off, url.length)),
                        url = url.slice(0, off)),
                    jQuery.isFunction(params) ? (callback = params,
                        params = void 0) : params && "object" == typeof params && (type = "POST"),
                    self.length > 0 && jQuery.ajax({
                        url: url,
                        type: type,
                        dataType: "html",
                        data: params
                    }).done(function (responseText) {
                        response = arguments,
                            self.html(selector ? jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector) : responseText)
                    }).complete(callback && function (jqXHR, status) {
                        self.each(callback, response || [jqXHR.responseText, status, jqXHR])
                    }),
                    this
            },
            jQuery.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function (i, type) {
                jQuery.fn[type] = function (fn) {
                    return this.on(type, fn)
                }
            }),
            jQuery.expr.filters.animated = function (elem) {
                return jQuery.grep(jQuery.timers, function (fn) {
                    return elem === fn.elem
                }).length
            };
        var docElem = window.document.documentElement;
        jQuery.offset = {
                setOffset: function (elem, options, i) {
                    var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery.css(elem, "position"),
                        curElem = jQuery(elem),
                        props = {};
                    "static" === position && (elem.style.position = "relative"),
                        curOffset = curElem.offset(),
                        curCSSTop = jQuery.css(elem, "top"),
                        curCSSLeft = jQuery.css(elem, "left"),
                        calculatePosition = ("absolute" === position || "fixed" === position) && jQuery.inArray("auto", [curCSSTop, curCSSLeft]) > -1,
                        calculatePosition ? (curPosition = curElem.position(),
                            curTop = curPosition.top,
                            curLeft = curPosition.left) : (curTop = parseFloat(curCSSTop) || 0,
                            curLeft = parseFloat(curCSSLeft) || 0),
                        jQuery.isFunction(options) && (options = options.call(elem, i, curOffset)),
                        null != options.top && (props.top = options.top - curOffset.top + curTop),
                        null != options.left && (props.left = options.left - curOffset.left + curLeft),
                        "using" in options ? options.using.call(elem, props) : curElem.css(props)
                }
            },
            jQuery.fn.extend({
                offset: function (options) {
                    if (arguments.length)
                        return void 0 === options ? this : this.each(function (i) {
                            jQuery.offset.setOffset(this, options, i)
                        });
                    var docElem, win, box = {
                            top: 0,
                            left: 0
                        },
                        elem = this[0],
                        doc = elem && elem.ownerDocument;
                    if (doc)
                        return docElem = doc.documentElement,
                            jQuery.contains(docElem, elem) ? (typeof elem.getBoundingClientRect !== strundefined && (box = elem.getBoundingClientRect()),
                                win = getWindow(doc), {
                                    top: box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0),
                                    left: box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0)
                                }) : box
                },
                position: function () {
                    if (this[0]) {
                        var offsetParent, offset, parentOffset = {
                                top: 0,
                                left: 0
                            },
                            elem = this[0];
                        return "fixed" === jQuery.css(elem, "position") ? offset = elem.getBoundingClientRect() : (offsetParent = this.offsetParent(),
                            offset = this.offset(),
                            jQuery.nodeName(offsetParent[0], "html") || (parentOffset = offsetParent.offset()),
                            parentOffset.top += jQuery.css(offsetParent[0], "borderTopWidth", !0),
                            parentOffset.left += jQuery.css(offsetParent[0], "borderLeftWidth", !0)), {
                            top: offset.top - parentOffset.top - jQuery.css(elem, "marginTop", !0),
                            left: offset.left - parentOffset.left - jQuery.css(elem, "marginLeft", !0)
                        }
                    }
                },
                offsetParent: function () {
                    return this.map(function () {
                        for (var offsetParent = this.offsetParent || docElem; offsetParent && !jQuery.nodeName(offsetParent, "html") && "static" === jQuery.css(offsetParent, "position");)
                            offsetParent = offsetParent.offsetParent;
                        return offsetParent || docElem
                    })
                }
            }),
            jQuery.each({
                scrollLeft: "pageXOffset",
                scrollTop: "pageYOffset"
            }, function (method, prop) {
                var top = /Y/.test(prop);
                jQuery.fn[method] = function (val) {
                    return access(this, function (elem, method, val) {
                        var win = getWindow(elem);
                        return void 0 === val ? win ? prop in win ? win[prop] : win.document.documentElement[method] : elem[method] : void(win ? win.scrollTo(top ? jQuery(win).scrollLeft() : val, top ? val : jQuery(win).scrollTop()) : elem[method] = val)
                    }, method, val, arguments.length, null)
                }
            }),
            jQuery.each(["top", "left"], function (i, prop) {
                jQuery.cssHooks[prop] = addGetHookIf(support.pixelPosition, function (elem, computed) {
                    return computed ? (computed = curCSS(elem, prop),
                        rnumnonpx.test(computed) ? jQuery(elem).position()[prop] + "px" : computed) : void 0
                })
            }),
            jQuery.each({
                Height: "height",
                Width: "width"
            }, function (name, type) {
                jQuery.each({
                    padding: "inner" + name,
                    content: type,
                    "": "outer" + name
                }, function (defaultExtra, funcName) {
                    jQuery.fn[funcName] = function (margin, value) {
                        var chainable = arguments.length && (defaultExtra || "boolean" != typeof margin),
                            extra = defaultExtra || (margin === !0 || value === !0 ? "margin" : "border");
                        return access(this, function (elem, type, value) {
                            var doc;
                            return jQuery.isWindow(elem) ? elem.document.documentElement["client" + name] : 9 === elem.nodeType ? (doc = elem.documentElement,
                                Math.max(elem.body["scroll" + name], doc["scroll" + name], elem.body["offset" + name], doc["offset" + name], doc["client" + name])) : void 0 === value ? jQuery.css(elem, type, extra) : jQuery.style(elem, type, value, extra)
                        }, type, chainable ? margin : void 0, chainable, null)
                    }
                })
            }),
            jQuery.fn.size = function () {
                return this.length
            },
            jQuery.fn.andSelf = jQuery.fn.addBack,
            "function" == typeof define && define.amd && define("jquery", [], function () {
                return jQuery
            });
        var _jQuery = window.jQuery,
            _$ = window.$;
        return jQuery.noConflict = function (deep) {
                return window.$ === jQuery && (window.$ = _$),
                    deep && window.jQuery === jQuery && (window.jQuery = _jQuery),
                    jQuery
            },
            typeof noGlobal === strundefined && (window.jQuery = window.$ = jQuery),
            jQuery
    }),
    ! function () {
        "use strict";

        function t(o) {
            if (!o)
                throw new Error("No options passed to Waypoint constructor");
            if (!o.element)
                throw new Error("No element option passed to Waypoint constructor");
            if (!o.handler)
                throw new Error("No handler option passed to Waypoint constructor");
            this.key = "waypoint-" + e,
                this.options = t.Adapter.extend({}, t.defaults, o),
                this.element = this.options.element,
                this.adapter = new t.Adapter(this.element),
                this.callback = o.handler,
                this.axis = this.options.horizontal ? "horizontal" : "vertical",
                this.enabled = this.options.enabled,
                this.triggerPoint = null,
                this.group = t.Group.findOrCreate({
                    name: this.options.group,
                    axis: this.axis
                }),
                this.context = t.Context.findOrCreateByElement(this.options.context),
                t.offsetAliases[this.options.offset] && (this.options.offset = t.offsetAliases[this.options.offset]),
                this.group.add(this),
                this.context.add(this),
                i[this.key] = this,
                e += 1
        }
        var e = 0,
            i = {};
        t.prototype.queueTrigger = function (t) {
                this.group.queueTrigger(this, t)
            },
            t.prototype.trigger = function (t) {
                this.enabled && this.callback && this.callback.apply(this, t)
            },
            t.prototype.destroy = function () {
                this.context.remove(this),
                    this.group.remove(this),
                    delete i[this.key]
            },
            t.prototype.disable = function () {
                return this.enabled = !1,
                    this
            },
            t.prototype.enable = function () {
                return this.context.refresh(),
                    this.enabled = !0,
                    this
            },
            t.prototype.next = function () {
                return this.group.next(this)
            },
            t.prototype.previous = function () {
                return this.group.previous(this)
            },
            t.invokeAll = function (t) {
                var e = [];
                for (var o in i)
                    e.push(i[o]);
                for (var n = 0, r = e.length; r > n; n++)
                    e[n][t]()
            },
            t.destroyAll = function () {
                t.invokeAll("destroy")
            },
            t.disableAll = function () {
                t.invokeAll("disable")
            },
            t.enableAll = function () {
                t.invokeAll("enable")
            },
            t.refreshAll = function () {
                t.Context.refreshAll()
            },
            t.viewportHeight = function () {
                return window.innerHeight || document.documentElement.clientHeight
            },
            t.viewportWidth = function () {
                return document.documentElement.clientWidth
            },
            t.adapters = [],
            t.defaults = {
                context: window,
                continuous: !0,
                enabled: !0,
                group: "default",
                horizontal: !1,
                offset: 0
            },
            t.offsetAliases = {
                "bottom-in-view": function () {
                    return this.context.innerHeight() - this.adapter.outerHeight()
                },
                "right-in-view": function () {
                    return this.context.innerWidth() - this.adapter.outerWidth()
                }
            },
            window.Waypoint = t
    }(),
    function () {
        "use strict";

        function t(t) {
            window.setTimeout(t, 1e3 / 60)
        }

        function e(t) {
            this.element = t,
                this.Adapter = n.Adapter,
                this.adapter = new this.Adapter(t),
                this.key = "waypoint-context-" + i,
                this.didScroll = !1,
                this.didResize = !1,
                this.oldScroll = {
                    x: this.adapter.scrollLeft(),
                    y: this.adapter.scrollTop()
                },
                this.waypoints = {
                    vertical: {},
                    horizontal: {}
                },
                t.waypointContextKey = this.key,
                o[t.waypointContextKey] = this,
                i += 1,
                this.createThrottledScrollHandler(),
                this.createThrottledResizeHandler()
        }
        var i = 0,
            o = {},
            n = window.Waypoint,
            r = window.onload;
        e.prototype.add = function (t) {
                var e = t.options.horizontal ? "horizontal" : "vertical";
                this.waypoints[e][t.key] = t,
                    this.refresh()
            },
            e.prototype.checkEmpty = function () {
                var t = this.Adapter.isEmptyObject(this.waypoints.horizontal),
                    e = this.Adapter.isEmptyObject(this.waypoints.vertical);
                t && e && (this.adapter.off(".waypoints"),
                    delete o[this.key])
            },
            e.prototype.createThrottledResizeHandler = function () {
                function t() {
                    e.handleResize(),
                        e.didResize = !1
                }
                var e = this;
                this.adapter.on("resize.waypoints", function () {
                    e.didResize || (e.didResize = !0,
                        n.requestAnimationFrame(t))
                })
            },
            e.prototype.createThrottledScrollHandler = function () {
                function t() {
                    e.handleScroll(),
                        e.didScroll = !1
                }
                var e = this;
                this.adapter.on("scroll.waypoints", function () {
                    (!e.didScroll || n.isTouch) && (e.didScroll = !0,
                        n.requestAnimationFrame(t))
                })
            },
            e.prototype.handleResize = function () {
                n.Context.refreshAll()
            },
            e.prototype.handleScroll = function () {
                var t = {},
                    e = {
                        horizontal: {
                            newScroll: this.adapter.scrollLeft(),
                            oldScroll: this.oldScroll.x,
                            forward: "right",
                            backward: "left"
                        },
                        vertical: {
                            newScroll: this.adapter.scrollTop(),
                            oldScroll: this.oldScroll.y,
                            forward: "down",
                            backward: "up"
                        }
                    };
                for (var i in e) {
                    var o = e[i],
                        n = o.newScroll > o.oldScroll,
                        r = n ? o.forward : o.backward;
                    for (var s in this.waypoints[i]) {
                        var a = this.waypoints[i][s],
                            l = o.oldScroll < a.triggerPoint,
                            h = o.newScroll >= a.triggerPoint,
                            p = l && h,
                            u = !l && !h;
                        (p || u) && (a.queueTrigger(r),
                            t[a.group.id] = a.group)
                    }
                }
                for (var c in t)
                    t[c].flushTriggers();
                this.oldScroll = {
                    x: e.horizontal.newScroll,
                    y: e.vertical.newScroll
                }
            },
            e.prototype.innerHeight = function () {
                return this.element == this.element.window ? n.viewportHeight() : this.adapter.innerHeight()
            },
            e.prototype.remove = function (t) {
                delete this.waypoints[t.axis][t.key],
                    this.checkEmpty()
            },
            e.prototype.innerWidth = function () {
                return this.element == this.element.window ? n.viewportWidth() : this.adapter.innerWidth()
            },
            e.prototype.destroy = function () {
                var t = [];
                for (var e in this.waypoints)
                    for (var i in this.waypoints[e])
                        t.push(this.waypoints[e][i]);
                for (var o = 0, n = t.length; n > o; o++)
                    t[o].destroy()
            },
            e.prototype.refresh = function () {
                var t, e = this.element == this.element.window,
                    i = e ? void 0 : this.adapter.offset(),
                    o = {};
                this.handleScroll(),
                    t = {
                        horizontal: {
                            contextOffset: e ? 0 : i.left,
                            contextScroll: e ? 0 : this.oldScroll.x,
                            contextDimension: this.innerWidth(),
                            oldScroll: this.oldScroll.x,
                            forward: "right",
                            backward: "left",
                            offsetProp: "left"
                        },
                        vertical: {
                            contextOffset: e ? 0 : i.top,
                            contextScroll: e ? 0 : this.oldScroll.y,
                            contextDimension: this.innerHeight(),
                            oldScroll: this.oldScroll.y,
                            forward: "down",
                            backward: "up",
                            offsetProp: "top"
                        }
                    };
                for (var r in t) {
                    var s = t[r];
                    for (var a in this.waypoints[r]) {
                        var l, h, p, u, c, d = this.waypoints[r][a],
                            f = d.options.offset,
                            w = d.triggerPoint,
                            y = 0,
                            g = null == w;
                        d.element !== d.element.window && (y = d.adapter.offset()[s.offsetProp]),
                            "function" == typeof f ? f = f.apply(d) : "string" == typeof f && (f = parseFloat(f),
                                d.options.offset.indexOf("%") > -1 && (f = Math.ceil(s.contextDimension * f / 100))),
                            l = s.contextScroll - s.contextOffset,
                            d.triggerPoint = y + l - f,
                            h = w < s.oldScroll,
                            p = d.triggerPoint >= s.oldScroll,
                            u = h && p,
                            c = !h && !p,
                            !g && u ? (d.queueTrigger(s.backward),
                                o[d.group.id] = d.group) : !g && c ? (d.queueTrigger(s.forward),
                                o[d.group.id] = d.group) : g && s.oldScroll >= d.triggerPoint && (d.queueTrigger(s.forward),
                                o[d.group.id] = d.group)
                    }
                }
                return n.requestAnimationFrame(function () {
                        for (var t in o)
                            o[t].flushTriggers()
                    }),
                    this
            },
            e.findOrCreateByElement = function (t) {
                return e.findByElement(t) || new e(t)
            },
            e.refreshAll = function () {
                for (var t in o)
                    o[t].refresh()
            },
            e.findByElement = function (t) {
                return o[t.waypointContextKey]
            },
            window.onload = function () {
                r && r(),
                    e.refreshAll()
            },
            n.requestAnimationFrame = function (e) {
                var i = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || t;
                i.call(window, e)
            },
            n.Context = e
    }(),
    function () {
        "use strict";

        function t(t, e) {
            return t.triggerPoint - e.triggerPoint
        }

        function e(t, e) {
            return e.triggerPoint - t.triggerPoint
        }

        function i(t) {
            this.name = t.name,
                this.axis = t.axis,
                this.id = this.name + "-" + this.axis,
                this.waypoints = [],
                this.clearTriggerQueues(),
                o[this.axis][this.name] = this
        }
        var o = {
                vertical: {},
                horizontal: {}
            },
            n = window.Waypoint;
        i.prototype.add = function (t) {
                this.waypoints.push(t)
            },
            i.prototype.clearTriggerQueues = function () {
                this.triggerQueues = {
                    up: [],
                    down: [],
                    left: [],
                    right: []
                }
            },
            i.prototype.flushTriggers = function () {
                for (var i in this.triggerQueues) {
                    var o = this.triggerQueues[i],
                        n = "up" === i || "left" === i;
                    o.sort(n ? e : t);
                    for (var r = 0, s = o.length; s > r; r += 1) {
                        var a = o[r];
                        (a.options.continuous || r === o.length - 1) && a.trigger([i])
                    }
                }
                this.clearTriggerQueues()
            },
            i.prototype.next = function (e) {
                this.waypoints.sort(t);
                var i = n.Adapter.inArray(e, this.waypoints),
                    o = i === this.waypoints.length - 1;
                return o ? null : this.waypoints[i + 1]
            },
            i.prototype.previous = function (e) {
                this.waypoints.sort(t);
                var i = n.Adapter.inArray(e, this.waypoints);
                return i ? this.waypoints[i - 1] : null
            },
            i.prototype.queueTrigger = function (t, e) {
                this.triggerQueues[e].push(t)
            },
            i.prototype.remove = function (t) {
                var e = n.Adapter.inArray(t, this.waypoints);
                e > -1 && this.waypoints.splice(e, 1)
            },
            i.prototype.first = function () {
                return this.waypoints[0]
            },
            i.prototype.last = function () {
                return this.waypoints[this.waypoints.length - 1]
            },
            i.findOrCreate = function (t) {
                return o[t.axis][t.name] || new i(t)
            },
            n.Group = i
    }(),
    function () {
        "use strict";

        function t(t) {
            this.$element = e(t)
        }
        var e = window.jQuery,
            i = window.Waypoint;
        e.each(["innerHeight", "innerWidth", "off", "offset", "on", "outerHeight", "outerWidth", "scrollLeft", "scrollTop"], function (e, i) {
                t.prototype[i] = function () {
                    var t = Array.prototype.slice.call(arguments);
                    return this.$element[i].apply(this.$element, t)
                }
            }),
            e.each(["extend", "inArray", "isEmptyObject"], function (i, o) {
                t[o] = e[o]
            }),
            i.adapters.push({
                name: "jquery",
                Adapter: t
            }),
            i.Adapter = t
    }(),
    function () {
        "use strict";

        function t(t) {
            return function () {
                var i = [],
                    o = arguments[0];
                return t.isFunction(arguments[0]) && (o = t.extend({}, arguments[1]),
                        o.handler = arguments[0]),
                    this.each(function () {
                        var n = t.extend({}, o, {
                            element: this
                        });
                        "string" == typeof n.context && (n.context = t(this).closest(n.context)[0]),
                            i.push(new e(n))
                    }),
                    i
            }
        }
        var e = window.Waypoint;
        window.jQuery && (window.jQuery.fn.waypoint = t(window.jQuery)),
            window.Zepto && (window.Zepto.fn.waypoint = t(window.Zepto))
    }(),
    function (root, factory) {
        "function" == typeof define && define.amd ? define(factory) : "object" == typeof exports ? module.exports = factory() : root.PhotoSwipeUI_Default = factory()
    }(this, function () {
        "use strict";
        var PhotoSwipeUI_Default = function (pswp, framework) {
            var _fullscrenAPI, _controls, _captionContainer, _fakeCaptionContainer, _indexIndicator, _shareButton, _shareModal, _initalCloseOnScrollValue, _isIdle, _listen, _loadingIndicator, _loadingIndicatorHidden, _loadingIndicatorTimeout, _galleryHasOneSlide, _options, _blockControlsTap, _blockControlsTapTimeout, _idleInterval, _idleTimer, ui = this,
                _overlayUIUpdated = !1,
                _controlsVisible = !0,
                _shareModalHidden = !0,
                _defaultUIOptions = {
                    barsSize: {
                        top: 44,
                        bottom: "auto"
                    },
                    closeElClasses: ["item", "caption", "zoom-wrap", "ui", "top-bar"],
                    timeToIdle: 4e3,
                    timeToIdleOutside: 1e3,
                    loadingIndicatorDelay: 1e3,
                    addCaptionHTMLFn: function (item, captionEl) {
                        return item.title ? (captionEl.children[0].innerHTML = item.title,
                            !0) : (captionEl.children[0].innerHTML = "",
                            !1)
                    },
                    closeEl: !0,
                    captionEl: !0,
                    fullscreenEl: !0,
                    zoomEl: !0,
                    shareEl: !0,
                    counterEl: !0,
                    arrowEl: !0,
                    preloaderEl: !0,
                    tapToClose: !1,
                    tapToToggleControls: !0,
                    clickToCloseNonZoomable: !0,
                    shareButtons: [{
                        id: "facebook",
                        label: "Share on Facebook",
                        url: "https://www.facebook.com/sharer/sharer.php?u={{url}}"
                    }, {
                        id: "twitter",
                        label: "Tweet",
                        url: "https://twitter.com/intent/tweet?text={{text}}&url={{url}}"
                    }, {
                        id: "pinterest",
                        label: "Pin it",
                        url: "http://www.pinterest.com/pin/create/button/?url={{url}}&media={{image_url}}&description={{text}}"
                    }, {
                        id: "download",
                        label: "Download image",
                        url: "{{raw_image_url}}",
                        download: !0
                    }],
                    getImageURLForShare: function () {
                        return pswp.currItem.src || ""
                    },
                    getPageURLForShare: function () {
                        return window.location.href
                    },
                    getTextForShare: function () {
                        return pswp.currItem.title || ""
                    },
                    indexIndicatorSep: " / "
                },
                _onControlsTap = function (e) {
                    if (_blockControlsTap)
                        return !0;
                    e = e || window.event,
                        _options.timeToIdle && _options.mouseUsed && !_isIdle && _onIdleMouseMove();
                    for (var uiElement, found, target = e.target || e.srcElement, clickedClass = target.className, i = 0; i < _uiElements.length; i++)
                        uiElement = _uiElements[i],
                        uiElement.onTap && clickedClass.indexOf("pswp__" + uiElement.name) > -1 && (uiElement.onTap(),
                            found = !0);
                    if (found) {
                        e.stopPropagation && e.stopPropagation(),
                            _blockControlsTap = !0;
                        var tapDelay = framework.features.isOldAndroid ? 600 : 30;
                        _blockControlsTapTimeout = setTimeout(function () {
                            _blockControlsTap = !1
                        }, tapDelay)
                    }
                },
                _fitControlsInViewport = function () {
                    return !pswp.likelyTouchDevice || _options.mouseUsed || screen.width > 1200
                },
                _togglePswpClass = function (el, cName, add) {
                    framework[(add ? "add" : "remove") + "Class"](el, "pswp__" + cName)
                },
                _countNumItems = function () {
                    var hasOneSlide = 1 === _options.getNumItemsFn();
                    hasOneSlide !== _galleryHasOneSlide && (_togglePswpClass(_controls, "ui--one-slide", hasOneSlide),
                        _galleryHasOneSlide = hasOneSlide)
                },
                _toggleShareModalClass = function () {
                    _togglePswpClass(_shareModal, "share-modal--hidden", _shareModalHidden)
                },
                _toggleShareModal = function () {
                    return _shareModalHidden = !_shareModalHidden,
                        _shareModalHidden ? (framework.removeClass(_shareModal, "pswp__share-modal--fade-in"),
                            setTimeout(function () {
                                _shareModalHidden && _toggleShareModalClass()
                            }, 300)) : (_toggleShareModalClass(),
                            setTimeout(function () {
                                _shareModalHidden || framework.addClass(_shareModal, "pswp__share-modal--fade-in")
                            }, 30)),
                        _shareModalHidden || _updateShareURLs(),
                        !1
                },
                _openWindowPopup = function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    return pswp.shout("shareLinkClick", e, target),
                        target.href ? target.hasAttribute("download") ? !0 : (window.open(target.href, "pswp_share", "scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,top=100,left=" + (window.screen ? Math.round(screen.width / 2 - 275) : 100)),
                            _shareModalHidden || _toggleShareModal(),
                            !1) : !1
                },
                _updateShareURLs = function () {
                    for (var shareButtonData, shareURL, image_url, page_url, share_text, shareButtonOut = "", i = 0; i < _options.shareButtons.length; i++)
                        shareButtonData = _options.shareButtons[i],
                        image_url = _options.getImageURLForShare(shareButtonData),
                        page_url = _options.getPageURLForShare(shareButtonData),
                        share_text = _options.getTextForShare(shareButtonData),
                        shareURL = shareButtonData.url.replace("{{url}}", encodeURIComponent(page_url)).replace("{{image_url}}", encodeURIComponent(image_url)).replace("{{raw_image_url}}", image_url).replace("{{text}}", encodeURIComponent(share_text)),
                        shareButtonOut += '<a href="' + shareURL + '" target="_blank" class="pswp__share--' + shareButtonData.id + '"' + (shareButtonData.download ? "download" : "") + ">" + shareButtonData.label + "</a>",
                        _options.parseShareButtonOut && (shareButtonOut = _options.parseShareButtonOut(shareButtonData, shareButtonOut));
                    _shareModal.children[0].innerHTML = shareButtonOut,
                        _shareModal.children[0].onclick = _openWindowPopup
                },
                _hasCloseClass = function (target) {
                    for (var i = 0; i < _options.closeElClasses.length; i++)
                        if (framework.hasClass(target, "pswp__" + _options.closeElClasses[i]))
                            return !0
                },
                _idleIncrement = 0,
                _onIdleMouseMove = function () {
                    clearTimeout(_idleTimer),
                        _idleIncrement = 0,
                        _isIdle && ui.setIdle(!1)
                },
                _onMouseLeaveWindow = function (e) {
                    e = e ? e : window.event;
                    var from = e.relatedTarget || e.toElement;
                    from && "HTML" !== from.nodeName || (clearTimeout(_idleTimer),
                        _idleTimer = setTimeout(function () {
                            ui.setIdle(!0)
                        }, _options.timeToIdleOutside))
                },
                _setupFullscreenAPI = function () {
                    _options.fullscreenEl && (_fullscrenAPI || (_fullscrenAPI = ui.getFullscreenAPI()),
                        _fullscrenAPI ? (framework.bind(document, _fullscrenAPI.eventK, ui.updateFullscreen),
                            ui.updateFullscreen(),
                            framework.addClass(pswp.template, "pswp--supports-fs")) : framework.removeClass(pswp.template, "pswp--supports-fs"))
                },
                _setupLoadingIndicator = function () {
                    _options.preloaderEl && (_toggleLoadingIndicator(!0),
                        _listen("beforeChange", function () {
                            clearTimeout(_loadingIndicatorTimeout),
                                _loadingIndicatorTimeout = setTimeout(function () {
                                    pswp.currItem && pswp.currItem.loading ? (!pswp.allowProgressiveImg() || pswp.currItem.img && !pswp.currItem.img.naturalWidth) && _toggleLoadingIndicator(!1) : _toggleLoadingIndicator(!0)
                                }, _options.loadingIndicatorDelay)
                        }),
                        _listen("imageLoadComplete", function (index, item) {
                            pswp.currItem === item && _toggleLoadingIndicator(!0)
                        }))
                },
                _toggleLoadingIndicator = function (hide) {
                    _loadingIndicatorHidden !== hide && (_togglePswpClass(_loadingIndicator, "preloader--active", !hide),
                        _loadingIndicatorHidden = hide)
                },
                _applyNavBarGaps = function (item) {
                    var gap = item.vGap;
                    if (_fitControlsInViewport()) {
                        var bars = _options.barsSize;
                        if (_options.captionEl && "auto" === bars.bottom)
                            if (_fakeCaptionContainer || (_fakeCaptionContainer = framework.createEl("pswp__caption pswp__caption--fake"),
                                    _fakeCaptionContainer.appendChild(framework.createEl("pswp__caption__center")),
                                    _controls.insertBefore(_fakeCaptionContainer, _captionContainer),
                                    framework.addClass(_controls, "pswp__ui--fit")),
                                _options.addCaptionHTMLFn(item, _fakeCaptionContainer, !0)) {
                                var captionSize = _fakeCaptionContainer.clientHeight;
                                gap.bottom = parseInt(captionSize, 10) || 44
                            } else
                                gap.bottom = bars.top;
                        else
                            gap.bottom = "auto" === bars.bottom ? 0 : bars.bottom;
                        gap.top = bars.top
                    } else
                        gap.top = gap.bottom = 0
                },
                _setupIdle = function () {
                    _options.timeToIdle && _listen("mouseUsed", function () {
                        framework.bind(document, "mousemove", _onIdleMouseMove),
                            framework.bind(document, "mouseout", _onMouseLeaveWindow),
                            _idleInterval = setInterval(function () {
                                _idleIncrement++,
                                2 === _idleIncrement && ui.setIdle(!0)
                            }, _options.timeToIdle / 2)
                    })
                },
                _setupHidingControlsDuringGestures = function () {
                    _listen("onVerticalDrag", function (now) {
                        _controlsVisible && .95 > now ? ui.hideControls() : !_controlsVisible && now >= .95 && ui.showControls()
                    });
                    var pinchControlsHidden;
                    _listen("onPinchClose", function (now) {
                            _controlsVisible && .9 > now ? (ui.hideControls(),
                                pinchControlsHidden = !0) : pinchControlsHidden && !_controlsVisible && now > .9 && ui.showControls()
                        }),
                        _listen("zoomGestureEnded", function () {
                            pinchControlsHidden = !1,
                                pinchControlsHidden && !_controlsVisible && ui.showControls()
                        })
                },
                _uiElements = [{
                    name: "caption",
                    option: "captionEl",
                    onInit: function (el) {
                        _captionContainer = el
                    }
                }, {
                    name: "share-modal",
                    option: "shareEl",
                    onInit: function (el) {
                        _shareModal = el
                    },
                    onTap: function () {
                        _toggleShareModal()
                    }
                }, {
                    name: "button--share",
                    option: "shareEl",
                    onInit: function (el) {
                        _shareButton = el
                    },
                    onTap: function () {
                        _toggleShareModal()
                    }
                }, {
                    name: "button--zoom",
                    option: "zoomEl",
                    onTap: pswp.toggleDesktopZoom
                }, {
                    name: "counter",
                    option: "counterEl",
                    onInit: function (el) {
                        _indexIndicator = el
                    }
                }, {
                    name: "button--close",
                    option: "closeEl",
                    onTap: pswp.close
                }, {
                    name: "button--arrow--left",
                    option: "arrowEl",
                    onTap: pswp.prev
                }, {
                    name: "button--arrow--right",
                    option: "arrowEl",
                    onTap: pswp.next
                }, {
                    name: "button--fs",
                    option: "fullscreenEl",
                    onTap: function () {
                        _fullscrenAPI.isFullscreen() ? _fullscrenAPI.exit() : _fullscrenAPI.enter()
                    }
                }, {
                    name: "preloader",
                    option: "preloaderEl",
                    onInit: function (el) {
                        _loadingIndicator = el
                    }
                }],
                _setupUIElements = function () {
                    var item, classAttr, uiElement, loopThroughChildElements = function (sChildren) {
                        if (sChildren)
                            for (var l = sChildren.length, i = 0; l > i; i++) {
                                item = sChildren[i],
                                    classAttr = item.className;
                                for (var a = 0; a < _uiElements.length; a++)
                                    uiElement = _uiElements[a],
                                    classAttr.indexOf("pswp__" + uiElement.name) > -1 && (_options[uiElement.option] ? (framework.removeClass(item, "pswp__element--disabled"),
                                        uiElement.onInit && uiElement.onInit(item)) : framework.addClass(item, "pswp__element--disabled"))
                            }
                    };
                    loopThroughChildElements(_controls.children);
                    var topBar = framework.getChildByClass(_controls, "pswp__top-bar");
                    topBar && loopThroughChildElements(topBar.children)
                };
            ui.init = function () {
                    framework.extend(pswp.options, _defaultUIOptions, !0),
                        _options = pswp.options,
                        _controls = framework.getChildByClass(pswp.scrollWrap, "pswp__ui"),
                        _listen = pswp.listen,
                        _setupHidingControlsDuringGestures(),
                        _listen("beforeChange", ui.update),
                        _listen("doubleTap", function (point) {
                            var initialZoomLevel = pswp.currItem.initialZoomLevel;
                            pswp.getZoomLevel() !== initialZoomLevel ? pswp.zoomTo(initialZoomLevel, point, 333) : pswp.zoomTo(_options.getDoubleTapZoom(!1, pswp.currItem), point, 333)
                        }),
                        _listen("preventDragEvent", function (e, isDown, preventObj) {
                            var t = e.target || e.srcElement;
                            t && t.className && e.type.indexOf("mouse") > -1 && (t.className.indexOf("__caption") > 0 || /(SMALL|STRONG|EM)/i.test(t.tagName)) && (preventObj.prevent = !1)
                        }),
                        _listen("bindEvents", function () {
                            framework.bind(_controls, "pswpTap click", _onControlsTap),
                                framework.bind(pswp.scrollWrap, "pswpTap", ui.onGlobalTap),
                                pswp.likelyTouchDevice || framework.bind(pswp.scrollWrap, "mouseover", ui.onMouseOver)
                        }),
                        _listen("unbindEvents", function () {
                            _shareModalHidden || _toggleShareModal(),
                                _idleInterval && clearInterval(_idleInterval),
                                framework.unbind(document, "mouseout", _onMouseLeaveWindow),
                                framework.unbind(document, "mousemove", _onIdleMouseMove),
                                framework.unbind(_controls, "pswpTap click", _onControlsTap),
                                framework.unbind(pswp.scrollWrap, "pswpTap", ui.onGlobalTap),
                                framework.unbind(pswp.scrollWrap, "mouseover", ui.onMouseOver),
                                _fullscrenAPI && (framework.unbind(document, _fullscrenAPI.eventK, ui.updateFullscreen),
                                    _fullscrenAPI.isFullscreen() && (_options.hideAnimationDuration = 0,
                                        _fullscrenAPI.exit()),
                                    _fullscrenAPI = null)
                        }),
                        _listen("destroy", function () {
                            _options.captionEl && (_fakeCaptionContainer && _controls.removeChild(_fakeCaptionContainer),
                                    framework.removeClass(_captionContainer, "pswp__caption--empty")),
                                _shareModal && (_shareModal.children[0].onclick = null),
                                framework.removeClass(_controls, "pswp__ui--over-close"),
                                framework.addClass(_controls, "pswp__ui--hidden"),
                                ui.setIdle(!1)
                        }),
                        _options.showAnimationDuration || framework.removeClass(_controls, "pswp__ui--hidden"),
                        _listen("initialZoomIn", function () {
                            _options.showAnimationDuration && framework.removeClass(_controls, "pswp__ui--hidden")
                        }),
                        _listen("initialZoomOut", function () {
                            framework.addClass(_controls, "pswp__ui--hidden")
                        }),
                        _listen("parseVerticalMargin", _applyNavBarGaps),
                        _setupUIElements(),
                        _options.shareEl && _shareButton && _shareModal && (_shareModalHidden = !0),
                        _countNumItems(),
                        _setupIdle(),
                        _setupFullscreenAPI(),
                        _setupLoadingIndicator()
                },
                ui.setIdle = function (isIdle) {
                    _isIdle = isIdle,
                        _togglePswpClass(_controls, "ui--idle", isIdle)
                },
                ui.update = function () {
                    _controlsVisible && pswp.currItem ? (ui.updateIndexIndicator(),
                            _options.captionEl && (_options.addCaptionHTMLFn(pswp.currItem, _captionContainer),
                                _togglePswpClass(_captionContainer, "caption--empty", !pswp.currItem.title)),
                            _overlayUIUpdated = !0) : _overlayUIUpdated = !1,
                        _shareModalHidden || _toggleShareModal(),
                        _countNumItems()
                },
                ui.updateFullscreen = function (e) {
                    e && setTimeout(function () {
                            pswp.setScrollOffset(0, framework.getScrollY())
                        }, 50),
                        framework[(_fullscrenAPI.isFullscreen() ? "add" : "remove") + "Class"](pswp.template, "pswp--fs")
                },
                ui.updateIndexIndicator = function () {
                    _options.counterEl && (_indexIndicator.innerHTML = pswp.getCurrentIndex() + 1 + _options.indexIndicatorSep + _options.getNumItemsFn())
                },
                ui.onGlobalTap = function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    if (!_blockControlsTap)
                        if (e.detail && "mouse" === e.detail.pointerType) {
                            if (_hasCloseClass(target))
                                return void pswp.close();
                            framework.hasClass(target, "pswp__img") && (1 === pswp.getZoomLevel() && pswp.getZoomLevel() <= pswp.currItem.fitRatio ? _options.clickToCloseNonZoomable && pswp.close() : pswp.toggleDesktopZoom(e.detail.releasePoint))
                        } else if (_options.tapToToggleControls && (_controlsVisible ? ui.hideControls() : ui.showControls()),
                        _options.tapToClose && (framework.hasClass(target, "pswp__img") || _hasCloseClass(target)))
                        return void pswp.close()
                },
                ui.onMouseOver = function (e) {
                    e = e || window.event;
                    var target = e.target || e.srcElement;
                    _togglePswpClass(_controls, "ui--over-close", _hasCloseClass(target))
                },
                ui.hideControls = function () {
                    framework.addClass(_controls, "pswp__ui--hidden"),
                        _controlsVisible = !1
                },
                ui.showControls = function () {
                    _controlsVisible = !0,
                        _overlayUIUpdated || ui.update(),
                        framework.removeClass(_controls, "pswp__ui--hidden")
                },
                ui.supportsFullscreen = function () {
                    var d = document;
                    return !!(d.exitFullscreen || d.mozCancelFullScreen || d.webkitExitFullscreen || d.msExitFullscreen)
                },
                ui.getFullscreenAPI = function () {
                    var api, dE = document.documentElement,
                        tF = "fullscreenchange";
                    return dE.requestFullscreen ? api = {
                            enterK: "requestFullscreen",
                            exitK: "exitFullscreen",
                            elementK: "fullscreenElement",
                            eventK: tF
                        } : dE.mozRequestFullScreen ? api = {
                            enterK: "mozRequestFullScreen",
                            exitK: "mozCancelFullScreen",
                            elementK: "mozFullScreenElement",
                            eventK: "moz" + tF
                        } : dE.webkitRequestFullscreen ? api = {
                            enterK: "webkitRequestFullscreen",
                            exitK: "webkitExitFullscreen",
                            elementK: "webkitFullscreenElement",
                            eventK: "webkit" + tF
                        } : dE.msRequestFullscreen && (api = {
                            enterK: "msRequestFullscreen",
                            exitK: "msExitFullscreen",
                            elementK: "msFullscreenElement",
                            eventK: "MSFullscreenChange"
                        }),
                        api && (api.enter = function () {
                                return _initalCloseOnScrollValue = _options.closeOnScroll,
                                    _options.closeOnScroll = !1,
                                    "webkitRequestFullscreen" !== this.enterK ? pswp.template[this.enterK]() : void pswp.template[this.enterK](Element.ALLOW_KEYBOARD_INPUT)
                            },
                            api.exit = function () {
                                return _options.closeOnScroll = _initalCloseOnScrollValue,
                                    document[this.exitK]()
                            },
                            api.isFullscreen = function () {
                                return document[this.elementK]
                            }
                        ),
                        api
                }
        };
        return PhotoSwipeUI_Default
    }),
    function (root, factory) {
        "function" == typeof define && define.amd ? define(factory) : "object" == typeof exports ? module.exports = factory() : root.PhotoSwipe = factory()
    }(this, function () {
        "use strict";
        var PhotoSwipe = function (template, UiClass, items, options) {
            var framework = {
                features: null,
                bind: function (target, type, listener, unbind) {
                    var methodName = (unbind ? "remove" : "add") + "EventListener";
                    type = type.split(" ");
                    for (var i = 0; i < type.length; i++)
                        type[i] && target[methodName](type[i], listener, !1)
                },
                isArray: function (obj) {
                    return obj instanceof Array
                },
                createEl: function (classes, tag) {
                    var el = document.createElement(tag || "div");
                    return classes && (el.className = classes),
                        el
                },
                getScrollY: function () {
                    var yOffset = window.pageYOffset;
                    return void 0 !== yOffset ? yOffset : document.documentElement.scrollTop
                },
                unbind: function (target, type, listener) {
                    framework.bind(target, type, listener, !0)
                },
                removeClass: function (el, className) {
                    var reg = new RegExp("(\\s|^)" + className + "(\\s|$)");
                    el.className = el.className.replace(reg, " ").replace(/^\s\s*/, "").replace(/\s\s*$/, "")
                },
                addClass: function (el, className) {
                    framework.hasClass(el, className) || (el.className += (el.className ? " " : "") + className)
                },
                hasClass: function (el, className) {
                    return el.className && new RegExp("(^|\\s)" + className + "(\\s|$)").test(el.className)
                },
                getChildByClass: function (parentEl, childClassName) {
                    for (var node = parentEl.firstChild; node;) {
                        if (framework.hasClass(node, childClassName))
                            return node;
                        node = node.nextSibling
                    }
                },
                arraySearch: function (array, value, key) {
                    for (var i = array.length; i--;)
                        if (array[i][key] === value)
                            return i;
                    return -1
                },
                extend: function (o1, o2, preventOverwrite) {
                    for (var prop in o2)
                        if (o2.hasOwnProperty(prop)) {
                            if (preventOverwrite && o1.hasOwnProperty(prop))
                                continue;
                            o1[prop] = o2[prop]
                        }
                },
                easing: {
                    sine: {
                        out: function (k) {
                            return Math.sin(k * (Math.PI / 2))
                        },
                        inOut: function (k) {
                            return -(Math.cos(Math.PI * k) - 1) / 2
                        }
                    },
                    cubic: {
                        out: function (k) {
                            return --k * k * k + 1
                        }
                    }
                },
                detectFeatures: function () {
                    if (framework.features)
                        return framework.features;
                    var helperEl = framework.createEl(),
                        helperStyle = helperEl.style,
                        vendor = "",
                        features = {};
                    if (features.oldIE = document.all && !document.addEventListener,
                        features.touch = "ontouchstart" in window,
                        window.requestAnimationFrame && (features.raf = window.requestAnimationFrame,
                            features.caf = window.cancelAnimationFrame),
                        features.pointerEvent = navigator.pointerEnabled || navigator.msPointerEnabled,
                        !features.pointerEvent) {
                        var ua = navigator.userAgent;
                        if (/iP(hone|od)/.test(navigator.platform)) {
                            var v = navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
                            v && v.length > 0 && (v = parseInt(v[1], 10),
                                v >= 1 && 8 > v && (features.isOldIOSPhone = !0))
                        }
                        var match = ua.match(/Android\s([0-9\.]*)/),
                            androidversion = match ? match[1] : 0;
                        androidversion = parseFloat(androidversion),
                            androidversion >= 1 && (4.4 > androidversion && (features.isOldAndroid = !0),
                                features.androidVersion = androidversion),
                            features.isMobileOpera = /opera mini|opera mobi/i.test(ua)
                    }
                    for (var styleCheckItem, styleName, styleChecks = ["transform", "perspective", "animationName"], vendors = ["", "webkit", "Moz", "ms", "O"], i = 0; 4 > i; i++) {
                        vendor = vendors[i];
                        for (var a = 0; 3 > a; a++)
                            styleCheckItem = styleChecks[a],
                            styleName = vendor + (vendor ? styleCheckItem.charAt(0).toUpperCase() + styleCheckItem.slice(1) : styleCheckItem),
                            !features[styleCheckItem] && styleName in helperStyle && (features[styleCheckItem] = styleName);
                        vendor && !features.raf && (vendor = vendor.toLowerCase(),
                            features.raf = window[vendor + "RequestAnimationFrame"],
                            features.raf && (features.caf = window[vendor + "CancelAnimationFrame"] || window[vendor + "CancelRequestAnimationFrame"]))
                    }
                    if (!features.raf) {
                        var lastTime = 0;
                        features.raf = function (fn) {
                                var currTime = (new Date).getTime(),
                                    timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                                    id = window.setTimeout(function () {
                                        fn(currTime + timeToCall)
                                    }, timeToCall);
                                return lastTime = currTime + timeToCall,
                                    id
                            },
                            features.caf = function (id) {
                                clearTimeout(id)
                            }
                    }
                    return features.svg = !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect,
                        framework.features = features,
                        features
                }
            };
            framework.detectFeatures(),
                framework.features.oldIE && (framework.bind = function (target, type, listener, unbind) {
                    type = type.split(" ");
                    for (var evName, methodName = (unbind ? "detach" : "attach") + "Event", _handleEv = function () {
                            listener.handleEvent.call(listener)
                        }, i = 0; i < type.length; i++)
                        if (evName = type[i])
                            if ("object" == typeof listener && listener.handleEvent) {
                                if (unbind) {
                                    if (!listener["oldIE" + evName])
                                        return !1
                                } else
                                    listener["oldIE" + evName] = _handleEv;
                                target[methodName]("on" + evName, listener["oldIE" + evName])
                            } else
                                target[methodName]("on" + evName, listener)
                });
            var self = this,
                DOUBLE_TAP_RADIUS = 25,
                NUM_HOLDERS = 3,
                _options = {
                    allowPanToNext: !0,
                    spacing: .12,
                    bgOpacity: 1,
                    mouseUsed: !1,
                    loop: !0,
                    pinchToClose: !0,
                    closeOnScroll: !0,
                    closeOnVerticalDrag: !0,
                    verticalDragRange: .6,
                    hideAnimationDuration: 333,
                    showAnimationDuration: 333,
                    showHideOpacity: !1,
                    focus: !0,
                    escKey: !0,
                    arrowKeys: !0,
                    mainScrollEndFriction: .35,
                    panEndFriction: .35,
                    isClickableElement: function (el) {
                        return "A" === el.tagName
                    },
                    getDoubleTapZoom: function (isMouseClick, item) {
                        return isMouseClick ? 1 : item.initialZoomLevel < .7 ? 1 : 1.5
                    },
                    maxSpreadZoom: 2,
                    modal: !0,
                    scaleMode: "fit",
                    alwaysFadeIn: !1
                };
            framework.extend(_options, options);
            var _isOpen, _isDestroying, _closedByScroll, _currentItemIndex, _containerStyle, _containerShiftIndex, _upMoveEvents, _downEvents, _globalEventHandlers, _currZoomLevel, _startZoomLevel, _translatePrefix, _translateSufix, _updateSizeInterval, _itemsNeedUpdate, _itemHolders, _prevItemIndex, _dragStartEvent, _dragMoveEvent, _dragEndEvent, _dragCancelEvent, _transformKey, _pointerEventEnabled, _likelyTouchDevice, _requestAF, _cancelAF, _initalClassName, _initalWindowScrollY, _oldIE, _currentWindowScrollY, _features, _gestureStartTime, _gestureCheckSpeedTime, _releaseAnimData, _isZoomingIn, _verticalDragInitiated, _oldAndroidTouchEndTimeout, _isDragging, _isMultitouch, _zoomStarted, _moved, _dragAnimFrame, _mainScrollShifted, _currentPoints, _isZooming, _currPointsDistance, _startPointsDistance, _currPanBounds, _currZoomElementStyle, _mainScrollAnimating, _direction, _isFirstMove, _opacityChanged, _bgOpacity, _wasOverInitialZoom, _tempCounter, _getEmptyPoint = function () {
                    return {
                        x: 0,
                        y: 0
                    }
                },
                _currPanDist = _getEmptyPoint(),
                _startPanOffset = _getEmptyPoint(),
                _panOffset = _getEmptyPoint(),
                _viewportSize = {},
                _currPositionIndex = 0,
                _offset = {},
                _slideSize = _getEmptyPoint(),
                _indexDiff = 0,
                _isFixedPosition = !0,
                _modules = [],
                _windowVisibleSize = {},
                _registerModule = function (name, module) {
                    framework.extend(self, module.publicMethods),
                        _modules.push(name)
                },
                _getLoopedId = function (index) {
                    var numSlides = _getNumItems();
                    return index > numSlides - 1 ? index - numSlides : 0 > index ? numSlides + index : index
                },
                _listeners = {},
                _listen = function (name, fn) {
                    return _listeners[name] || (_listeners[name] = []),
                        _listeners[name].push(fn)
                },
                _shout = function (name) {
                    var listeners = _listeners[name];
                    if (listeners) {
                        var args = Array.prototype.slice.call(arguments);
                        args.shift();
                        for (var i = 0; i < listeners.length; i++)
                            listeners[i].apply(self, args)
                    }
                },
                _getCurrentTime = function () {
                    return (new Date).getTime()
                },
                _applyBgOpacity = function (opacity) {
                    _bgOpacity = opacity,
                        self.bg.style.opacity = opacity * _options.bgOpacity
                },
                _applyZoomTransform = function (styleObj, x, y, zoom) {
                    styleObj[_transformKey] = _translatePrefix + x + "px, " + y + "px" + _translateSufix + " scale(" + zoom + ")"
                },
                _applyCurrentZoomPan = function () {
                    _currZoomElementStyle && _applyZoomTransform(_currZoomElementStyle, _panOffset.x, _panOffset.y, _currZoomLevel)
                },
                _applyZoomPanToItem = function (item) {
                    item.container && _applyZoomTransform(item.container.style, item.initialPosition.x, item.initialPosition.y, item.initialZoomLevel)
                },
                _setTranslateX = function (x, elStyle) {
                    elStyle[_transformKey] = _translatePrefix + x + "px, 0px" + _translateSufix
                },
                _moveMainScroll = function (x, dragging) {
                    if (!_options.loop && dragging) {
                        var newSlideIndexOffset = _currentItemIndex + (_slideSize.x * _currPositionIndex - x) / _slideSize.x,
                            delta = Math.round(x - _mainScrollPos.x);
                        (0 > newSlideIndexOffset && delta > 0 || newSlideIndexOffset >= _getNumItems() - 1 && 0 > delta) && (x = _mainScrollPos.x + delta * _options.mainScrollEndFriction)
                    }
                    _mainScrollPos.x = x,
                        _setTranslateX(x, _containerStyle)
                },
                _calculatePanOffset = function (axis, zoomLevel) {
                    var m = _midZoomPoint[axis] - _offset[axis];
                    return _startPanOffset[axis] + _currPanDist[axis] + m - m * (zoomLevel / _startZoomLevel)
                },
                _equalizePoints = function (p1, p2) {
                    p1.x = p2.x,
                        p1.y = p2.y,
                        p2.id && (p1.id = p2.id)
                },
                _roundPoint = function (p) {
                    p.x = Math.round(p.x),
                        p.y = Math.round(p.y)
                },
                _mouseMoveTimeout = null,
                _onFirstMouseMove = function () {
                    _mouseMoveTimeout && (framework.unbind(document, "mousemove", _onFirstMouseMove),
                            framework.addClass(template, "pswp--has_mouse"),
                            _options.mouseUsed = !0,
                            _shout("mouseUsed")),
                        _mouseMoveTimeout = setTimeout(function () {
                            _mouseMoveTimeout = null
                        }, 100)
                },
                _bindEvents = function () {
                    framework.bind(document, "keydown", self),
                        _features.transform && framework.bind(self.scrollWrap, "click", self),
                        _options.mouseUsed || framework.bind(document, "mousemove", _onFirstMouseMove),
                        framework.bind(window, "resize scroll", self),
                        _shout("bindEvents")
                },
                _unbindEvents = function () {
                    framework.unbind(window, "resize", self),
                        framework.unbind(window, "scroll", _globalEventHandlers.scroll),
                        framework.unbind(document, "keydown", self),
                        framework.unbind(document, "mousemove", _onFirstMouseMove),
                        _features.transform && framework.unbind(self.scrollWrap, "click", self),
                        _isDragging && framework.unbind(window, _upMoveEvents, self),
                        _shout("unbindEvents")
                },
                _calculatePanBounds = function (zoomLevel, update) {
                    var bounds = _calculateItemSize(self.currItem, _viewportSize, zoomLevel);
                    return update && (_currPanBounds = bounds),
                        bounds
                },
                _getMinZoomLevel = function (item) {
                    return item || (item = self.currItem),
                        item.initialZoomLevel
                },
                _getMaxZoomLevel = function (item) {
                    return item || (item = self.currItem),
                        item.w > 0 ? _options.maxSpreadZoom : 1
                },
                _modifyDestPanOffset = function (axis, destPanBounds, destPanOffset, destZoomLevel) {
                    return destZoomLevel === self.currItem.initialZoomLevel ? (destPanOffset[axis] = self.currItem.initialPosition[axis],
                        !0) : (destPanOffset[axis] = _calculatePanOffset(axis, destZoomLevel),
                        destPanOffset[axis] > destPanBounds.min[axis] ? (destPanOffset[axis] = destPanBounds.min[axis],
                            !0) : destPanOffset[axis] < destPanBounds.max[axis] ? (destPanOffset[axis] = destPanBounds.max[axis],
                            !0) : !1)
                },
                _setupTransforms = function () {
                    if (_transformKey) {
                        var allow3dTransform = _features.perspective && !_likelyTouchDevice;
                        return _translatePrefix = "translate" + (allow3dTransform ? "3d(" : "("),
                            void(_translateSufix = _features.perspective ? ", 0px)" : ")")
                    }
                    _transformKey = "left",
                        framework.addClass(template, "pswp--ie"),
                        _setTranslateX = function (x, elStyle) {
                            elStyle.left = x + "px"
                        },
                        _applyZoomPanToItem = function (item) {
                            var zoomRatio = item.fitRatio > 1 ? 1 : item.fitRatio,
                                s = item.container.style,
                                w = zoomRatio * item.w,
                                h = zoomRatio * item.h;
                            s.width = w + "px",
                                s.height = h + "px",
                                s.left = item.initialPosition.x + "px",
                                s.top = item.initialPosition.y + "px"
                        },
                        _applyCurrentZoomPan = function () {
                            if (_currZoomElementStyle) {
                                var s = _currZoomElementStyle,
                                    item = self.currItem,
                                    zoomRatio = item.fitRatio > 1 ? 1 : item.fitRatio,
                                    w = zoomRatio * item.w,
                                    h = zoomRatio * item.h;
                                s.width = w + "px",
                                    s.height = h + "px",
                                    s.left = _panOffset.x + "px",
                                    s.top = _panOffset.y + "px"
                            }
                        }
                },
                _onKeyDown = function (e) {
                    var keydownAction = "";
                    _options.escKey && 27 === e.keyCode ? keydownAction = "close" : _options.arrowKeys && (37 === e.keyCode ? keydownAction = "prev" : 39 === e.keyCode && (keydownAction = "next")),
                        keydownAction && (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey || (e.preventDefault ? e.preventDefault() : e.returnValue = !1,
                            self[keydownAction]()))
                },
                _onGlobalClick = function (e) {
                    e && (_moved || _zoomStarted || _mainScrollAnimating || _verticalDragInitiated) && (e.preventDefault(),
                        e.stopPropagation())
                },
                _updatePageScrollOffset = function () {
                    self.setScrollOffset(0, framework.getScrollY())
                },
                _animations = {},
                _numAnimations = 0,
                _stopAnimation = function (name) {
                    _animations[name] && (_animations[name].raf && _cancelAF(_animations[name].raf),
                        _numAnimations--,
                        delete _animations[name])
                },
                _registerStartAnimation = function (name) {
                    _animations[name] && _stopAnimation(name),
                        _animations[name] || (_numAnimations++,
                            _animations[name] = {})
                },
                _stopAllAnimations = function () {
                    for (var prop in _animations)
                        _animations.hasOwnProperty(prop) && _stopAnimation(prop)
                },
                _animateProp = function (name, b, endProp, d, easingFn, onUpdate, onComplete) {
                    var t, startAnimTime = _getCurrentTime();
                    _registerStartAnimation(name);
                    var animloop = function () {
                        if (_animations[name]) {
                            if (t = _getCurrentTime() - startAnimTime,
                                t >= d)
                                return _stopAnimation(name),
                                    onUpdate(endProp),
                                    void(onComplete && onComplete());
                            onUpdate((endProp - b) * easingFn(t / d) + b),
                                _animations[name].raf = _requestAF(animloop)
                        }
                    };
                    animloop()
                },
                publicMethods = {
                    shout: _shout,
                    listen: _listen,
                    viewportSize: _viewportSize,
                    options: _options,
                    isMainScrollAnimating: function () {
                        return _mainScrollAnimating
                    },
                    getZoomLevel: function () {
                        return _currZoomLevel
                    },
                    getCurrentIndex: function () {
                        return _currentItemIndex
                    },
                    isDragging: function () {
                        return _isDragging
                    },
                    isZooming: function () {
                        return _isZooming
                    },
                    setScrollOffset: function (x, y) {
                        _offset.x = x,
                            _currentWindowScrollY = _offset.y = y,
                            _shout("updateScrollOffset", _offset)
                    },
                    applyZoomPan: function (zoomLevel, panX, panY) {
                        _panOffset.x = panX,
                            _panOffset.y = panY,
                            _currZoomLevel = zoomLevel,
                            _applyCurrentZoomPan()
                    },
                    init: function () {
                        if (!_isOpen && !_isDestroying) {
                            var i;
                            self.framework = framework,
                                self.template = template,
                                self.bg = framework.getChildByClass(template, "pswp__bg"),
                                _initalClassName = template.className,
                                _isOpen = !0,
                                _features = framework.detectFeatures(),
                                _requestAF = _features.raf,
                                _cancelAF = _features.caf,
                                _transformKey = _features.transform,
                                _oldIE = _features.oldIE,
                                self.scrollWrap = framework.getChildByClass(template, "pswp__scroll-wrap"),
                                self.container = framework.getChildByClass(self.scrollWrap, "pswp__container"),
                                _containerStyle = self.container.style,
                                self.itemHolders = _itemHolders = [{
                                    el: self.container.children[0],
                                    wrap: 0,
                                    index: -1
                                }, {
                                    el: self.container.children[1],
                                    wrap: 0,
                                    index: -1
                                }, {
                                    el: self.container.children[2],
                                    wrap: 0,
                                    index: -1
                                }],
                                _itemHolders[0].el.style.display = _itemHolders[2].el.style.display = "none",
                                _setupTransforms(),
                                _globalEventHandlers = {
                                    resize: self.updateSize,
                                    scroll: _updatePageScrollOffset,
                                    keydown: _onKeyDown,
                                    click: _onGlobalClick
                                };
                            var oldPhone = _features.isOldIOSPhone || _features.isOldAndroid || _features.isMobileOpera;
                            for (_features.animationName && _features.transform && !oldPhone || (_options.showAnimationDuration = _options.hideAnimationDuration = 0),
                                i = 0; i < _modules.length; i++)
                                self["init" + _modules[i]]();
                            if (UiClass) {
                                var ui = self.ui = new UiClass(self, framework);
                                ui.init()
                            }
                            _shout("firstUpdate"),
                                _currentItemIndex = _currentItemIndex || _options.index || 0,
                                (isNaN(_currentItemIndex) || 0 > _currentItemIndex || _currentItemIndex >= _getNumItems()) && (_currentItemIndex = 0),
                                self.currItem = _getItemAt(_currentItemIndex),
                                (_features.isOldIOSPhone || _features.isOldAndroid) && (_isFixedPosition = !1),
                                template.setAttribute("aria-hidden", "false"),
                                _options.modal && (_isFixedPosition ? template.style.position = "fixed" : (template.style.position = "absolute",
                                    template.style.top = framework.getScrollY() + "px")),
                                void 0 === _currentWindowScrollY && (_shout("initialLayout"),
                                    _currentWindowScrollY = _initalWindowScrollY = framework.getScrollY());
                            var rootClasses = "pswp--open ";
                            for (_options.mainClass && (rootClasses += _options.mainClass + " "),
                                _options.showHideOpacity && (rootClasses += "pswp--animate_opacity "),
                                rootClasses += _likelyTouchDevice ? "pswp--touch" : "pswp--notouch",
                                rootClasses += _features.animationName ? " pswp--css_animation" : "",
                                rootClasses += _features.svg ? " pswp--svg" : "",
                                framework.addClass(template, rootClasses),
                                self.updateSize(),
                                _containerShiftIndex = -1,
                                _indexDiff = null,
                                i = 0; NUM_HOLDERS > i; i++)
                                _setTranslateX((i + _containerShiftIndex) * _slideSize.x, _itemHolders[i].el.style);
                            _oldIE || framework.bind(self.scrollWrap, _downEvents, self),
                                _listen("initialZoomInEnd", function () {
                                    self.setContent(_itemHolders[0], _currentItemIndex - 1),
                                        self.setContent(_itemHolders[2], _currentItemIndex + 1),
                                        _itemHolders[0].el.style.display = _itemHolders[2].el.style.display = "block",
                                        _options.focus && template.focus(),
                                        _bindEvents()
                                }),
                                self.setContent(_itemHolders[1], _currentItemIndex),
                                self.updateCurrItem(),
                                _shout("afterInit"),
                                _isFixedPosition || (_updateSizeInterval = setInterval(function () {
                                    _numAnimations || _isDragging || _isZooming || _currZoomLevel !== self.currItem.initialZoomLevel || self.updateSize()
                                }, 1e3)),
                                framework.addClass(template, "pswp--visible")
                        }
                    },
                    close: function () {
                        _isOpen && (_isOpen = !1,
                            _isDestroying = !0,
                            _shout("close"),
                            _unbindEvents(),
                            _showOrHide(self.currItem, null, !0, self.destroy))
                    },
                    destroy: function () {
                        _shout("destroy"),
                            _showOrHideTimeout && clearTimeout(_showOrHideTimeout),
                            template.setAttribute("aria-hidden", "true"),
                            template.className = _initalClassName,
                            _updateSizeInterval && clearInterval(_updateSizeInterval),
                            framework.unbind(self.scrollWrap, _downEvents, self),
                            framework.unbind(window, "scroll", self),
                            _stopDragUpdateLoop(),
                            _stopAllAnimations(),
                            _listeners = null
                    },
                    panTo: function (x, y, force) {
                        force || (x > _currPanBounds.min.x ? x = _currPanBounds.min.x : x < _currPanBounds.max.x && (x = _currPanBounds.max.x),
                                y > _currPanBounds.min.y ? y = _currPanBounds.min.y : y < _currPanBounds.max.y && (y = _currPanBounds.max.y)),
                            _panOffset.x = x,
                            _panOffset.y = y,
                            _applyCurrentZoomPan()
                    },
                    handleEvent: function (e) {
                        e = e || window.event,
                            _globalEventHandlers[e.type] && _globalEventHandlers[e.type](e)
                    },
                    goTo: function (index) {
                        index = _getLoopedId(index);
                        var diff = index - _currentItemIndex;
                        _indexDiff = diff,
                            _currentItemIndex = index,
                            self.currItem = _getItemAt(_currentItemIndex),
                            _currPositionIndex -= diff,
                            _moveMainScroll(_slideSize.x * _currPositionIndex),
                            _stopAllAnimations(),
                            _mainScrollAnimating = !1,
                            self.updateCurrItem()
                    },
                    next: function () {
                        self.goTo(_currentItemIndex + 1)
                    },
                    prev: function () {
                        self.goTo(_currentItemIndex - 1)
                    },
                    updateCurrZoomItem: function (emulateSetContent) {
                        if (emulateSetContent && _shout("beforeChange", 0),
                            _itemHolders[1].el.children.length) {
                            var zoomElement = _itemHolders[1].el.children[0];
                            _currZoomElementStyle = framework.hasClass(zoomElement, "pswp__zoom-wrap") ? zoomElement.style : null
                        } else
                            _currZoomElementStyle = null;
                        _currPanBounds = self.currItem.bounds,
                            _startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel,
                            _panOffset.x = _currPanBounds.center.x,
                            _panOffset.y = _currPanBounds.center.y,
                            emulateSetContent && _shout("afterChange")
                    },
                    invalidateCurrItems: function () {
                        _itemsNeedUpdate = !0;
                        for (var i = 0; NUM_HOLDERS > i; i++)
                            _itemHolders[i].item && (_itemHolders[i].item.needsUpdate = !0)
                    },
                    updateCurrItem: function (beforeAnimation) {
                        if (0 !== _indexDiff) {
                            var tempHolder, diffAbs = Math.abs(_indexDiff);
                            if (!(beforeAnimation && 2 > diffAbs)) {
                                self.currItem = _getItemAt(_currentItemIndex),
                                    _shout("beforeChange", _indexDiff),
                                    diffAbs >= NUM_HOLDERS && (_containerShiftIndex += _indexDiff + (_indexDiff > 0 ? -NUM_HOLDERS : NUM_HOLDERS),
                                        diffAbs = NUM_HOLDERS);
                                for (var i = 0; diffAbs > i; i++)
                                    _indexDiff > 0 ? (tempHolder = _itemHolders.shift(),
                                        _itemHolders[NUM_HOLDERS - 1] = tempHolder,
                                        _containerShiftIndex++,
                                        _setTranslateX((_containerShiftIndex + 2) * _slideSize.x, tempHolder.el.style),
                                        self.setContent(tempHolder, _currentItemIndex - diffAbs + i + 1 + 1)) : (tempHolder = _itemHolders.pop(),
                                        _itemHolders.unshift(tempHolder),
                                        _containerShiftIndex--,
                                        _setTranslateX(_containerShiftIndex * _slideSize.x, tempHolder.el.style),
                                        self.setContent(tempHolder, _currentItemIndex + diffAbs - i - 1 - 1));
                                if (_currZoomElementStyle && 1 === Math.abs(_indexDiff)) {
                                    var prevItem = _getItemAt(_prevItemIndex);
                                    prevItem.initialZoomLevel !== _currZoomLevel && (_calculateItemSize(prevItem, _viewportSize),
                                        _applyZoomPanToItem(prevItem))
                                }
                                _indexDiff = 0,
                                    self.updateCurrZoomItem(),
                                    _prevItemIndex = _currentItemIndex,
                                    _shout("afterChange")
                            }
                        }
                    },
                    updateSize: function (force) {
                        if (!_isFixedPosition && _options.modal) {
                            var windowScrollY = framework.getScrollY();
                            if (_currentWindowScrollY !== windowScrollY && (template.style.top = windowScrollY + "px",
                                    _currentWindowScrollY = windowScrollY),
                                !force && _windowVisibleSize.x === window.innerWidth && _windowVisibleSize.y === window.innerHeight)
                                return;
                            _windowVisibleSize.x = window.innerWidth,
                                _windowVisibleSize.y = window.innerHeight,
                                template.style.height = _windowVisibleSize.y + "px"
                        }
                        if (_viewportSize.x = self.scrollWrap.clientWidth,
                            _viewportSize.y = self.scrollWrap.clientHeight,
                            _updatePageScrollOffset(),
                            _slideSize.x = _viewportSize.x + Math.round(_viewportSize.x * _options.spacing),
                            _slideSize.y = _viewportSize.y,
                            _moveMainScroll(_slideSize.x * _currPositionIndex),
                            _shout("beforeResize"),
                            void 0 !== _containerShiftIndex) {
                            for (var holder, item, hIndex, i = 0; NUM_HOLDERS > i; i++)
                                holder = _itemHolders[i],
                                _setTranslateX((i + _containerShiftIndex) * _slideSize.x, holder.el.style),
                                hIndex = _currentItemIndex + i - 1,
                                _options.loop && _getNumItems() > 2 && (hIndex = _getLoopedId(hIndex)),
                                item = _getItemAt(hIndex),
                                item && (_itemsNeedUpdate || item.needsUpdate || !item.bounds) ? (self.cleanSlide(item),
                                    self.setContent(holder, hIndex),
                                    1 === i && (self.currItem = item,
                                        self.updateCurrZoomItem(!0)),
                                    item.needsUpdate = !1) : -1 === holder.index && hIndex >= 0 && self.setContent(holder, hIndex),
                                item && item.container && (_calculateItemSize(item, _viewportSize),
                                    _applyZoomPanToItem(item));
                            _itemsNeedUpdate = !1
                        }
                        _startZoomLevel = _currZoomLevel = self.currItem.initialZoomLevel,
                            _currPanBounds = self.currItem.bounds,
                            _currPanBounds && (_panOffset.x = _currPanBounds.center.x,
                                _panOffset.y = _currPanBounds.center.y,
                                _applyCurrentZoomPan()),
                            _shout("resize")
                    },
                    zoomTo: function (destZoomLevel, centerPoint, speed, easingFn, updateFn) {
                        centerPoint && (_startZoomLevel = _currZoomLevel,
                            _midZoomPoint.x = Math.abs(centerPoint.x) - _panOffset.x,
                            _midZoomPoint.y = Math.abs(centerPoint.y) - _panOffset.y,
                            _equalizePoints(_startPanOffset, _panOffset));
                        var destPanBounds = _calculatePanBounds(destZoomLevel, !1),
                            destPanOffset = {};
                        _modifyDestPanOffset("x", destPanBounds, destPanOffset, destZoomLevel),
                            _modifyDestPanOffset("y", destPanBounds, destPanOffset, destZoomLevel);
                        var initialZoomLevel = _currZoomLevel,
                            initialPanOffset = {
                                x: _panOffset.x,
                                y: _panOffset.y
                            };
                        _roundPoint(destPanOffset);
                        var onUpdate = function (now) {
                            1 === now ? (_currZoomLevel = destZoomLevel,
                                    _panOffset.x = destPanOffset.x,
                                    _panOffset.y = destPanOffset.y) : (_currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel,
                                    _panOffset.x = (destPanOffset.x - initialPanOffset.x) * now + initialPanOffset.x,
                                    _panOffset.y = (destPanOffset.y - initialPanOffset.y) * now + initialPanOffset.y),
                                updateFn && updateFn(now),
                                _applyCurrentZoomPan()
                        };
                        speed ? _animateProp("customZoomTo", 0, 1, speed, easingFn || framework.easing.sine.inOut, onUpdate) : onUpdate(1)
                    }
                },
                MIN_SWIPE_DISTANCE = 30,
                DIRECTION_CHECK_OFFSET = 10,
                p = {},
                p2 = {},
                delta = {},
                _currPoint = {},
                _startPoint = {},
                _currPointers = [],
                _startMainScrollPos = {},
                _posPoints = [],
                _tempPoint = {},
                _currZoomedItemIndex = 0,
                _centerPoint = _getEmptyPoint(),
                _lastReleaseTime = 0,
                _mainScrollPos = _getEmptyPoint(),
                _midZoomPoint = _getEmptyPoint(),
                _currCenterPoint = _getEmptyPoint(),
                _isEqualPoints = function (p1, p2) {
                    return p1.x === p2.x && p1.y === p2.y
                },
                _isNearbyPoints = function (touch0, touch1) {
                    return Math.abs(touch0.x - touch1.x) < DOUBLE_TAP_RADIUS && Math.abs(touch0.y - touch1.y) < DOUBLE_TAP_RADIUS
                },
                _calculatePointsDistance = function (p1, p2) {
                    return _tempPoint.x = Math.abs(p1.x - p2.x),
                        _tempPoint.y = Math.abs(p1.y - p2.y),
                        Math.sqrt(_tempPoint.x * _tempPoint.x + _tempPoint.y * _tempPoint.y)
                },
                _stopDragUpdateLoop = function () {
                    _dragAnimFrame && (_cancelAF(_dragAnimFrame),
                        _dragAnimFrame = null)
                },
                _dragUpdateLoop = function () {
                    _isDragging && (_dragAnimFrame = _requestAF(_dragUpdateLoop),
                        _renderMovement())
                },
                _canPan = function () {
                    return !("fit" === _options.scaleMode && _currZoomLevel === self.currItem.initialZoomLevel)
                },
                _closestElement = function (el, fn) {
                    return el ? el.className && el.className.indexOf("pswp__scroll-wrap") > -1 ? !1 : fn(el) ? el : _closestElement(el.parentNode, fn) : !1
                },
                _preventObj = {},
                _preventDefaultEventBehaviour = function (e, isDown) {
                    return _preventObj.prevent = !_closestElement(e.target, _options.isClickableElement),
                        _shout("preventDragEvent", e, isDown, _preventObj),
                        _preventObj.prevent
                },
                _convertTouchToPoint = function (touch, p) {
                    return p.x = touch.pageX,
                        p.y = touch.pageY,
                        p.id = touch.identifier,
                        p
                },
                _findCenterOfPoints = function (p1, p2, pCenter) {
                    pCenter.x = .5 * (p1.x + p2.x),
                        pCenter.y = .5 * (p1.y + p2.y)
                },
                _pushPosPoint = function (time, x, y) {
                    if (time - _gestureCheckSpeedTime > 50) {
                        var o = _posPoints.length > 2 ? _posPoints.shift() : {};
                        o.x = x,
                            o.y = y,
                            _posPoints.push(o),
                            _gestureCheckSpeedTime = time
                    }
                },
                _calculateVerticalDragOpacityRatio = function () {
                    var yOffset = _panOffset.y - self.currItem.initialPosition.y;
                    return 1 - Math.abs(yOffset / (_viewportSize.y / 2))
                },
                _ePoint1 = {},
                _ePoint2 = {},
                _tempPointsArr = [],
                _getTouchPoints = function (e) {
                    for (; _tempPointsArr.length > 0;)
                        _tempPointsArr.pop();
                    return _pointerEventEnabled ? (_tempCounter = 0,
                            _currPointers.forEach(function (p) {
                                0 === _tempCounter ? _tempPointsArr[0] = p : 1 === _tempCounter && (_tempPointsArr[1] = p),
                                    _tempCounter++
                            })) : e.type.indexOf("touch") > -1 ? e.touches && e.touches.length > 0 && (_tempPointsArr[0] = _convertTouchToPoint(e.touches[0], _ePoint1),
                            e.touches.length > 1 && (_tempPointsArr[1] = _convertTouchToPoint(e.touches[1], _ePoint2))) : (_ePoint1.x = e.pageX,
                            _ePoint1.y = e.pageY,
                            _ePoint1.id = "",
                            _tempPointsArr[0] = _ePoint1),
                        _tempPointsArr
                },
                _panOrMoveMainScroll = function (axis, delta) {
                    var panFriction, startOverDiff, newPanPos, newMainScrollPos, overDiff = 0,
                        newOffset = _panOffset[axis] + delta[axis],
                        dir = delta[axis] > 0,
                        newMainScrollPosition = _mainScrollPos.x + delta.x,
                        mainScrollDiff = _mainScrollPos.x - _startMainScrollPos.x;
                    return panFriction = newOffset > _currPanBounds.min[axis] || newOffset < _currPanBounds.max[axis] ? _options.panEndFriction : 1,
                        newOffset = _panOffset[axis] + delta[axis] * panFriction,
                        !_options.allowPanToNext && _currZoomLevel !== self.currItem.initialZoomLevel || (_currZoomElementStyle ? "h" !== _direction || "x" !== axis || _zoomStarted || (dir ? (newOffset > _currPanBounds.min[axis] && (panFriction = _options.panEndFriction,
                                    overDiff = _currPanBounds.min[axis] - newOffset,
                                    startOverDiff = _currPanBounds.min[axis] - _startPanOffset[axis]),
                                (0 >= startOverDiff || 0 > mainScrollDiff) && _getNumItems() > 1 ? (newMainScrollPos = newMainScrollPosition,
                                    0 > mainScrollDiff && newMainScrollPosition > _startMainScrollPos.x && (newMainScrollPos = _startMainScrollPos.x)) : _currPanBounds.min.x !== _currPanBounds.max.x && (newPanPos = newOffset)) : (newOffset < _currPanBounds.max[axis] && (panFriction = _options.panEndFriction,
                                    overDiff = newOffset - _currPanBounds.max[axis],
                                    startOverDiff = _startPanOffset[axis] - _currPanBounds.max[axis]),
                                (0 >= startOverDiff || mainScrollDiff > 0) && _getNumItems() > 1 ? (newMainScrollPos = newMainScrollPosition,
                                    mainScrollDiff > 0 && newMainScrollPosition < _startMainScrollPos.x && (newMainScrollPos = _startMainScrollPos.x)) : _currPanBounds.min.x !== _currPanBounds.max.x && (newPanPos = newOffset))) : newMainScrollPos = newMainScrollPosition,
                            "x" !== axis) ? void(_mainScrollAnimating || _mainScrollShifted || _currZoomLevel > self.currItem.fitRatio && (_panOffset[axis] += delta[axis] * panFriction)) : (void 0 !== newMainScrollPos && (_moveMainScroll(newMainScrollPos, !0),
                                _mainScrollShifted = newMainScrollPos === _startMainScrollPos.x ? !1 : !0),
                            _currPanBounds.min.x !== _currPanBounds.max.x && (void 0 !== newPanPos ? _panOffset.x = newPanPos : _mainScrollShifted || (_panOffset.x += delta.x * panFriction)),
                            void 0 !== newMainScrollPos)
                },
                _onDragStart = function (e) {
                    if (!("mousedown" === e.type && e.button > 0)) {
                        if (_initialZoomRunning)
                            return void e.preventDefault();
                        if (!_oldAndroidTouchEndTimeout || "mousedown" !== e.type) {
                            if (_preventDefaultEventBehaviour(e, !0) && e.preventDefault(),
                                _shout("pointerDown"),
                                _pointerEventEnabled) {
                                var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, "id");
                                0 > pointerIndex && (pointerIndex = _currPointers.length),
                                    _currPointers[pointerIndex] = {
                                        x: e.pageX,
                                        y: e.pageY,
                                        id: e.pointerId
                                    }
                            }
                            var startPointsList = _getTouchPoints(e),
                                numPoints = startPointsList.length;
                            _currentPoints = null,
                                _stopAllAnimations(),
                                _isDragging && 1 !== numPoints || (_isDragging = _isFirstMove = !0,
                                    framework.bind(window, _upMoveEvents, self),
                                    _isZoomingIn = _wasOverInitialZoom = _opacityChanged = _verticalDragInitiated = _mainScrollShifted = _moved = _isMultitouch = _zoomStarted = !1,
                                    _direction = null,
                                    _shout("firstTouchStart", startPointsList),
                                    _equalizePoints(_startPanOffset, _panOffset),
                                    _currPanDist.x = _currPanDist.y = 0,
                                    _equalizePoints(_currPoint, startPointsList[0]),
                                    _equalizePoints(_startPoint, _currPoint),
                                    _startMainScrollPos.x = _slideSize.x * _currPositionIndex,
                                    _posPoints = [{
                                        x: _currPoint.x,
                                        y: _currPoint.y
                                    }],
                                    _gestureCheckSpeedTime = _gestureStartTime = _getCurrentTime(),
                                    _calculatePanBounds(_currZoomLevel, !0),
                                    _stopDragUpdateLoop(),
                                    _dragUpdateLoop()),
                                !_isZooming && numPoints > 1 && !_mainScrollAnimating && !_mainScrollShifted && (_startZoomLevel = _currZoomLevel,
                                    _zoomStarted = !1,
                                    _isZooming = _isMultitouch = !0,
                                    _currPanDist.y = _currPanDist.x = 0,
                                    _equalizePoints(_startPanOffset, _panOffset),
                                    _equalizePoints(p, startPointsList[0]),
                                    _equalizePoints(p2, startPointsList[1]),
                                    _findCenterOfPoints(p, p2, _currCenterPoint),
                                    _midZoomPoint.x = Math.abs(_currCenterPoint.x) - _panOffset.x,
                                    _midZoomPoint.y = Math.abs(_currCenterPoint.y) - _panOffset.y,
                                    _currPointsDistance = _startPointsDistance = _calculatePointsDistance(p, p2))
                        }
                    }
                },
                _onDragMove = function (e) {
                    if (e.preventDefault(),
                        _pointerEventEnabled) {
                        var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, "id");
                        if (pointerIndex > -1) {
                            var p = _currPointers[pointerIndex];
                            p.x = e.pageX,
                                p.y = e.pageY
                        }
                    }
                    if (_isDragging) {
                        var touchesList = _getTouchPoints(e);
                        if (_direction || _moved || _isZooming)
                            _currentPoints = touchesList;
                        else {
                            var diff = Math.abs(touchesList[0].x - _currPoint.x) - Math.abs(touchesList[0].y - _currPoint.y);
                            Math.abs(diff) >= DIRECTION_CHECK_OFFSET && (_direction = diff > 0 ? "h" : "v",
                                _currentPoints = touchesList)
                        }
                    }
                },
                _renderMovement = function () {
                    if (_currentPoints) {
                        var numPoints = _currentPoints.length;
                        if (0 !== numPoints)
                            if (_equalizePoints(p, _currentPoints[0]),
                                delta.x = p.x - _currPoint.x,
                                delta.y = p.y - _currPoint.y,
                                _isZooming && numPoints > 1) {
                                if (_currPoint.x = p.x,
                                    _currPoint.y = p.y,
                                    !delta.x && !delta.y && _isEqualPoints(_currentPoints[1], p2))
                                    return;
                                _equalizePoints(p2, _currentPoints[1]),
                                    _zoomStarted || (_zoomStarted = !0,
                                        _shout("zoomGestureStarted"));
                                var pointsDistance = _calculatePointsDistance(p, p2),
                                    zoomLevel = _calculateZoomLevel(pointsDistance);
                                zoomLevel > self.currItem.initialZoomLevel + self.currItem.initialZoomLevel / 15 && (_wasOverInitialZoom = !0);
                                var zoomFriction = 1,
                                    minZoomLevel = _getMinZoomLevel(),
                                    maxZoomLevel = _getMaxZoomLevel();
                                if (minZoomLevel > zoomLevel)
                                    if (_options.pinchToClose && !_wasOverInitialZoom && _startZoomLevel <= self.currItem.initialZoomLevel) {
                                        var minusDiff = minZoomLevel - zoomLevel,
                                            percent = 1 - minusDiff / (minZoomLevel / 1.2);
                                        _applyBgOpacity(percent),
                                            _shout("onPinchClose", percent),
                                            _opacityChanged = !0
                                    } else
                                        zoomFriction = (minZoomLevel - zoomLevel) / minZoomLevel,
                                        zoomFriction > 1 && (zoomFriction = 1),
                                        zoomLevel = minZoomLevel - zoomFriction * (minZoomLevel / 3);
                                else
                                    zoomLevel > maxZoomLevel && (zoomFriction = (zoomLevel - maxZoomLevel) / (6 * minZoomLevel),
                                        zoomFriction > 1 && (zoomFriction = 1),
                                        zoomLevel = maxZoomLevel + zoomFriction * minZoomLevel);
                                0 > zoomFriction && (zoomFriction = 0),
                                    _currPointsDistance = pointsDistance,
                                    _findCenterOfPoints(p, p2, _centerPoint),
                                    _currPanDist.x += _centerPoint.x - _currCenterPoint.x,
                                    _currPanDist.y += _centerPoint.y - _currCenterPoint.y,
                                    _equalizePoints(_currCenterPoint, _centerPoint),
                                    _panOffset.x = _calculatePanOffset("x", zoomLevel),
                                    _panOffset.y = _calculatePanOffset("y", zoomLevel),
                                    _isZoomingIn = zoomLevel > _currZoomLevel,
                                    _currZoomLevel = zoomLevel,
                                    _applyCurrentZoomPan()
                            } else {
                                if (!_direction)
                                    return;
                                if (_isFirstMove && (_isFirstMove = !1,
                                        Math.abs(delta.x) >= DIRECTION_CHECK_OFFSET && (delta.x -= _currentPoints[0].x - _startPoint.x),
                                        Math.abs(delta.y) >= DIRECTION_CHECK_OFFSET && (delta.y -= _currentPoints[0].y - _startPoint.y)),
                                    _currPoint.x = p.x,
                                    _currPoint.y = p.y,
                                    0 === delta.x && 0 === delta.y)
                                    return;
                                if ("v" === _direction && _options.closeOnVerticalDrag && !_canPan()) {
                                    _currPanDist.y += delta.y,
                                        _panOffset.y += delta.y;
                                    var opacityRatio = _calculateVerticalDragOpacityRatio();
                                    return _verticalDragInitiated = !0,
                                        _shout("onVerticalDrag", opacityRatio),
                                        _applyBgOpacity(opacityRatio),
                                        void _applyCurrentZoomPan()
                                }
                                _pushPosPoint(_getCurrentTime(), p.x, p.y),
                                    _moved = !0,
                                    _currPanBounds = self.currItem.bounds;
                                var mainScrollChanged = _panOrMoveMainScroll("x", delta);
                                mainScrollChanged || (_panOrMoveMainScroll("y", delta),
                                    _roundPoint(_panOffset),
                                    _applyCurrentZoomPan())
                            }
                    }
                },
                _onDragRelease = function (e) {
                    if (_features.isOldAndroid) {
                        if (_oldAndroidTouchEndTimeout && "mouseup" === e.type)
                            return;
                        e.type.indexOf("touch") > -1 && (clearTimeout(_oldAndroidTouchEndTimeout),
                            _oldAndroidTouchEndTimeout = setTimeout(function () {
                                _oldAndroidTouchEndTimeout = 0
                            }, 600))
                    }
                    _shout("pointerUp"),
                        _preventDefaultEventBehaviour(e, !1) && e.preventDefault();
                    var releasePoint;
                    if (_pointerEventEnabled) {
                        var pointerIndex = framework.arraySearch(_currPointers, e.pointerId, "id");
                        if (pointerIndex > -1)
                            if (releasePoint = _currPointers.splice(pointerIndex, 1)[0],
                                navigator.pointerEnabled)
                                releasePoint.type = e.pointerType || "mouse";
                            else {
                                var MSPOINTER_TYPES = {
                                    4: "mouse",
                                    2: "touch",
                                    3: "pen"
                                };
                                releasePoint.type = MSPOINTER_TYPES[e.pointerType],
                                    releasePoint.type || (releasePoint.type = e.pointerType || "mouse")
                            }
                    }
                    var gestureType, touchList = _getTouchPoints(e),
                        numPoints = touchList.length;
                    if ("mouseup" === e.type && (numPoints = 0),
                        2 === numPoints)
                        return _currentPoints = null,
                            !0;
                    1 === numPoints && _equalizePoints(_startPoint, touchList[0]),
                        0 !== numPoints || _direction || _mainScrollAnimating || (releasePoint || ("mouseup" === e.type ? releasePoint = {
                                x: e.pageX,
                                y: e.pageY,
                                type: "mouse"
                            } : e.changedTouches && e.changedTouches[0] && (releasePoint = {
                                x: e.changedTouches[0].pageX,
                                y: e.changedTouches[0].pageY,
                                type: "touch"
                            })),
                            _shout("touchRelease", e, releasePoint));
                    var releaseTimeDiff = -1;
                    if (0 === numPoints && (_isDragging = !1,
                            framework.unbind(window, _upMoveEvents, self),
                            _stopDragUpdateLoop(),
                            _isZooming ? releaseTimeDiff = 0 : -1 !== _lastReleaseTime && (releaseTimeDiff = _getCurrentTime() - _lastReleaseTime)),
                        _lastReleaseTime = 1 === numPoints ? _getCurrentTime() : -1,
                        gestureType = -1 !== releaseTimeDiff && 150 > releaseTimeDiff ? "zoom" : "swipe",
                        _isZooming && 2 > numPoints && (_isZooming = !1,
                            1 === numPoints && (gestureType = "zoomPointerUp"),
                            _shout("zoomGestureEnded")),
                        _currentPoints = null,
                        _moved || _zoomStarted || _mainScrollAnimating || _verticalDragInitiated)
                        if (_stopAllAnimations(),
                            _releaseAnimData || (_releaseAnimData = _initDragReleaseAnimationData()),
                            _releaseAnimData.calculateSwipeSpeed("x"),
                            _verticalDragInitiated) {
                            var opacityRatio = _calculateVerticalDragOpacityRatio();
                            if (opacityRatio < _options.verticalDragRange)
                                self.close();
                            else {
                                var initalPanY = _panOffset.y,
                                    initialBgOpacity = _bgOpacity;
                                _animateProp("verticalDrag", 0, 1, 300, framework.easing.cubic.out, function (now) {
                                        _panOffset.y = (self.currItem.initialPosition.y - initalPanY) * now + initalPanY,
                                            _applyBgOpacity((1 - initialBgOpacity) * now + initialBgOpacity),
                                            _applyCurrentZoomPan()
                                    }),
                                    _shout("onVerticalDrag", 1)
                            }
                        } else {
                            if ((_mainScrollShifted || _mainScrollAnimating) && 0 === numPoints) {
                                var itemChanged = _finishSwipeMainScrollGesture(gestureType, _releaseAnimData);
                                if (itemChanged)
                                    return;
                                gestureType = "zoomPointerUp"
                            }
                            if (!_mainScrollAnimating)
                                return "swipe" !== gestureType ? void _completeZoomGesture() : void(!_mainScrollShifted && _currZoomLevel > self.currItem.fitRatio && _completePanGesture(_releaseAnimData))
                        }
                },
                _initDragReleaseAnimationData = function () {
                    var lastFlickDuration, tempReleasePos, s = {
                        lastFlickOffset: {},
                        lastFlickDist: {},
                        lastFlickSpeed: {},
                        slowDownRatio: {},
                        slowDownRatioReverse: {},
                        speedDecelerationRatio: {},
                        speedDecelerationRatioAbs: {},
                        distanceOffset: {},
                        backAnimDestination: {},
                        backAnimStarted: {},
                        calculateSwipeSpeed: function (axis) {
                            _posPoints.length > 1 ? (lastFlickDuration = _getCurrentTime() - _gestureCheckSpeedTime + 50,
                                    tempReleasePos = _posPoints[_posPoints.length - 2][axis]) : (lastFlickDuration = _getCurrentTime() - _gestureStartTime,
                                    tempReleasePos = _startPoint[axis]),
                                s.lastFlickOffset[axis] = _currPoint[axis] - tempReleasePos,
                                s.lastFlickDist[axis] = Math.abs(s.lastFlickOffset[axis]),
                                s.lastFlickDist[axis] > 20 ? s.lastFlickSpeed[axis] = s.lastFlickOffset[axis] / lastFlickDuration : s.lastFlickSpeed[axis] = 0,
                                Math.abs(s.lastFlickSpeed[axis]) < .1 && (s.lastFlickSpeed[axis] = 0),
                                s.slowDownRatio[axis] = .95,
                                s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis],
                                s.speedDecelerationRatio[axis] = 1
                        },
                        calculateOverBoundsAnimOffset: function (axis, speed) {
                            s.backAnimStarted[axis] || (_panOffset[axis] > _currPanBounds.min[axis] ? s.backAnimDestination[axis] = _currPanBounds.min[axis] : _panOffset[axis] < _currPanBounds.max[axis] && (s.backAnimDestination[axis] = _currPanBounds.max[axis]),
                                void 0 !== s.backAnimDestination[axis] && (s.slowDownRatio[axis] = .7,
                                    s.slowDownRatioReverse[axis] = 1 - s.slowDownRatio[axis],
                                    s.speedDecelerationRatioAbs[axis] < .05 && (s.lastFlickSpeed[axis] = 0,
                                        s.backAnimStarted[axis] = !0,
                                        _animateProp("bounceZoomPan" + axis, _panOffset[axis], s.backAnimDestination[axis], speed || 300, framework.easing.sine.out, function (pos) {
                                            _panOffset[axis] = pos,
                                                _applyCurrentZoomPan()
                                        }))))
                        },
                        calculateAnimOffset: function (axis) {
                            s.backAnimStarted[axis] || (s.speedDecelerationRatio[axis] = s.speedDecelerationRatio[axis] * (s.slowDownRatio[axis] + s.slowDownRatioReverse[axis] - s.slowDownRatioReverse[axis] * s.timeDiff / 10),
                                s.speedDecelerationRatioAbs[axis] = Math.abs(s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis]),
                                s.distanceOffset[axis] = s.lastFlickSpeed[axis] * s.speedDecelerationRatio[axis] * s.timeDiff,
                                _panOffset[axis] += s.distanceOffset[axis])
                        },
                        panAnimLoop: function () {
                            return _animations.zoomPan && (_animations.zoomPan.raf = _requestAF(s.panAnimLoop),
                                s.now = _getCurrentTime(),
                                s.timeDiff = s.now - s.lastNow,
                                s.lastNow = s.now,
                                s.calculateAnimOffset("x"),
                                s.calculateAnimOffset("y"),
                                _applyCurrentZoomPan(),
                                s.calculateOverBoundsAnimOffset("x"),
                                s.calculateOverBoundsAnimOffset("y"),
                                s.speedDecelerationRatioAbs.x < .05 && s.speedDecelerationRatioAbs.y < .05) ? (_panOffset.x = Math.round(_panOffset.x),
                                _panOffset.y = Math.round(_panOffset.y),
                                _applyCurrentZoomPan(),
                                void _stopAnimation("zoomPan")) : void 0
                        }
                    };
                    return s
                },
                _completePanGesture = function (animData) {
                    return animData.calculateSwipeSpeed("y"),
                        _currPanBounds = self.currItem.bounds,
                        animData.backAnimDestination = {},
                        animData.backAnimStarted = {},
                        Math.abs(animData.lastFlickSpeed.x) <= .05 && Math.abs(animData.lastFlickSpeed.y) <= .05 ? (animData.speedDecelerationRatioAbs.x = animData.speedDecelerationRatioAbs.y = 0,
                            animData.calculateOverBoundsAnimOffset("x"),
                            animData.calculateOverBoundsAnimOffset("y"),
                            !0) : (_registerStartAnimation("zoomPan"),
                            animData.lastNow = _getCurrentTime(),
                            void animData.panAnimLoop())
                },
                _finishSwipeMainScrollGesture = function (gestureType, _releaseAnimData) {
                    var itemChanged;
                    _mainScrollAnimating || (_currZoomedItemIndex = _currentItemIndex);
                    var itemsDiff;
                    if ("swipe" === gestureType) {
                        var totalShiftDist = _currPoint.x - _startPoint.x,
                            isFastLastFlick = _releaseAnimData.lastFlickDist.x < 10;
                        totalShiftDist > MIN_SWIPE_DISTANCE && (isFastLastFlick || _releaseAnimData.lastFlickOffset.x > 20) ? itemsDiff = -1 : -MIN_SWIPE_DISTANCE > totalShiftDist && (isFastLastFlick || _releaseAnimData.lastFlickOffset.x < -20) && (itemsDiff = 1)
                    }
                    var nextCircle;
                    itemsDiff && (_currentItemIndex += itemsDiff,
                        0 > _currentItemIndex ? (_currentItemIndex = _options.loop ? _getNumItems() - 1 : 0,
                            nextCircle = !0) : _currentItemIndex >= _getNumItems() && (_currentItemIndex = _options.loop ? 0 : _getNumItems() - 1,
                            nextCircle = !0),
                        (!nextCircle || _options.loop) && (_indexDiff += itemsDiff,
                            _currPositionIndex -= itemsDiff,
                            itemChanged = !0));
                    var finishAnimDuration, animateToX = _slideSize.x * _currPositionIndex,
                        animateToDist = Math.abs(animateToX - _mainScrollPos.x);
                    return itemChanged || animateToX > _mainScrollPos.x == _releaseAnimData.lastFlickSpeed.x > 0 ? (finishAnimDuration = Math.abs(_releaseAnimData.lastFlickSpeed.x) > 0 ? animateToDist / Math.abs(_releaseAnimData.lastFlickSpeed.x) : 333,
                            finishAnimDuration = Math.min(finishAnimDuration, 400),
                            finishAnimDuration = Math.max(finishAnimDuration, 250)) : finishAnimDuration = 333,
                        _currZoomedItemIndex === _currentItemIndex && (itemChanged = !1),
                        _mainScrollAnimating = !0,
                        _shout("mainScrollAnimStart"),
                        _animateProp("mainScroll", _mainScrollPos.x, animateToX, finishAnimDuration, framework.easing.cubic.out, _moveMainScroll, function () {
                            _stopAllAnimations(),
                                _mainScrollAnimating = !1,
                                _currZoomedItemIndex = -1,
                                (itemChanged || _currZoomedItemIndex !== _currentItemIndex) && self.updateCurrItem(),
                                _shout("mainScrollAnimComplete")
                        }),
                        itemChanged && self.updateCurrItem(!0),
                        itemChanged
                },
                _calculateZoomLevel = function (touchesDistance) {
                    return 1 / _startPointsDistance * touchesDistance * _startZoomLevel
                },
                _completeZoomGesture = function () {
                    var destZoomLevel = _currZoomLevel,
                        minZoomLevel = _getMinZoomLevel(),
                        maxZoomLevel = _getMaxZoomLevel();
                    minZoomLevel > _currZoomLevel ? destZoomLevel = minZoomLevel : _currZoomLevel > maxZoomLevel && (destZoomLevel = maxZoomLevel);
                    var onUpdate, destOpacity = 1,
                        initialOpacity = _bgOpacity;
                    return _opacityChanged && !_isZoomingIn && !_wasOverInitialZoom && minZoomLevel > _currZoomLevel ? (self.close(),
                        !0) : (_opacityChanged && (onUpdate = function (now) {
                            _applyBgOpacity((destOpacity - initialOpacity) * now + initialOpacity)
                        }),
                        self.zoomTo(destZoomLevel, 0, 300, framework.easing.cubic.out, onUpdate),
                        !0)
                };
            _registerModule("Gestures", {
                publicMethods: {
                    initGestures: function () {
                        var addEventNames = function (pref, down, move, up, cancel) {
                            _dragStartEvent = pref + down,
                                _dragMoveEvent = pref + move,
                                _dragEndEvent = pref + up,
                                _dragCancelEvent = cancel ? pref + cancel : ""
                        };
                        _pointerEventEnabled = _features.pointerEvent,
                            _pointerEventEnabled && _features.touch && (_features.touch = !1),
                            _pointerEventEnabled ? navigator.pointerEnabled ? addEventNames("pointer", "down", "move", "up", "cancel") : addEventNames("MSPointer", "Down", "Move", "Up", "Cancel") : _features.touch ? (addEventNames("touch", "start", "move", "end", "cancel"),
                                _likelyTouchDevice = !0) : addEventNames("mouse", "down", "move", "up"),
                            _upMoveEvents = _dragMoveEvent + " " + _dragEndEvent + " " + _dragCancelEvent,
                            _downEvents = _dragStartEvent,
                            _pointerEventEnabled && !_likelyTouchDevice && (_likelyTouchDevice = navigator.maxTouchPoints > 1 || navigator.msMaxTouchPoints > 1),
                            self.likelyTouchDevice = _likelyTouchDevice,
                            _globalEventHandlers[_dragStartEvent] = _onDragStart,
                            _globalEventHandlers[_dragMoveEvent] = _onDragMove,
                            _globalEventHandlers[_dragEndEvent] = _onDragRelease,
                            _dragCancelEvent && (_globalEventHandlers[_dragCancelEvent] = _globalEventHandlers[_dragEndEvent]),
                            _features.touch && (_downEvents += " mousedown",
                                _upMoveEvents += " mousemove mouseup",
                                _globalEventHandlers.mousedown = _globalEventHandlers[_dragStartEvent],
                                _globalEventHandlers.mousemove = _globalEventHandlers[_dragMoveEvent],
                                _globalEventHandlers.mouseup = _globalEventHandlers[_dragEndEvent]),
                            _likelyTouchDevice || (_options.allowPanToNext = !1)
                    }
                }
            });
            var _showOrHideTimeout, _items, _initialContentSet, _initialZoomRunning, _getItemAt, _getNumItems, _initialIsLoop, _showOrHide = function (item, img, out, completeFn) {
                    _showOrHideTimeout && clearTimeout(_showOrHideTimeout),
                        _initialZoomRunning = !0,
                        _initialContentSet = !0;
                    var thumbBounds;
                    item.initialLayout ? (thumbBounds = item.initialLayout,
                        item.initialLayout = null) : thumbBounds = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex);
                    var duration = out ? _options.hideAnimationDuration : _options.showAnimationDuration,
                        onComplete = function () {
                            _stopAnimation("initialZoom"),
                                out ? (self.template.removeAttribute("style"),
                                    self.bg.removeAttribute("style")) : (_applyBgOpacity(1),
                                    img && (img.style.display = "block"),
                                    framework.addClass(template, "pswp--animated-in"),
                                    _shout("initialZoom" + (out ? "OutEnd" : "InEnd"))),
                                completeFn && completeFn(),
                                _initialZoomRunning = !1
                        };
                    if (!duration || !thumbBounds || void 0 === thumbBounds.x) {
                        var finishWithoutAnimation = function () {
                            _shout("initialZoom" + (out ? "Out" : "In")),
                                _currZoomLevel = item.initialZoomLevel,
                                _equalizePoints(_panOffset, item.initialPosition),
                                _applyCurrentZoomPan(),
                                template.style.opacity = out ? 0 : 1,
                                _applyBgOpacity(1),
                                onComplete()
                        };
                        return void finishWithoutAnimation()
                    }
                    var startAnimation = function () {
                        var closeWithRaf = _closedByScroll,
                            fadeEverything = !self.currItem.src || self.currItem.loadError || _options.showHideOpacity;
                        item.miniImg && (item.miniImg.style.webkitBackfaceVisibility = "hidden"),
                            out || (_currZoomLevel = thumbBounds.w / item.w,
                                _panOffset.x = thumbBounds.x,
                                _panOffset.y = thumbBounds.y - _initalWindowScrollY,
                                self[fadeEverything ? "template" : "bg"].style.opacity = .001,
                                _applyCurrentZoomPan()),
                            _registerStartAnimation("initialZoom"),
                            out && !closeWithRaf && framework.removeClass(template, "pswp--animated-in"),
                            fadeEverything && (out ? framework[(closeWithRaf ? "remove" : "add") + "Class"](template, "pswp--animate_opacity") : setTimeout(function () {
                                framework.addClass(template, "pswp--animate_opacity")
                            }, 30)),
                            _showOrHideTimeout = setTimeout(function () {
                                if (_shout("initialZoom" + (out ? "Out" : "In")),
                                    out) {
                                    var destZoomLevel = thumbBounds.w / item.w,
                                        initialPanOffset = {
                                            x: _panOffset.x,
                                            y: _panOffset.y
                                        },
                                        initialZoomLevel = _currZoomLevel,
                                        initalBgOpacity = _bgOpacity,
                                        onUpdate = function (now) {
                                            1 === now ? (_currZoomLevel = destZoomLevel,
                                                    _panOffset.x = thumbBounds.x,
                                                    _panOffset.y = thumbBounds.y - _currentWindowScrollY) : (_currZoomLevel = (destZoomLevel - initialZoomLevel) * now + initialZoomLevel,
                                                    _panOffset.x = (thumbBounds.x - initialPanOffset.x) * now + initialPanOffset.x,
                                                    _panOffset.y = (thumbBounds.y - _currentWindowScrollY - initialPanOffset.y) * now + initialPanOffset.y),
                                                _applyCurrentZoomPan(),
                                                fadeEverything ? template.style.opacity = 1 - now : _applyBgOpacity(initalBgOpacity - now * initalBgOpacity)
                                        };
                                    closeWithRaf ? _animateProp("initialZoom", 0, 1, duration, framework.easing.cubic.out, onUpdate, onComplete) : (onUpdate(1),
                                        _showOrHideTimeout = setTimeout(onComplete, duration + 20))
                                } else
                                    _currZoomLevel = item.initialZoomLevel,
                                    _equalizePoints(_panOffset, item.initialPosition),
                                    _applyCurrentZoomPan(),
                                    _applyBgOpacity(1),
                                    fadeEverything ? template.style.opacity = 1 : _applyBgOpacity(1),
                                    _showOrHideTimeout = setTimeout(onComplete, duration + 20)
                            }, out ? 25 : 90)
                    };
                    startAnimation()
                },
                _tempPanAreaSize = {},
                _imagesToAppendPool = [],
                _controllerDefaultOptions = {
                    index: 0,
                    errorMsg: '<div class="pswp__error-msg"><a href="%url%" target="_blank">The image</a> could not be loaded.</div>',
                    forceProgressiveLoading: !1,
                    preload: [1, 1],
                    getNumItemsFn: function () {
                        return _items.length
                    }
                },
                _getZeroBounds = function () {
                    return {
                        center: {
                            x: 0,
                            y: 0
                        },
                        max: {
                            x: 0,
                            y: 0
                        },
                        min: {
                            x: 0,
                            y: 0
                        }
                    }
                },
                _calculateSingleItemPanBounds = function (item, realPanElementW, realPanElementH) {
                    var bounds = item.bounds;
                    bounds.center.x = Math.round((_tempPanAreaSize.x - realPanElementW) / 2),
                        bounds.center.y = Math.round((_tempPanAreaSize.y - realPanElementH) / 2) + item.vGap.top,
                        bounds.max.x = realPanElementW > _tempPanAreaSize.x ? Math.round(_tempPanAreaSize.x - realPanElementW) : bounds.center.x,
                        bounds.max.y = realPanElementH > _tempPanAreaSize.y ? Math.round(_tempPanAreaSize.y - realPanElementH) + item.vGap.top : bounds.center.y,
                        bounds.min.x = realPanElementW > _tempPanAreaSize.x ? 0 : bounds.center.x,
                        bounds.min.y = realPanElementH > _tempPanAreaSize.y ? item.vGap.top : bounds.center.y
                },
                _calculateItemSize = function (item, viewportSize, zoomLevel) {
                    if (item.src && !item.loadError) {
                        var isInitial = !zoomLevel;
                        if (isInitial && (item.vGap || (item.vGap = {
                                    top: 0,
                                    bottom: 0
                                }),
                                _shout("parseVerticalMargin", item)),
                            _tempPanAreaSize.x = viewportSize.x,
                            _tempPanAreaSize.y = viewportSize.y - item.vGap.top - item.vGap.bottom,
                            isInitial) {
                            var hRatio = _tempPanAreaSize.x / item.w,
                                vRatio = _tempPanAreaSize.y / item.h;
                            item.fitRatio = vRatio > hRatio ? hRatio : vRatio;
                            var scaleMode = _options.scaleMode;
                            "orig" === scaleMode ? zoomLevel = 1 : "fit" === scaleMode && (zoomLevel = item.fitRatio),
                                zoomLevel > 1 && (zoomLevel = 1),
                                item.initialZoomLevel = zoomLevel,
                                item.bounds || (item.bounds = _getZeroBounds())
                        }
                        if (!zoomLevel)
                            return;
                        return _calculateSingleItemPanBounds(item, item.w * zoomLevel, item.h * zoomLevel),
                            isInitial && zoomLevel === item.initialZoomLevel && (item.initialPosition = item.bounds.center),
                            item.bounds
                    }
                    return item.w = item.h = 0,
                        item.initialZoomLevel = item.fitRatio = 1,
                        item.bounds = _getZeroBounds(),
                        item.initialPosition = item.bounds.center,
                        item.bounds
                },
                _appendImage = function (index, item, baseDiv, img, preventAnimation, keepPlaceholder) {
                    if (!item.loadError) {
                        var animate, isSwiping = self.isDragging() && !self.isZooming(),
                            slideMightBeVisible = index === _currentItemIndex || self.isMainScrollAnimating() || isSwiping;
                        !preventAnimation && (_likelyTouchDevice || _options.alwaysFadeIn) && slideMightBeVisible && (animate = !0),
                            img && (animate && (img.style.opacity = 0),
                                item.imageAppended = !0,
                                _setImageSize(img, item.w, item.h),
                                baseDiv.appendChild(img),
                                animate && setTimeout(function () {
                                    img.style.opacity = 1,
                                        keepPlaceholder && setTimeout(function () {
                                            item && item.loaded && item.placeholder && (item.placeholder.style.display = "none",
                                                item.placeholder = null)
                                        }, 500)
                                }, 50))
                    }
                },
                _preloadImage = function (item) {
                    item.loading = !0,
                        item.loaded = !1;
                    var img = item.img = framework.createEl("pswp__img", "img"),
                        onComplete = function () {
                            item.loading = !1,
                                item.loaded = !0,
                                item.loadComplete ? item.loadComplete(item) : item.img = null,
                                img.onload = img.onerror = null,
                                img = null
                        };
                    return img.onload = onComplete,
                        img.onerror = function () {
                            item.loadError = !0,
                                onComplete()
                        },
                        img.src = item.src,
                        img
                },
                _checkForError = function (item, cleanUp) {
                    return item.src && item.loadError && item.container ? (cleanUp && (item.container.innerHTML = ""),
                        item.container.innerHTML = _options.errorMsg.replace("%url%", item.src),
                        !0) : void 0
                },
                _setImageSize = function (img, w, h) {
                    img.style.width = w + "px",
                        img.style.height = h + "px"
                },
                _appendImagesPool = function () {
                    if (_imagesToAppendPool.length) {
                        for (var poolItem, i = 0; i < _imagesToAppendPool.length; i++)
                            poolItem = _imagesToAppendPool[i],
                            poolItem.holder.index === poolItem.index && _appendImage(poolItem.index, poolItem.item, poolItem.baseDiv, poolItem.img);
                        _imagesToAppendPool = []
                    }
                };
            _registerModule("Controller", {
                publicMethods: {
                    lazyLoadItem: function (index) {
                        index = _getLoopedId(index);
                        var item = _getItemAt(index);
                        !item || item.loaded || item.loading || (_shout("gettingData", index, item),
                            item.src && _preloadImage(item))
                    },
                    initController: function () {
                        framework.extend(_options, _controllerDefaultOptions, !0),
                            self.items = _items = items,
                            _getItemAt = self.getItemAt,
                            _getNumItems = _options.getNumItemsFn,
                            _initialIsLoop = _options.loop,
                            _getNumItems() < 3 && (_options.loop = !1),
                            _listen("beforeChange", function (diff) {
                                var i, p = _options.preload,
                                    isNext = null === diff ? !0 : diff > 0,
                                    preloadBefore = Math.min(p[0], _getNumItems()),
                                    preloadAfter = Math.min(p[1], _getNumItems());
                                for (i = 1;
                                    (isNext ? preloadAfter : preloadBefore) >= i; i++)
                                    self.lazyLoadItem(_currentItemIndex + i);
                                for (i = 1;
                                    (isNext ? preloadBefore : preloadAfter) >= i; i++)
                                    self.lazyLoadItem(_currentItemIndex - i)
                            }),
                            _listen("initialLayout", function () {
                                self.currItem.initialLayout = _options.getThumbBoundsFn && _options.getThumbBoundsFn(_currentItemIndex)
                            }),
                            _listen("mainScrollAnimComplete", _appendImagesPool),
                            _listen("initialZoomInEnd", _appendImagesPool),
                            _listen("destroy", function () {
                                for (var item, i = 0; i < _items.length; i++)
                                    item = _items[i],
                                    item.container && (item.container = null),
                                    item.placeholder && (item.placeholder = null),
                                    item.img && (item.img = null),
                                    item.preloader && (item.preloader = null),
                                    item.loadError && (item.loaded = item.loadError = !1);
                                _imagesToAppendPool = null
                            })
                    },
                    getItemAt: function (index) {
                        return index >= 0 && void 0 !== _items[index] ? _items[index] : !1
                    },
                    allowProgressiveImg: function () {
                        return _options.forceProgressiveLoading || !_likelyTouchDevice || _options.mouseUsed || screen.width > 1200
                    },
                    setContent: function (holder, index) {
                        _options.loop && (index = _getLoopedId(index));
                        var prevItem = self.getItemAt(holder.index);
                        prevItem && (prevItem.container = null);
                        var img, item = self.getItemAt(index);
                        if (!item)
                            return void(holder.el.innerHTML = "");
                        _shout("gettingData", index, item),
                            holder.index = index,
                            holder.item = item;
                        var baseDiv = item.container = framework.createEl("pswp__zoom-wrap");
                        if (!item.src && item.html && (item.html.tagName ? baseDiv.appendChild(item.html) : baseDiv.innerHTML = item.html),
                            _checkForError(item),
                            !item.src || item.loadError || item.loaded)
                            item.src && !item.loadError && (img = framework.createEl("pswp__img", "img"),
                                img.style.webkitBackfaceVisibility = "hidden",
                                img.style.opacity = 1,
                                img.src = item.src,
                                _setImageSize(img, item.w, item.h),
                                _appendImage(index, item, baseDiv, img, !0));
                        else {
                            if (item.loadComplete = function (item) {
                                    if (_isOpen) {
                                        if (item.img && (item.img.style.webkitBackfaceVisibility = "hidden"),
                                            holder && holder.index === index) {
                                            if (_checkForError(item, !0))
                                                return item.loadComplete = item.img = null,
                                                    _calculateItemSize(item, _viewportSize),
                                                    _applyZoomPanToItem(item),
                                                    void(holder.index === _currentItemIndex && self.updateCurrZoomItem());
                                            item.imageAppended ? !_initialZoomRunning && item.placeholder && (item.placeholder.style.display = "none",
                                                item.placeholder = null) : _features.transform && (_mainScrollAnimating || _initialZoomRunning) ? _imagesToAppendPool.push({
                                                item: item,
                                                baseDiv: baseDiv,
                                                img: item.img,
                                                index: index,
                                                holder: holder
                                            }) : _appendImage(index, item, baseDiv, item.img, _mainScrollAnimating || _initialZoomRunning)
                                        }
                                        item.loadComplete = null,
                                            item.img = null,
                                            _shout("imageLoadComplete", index, item)
                                    }
                                },
                                framework.features.transform) {
                                var placeholderClassName = "pswp__img pswp__img--placeholder";
                                placeholderClassName += item.msrc ? "" : " pswp__img--placeholder--blank";
                                var placeholder = framework.createEl(placeholderClassName, item.msrc ? "img" : "");
                                item.msrc && (placeholder.src = item.msrc),
                                    _setImageSize(placeholder, item.w, item.h),
                                    baseDiv.appendChild(placeholder),
                                    item.placeholder = placeholder
                            }
                            item.loading || _preloadImage(item),
                                self.allowProgressiveImg() && (!_initialContentSet && _features.transform ? _imagesToAppendPool.push({
                                    item: item,
                                    baseDiv: baseDiv,
                                    img: item.img,
                                    index: index,
                                    holder: holder
                                }) : _appendImage(index, item, baseDiv, item.img, !0, !0))
                        }
                        _calculateItemSize(item, _viewportSize),
                            _initialContentSet || index !== _currentItemIndex ? _applyZoomPanToItem(item) : (_currZoomElementStyle = baseDiv.style,
                                _showOrHide(item, img || item.img)),
                            holder.el.innerHTML = "",
                            holder.el.appendChild(baseDiv)
                    },
                    cleanSlide: function (item) {
                        item.img && (item.img.onload = item.img.onerror = null),
                            item.loaded = item.loading = item.img = item.imageAppended = !1
                    }
                }
            });
            var tapTimer, tapReleasePoint = {},
                _dispatchTapEvent = function (origEvent, releasePoint, pointerType) {
                    var e = document.createEvent("CustomEvent"),
                        eDetail = {
                            origEvent: origEvent,
                            target: origEvent.target,
                            releasePoint: releasePoint,
                            pointerType: pointerType || "touch"
                        };
                    e.initCustomEvent("pswpTap", !0, !0, eDetail),
                        origEvent.target.dispatchEvent(e)
                };
            _registerModule("Tap", {
                publicMethods: {
                    initTap: function () {
                        _listen("firstTouchStart", self.onTapStart),
                            _listen("touchRelease", self.onTapRelease),
                            _listen("destroy", function () {
                                tapReleasePoint = {},
                                    tapTimer = null
                            })
                    },
                    onTapStart: function (touchList) {
                        touchList.length > 1 && (clearTimeout(tapTimer),
                            tapTimer = null)
                    },
                    onTapRelease: function (e, releasePoint) {
                        if (releasePoint && !_moved && !_isMultitouch && !_numAnimations) {
                            var p0 = releasePoint;
                            if (tapTimer && (clearTimeout(tapTimer),
                                    tapTimer = null,
                                    _isNearbyPoints(p0, tapReleasePoint)))
                                return void _shout("doubleTap", p0);
                            if ("mouse" === releasePoint.type)
                                return void _dispatchTapEvent(e, releasePoint, "mouse");
                            var clickedTagName = e.target.tagName.toUpperCase();
                            if ("BUTTON" === clickedTagName || framework.hasClass(e.target, "pswp__single-tap"))
                                return void _dispatchTapEvent(e, releasePoint);
                            _equalizePoints(tapReleasePoint, p0),
                                tapTimer = setTimeout(function () {
                                    _dispatchTapEvent(e, releasePoint),
                                        tapTimer = null
                                }, 300)
                        }
                    }
                }
            });
            var _wheelDelta;
            _registerModule("DesktopZoom", {
                publicMethods: {
                    initDesktopZoom: function () {
                        _oldIE || (_likelyTouchDevice ? _listen("mouseUsed", function () {
                            self.setupDesktopZoom()
                        }) : self.setupDesktopZoom(!0))
                    },
                    setupDesktopZoom: function (onInit) {
                        _wheelDelta = {};
                        var events = "wheel mousewheel DOMMouseScroll";
                        _listen("bindEvents", function () {
                                framework.bind(template, events, self.handleMouseWheel)
                            }),
                            _listen("unbindEvents", function () {
                                _wheelDelta && framework.unbind(template, events, self.handleMouseWheel)
                            }),
                            self.mouseZoomedIn = !1;
                        var hasDraggingClass, updateZoomable = function () {
                                self.mouseZoomedIn && (framework.removeClass(template, "pswp--zoomed-in"),
                                        self.mouseZoomedIn = !1),
                                    1 > _currZoomLevel ? framework.addClass(template, "pswp--zoom-allowed") : framework.removeClass(template, "pswp--zoom-allowed"),
                                    removeDraggingClass()
                            },
                            removeDraggingClass = function () {
                                hasDraggingClass && (framework.removeClass(template, "pswp--dragging"),
                                    hasDraggingClass = !1)
                            };
                        _listen("resize", updateZoomable),
                            _listen("afterChange", updateZoomable),
                            _listen("pointerDown", function () {
                                self.mouseZoomedIn && (hasDraggingClass = !0,
                                    framework.addClass(template, "pswp--dragging"))
                            }),
                            _listen("pointerUp", removeDraggingClass),
                            onInit || updateZoomable()
                    },
                    handleMouseWheel: function (e) {
                        if (_currZoomLevel <= self.currItem.fitRatio)
                            return _options.modal && (_options.closeOnScroll ? _transformKey && Math.abs(e.deltaY) > 2 && (_closedByScroll = !0,
                                    self.close()) : e.preventDefault()),
                                !0;
                        if (e.stopPropagation(),
                            _wheelDelta.x = 0,
                            "deltaX" in e)
                            1 === e.deltaMode ? (_wheelDelta.x = 18 * e.deltaX,
                                _wheelDelta.y = 18 * e.deltaY) : (_wheelDelta.x = e.deltaX,
                                _wheelDelta.y = e.deltaY);
                        else if ("wheelDelta" in e)
                            e.wheelDeltaX && (_wheelDelta.x = -.16 * e.wheelDeltaX),
                            e.wheelDeltaY ? _wheelDelta.y = -.16 * e.wheelDeltaY : _wheelDelta.y = -.16 * e.wheelDelta;
                        else {
                            if (!("detail" in e))
                                return;
                            _wheelDelta.y = e.detail
                        }
                        _calculatePanBounds(_currZoomLevel, !0);
                        var newPanX = _panOffset.x - _wheelDelta.x,
                            newPanY = _panOffset.y - _wheelDelta.y;
                        (_options.modal || newPanX <= _currPanBounds.min.x && newPanX >= _currPanBounds.max.x && newPanY <= _currPanBounds.min.y && newPanY >= _currPanBounds.max.y) && e.preventDefault(),
                            self.panTo(newPanX, newPanY)
                    },
                    toggleDesktopZoom: function (centerPoint) {
                        centerPoint = centerPoint || {
                            x: _viewportSize.x / 2 + _offset.x,
                            y: _viewportSize.y / 2 + _offset.y
                        };
                        var doubleTapZoomLevel = _options.getDoubleTapZoom(!0, self.currItem),
                            zoomOut = _currZoomLevel === doubleTapZoomLevel;
                        self.mouseZoomedIn = !zoomOut,
                            self.zoomTo(zoomOut ? self.currItem.initialZoomLevel : doubleTapZoomLevel, centerPoint, 333),
                            framework[(zoomOut ? "remove" : "add") + "Class"](template, "pswp--zoomed-in")
                    }
                }
            });
            var _historyUpdateTimeout, _hashChangeTimeout, _hashAnimCheckTimeout, _hashChangedByScript, _hashChangedByHistory, _hashReseted, _initialHash, _historyChanged, _closedFromURL, _urlChangedOnce, _windowLoc, _supportsPushState, _historyDefaultOptions = {
                    history: !0,
                    galleryUID: 1
                },
                _getHash = function () {
                    return _windowLoc.hash.substring(1)
                },
                _cleanHistoryTimeouts = function () {
                    _historyUpdateTimeout && clearTimeout(_historyUpdateTimeout),
                        _hashAnimCheckTimeout && clearTimeout(_hashAnimCheckTimeout)
                },
                _parseItemIndexFromURL = function () {
                    var hash = _getHash(),
                        params = {};
                    if (hash.length < 5)
                        return params;
                    var i, vars = hash.split("&");
                    for (i = 0; i < vars.length; i++)
                        if (vars[i]) {
                            var pair = vars[i].split("=");
                            pair.length < 2 || (params[pair[0]] = pair[1])
                        }
                    if (_options.galleryPIDs) {
                        var searchfor = params.pid;
                        for (params.pid = 0,
                            i = 0; i < _items.length; i++)
                            if (_items[i].pid === searchfor) {
                                params.pid = i;
                                break
                            }
                    } else
                        params.pid = parseInt(params.pid, 10) - 1;
                    return params.pid < 0 && (params.pid = 0),
                        params
                },
                _updateHash = function () {
                    if (_hashAnimCheckTimeout && clearTimeout(_hashAnimCheckTimeout),
                        _numAnimations || _isDragging)
                        return void(_hashAnimCheckTimeout = setTimeout(_updateHash, 500));
                    _hashChangedByScript ? clearTimeout(_hashChangeTimeout) : _hashChangedByScript = !0;
                    var pid = _currentItemIndex + 1,
                        item = _getItemAt(_currentItemIndex);
                    item.hasOwnProperty("pid") && (pid = item.pid);
                    var newHash = _initialHash + "&gid=" + _options.galleryUID + "&pid=" + pid;
                    _historyChanged || -1 === _windowLoc.hash.indexOf(newHash) && (_urlChangedOnce = !0);
                    var newURL = _windowLoc.href.split("#")[0] + "#" + newHash;
                    _supportsPushState ? "#" + newHash !== window.location.hash && history[_historyChanged ? "replaceState" : "pushState"]("", document.title, newURL) : _historyChanged ? _windowLoc.replace(newURL) : _windowLoc.hash = newHash,
                        _historyChanged = !0,
                        _hashChangeTimeout = setTimeout(function () {
                            _hashChangedByScript = !1
                        }, 60)
                };
            _registerModule("History", {
                    publicMethods: {
                        initHistory: function () {
                            if (framework.extend(_options, _historyDefaultOptions, !0),
                                _options.history) {
                                _windowLoc = window.location,
                                    _urlChangedOnce = !1,
                                    _closedFromURL = !1,
                                    _historyChanged = !1,
                                    _initialHash = _getHash(),
                                    _supportsPushState = "pushState" in history,
                                    _initialHash.indexOf("gid=") > -1 && (_initialHash = _initialHash.split("&gid=")[0],
                                        _initialHash = _initialHash.split("?gid=")[0]),
                                    _listen("afterChange", self.updateURL),
                                    _listen("unbindEvents", function () {
                                        framework.unbind(window, "hashchange", self.onHashChange)
                                    });
                                var returnToOriginal = function () {
                                    _hashReseted = !0,
                                        _closedFromURL || (_urlChangedOnce ? history.back() : _initialHash ? _windowLoc.hash = _initialHash : _supportsPushState ? history.pushState("", document.title, _windowLoc.pathname + _windowLoc.search) : _windowLoc.hash = ""),
                                        _cleanHistoryTimeouts()
                                };
                                _listen("unbindEvents", function () {
                                        _closedByScroll && returnToOriginal()
                                    }),
                                    _listen("destroy", function () {
                                        _hashReseted || returnToOriginal()
                                    }),
                                    _listen("firstUpdate", function () {
                                        _currentItemIndex = _parseItemIndexFromURL().pid
                                    });
                                var index = _initialHash.indexOf("pid=");
                                index > -1 && (_initialHash = _initialHash.substring(0, index),
                                        "&" === _initialHash.slice(-1) && (_initialHash = _initialHash.slice(0, -1))),
                                    setTimeout(function () {
                                        _isOpen && framework.bind(window, "hashchange", self.onHashChange);
                                    }, 40)
                            }
                        },
                        onHashChange: function () {
                            return _getHash() === _initialHash ? (_closedFromURL = !0,
                                void self.close()) : void(_hashChangedByScript || (_hashChangedByHistory = !0,
                                self.goTo(_parseItemIndexFromURL().pid),
                                _hashChangedByHistory = !1))
                        },
                        updateURL: function () {
                            _cleanHistoryTimeouts(),
                                _hashChangedByHistory || (_historyChanged ? _historyUpdateTimeout = setTimeout(_updateHash, 800) : _updateHash())
                        }
                    }
                }),
                framework.extend(self, publicMethods)
        };
        return PhotoSwipe
    }),
    function ($) {
        $.fn.photoswipe = function (options) {
            var galleries = [],
                _options = options,
                parseImage = function ($link, size) {
                    var sizeItem;
                    if ("undefined" == $link.attr("data-" + size) || "undefined" == $link.attr("data-" + size + "-size"))
                        throw SyntaxError("Missing data-* attributes for " + size);
                    var imageSize = $link.data(size + "-size").split("x");
                    if (2 != imageSize.length)
                        throw SyntaxError("Missing data-size attribute.");
                    return sizeItem = {
                        src: $link.data(size),
                        w: parseInt(imageSize[0], 10),
                        h: parseInt(imageSize[1], 10)
                    }
                },
                init = function ($this) {
                    galleries = [],
                        $this.each(function (i, gallery) {
                            galleries.push({
                                    id: i,
                                    items: []
                                }),
                                $(gallery).find("a").each(function (k, link) {
                                    var $link = $(link);
                                    $link.data("gallery-id", i + 1),
                                        $link.data("photo-id", k);
                                    var item = {
                                        src: link.href,
                                        msrc: link.children[0].getAttribute("alt-src"),
                                        title: $link.children("figcaption").text(),
                                        el: link,
                                        smallImage: parseImage($link, "small"),
                                        mediumImage: parseImage($link, "medium"),
                                        largeImage: parseImage($link, "large")
                                    };
                                    galleries[i].items.push(item)
                                }),
                                $(gallery).on("click", "a", function (e) {
                                    e.preventDefault();
                                    var gid = $(this).data("gallery-id"),
                                        pid = $(this).data("photo-id");
                                    openGallery(gid, pid)
                                })
                        })
                },
                parseHash = function () {
                    var hash = window.location.hash.substring(1),
                        params = {};
                    if (hash.length < 5)
                        return params;
                    for (var vars = hash.split("&"), i = 0; i < vars.length; i++)
                        if (vars[i]) {
                            var pair = vars[i].split("=");
                            pair.length < 2 || (params[pair[0]] = pair[1])
                        }
                    return params.gid && (params.gid = parseInt(params.gid, 10)),
                        params.hasOwnProperty("pid") ? (params.pid = parseInt(params.pid, 10),
                            params) : params
                },
                openGallery = function (gid, pid) {
                    var pswpElement = document.querySelectorAll(".pswp")[0],
                        items = galleries[gid - 1].items,
                        options = {
                            index: pid,
                            galleryUID: gid,
                            getThumbBoundsFn: function (index) {
                                var thumbnail = items[index].el.children[0],
                                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                                    rect = thumbnail.getBoundingClientRect();
                                return {
                                    x: rect.left,
                                    y: rect.top + pageYScroll,
                                    w: rect.width
                                }
                            }
                        };
                    $.extend(options, _options);
                    var realViewportWidth, imageSrcWillChange, gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options),
                        useImageSize = "large",
                        firstResize = !0;
                    gallery.listen("beforeResize", function () {
                            realViewportWidth = gallery.viewportSize.x,
                                "small" != useImageSize && realViewportWidth < gallery.options.breakpoints.medium ? (useImageSize = "small",
                                    imageSrcWillChange = !0) : "medium" != useImageSize && realViewportWidth >= gallery.options.breakpoints.medium && realViewportWidth < gallery.options.breakpoints.large ? (useImageSize = "medium",
                                    imageSrcWillChange = !0) : "large" != useImageSize && realViewportWidth >= gallery.options.breakpoints.large && (useImageSize = "large",
                                    imageSrcWillChange = !0),
                                imageSrcWillChange && !firstResize && gallery.invalidateCurrItems(),
                                firstResize && (firstResize = !1),
                                imageSrcWillChange = !1
                        }),
                        gallery.listen("gettingData", function (index, item) {
                            "large" == useImageSize ? (item.src = item.largeImage.src,
                                item.w = item.largeImage.w,
                                item.h = item.largeImage.h) : "medium" == useImageSize ? (item.src = item.mediumImage.src,
                                item.w = item.mediumImage.w,
                                item.h = item.mediumImage.h) : "small" == useImageSize && (item.src = item.smallImage.src,
                                item.w = item.smallImage.w,
                                item.h = item.smallImage.h)
                        }),
                        gallery.init()
                };
            init(this);
            var hashData = parseHash();
            return hashData.pid > 0 && hashData.gid > 0 && openGallery(hashData.gid, hashData.pid),
                this
        }
    }(jQuery),
    function (factory) {
        "use strict";
        "function" == typeof define && define.amd ? define(["jquery"], factory) : "undefined" != typeof exports ? module.exports = factory(require("jquery")) : factory(jQuery)
    }(function ($) {
        "use strict";
        var Slick = window.Slick || {};
        Slick = function () {
                function Slick(element, settings) {
                    var dataSettings, _ = this;
                    _.defaults = {
                            accessibility: !0,
                            adaptiveHeight: !1,
                            appendArrows: $(element),
                            appendDots: $(element),
                            arrows: !0,
                            asNavFor: null,
                            prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="Previous" tabindex="0" role="button">Previous</button>',
                            nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="Next" tabindex="0" role="button">Next</button>',
                            autoplay: !1,
                            autoplaySpeed: 3e3,
                            centerMode: !1,
                            centerPadding: "50px",
                            cssEase: "ease",
                            customPaging: function (slider, i) {
                                return '<button type="button" data-role="none" role="button" aria-required="false" tabindex="0">' + (i + 1) + "</button>"
                            },
                            dots: !1,
                            dotsClass: "slick-dots",
                            draggable: !0,
                            easing: "linear",
                            edgeFriction: .35,
                            fade: !1,
                            focusOnSelect: !1,
                            infinite: !0,
                            initialSlide: 0,
                            lazyLoad: "ondemand",
                            mobileFirst: !1,
                            pauseOnHover: !0,
                            pauseOnDotsHover: !1,
                            respondTo: "window",
                            responsive: null,
                            rows: 1,
                            rtl: !1,
                            slide: "",
                            slidesPerRow: 1,
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            speed: 500,
                            swipe: !0,
                            swipeToSlide: !1,
                            touchMove: !0,
                            touchThreshold: 5,
                            useCSS: !0,
                            variableWidth: !1,
                            vertical: !1,
                            verticalSwiping: !1,
                            waitForAnimate: !0,
                            zIndex: 1e3
                        },
                        _.initials = {
                            animating: !1,
                            dragging: !1,
                            autoPlayTimer: null,
                            currentDirection: 0,
                            currentLeft: null,
                            currentSlide: 0,
                            direction: 1,
                            $dots: null,
                            listWidth: null,
                            listHeight: null,
                            loadIndex: 0,
                            $nextArrow: null,
                            $prevArrow: null,
                            slideCount: null,
                            slideWidth: null,
                            $slideTrack: null,
                            $slides: null,
                            sliding: !1,
                            slideOffset: 0,
                            swipeLeft: null,
                            $list: null,
                            touchObject: {},
                            transformsEnabled: !1,
                            unslicked: !1
                        },
                        $.extend(_, _.initials),
                        _.activeBreakpoint = null,
                        _.animType = null,
                        _.animProp = null,
                        _.breakpoints = [],
                        _.breakpointSettings = [],
                        _.cssTransitions = !1,
                        _.hidden = "hidden",
                        _.paused = !1,
                        _.positionProp = null,
                        _.respondTo = null,
                        _.rowCount = 1,
                        _.shouldClick = !0,
                        _.$slider = $(element),
                        _.$slidesCache = null,
                        _.transformType = null,
                        _.transitionType = null,
                        _.visibilityChange = "visibilitychange",
                        _.windowWidth = 0,
                        _.windowTimer = null,
                        dataSettings = $(element).data("slick") || {},
                        _.options = $.extend({}, _.defaults, dataSettings, settings),
                        _.currentSlide = _.options.initialSlide,
                        _.originalSettings = _.options,
                        "undefined" != typeof document.mozHidden ? (_.hidden = "mozHidden",
                            _.visibilityChange = "mozvisibilitychange") : "undefined" != typeof document.webkitHidden && (_.hidden = "webkitHidden",
                            _.visibilityChange = "webkitvisibilitychange"),
                        _.autoPlay = $.proxy(_.autoPlay, _),
                        _.autoPlayClear = $.proxy(_.autoPlayClear, _),
                        _.changeSlide = $.proxy(_.changeSlide, _),
                        _.clickHandler = $.proxy(_.clickHandler, _),
                        _.selectHandler = $.proxy(_.selectHandler, _),
                        _.setPosition = $.proxy(_.setPosition, _),
                        _.swipeHandler = $.proxy(_.swipeHandler, _),
                        _.dragHandler = $.proxy(_.dragHandler, _),
                        _.keyHandler = $.proxy(_.keyHandler, _),
                        _.autoPlayIterator = $.proxy(_.autoPlayIterator, _),
                        _.instanceUid = instanceUid++,
                        _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/,
                        _.registerBreakpoints(),
                        _.init(!0),
                        _.checkResponsive(!0)
                }
                var instanceUid = 0;
                return Slick
            }(),
            Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {
                var _ = this;
                if ("boolean" == typeof index)
                    addBefore = index,
                    index = null;
                else if (0 > index || index >= _.slideCount)
                    return !1;
                _.unload(),
                    "number" == typeof index ? 0 === index && 0 === _.$slides.length ? $(markup).appendTo(_.$slideTrack) : addBefore ? $(markup).insertBefore(_.$slides.eq(index)) : $(markup).insertAfter(_.$slides.eq(index)) : addBefore === !0 ? $(markup).prependTo(_.$slideTrack) : $(markup).appendTo(_.$slideTrack),
                    _.$slides = _.$slideTrack.children(this.options.slide),
                    _.$slideTrack.children(this.options.slide).detach(),
                    _.$slideTrack.append(_.$slides),
                    _.$slides.each(function (index, element) {
                        $(element).attr("data-slick-index", index)
                    }),
                    _.$slidesCache = _.$slides,
                    _.reinit()
            },
            Slick.prototype.animateHeight = function () {
                var _ = this;
                if (1 === _.options.slidesToShow && _.options.adaptiveHeight === !0 && _.options.vertical === !1) {
                    var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(!0);
                    _.$list.animate({
                        height: targetHeight
                    }, _.options.speed)
                }
            },
            Slick.prototype.animateSlide = function (targetLeft, callback) {
                var animProps = {},
                    _ = this;
                _.animateHeight(),
                    _.options.rtl === !0 && _.options.vertical === !1 && (targetLeft = -targetLeft),
                    _.transformsEnabled === !1 ? _.options.vertical === !1 ? _.$slideTrack.animate({
                        left: targetLeft
                    }, _.options.speed, _.options.easing, callback) : _.$slideTrack.animate({
                        top: targetLeft
                    }, _.options.speed, _.options.easing, callback) : _.cssTransitions === !1 ? (_.options.rtl === !0 && (_.currentLeft = -_.currentLeft),
                        $({
                            animStart: _.currentLeft
                        }).animate({
                            animStart: targetLeft
                        }, {
                            duration: _.options.speed,
                            easing: _.options.easing,
                            step: function (now) {
                                now = Math.ceil(now),
                                    _.options.vertical === !1 ? (animProps[_.animType] = "translate(" + now + "px, 0px)",
                                        _.$slideTrack.css(animProps)) : (animProps[_.animType] = "translate(0px," + now + "px)",
                                        _.$slideTrack.css(animProps))
                            },
                            complete: function () {
                                callback && callback.call()
                            }
                        })) : (_.applyTransition(),
                        targetLeft = Math.ceil(targetLeft),
                        _.options.vertical === !1 ? animProps[_.animType] = "translate3d(" + targetLeft + "px, 0px, 0px)" : animProps[_.animType] = "translate3d(0px," + targetLeft + "px, 0px)",
                        _.$slideTrack.css(animProps),
                        callback && setTimeout(function () {
                            _.disableTransition(),
                                callback.call()
                        }, _.options.speed))
            },
            Slick.prototype.asNavFor = function (index) {
                var _ = this,
                    asNavFor = _.options.asNavFor;
                asNavFor && null !== asNavFor && (asNavFor = $(asNavFor).not(_.$slider)),
                    null !== asNavFor && "object" == typeof asNavFor && asNavFor.each(function () {
                        var target = $(this).slick("getSlick");
                        target.unslicked || target.slideHandler(index, !0)
                    })
            },
            Slick.prototype.applyTransition = function (slide) {
                var _ = this,
                    transition = {};
                _.options.fade === !1 ? transition[_.transitionType] = _.transformType + " " + _.options.speed + "ms " + _.options.cssEase : transition[_.transitionType] = "opacity " + _.options.speed + "ms " + _.options.cssEase,
                    _.options.fade === !1 ? _.$slideTrack.css(transition) : _.$slides.eq(slide).css(transition)
            },
            Slick.prototype.autoPlay = function () {
                var _ = this;
                _.autoPlayTimer && clearInterval(_.autoPlayTimer),
                    _.slideCount > _.options.slidesToShow && _.paused !== !0 && (_.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed))
            },
            Slick.prototype.autoPlayClear = function () {
                var _ = this;
                _.autoPlayTimer && clearInterval(_.autoPlayTimer)
            },
            Slick.prototype.autoPlayIterator = function () {
                var _ = this;
                _.options.infinite === !1 ? 1 === _.direction ? (_.currentSlide + 1 === _.slideCount - 1 && (_.direction = 0),
                    _.slideHandler(_.currentSlide + _.options.slidesToScroll)) : (_.currentSlide - 1 === 0 && (_.direction = 1),
                    _.slideHandler(_.currentSlide - _.options.slidesToScroll)) : _.slideHandler(_.currentSlide + _.options.slidesToScroll)
            },
            Slick.prototype.buildArrows = function () {
                var _ = this;
                _.options.arrows === !0 && (_.$prevArrow = $(_.options.prevArrow).addClass("slick-arrow"),
                    _.$nextArrow = $(_.options.nextArrow).addClass("slick-arrow"),
                    _.slideCount > _.options.slidesToShow ? (_.$prevArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),
                        _.$nextArrow.removeClass("slick-hidden").removeAttr("aria-hidden tabindex"),
                        _.htmlExpr.test(_.options.prevArrow) && _.$prevArrow.prependTo(_.options.appendArrows),
                        _.htmlExpr.test(_.options.nextArrow) && _.$nextArrow.appendTo(_.options.appendArrows),
                        _.options.infinite !== !0 && _.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true")) : _.$prevArrow.add(_.$nextArrow).addClass("slick-hidden").attr({
                        "aria-disabled": "true",
                        tabindex: "-1"
                    }))
            },
            Slick.prototype.buildDots = function () {
                var i, dotString, _ = this;
                if (_.options.dots === !0 && _.slideCount > _.options.slidesToShow) {
                    for (dotString = '<ul class="' + _.options.dotsClass + '">',
                        i = 0; i <= _.getDotCount(); i += 1)
                        dotString += "<li>" + _.options.customPaging.call(this, _, i) + "</li>";
                    dotString += "</ul>",
                        _.$dots = $(dotString).appendTo(_.options.appendDots),
                        _.$dots.find("li").first().addClass("slick-active").attr("aria-hidden", "false")
                }
            },
            Slick.prototype.buildOut = function () {
                var _ = this;
                _.$slides = _.$slider.children(_.options.slide + ":not(.slick-cloned)").addClass("slick-slide"),
                    _.slideCount = _.$slides.length,
                    _.$slides.each(function (index, element) {
                        $(element).attr("data-slick-index", index).data("originalStyling", $(element).attr("style") || "")
                    }),
                    _.$slidesCache = _.$slides,
                    _.$slider.addClass("slick-slider"),
                    _.$slideTrack = 0 === _.slideCount ? $('<div class="slick-track"/>').appendTo(_.$slider) : _.$slides.wrapAll('<div class="slick-track"/>').parent(),
                    _.$list = _.$slideTrack.wrap('<div aria-live="polite" class="slick-list"/>').parent(),
                    _.$slideTrack.css("opacity", 0),
                    (_.options.centerMode === !0 || _.options.swipeToSlide === !0) && (_.options.slidesToScroll = 1),
                    $("img[data-lazy]", _.$slider).not("[src]").addClass("slick-loading"),
                    _.setupInfinite(),
                    _.buildArrows(),
                    _.buildDots(),
                    _.updateDots(),
                    _.setSlideClasses("number" == typeof _.currentSlide ? _.currentSlide : 0),
                    _.options.draggable === !0 && _.$list.addClass("draggable")
            },
            Slick.prototype.buildRows = function () {
                var a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection, _ = this;
                if (newSlides = document.createDocumentFragment(),
                    originalSlides = _.$slider.children(),
                    _.options.rows > 1) {
                    for (slidesPerSection = _.options.slidesPerRow * _.options.rows,
                        numOfSlides = Math.ceil(originalSlides.length / slidesPerSection),
                        a = 0; numOfSlides > a; a++) {
                        var slide = document.createElement("div");
                        for (b = 0; b < _.options.rows; b++) {
                            var row = document.createElement("div");
                            for (c = 0; c < _.options.slidesPerRow; c++) {
                                var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
                                originalSlides.get(target) && row.appendChild(originalSlides.get(target))
                            }
                            slide.appendChild(row)
                        }
                        newSlides.appendChild(slide)
                    }
                    _.$slider.html(newSlides),
                        _.$slider.children().children().children().css({
                            width: 100 / _.options.slidesPerRow + "%",
                            display: "inline-block"
                        })
                }
            },
            Slick.prototype.checkResponsive = function (initial, forceUpdate) {
                var breakpoint, targetBreakpoint, respondToWidth, _ = this,
                    triggerBreakpoint = !1,
                    sliderWidth = _.$slider.width(),
                    windowWidth = window.innerWidth || $(window).width();
                if ("window" === _.respondTo ? respondToWidth = windowWidth : "slider" === _.respondTo ? respondToWidth = sliderWidth : "min" === _.respondTo && (respondToWidth = Math.min(windowWidth, sliderWidth)),
                    _.options.responsive && _.options.responsive.length && null !== _.options.responsive) {
                    targetBreakpoint = null;
                    for (breakpoint in _.breakpoints)
                        _.breakpoints.hasOwnProperty(breakpoint) && (_.originalSettings.mobileFirst === !1 ? respondToWidth < _.breakpoints[breakpoint] && (targetBreakpoint = _.breakpoints[breakpoint]) : respondToWidth > _.breakpoints[breakpoint] && (targetBreakpoint = _.breakpoints[breakpoint]));
                    null !== targetBreakpoint ? null !== _.activeBreakpoint ? (targetBreakpoint !== _.activeBreakpoint || forceUpdate) && (_.activeBreakpoint = targetBreakpoint,
                            "unslick" === _.breakpointSettings[targetBreakpoint] ? _.unslick(targetBreakpoint) : (_.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]),
                                initial === !0 && (_.currentSlide = _.options.initialSlide),
                                _.refresh(initial)),
                            triggerBreakpoint = targetBreakpoint) : (_.activeBreakpoint = targetBreakpoint,
                            "unslick" === _.breakpointSettings[targetBreakpoint] ? _.unslick(targetBreakpoint) : (_.options = $.extend({}, _.originalSettings, _.breakpointSettings[targetBreakpoint]),
                                initial === !0 && (_.currentSlide = _.options.initialSlide),
                                _.refresh(initial)),
                            triggerBreakpoint = targetBreakpoint) : null !== _.activeBreakpoint && (_.activeBreakpoint = null,
                            _.options = _.originalSettings,
                            initial === !0 && (_.currentSlide = _.options.initialSlide),
                            _.refresh(initial),
                            triggerBreakpoint = targetBreakpoint),
                        initial || triggerBreakpoint === !1 || _.$slider.trigger("breakpoint", [_, triggerBreakpoint])
                }
            },
            Slick.prototype.changeSlide = function (event, dontAnimate) {
                var indexOffset, slideOffset, unevenOffset, _ = this,
                    $target = $(event.target);
                switch ($target.is("a") && event.preventDefault(),
                    $target.is("li") || ($target = $target.closest("li")),
                    unevenOffset = _.slideCount % _.options.slidesToScroll !== 0,
                    indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll,
                    event.data.message) {
                    case "previous":
                        slideOffset = 0 === indexOffset ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset,
                            _.slideCount > _.options.slidesToShow && _.slideHandler(_.currentSlide - slideOffset, !1, dontAnimate);
                        break;
                    case "next":
                        slideOffset = 0 === indexOffset ? _.options.slidesToScroll : indexOffset,
                            _.slideCount > _.options.slidesToShow && _.slideHandler(_.currentSlide + slideOffset, !1, dontAnimate);
                        break;
                    case "index":
                        var index = 0 === event.data.index ? 0 : event.data.index || $target.index() * _.options.slidesToScroll;
                        _.slideHandler(_.checkNavigable(index), !1, dontAnimate),
                            $target.children().trigger("focus");
                        break;
                    default:
                        return
                }
            },
            Slick.prototype.checkNavigable = function (index) {
                var navigables, prevNavigable, _ = this;
                if (navigables = _.getNavigableIndexes(),
                    prevNavigable = 0,
                    index > navigables[navigables.length - 1])
                    index = navigables[navigables.length - 1];
                else
                    for (var n in navigables) {
                        if (index < navigables[n]) {
                            index = prevNavigable;
                            break
                        }
                        prevNavigable = navigables[n]
                    }
                return index
            },
            Slick.prototype.cleanUpEvents = function () {
                var _ = this;
                _.options.dots && null !== _.$dots && ($("li", _.$dots).off("click.slick", _.changeSlide),
                        _.options.pauseOnDotsHover === !0 && _.options.autoplay === !0 && $("li", _.$dots).off("mouseenter.slick", $.proxy(_.setPaused, _, !0)).off("mouseleave.slick", $.proxy(_.setPaused, _, !1))),
                    _.options.arrows === !0 && _.slideCount > _.options.slidesToShow && (_.$prevArrow && _.$prevArrow.off("click.slick", _.changeSlide),
                        _.$nextArrow && _.$nextArrow.off("click.slick", _.changeSlide)),
                    _.$list.off("touchstart.slick mousedown.slick", _.swipeHandler),
                    _.$list.off("touchmove.slick mousemove.slick", _.swipeHandler),
                    _.$list.off("touchend.slick mouseup.slick", _.swipeHandler),
                    _.$list.off("touchcancel.slick mouseleave.slick", _.swipeHandler),
                    _.$list.off("click.slick", _.clickHandler),
                    $(document).off(_.visibilityChange, _.visibility),
                    _.$list.off("mouseenter.slick", $.proxy(_.setPaused, _, !0)),
                    _.$list.off("mouseleave.slick", $.proxy(_.setPaused, _, !1)),
                    _.options.accessibility === !0 && _.$list.off("keydown.slick", _.keyHandler),
                    _.options.focusOnSelect === !0 && $(_.$slideTrack).children().off("click.slick", _.selectHandler),
                    $(window).off("orientationchange.slick.slick-" + _.instanceUid, _.orientationChange),
                    $(window).off("resize.slick.slick-" + _.instanceUid, _.resize),
                    $("[draggable!=true]", _.$slideTrack).off("dragstart", _.preventDefault),
                    $(window).off("load.slick.slick-" + _.instanceUid, _.setPosition),
                    $(document).off("ready.slick.slick-" + _.instanceUid, _.setPosition)
            },
            Slick.prototype.cleanUpRows = function () {
                var originalSlides, _ = this;
                _.options.rows > 1 && (originalSlides = _.$slides.children().children(),
                    originalSlides.removeAttr("style"),
                    _.$slider.html(originalSlides))
            },
            Slick.prototype.clickHandler = function (event) {
                var _ = this;
                _.shouldClick === !1 && (event.stopImmediatePropagation(),
                    event.stopPropagation(),
                    event.preventDefault())
            },
            Slick.prototype.destroy = function (refresh) {
                var _ = this;
                _.autoPlayClear(),
                    _.touchObject = {},
                    _.cleanUpEvents(),
                    $(".slick-cloned", _.$slider).detach(),
                    _.$dots && _.$dots.remove(),
                    _.options.arrows === !0 && (_.$prevArrow && _.$prevArrow.length && (_.$prevArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""),
                            _.htmlExpr.test(_.options.prevArrow) && _.$prevArrow.remove()),
                        _.$nextArrow && _.$nextArrow.length && (_.$nextArrow.removeClass("slick-disabled slick-arrow slick-hidden").removeAttr("aria-hidden aria-disabled tabindex").css("display", ""),
                            _.htmlExpr.test(_.options.nextArrow) && _.$nextArrow.remove())),
                    _.$slides && (_.$slides.removeClass("slick-slide slick-active slick-center slick-visible slick-current").removeAttr("aria-hidden").removeAttr("data-slick-index").each(function () {
                            $(this).attr("style", $(this).data("originalStyling"))
                        }),
                        _.$slideTrack.children(this.options.slide).detach(),
                        _.$slideTrack.detach(),
                        _.$list.detach(),
                        _.$slider.append(_.$slides)),
                    _.cleanUpRows(),
                    _.$slider.removeClass("slick-slider"),
                    _.$slider.removeClass("slick-initialized"),
                    _.unslicked = !0,
                    refresh || _.$slider.trigger("destroy", [_])
            },
            Slick.prototype.disableTransition = function (slide) {
                var _ = this,
                    transition = {};
                transition[_.transitionType] = "",
                    _.options.fade === !1 ? _.$slideTrack.css(transition) : _.$slides.eq(slide).css(transition)
            },
            Slick.prototype.fadeSlide = function (slideIndex, callback) {
                var _ = this;
                _.cssTransitions === !1 ? (_.$slides.eq(slideIndex).css({
                        zIndex: _.options.zIndex
                    }),
                    _.$slides.eq(slideIndex).animate({
                        opacity: 1
                    }, _.options.speed, _.options.easing, callback)) : (_.applyTransition(slideIndex),
                    _.$slides.eq(slideIndex).css({
                        opacity: 1,
                        zIndex: _.options.zIndex
                    }),
                    callback && setTimeout(function () {
                        _.disableTransition(slideIndex),
                            callback.call()
                    }, _.options.speed))
            },
            Slick.prototype.fadeSlideOut = function (slideIndex) {
                var _ = this;
                _.cssTransitions === !1 ? _.$slides.eq(slideIndex).animate({
                    opacity: 0,
                    zIndex: _.options.zIndex - 2
                }, _.options.speed, _.options.easing) : (_.applyTransition(slideIndex),
                    _.$slides.eq(slideIndex).css({
                        opacity: 0,
                        zIndex: _.options.zIndex - 2
                    }))
            },
            Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {
                var _ = this;
                null !== filter && (_.unload(),
                    _.$slideTrack.children(this.options.slide).detach(),
                    _.$slidesCache.filter(filter).appendTo(_.$slideTrack),
                    _.reinit())
            },
            Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {
                var _ = this;
                return _.currentSlide
            },
            Slick.prototype.getDotCount = function () {
                var _ = this,
                    breakPoint = 0,
                    counter = 0,
                    pagerQty = 0;
                if (_.options.infinite === !0)
                    for (; breakPoint < _.slideCount;)
                        ++pagerQty,
                        breakPoint = counter + _.options.slidesToShow,
                        counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                else if (_.options.centerMode === !0)
                    pagerQty = _.slideCount;
                else
                    for (; breakPoint < _.slideCount;)
                        ++pagerQty,
                        breakPoint = counter + _.options.slidesToShow,
                        counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                return pagerQty - 1
            },
            Slick.prototype.getLeft = function (slideIndex) {
                var targetLeft, verticalHeight, targetSlide, _ = this,
                    verticalOffset = 0;
                return _.slideOffset = 0,
                    verticalHeight = _.$slides.first().outerHeight(!0),
                    _.options.infinite === !0 ? (_.slideCount > _.options.slidesToShow && (_.slideOffset = _.slideWidth * _.options.slidesToShow * -1,
                            verticalOffset = verticalHeight * _.options.slidesToShow * -1),
                        _.slideCount % _.options.slidesToScroll !== 0 && slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow && (slideIndex > _.slideCount ? (_.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1,
                            verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1) : (_.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1,
                            verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1))) : slideIndex + _.options.slidesToShow > _.slideCount && (_.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth,
                        verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight),
                    _.slideCount <= _.options.slidesToShow && (_.slideOffset = 0,
                        verticalOffset = 0),
                    _.options.centerMode === !0 && _.options.infinite === !0 ? _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth : _.options.centerMode === !0 && (_.slideOffset = 0,
                        _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2)),
                    targetLeft = _.options.vertical === !1 ? slideIndex * _.slideWidth * -1 + _.slideOffset : slideIndex * verticalHeight * -1 + verticalOffset,
                    _.options.variableWidth === !0 && (targetSlide = _.slideCount <= _.options.slidesToShow || _.options.infinite === !1 ? _.$slideTrack.children(".slick-slide").eq(slideIndex) : _.$slideTrack.children(".slick-slide").eq(slideIndex + _.options.slidesToShow),
                        targetLeft = targetSlide[0] ? -1 * targetSlide[0].offsetLeft : 0,
                        _.options.centerMode === !0 && (targetSlide = _.options.infinite === !1 ? _.$slideTrack.children(".slick-slide").eq(slideIndex) : _.$slideTrack.children(".slick-slide").eq(slideIndex + _.options.slidesToShow + 1),
                            targetLeft = targetSlide[0] ? -1 * targetSlide[0].offsetLeft : 0,
                            targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2)),
                    targetLeft
            },
            Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {
                var _ = this;
                return _.options[option]
            },
            Slick.prototype.getNavigableIndexes = function () {
                var max, _ = this,
                    breakPoint = 0,
                    counter = 0,
                    indexes = [];
                for (_.options.infinite === !1 ? max = _.slideCount : (breakPoint = -1 * _.options.slidesToScroll,
                        counter = -1 * _.options.slidesToScroll,
                        max = 2 * _.slideCount); max > breakPoint;)
                    indexes.push(breakPoint),
                    breakPoint = counter + _.options.slidesToScroll,
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                return indexes
            },
            Slick.prototype.getSlick = function () {
                return this
            },
            Slick.prototype.getSlideCount = function () {
                var slidesTraversed, swipedSlide, centerOffset, _ = this;
                return centerOffset = _.options.centerMode === !0 ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0,
                    _.options.swipeToSlide === !0 ? (_.$slideTrack.find(".slick-slide").each(function (index, slide) {
                            return slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > -1 * _.swipeLeft ? (swipedSlide = slide,
                                !1) : void 0
                        }),
                        slidesTraversed = Math.abs($(swipedSlide).attr("data-slick-index") - _.currentSlide) || 1) : _.options.slidesToScroll
            },
            Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {
                var _ = this;
                _.changeSlide({
                    data: {
                        message: "index",
                        index: parseInt(slide)
                    }
                }, dontAnimate)
            },
            Slick.prototype.init = function (creation) {
                var _ = this;
                $(_.$slider).hasClass("slick-initialized") || ($(_.$slider).addClass("slick-initialized"),
                        _.buildRows(),
                        _.buildOut(),
                        _.setProps(),
                        _.startLoad(),
                        _.loadSlider(),
                        _.initializeEvents(),
                        _.updateArrows(),
                        _.updateDots()),
                    creation && _.$slider.trigger("init", [_]),
                    _.options.accessibility === !0 && _.initADA()
            },
            Slick.prototype.initArrowEvents = function () {
                var _ = this;
                _.options.arrows === !0 && _.slideCount > _.options.slidesToShow && (_.$prevArrow.on("click.slick", {
                        message: "previous"
                    }, _.changeSlide),
                    _.$nextArrow.on("click.slick", {
                        message: "next"
                    }, _.changeSlide))
            },
            Slick.prototype.initDotEvents = function () {
                var _ = this;
                _.options.dots === !0 && _.slideCount > _.options.slidesToShow && $("li", _.$dots).on("click.slick", {
                        message: "index"
                    }, _.changeSlide),
                    _.options.dots === !0 && _.options.pauseOnDotsHover === !0 && _.options.autoplay === !0 && $("li", _.$dots).on("mouseenter.slick", $.proxy(_.setPaused, _, !0)).on("mouseleave.slick", $.proxy(_.setPaused, _, !1))
            },
            Slick.prototype.initializeEvents = function () {
                var _ = this;
                _.initArrowEvents(),
                    _.initDotEvents(),
                    _.$list.on("touchstart.slick mousedown.slick", {
                        action: "start"
                    }, _.swipeHandler),
                    _.$list.on("touchmove.slick mousemove.slick", {
                        action: "move"
                    }, _.swipeHandler),
                    _.$list.on("touchend.slick mouseup.slick", {
                        action: "end"
                    }, _.swipeHandler),
                    _.$list.on("touchcancel.slick mouseleave.slick", {
                        action: "end"
                    }, _.swipeHandler),
                    _.$list.on("click.slick", _.clickHandler),
                    $(document).on(_.visibilityChange, $.proxy(_.visibility, _)),
                    _.$list.on("mouseenter.slick", $.proxy(_.setPaused, _, !0)),
                    _.$list.on("mouseleave.slick", $.proxy(_.setPaused, _, !1)),
                    _.options.accessibility === !0 && _.$list.on("keydown.slick", _.keyHandler),
                    _.options.focusOnSelect === !0 && $(_.$slideTrack).children().on("click.slick", _.selectHandler),
                    $(window).on("orientationchange.slick.slick-" + _.instanceUid, $.proxy(_.orientationChange, _)),
                    $(window).on("resize.slick.slick-" + _.instanceUid, $.proxy(_.resize, _)),
                    $("[draggable!=true]", _.$slideTrack).on("dragstart", _.preventDefault),
                    $(window).on("load.slick.slick-" + _.instanceUid, _.setPosition),
                    $(document).on("ready.slick.slick-" + _.instanceUid, _.setPosition)
            },
            Slick.prototype.initUI = function () {
                var _ = this;
                _.options.arrows === !0 && _.slideCount > _.options.slidesToShow && (_.$prevArrow.show(),
                        _.$nextArrow.show()),
                    _.options.dots === !0 && _.slideCount > _.options.slidesToShow && _.$dots.show(),
                    _.options.autoplay === !0 && _.autoPlay()
            },
            Slick.prototype.keyHandler = function (event) {
                var _ = this;
                event.target.tagName.match("TEXTAREA|INPUT|SELECT") || (37 === event.keyCode && _.options.accessibility === !0 ? _.changeSlide({
                    data: {
                        message: "previous"
                    }
                }) : 39 === event.keyCode && _.options.accessibility === !0 && _.changeSlide({
                    data: {
                        message: "next"
                    }
                }))
            },
            Slick.prototype.lazyLoad = function () {
                function loadImages(imagesScope) {
                    $("img[data-lazy]", imagesScope).each(function () {
                        var image = $(this),
                            imageSource = $(this).attr("data-lazy"),
                            imageToLoad = document.createElement("img");
                        imageToLoad.onload = function () {
                                image.animate({
                                    opacity: 0
                                }, 100, function () {
                                    image.attr("src", imageSource).animate({
                                        opacity: 1
                                    }, 200, function () {
                                        image.removeAttr("data-lazy").removeClass("slick-loading")
                                    })
                                })
                            },
                            imageToLoad.src = imageSource
                    })
                }
                var loadRange, cloneRange, rangeStart, rangeEnd, _ = this;
                _.options.centerMode === !0 ? _.options.infinite === !0 ? (rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1),
                        rangeEnd = rangeStart + _.options.slidesToShow + 2) : (rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1)),
                        rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide) : (rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide,
                        rangeEnd = rangeStart + _.options.slidesToShow,
                        _.options.fade === !0 && (rangeStart > 0 && rangeStart--,
                            rangeEnd <= _.slideCount && rangeEnd++)),
                    loadRange = _.$slider.find(".slick-slide").slice(rangeStart, rangeEnd),
                    loadImages(loadRange),
                    _.slideCount <= _.options.slidesToShow ? (cloneRange = _.$slider.find(".slick-slide"),
                        loadImages(cloneRange)) : _.currentSlide >= _.slideCount - _.options.slidesToShow ? (cloneRange = _.$slider.find(".slick-cloned").slice(0, _.options.slidesToShow),
                        loadImages(cloneRange)) : 0 === _.currentSlide && (cloneRange = _.$slider.find(".slick-cloned").slice(-1 * _.options.slidesToShow),
                        loadImages(cloneRange))
            },
            Slick.prototype.loadSlider = function () {
                var _ = this;
                _.setPosition(),
                    _.$slideTrack.css({
                        opacity: 1
                    }),
                    _.$slider.removeClass("slick-loading"),
                    _.initUI(),
                    "progressive" === _.options.lazyLoad && _.progressiveLazyLoad()
            },
            Slick.prototype.next = Slick.prototype.slickNext = function () {
                var _ = this;
                _.changeSlide({
                    data: {
                        message: "next"
                    }
                })
            },
            Slick.prototype.orientationChange = function () {
                var _ = this;
                _.checkResponsive(),
                    _.setPosition()
            },
            Slick.prototype.pause = Slick.prototype.slickPause = function () {
                var _ = this;
                _.autoPlayClear(),
                    _.paused = !0
            },
            Slick.prototype.play = Slick.prototype.slickPlay = function () {
                var _ = this;
                _.paused = !1,
                    _.autoPlay()
            },
            Slick.prototype.postSlide = function (index) {
                var _ = this;
                _.$slider.trigger("afterChange", [_, index]),
                    _.animating = !1,
                    _.setPosition(),
                    _.swipeLeft = null,
                    _.options.autoplay === !0 && _.paused === !1 && _.autoPlay(),
                    _.options.accessibility === !0 && _.initADA()
            },
            Slick.prototype.prev = Slick.prototype.slickPrev = function () {
                var _ = this;
                _.changeSlide({
                    data: {
                        message: "previous"
                    }
                })
            },
            Slick.prototype.preventDefault = function (e) {
                e.preventDefault()
            },
            Slick.prototype.progressiveLazyLoad = function () {
                var imgCount, targetImage, _ = this;
                imgCount = $("img[data-lazy]", _.$slider).length,
                    imgCount > 0 && (targetImage = $("img[data-lazy]", _.$slider).first(),
                        targetImage.attr("src", targetImage.attr("data-lazy")).removeClass("slick-loading").load(function () {
                            targetImage.removeAttr("data-lazy"),
                                _.progressiveLazyLoad(),
                                _.options.adaptiveHeight === !0 && _.setPosition()
                        }).error(function () {
                            targetImage.removeAttr("data-lazy"),
                                _.progressiveLazyLoad()
                        }))
            },
            Slick.prototype.refresh = function (initializing) {
                var _ = this,
                    currentSlide = _.currentSlide;
                _.destroy(!0),
                    $.extend(_, _.initials, {
                        currentSlide: currentSlide
                    }),
                    _.init(),
                    initializing || _.changeSlide({
                        data: {
                            message: "index",
                            index: currentSlide
                        }
                    }, !1)
            },
            Slick.prototype.registerBreakpoints = function () {
                var breakpoint, currentBreakpoint, l, _ = this,
                    responsiveSettings = _.options.responsive || null;
                if ("array" === $.type(responsiveSettings) && responsiveSettings.length) {
                    _.respondTo = _.options.respondTo || "window";
                    for (breakpoint in responsiveSettings)
                        if (l = _.breakpoints.length - 1,
                            currentBreakpoint = responsiveSettings[breakpoint].breakpoint,
                            responsiveSettings.hasOwnProperty(breakpoint)) {
                            for (; l >= 0;)
                                _.breakpoints[l] && _.breakpoints[l] === currentBreakpoint && _.breakpoints.splice(l, 1),
                                l--;
                            _.breakpoints.push(currentBreakpoint),
                                _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings
                        }
                    _.breakpoints.sort(function (a, b) {
                        return _.options.mobileFirst ? a - b : b - a
                    })
                }
            },
            Slick.prototype.reinit = function () {
                var _ = this;
                _.$slides = _.$slideTrack.children(_.options.slide).addClass("slick-slide"),
                    _.slideCount = _.$slides.length,
                    _.currentSlide >= _.slideCount && 0 !== _.currentSlide && (_.currentSlide = _.currentSlide - _.options.slidesToScroll),
                    _.slideCount <= _.options.slidesToShow && (_.currentSlide = 0),
                    _.registerBreakpoints(),
                    _.setProps(),
                    _.setupInfinite(),
                    _.buildArrows(),
                    _.updateArrows(),
                    _.initArrowEvents(),
                    _.buildDots(),
                    _.updateDots(),
                    _.initDotEvents(),
                    _.checkResponsive(!1, !0),
                    _.options.focusOnSelect === !0 && $(_.$slideTrack).children().on("click.slick", _.selectHandler),
                    _.setSlideClasses(0),
                    _.setPosition(),
                    _.$slider.trigger("reInit", [_]),
                    _.options.autoplay === !0 && _.focusHandler()
            },
            Slick.prototype.resize = function () {
                var _ = this;
                $(window).width() !== _.windowWidth && (clearTimeout(_.windowDelay),
                    _.windowDelay = window.setTimeout(function () {
                        _.windowWidth = $(window).width(),
                            _.checkResponsive(),
                            _.unslicked || _.setPosition()
                    }, 50))
            },
            Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {
                var _ = this;
                return "boolean" == typeof index ? (removeBefore = index,
                        index = removeBefore === !0 ? 0 : _.slideCount - 1) : index = removeBefore === !0 ? --index : index,
                    _.slideCount < 1 || 0 > index || index > _.slideCount - 1 ? !1 : (_.unload(),
                        removeAll === !0 ? _.$slideTrack.children().remove() : _.$slideTrack.children(this.options.slide).eq(index).remove(),
                        _.$slides = _.$slideTrack.children(this.options.slide),
                        _.$slideTrack.children(this.options.slide).detach(),
                        _.$slideTrack.append(_.$slides),
                        _.$slidesCache = _.$slides,
                        void _.reinit())
            },
            Slick.prototype.setCSS = function (position) {
                var x, y, _ = this,
                    positionProps = {};
                _.options.rtl === !0 && (position = -position),
                    x = "left" == _.positionProp ? Math.ceil(position) + "px" : "0px",
                    y = "top" == _.positionProp ? Math.ceil(position) + "px" : "0px",
                    positionProps[_.positionProp] = position,
                    _.transformsEnabled === !1 ? _.$slideTrack.css(positionProps) : (positionProps = {},
                        _.cssTransitions === !1 ? (positionProps[_.animType] = "translate(" + x + ", " + y + ")",
                            _.$slideTrack.css(positionProps)) : (positionProps[_.animType] = "translate3d(" + x + ", " + y + ", 0px)",
                            _.$slideTrack.css(positionProps)))
            },
            Slick.prototype.setDimensions = function () {
                var _ = this;
                _.options.vertical === !1 ? _.options.centerMode === !0 && _.$list.css({
                        padding: "0px " + _.options.centerPadding
                    }) : (_.$list.height(_.$slides.first().outerHeight(!0) * _.options.slidesToShow),
                        _.options.centerMode === !0 && _.$list.css({
                            padding: _.options.centerPadding + " 0px"
                        })),
                    _.listWidth = _.$list.width(),
                    _.listHeight = _.$list.height(),
                    _.options.vertical === !1 && _.options.variableWidth === !1 ? (_.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow),
                        _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children(".slick-slide").length))) : _.options.variableWidth === !0 ? _.$slideTrack.width(5e3 * _.slideCount) : (_.slideWidth = Math.ceil(_.listWidth),
                        _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(!0) * _.$slideTrack.children(".slick-slide").length)));
                var offset = _.$slides.first().outerWidth(!0) - _.$slides.first().width();
                _.options.variableWidth === !1 && _.$slideTrack.children(".slick-slide").width(_.slideWidth - offset)
            },
            Slick.prototype.setFade = function () {
                var targetLeft, _ = this;
                _.$slides.each(function (index, element) {
                        targetLeft = _.slideWidth * index * -1,
                            _.options.rtl === !0 ? $(element).css({
                                position: "relative",
                                right: targetLeft,
                                top: 0,
                                zIndex: _.options.zIndex - 2,
                                opacity: 0
                            }) : $(element).css({
                                position: "relative",
                                left: targetLeft,
                                top: 0,
                                zIndex: _.options.zIndex - 2,
                                opacity: 0
                            })
                    }),
                    _.$slides.eq(_.currentSlide).css({
                        zIndex: _.options.zIndex - 1,
                        opacity: 1
                    })
            },
            Slick.prototype.setHeight = function () {
                var _ = this;
                if (1 === _.options.slidesToShow && _.options.adaptiveHeight === !0 && _.options.vertical === !1) {
                    var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(!0);
                    _.$list.css("height", targetHeight)
                }
            },
            Slick.prototype.setOption = Slick.prototype.slickSetOption = function (option, value, refresh) {
                var l, item, _ = this;
                if ("responsive" === option && "array" === $.type(value))
                    for (item in value)
                        if ("array" !== $.type(_.options.responsive))
                            _.options.responsive = [value[item]];
                        else {
                            for (l = _.options.responsive.length - 1; l >= 0;)
                                _.options.responsive[l].breakpoint === value[item].breakpoint && _.options.responsive.splice(l, 1),
                                l--;
                            _.options.responsive.push(value[item])
                        }
                else
                    _.options[option] = value;
                refresh === !0 && (_.unload(),
                    _.reinit())
            },
            Slick.prototype.setPosition = function () {
                var _ = this;
                _.setDimensions(),
                    _.setHeight(),
                    _.options.fade === !1 ? _.setCSS(_.getLeft(_.currentSlide)) : _.setFade(),
                    _.$slider.trigger("setPosition", [_])
            },
            Slick.prototype.setProps = function () {
                var _ = this,
                    bodyStyle = document.body.style;
                _.positionProp = _.options.vertical === !0 ? "top" : "left",
                    "top" === _.positionProp ? _.$slider.addClass("slick-vertical") : _.$slider.removeClass("slick-vertical"),
                    (void 0 !== bodyStyle.WebkitTransition || void 0 !== bodyStyle.MozTransition || void 0 !== bodyStyle.msTransition) && _.options.useCSS === !0 && (_.cssTransitions = !0),
                    _.options.fade && ("number" == typeof _.options.zIndex ? _.options.zIndex < 3 && (_.options.zIndex = 3) : _.options.zIndex = _.defaults.zIndex),
                    void 0 !== bodyStyle.OTransform && (_.animType = "OTransform",
                        _.transformType = "-o-transform",
                        _.transitionType = "OTransition",
                        void 0 === bodyStyle.perspectiveProperty && void 0 === bodyStyle.webkitPerspective && (_.animType = !1)),
                    void 0 !== bodyStyle.MozTransform && (_.animType = "MozTransform",
                        _.transformType = "-moz-transform",
                        _.transitionType = "MozTransition",
                        void 0 === bodyStyle.perspectiveProperty && void 0 === bodyStyle.MozPerspective && (_.animType = !1)),
                    void 0 !== bodyStyle.webkitTransform && (_.animType = "webkitTransform",
                        _.transformType = "-webkit-transform",
                        _.transitionType = "webkitTransition",
                        void 0 === bodyStyle.perspectiveProperty && void 0 === bodyStyle.webkitPerspective && (_.animType = !1)),
                    void 0 !== bodyStyle.msTransform && (_.animType = "msTransform",
                        _.transformType = "-ms-transform",
                        _.transitionType = "msTransition",
                        void 0 === bodyStyle.msTransform && (_.animType = !1)),
                    void 0 !== bodyStyle.transform && _.animType !== !1 && (_.animType = "transform",
                        _.transformType = "transform",
                        _.transitionType = "transition"),
                    _.transformsEnabled = null !== _.animType && _.animType !== !1
            },
            Slick.prototype.setSlideClasses = function (index) {
                var centerOffset, allSlides, indexOffset, remainder, _ = this;
                allSlides = _.$slider.find(".slick-slide").removeClass("slick-active slick-center slick-current").attr("aria-hidden", "true"),
                    _.$slides.eq(index).addClass("slick-current"),
                    _.options.centerMode === !0 ? (centerOffset = Math.floor(_.options.slidesToShow / 2),
                        _.options.infinite === !0 && (index >= centerOffset && index <= _.slideCount - 1 - centerOffset ? _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass("slick-active").attr("aria-hidden", "false") : (indexOffset = _.options.slidesToShow + index,
                                allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass("slick-active").attr("aria-hidden", "false")),
                            0 === index ? allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass("slick-center") : index === _.slideCount - 1 && allSlides.eq(_.options.slidesToShow).addClass("slick-center")),
                        _.$slides.eq(index).addClass("slick-center")) : index >= 0 && index <= _.slideCount - _.options.slidesToShow ? _.$slides.slice(index, index + _.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false") : allSlides.length <= _.options.slidesToShow ? allSlides.addClass("slick-active").attr("aria-hidden", "false") : (remainder = _.slideCount % _.options.slidesToShow,
                        indexOffset = _.options.infinite === !0 ? _.options.slidesToShow + index : index,
                        _.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow ? allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass("slick-active").attr("aria-hidden", "false") : allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass("slick-active").attr("aria-hidden", "false")),
                    "ondemand" === _.options.lazyLoad && _.lazyLoad()
            },
            Slick.prototype.setupInfinite = function () {
                var i, slideIndex, infiniteCount, _ = this;
                if (_.options.fade === !0 && (_.options.centerMode = !1),
                    _.options.infinite === !0 && _.options.fade === !1 && (slideIndex = null,
                        _.slideCount > _.options.slidesToShow)) {
                    for (infiniteCount = _.options.centerMode === !0 ? _.options.slidesToShow + 1 : _.options.slidesToShow,
                        i = _.slideCount; i > _.slideCount - infiniteCount; i -= 1)
                        slideIndex = i - 1,
                        $(_.$slides[slideIndex]).clone(!0).attr("id", "").attr("data-slick-index", slideIndex - _.slideCount).prependTo(_.$slideTrack).addClass("slick-cloned");
                    for (i = 0; infiniteCount > i; i += 1)
                        slideIndex = i,
                        $(_.$slides[slideIndex]).clone(!0).attr("id", "").attr("data-slick-index", slideIndex + _.slideCount).appendTo(_.$slideTrack).addClass("slick-cloned");
                    _.$slideTrack.find(".slick-cloned").find("[id]").each(function () {
                        $(this).attr("id", "")
                    })
                }
            },
            Slick.prototype.setPaused = function (paused) {
                var _ = this;
                _.options.autoplay === !0 && _.options.pauseOnHover === !0 && (_.paused = paused,
                    paused ? _.autoPlayClear() : _.autoPlay())
            },
            Slick.prototype.selectHandler = function (event) {
                var _ = this,
                    targetElement = $(event.target).is(".slick-slide") ? $(event.target) : $(event.target).parents(".slick-slide"),
                    index = parseInt(targetElement.attr("data-slick-index"));
                return index || (index = 0),
                    _.slideCount <= _.options.slidesToShow ? (_.setSlideClasses(index),
                        void _.asNavFor(index)) : void _.slideHandler(index)
            },
            Slick.prototype.slideHandler = function (index, sync, dontAnimate) {
                var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
                    _ = this;
                return sync = sync || !1,
                    _.animating === !0 && _.options.waitForAnimate === !0 || _.options.fade === !0 && _.currentSlide === index || _.slideCount <= _.options.slidesToShow ? void 0 : (sync === !1 && _.asNavFor(index),
                        targetSlide = index,
                        targetLeft = _.getLeft(targetSlide),
                        slideLeft = _.getLeft(_.currentSlide),
                        _.currentLeft = null === _.swipeLeft ? slideLeft : _.swipeLeft,
                        _.options.infinite === !1 && _.options.centerMode === !1 && (0 > index || index > _.getDotCount() * _.options.slidesToScroll) ? void(_.options.fade === !1 && (targetSlide = _.currentSlide,
                            dontAnimate !== !0 ? _.animateSlide(slideLeft, function () {
                                _.postSlide(targetSlide)
                            }) : _.postSlide(targetSlide))) : _.options.infinite === !1 && _.options.centerMode === !0 && (0 > index || index > _.slideCount - _.options.slidesToScroll) ? void(_.options.fade === !1 && (targetSlide = _.currentSlide,
                            dontAnimate !== !0 ? _.animateSlide(slideLeft, function () {
                                _.postSlide(targetSlide)
                            }) : _.postSlide(targetSlide))) : (_.options.autoplay === !0 && clearInterval(_.autoPlayTimer),
                            animSlide = 0 > targetSlide ? _.slideCount % _.options.slidesToScroll !== 0 ? _.slideCount - _.slideCount % _.options.slidesToScroll : _.slideCount + targetSlide : targetSlide >= _.slideCount ? _.slideCount % _.options.slidesToScroll !== 0 ? 0 : targetSlide - _.slideCount : targetSlide,
                            _.animating = !0,
                            _.$slider.trigger("beforeChange", [_, _.currentSlide, animSlide]),
                            oldSlide = _.currentSlide,
                            _.currentSlide = animSlide,
                            _.setSlideClasses(_.currentSlide),
                            _.updateDots(),
                            _.updateArrows(),
                            _.options.fade === !0 ? (dontAnimate !== !0 ? (_.fadeSlideOut(oldSlide),
                                    _.fadeSlide(animSlide, function () {
                                        _.postSlide(animSlide)
                                    })) : _.postSlide(animSlide),
                                void _.animateHeight()) : void(dontAnimate !== !0 ? _.animateSlide(targetLeft, function () {
                                _.postSlide(animSlide)
                            }) : _.postSlide(animSlide))))
            },
            Slick.prototype.startLoad = function () {
                var _ = this;
                _.options.arrows === !0 && _.slideCount > _.options.slidesToShow && (_.$prevArrow.hide(),
                        _.$nextArrow.hide()),
                    _.options.dots === !0 && _.slideCount > _.options.slidesToShow && _.$dots.hide(),
                    _.$slider.addClass("slick-loading")
            },
            Slick.prototype.swipeDirection = function () {
                var xDist, yDist, r, swipeAngle, _ = this;
                return xDist = _.touchObject.startX - _.touchObject.curX,
                    yDist = _.touchObject.startY - _.touchObject.curY,
                    r = Math.atan2(yDist, xDist),
                    swipeAngle = Math.round(180 * r / Math.PI),
                    0 > swipeAngle && (swipeAngle = 360 - Math.abs(swipeAngle)),
                    45 >= swipeAngle && swipeAngle >= 0 ? _.options.rtl === !1 ? "left" : "right" : 360 >= swipeAngle && swipeAngle >= 315 ? _.options.rtl === !1 ? "left" : "right" : swipeAngle >= 135 && 225 >= swipeAngle ? _.options.rtl === !1 ? "right" : "left" : _.options.verticalSwiping === !0 ? swipeAngle >= 35 && 135 >= swipeAngle ? "left" : "right" : "vertical"
            },
            Slick.prototype.swipeEnd = function (event) {
                var slideCount, _ = this;
                if (_.dragging = !1,
                    _.shouldClick = _.touchObject.swipeLength > 10 ? !1 : !0,
                    void 0 === _.touchObject.curX)
                    return !1;
                if (_.touchObject.edgeHit === !0 && _.$slider.trigger("edge", [_, _.swipeDirection()]),
                    _.touchObject.swipeLength >= _.touchObject.minSwipe)
                    switch (_.swipeDirection()) {
                        case "left":
                            slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount(),
                                _.slideHandler(slideCount),
                                _.currentDirection = 0,
                                _.touchObject = {},
                                _.$slider.trigger("swipe", [_, "left"]);
                            break;
                        case "right":
                            slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount(),
                                _.slideHandler(slideCount),
                                _.currentDirection = 1,
                                _.touchObject = {},
                                _.$slider.trigger("swipe", [_, "right"])
                    }
                else
                    _.touchObject.startX !== _.touchObject.curX && (_.slideHandler(_.currentSlide),
                        _.touchObject = {})
            },
            Slick.prototype.swipeHandler = function (event) {
                var _ = this;
                if (!(_.options.swipe === !1 || "ontouchend" in document && _.options.swipe === !1 || _.options.draggable === !1 && -1 !== event.type.indexOf("mouse")))
                    switch (_.touchObject.fingerCount = event.originalEvent && void 0 !== event.originalEvent.touches ? event.originalEvent.touches.length : 1,
                        _.touchObject.minSwipe = _.listWidth / _.options.touchThreshold,
                        _.options.verticalSwiping === !0 && (_.touchObject.minSwipe = _.listHeight / _.options.touchThreshold),
                        event.data.action) {
                        case "start":
                            _.swipeStart(event);
                            break;
                        case "move":
                            _.swipeMove(event);
                            break;
                        case "end":
                            _.swipeEnd(event)
                    }
            },
            Slick.prototype.swipeMove = function (event) {
                var curLeft, swipeDirection, swipeLength, positionOffset, touches, _ = this;
                return touches = void 0 !== event.originalEvent ? event.originalEvent.touches : null,
                    !_.dragging || touches && 1 !== touches.length ? !1 : (curLeft = _.getLeft(_.currentSlide),
                        _.touchObject.curX = void 0 !== touches ? touches[0].pageX : event.clientX,
                        _.touchObject.curY = void 0 !== touches ? touches[0].pageY : event.clientY,
                        _.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curX - _.touchObject.startX, 2))),
                        _.options.verticalSwiping === !0 && (_.touchObject.swipeLength = Math.round(Math.sqrt(Math.pow(_.touchObject.curY - _.touchObject.startY, 2)))),
                        swipeDirection = _.swipeDirection(),
                        "vertical" !== swipeDirection ? (void 0 !== event.originalEvent && _.touchObject.swipeLength > 4 && event.preventDefault(),
                            positionOffset = (_.options.rtl === !1 ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1),
                            _.options.verticalSwiping === !0 && (positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1),
                            swipeLength = _.touchObject.swipeLength,
                            _.touchObject.edgeHit = !1,
                            _.options.infinite === !1 && (0 === _.currentSlide && "right" === swipeDirection || _.currentSlide >= _.getDotCount() && "left" === swipeDirection) && (swipeLength = _.touchObject.swipeLength * _.options.edgeFriction,
                                _.touchObject.edgeHit = !0),
                            _.options.vertical === !1 ? _.swipeLeft = curLeft + swipeLength * positionOffset : _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset,
                            _.options.verticalSwiping === !0 && (_.swipeLeft = curLeft + swipeLength * positionOffset),
                            _.options.fade === !0 || _.options.touchMove === !1 ? !1 : _.animating === !0 ? (_.swipeLeft = null,
                                !1) : void _.setCSS(_.swipeLeft)) : void 0)
            },
            Slick.prototype.swipeStart = function (event) {
                var touches, _ = this;
                return 1 !== _.touchObject.fingerCount || _.slideCount <= _.options.slidesToShow ? (_.touchObject = {},
                    !1) : (void 0 !== event.originalEvent && void 0 !== event.originalEvent.touches && (touches = event.originalEvent.touches[0]),
                    _.touchObject.startX = _.touchObject.curX = void 0 !== touches ? touches.pageX : event.clientX,
                    _.touchObject.startY = _.touchObject.curY = void 0 !== touches ? touches.pageY : event.clientY,
                    void(_.dragging = !0))
            },
            Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {
                var _ = this;
                null !== _.$slidesCache && (_.unload(),
                    _.$slideTrack.children(this.options.slide).detach(),
                    _.$slidesCache.appendTo(_.$slideTrack),
                    _.reinit())
            },
            Slick.prototype.unload = function () {
                var _ = this;
                $(".slick-cloned", _.$slider).remove(),
                    _.$dots && _.$dots.remove(),
                    _.$prevArrow && _.htmlExpr.test(_.options.prevArrow) && _.$prevArrow.remove(),
                    _.$nextArrow && _.htmlExpr.test(_.options.nextArrow) && _.$nextArrow.remove(),
                    _.$slides.removeClass("slick-slide slick-active slick-visible slick-current").attr("aria-hidden", "true").css("width", "")
            },
            Slick.prototype.unslick = function (fromBreakpoint) {
                var _ = this;
                _.$slider.trigger("unslick", [_, fromBreakpoint]),
                    _.destroy()
            },
            Slick.prototype.updateArrows = function () {
                var centerOffset, _ = this;
                centerOffset = Math.floor(_.options.slidesToShow / 2),
                    _.options.arrows === !0 && _.slideCount > _.options.slidesToShow && !_.options.infinite && (_.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false"),
                        _.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false"),
                        0 === _.currentSlide ? (_.$prevArrow.addClass("slick-disabled").attr("aria-disabled", "true"),
                            _.$nextArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : _.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === !1 ? (_.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"),
                            _.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")) : _.currentSlide >= _.slideCount - 1 && _.options.centerMode === !0 && (_.$nextArrow.addClass("slick-disabled").attr("aria-disabled", "true"),
                            _.$prevArrow.removeClass("slick-disabled").attr("aria-disabled", "false")))
            },
            Slick.prototype.updateDots = function () {
                var _ = this;
                null !== _.$dots && (_.$dots.find("li").removeClass("slick-active").attr("aria-hidden", "true"),
                    _.$dots.find("li").eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass("slick-active").attr("aria-hidden", "false"))
            },
            Slick.prototype.visibility = function () {
                var _ = this;
                document[_.hidden] ? (_.paused = !0,
                    _.autoPlayClear()) : _.options.autoplay === !0 && (_.paused = !1,
                    _.autoPlay())
            },
            Slick.prototype.initADA = function () {
                var _ = this;
                _.$slides.add(_.$slideTrack.find(".slick-cloned")).attr({
                        "aria-hidden": "true",
                        tabindex: "-1"
                    }).find("a, input, button, select").attr({
                        tabindex: "-1"
                    }),
                    _.$slideTrack.attr("role", "listbox"),
                    _.$slides.not(_.$slideTrack.find(".slick-cloned")).each(function (i) {
                        $(this).attr({
                            role: "option",
                            "aria-describedby": "slick-slide" + _.instanceUid + i
                        })
                    }),
                    null !== _.$dots && _.$dots.attr("role", "tablist").find("li").each(function (i) {
                        $(this).attr({
                            role: "presentation",
                            "aria-selected": "false",
                            "aria-controls": "navigation" + _.instanceUid + i,
                            id: "slick-slide" + _.instanceUid + i
                        })
                    }).first().attr("aria-selected", "true").end().find("button").attr("role", "button").end().closest("div").attr("role", "toolbar"),
                    _.activateADA()
            },
            Slick.prototype.activateADA = function () {
                var _ = this,
                    _isSlideOnFocus = _.$slider.find("*").is(":focus");
                _.$slideTrack.find(".slick-active").attr({
                        "aria-hidden": "false",
                        tabindex: "0"
                    }).find("a, input, button, select").attr({
                        tabindex: "0"
                    }),
                    _isSlideOnFocus && _.$slideTrack.find(".slick-active").focus()
            },
            Slick.prototype.focusHandler = function () {
                var _ = this;
                _.$slider.on("focus.slick blur.slick", "*", function (event) {
                    event.stopImmediatePropagation();
                    var sf = $(this);
                    setTimeout(function () {
                        _.isPlay && (sf.is(":focus") ? (_.autoPlayClear(),
                            _.paused = !0) : (_.paused = !1,
                            _.autoPlay()))
                    }, 0)
                })
            },
            $.fn.slick = function () {
                var ret, _ = this,
                    opt = arguments[0],
                    args = Array.prototype.slice.call(arguments, 1),
                    l = _.length,
                    i = 0;
                for (i; l > i; i++)
                    if ("object" == typeof opt || "undefined" == typeof opt ? _[i].slick = new Slick(_[i], opt) : ret = _[i].slick[opt].apply(_[i].slick, args),
                        "undefined" != typeof ret)
                        return ret;
                return _
            }
    }),
    ! function (e, t, n) {
        "use strict";
        ! function o(e, t, n) {
            function a(s, l) {
                if (!t[s]) {
                    if (!e[s]) {
                        var i = "function" == typeof require && require;
                        if (!l && i)
                            return i(s, !0);
                        if (r)
                            return r(s, !0);
                        var u = new Error("Cannot find module '" + s + "'");
                        throw u.code = "MODULE_NOT_FOUND",
                            u
                    }
                    var c = t[s] = {
                        exports: {}
                    };
                    e[s][0].call(c.exports, function (t) {
                        var n = e[s][1][t];
                        return a(n ? n : t)
                    }, c, c.exports, o, e, t, n)
                }
                return t[s].exports
            }
            for (var r = "function" == typeof require && require, s = 0; s < n.length; s++)
                a(n[s]);
            return a
        }({
            1: [function (o, a, r) {
                var s = function (e) {
                    return e && e.__esModule ? e : {
                        "default": e
                    }
                };
                Object.defineProperty(r, "__esModule", {
                    value: !0
                });
                var l, i, u, c, d = o("./modules/handle-dom"),
                    f = o("./modules/utils"),
                    p = o("./modules/handle-swal-dom"),
                    m = o("./modules/handle-click"),
                    v = o("./modules/handle-key"),
                    y = s(v),
                    h = o("./modules/default-params"),
                    b = s(h),
                    g = o("./modules/set-params"),
                    w = s(g);
                r["default"] = u = c = function () {
                        function o(e) {
                            var t = a;
                            return t[e] === n ? b["default"][e] : t[e]
                        }
                        var a = arguments[0];
                        if (d.addClass(t.body, "stop-scrolling"),
                            p.resetInput(),
                            a === n)
                            return f.logStr("SweetAlert expects at least 1 attribute!"),
                                !1;
                        var r = f.extend({}, b["default"]);
                        switch (typeof a) {
                            case "string":
                                r.title = a,
                                    r.text = arguments[1] || "",
                                    r.type = arguments[2] || "";
                                break;
                            case "object":
                                if (a.title === n)
                                    return f.logStr('Missing "title" argument!'),
                                        !1;
                                r.title = a.title;
                                for (var s in b["default"])
                                    r[s] = o(s);
                                r.confirmButtonText = r.showCancelButton ? "Confirm" : b["default"].confirmButtonText,
                                    r.confirmButtonText = o("confirmButtonText"),
                                    r.doneFunction = arguments[1] || null;
                                break;
                            default:
                                return f.logStr('Unexpected type of argument! Expected "string" or "object", got ' + typeof a),
                                    !1
                        }
                        w["default"](r),
                            p.fixVerticalPosition(),
                            p.openModal(arguments[1]);
                        for (var u = p.getModal(), v = u.querySelectorAll("button"), h = ["onclick", "onmouseover", "onmouseout", "onmousedown", "onmouseup", "onfocus"], g = function (e) {
                                return m.handleButton(e, r, u)
                            }, C = 0; C < v.length; C++)
                            for (var S = 0; S < h.length; S++) {
                                var x = h[S];
                                v[C][x] = g
                            }
                        p.getOverlay().onclick = g,
                            l = e.onkeydown;
                        var k = function (e) {
                            return y["default"](e, r, u)
                        };
                        e.onkeydown = k,
                            e.onfocus = function () {
                                setTimeout(function () {
                                    i !== n && (i.focus(),
                                        i = n)
                                }, 0)
                            },
                            c.enableButtons()
                    },
                    u.setDefaults = c.setDefaults = function (e) {
                        if (!e)
                            throw new Error("userParams is required");
                        if ("object" != typeof e)
                            throw new Error("userParams has to be a object");
                        f.extend(b["default"], e)
                    },
                    u.close = c.close = function () {
                        var o = p.getModal();
                        d.fadeOut(p.getOverlay(), 5),
                            d.fadeOut(o, 5),
                            d.removeClass(o, "showSweetAlert"),
                            d.addClass(o, "hideSweetAlert"),
                            d.removeClass(o, "visible");
                        var a = o.querySelector(".sa-icon.sa-success");
                        d.removeClass(a, "animate"),
                            d.removeClass(a.querySelector(".sa-tip"), "animateSuccessTip"),
                            d.removeClass(a.querySelector(".sa-long"), "animateSuccessLong");
                        var r = o.querySelector(".sa-icon.sa-error");
                        d.removeClass(r, "animateErrorIcon"),
                            d.removeClass(r.querySelector(".sa-x-mark"), "animateXMark");
                        var s = o.querySelector(".sa-icon.sa-warning");
                        return d.removeClass(s, "pulseWarning"),
                            d.removeClass(s.querySelector(".sa-body"), "pulseWarningIns"),
                            d.removeClass(s.querySelector(".sa-dot"), "pulseWarningIns"),
                            setTimeout(function () {
                                var e = o.getAttribute("data-custom-class");
                                d.removeClass(o, e)
                            }, 300),
                            d.removeClass(t.body, "stop-scrolling"),
                            e.onkeydown = l,
                            e.previousActiveElement && e.previousActiveElement.focus(),
                            i = n,
                            clearTimeout(o.timeout),
                            !0
                    },
                    u.showInputError = c.showInputError = function (e) {
                        var t = p.getModal(),
                            n = t.querySelector(".sa-input-error");
                        d.addClass(n, "show");
                        var o = t.querySelector(".sa-error-container");
                        d.addClass(o, "show"),
                            o.querySelector("p").innerHTML = e,
                            setTimeout(function () {
                                u.enableButtons()
                            }, 1),
                            t.querySelector("input").focus()
                    },
                    u.resetInputError = c.resetInputError = function (e) {
                        if (e && 13 === e.keyCode)
                            return !1;
                        var t = p.getModal(),
                            n = t.querySelector(".sa-input-error");
                        d.removeClass(n, "show");
                        var o = t.querySelector(".sa-error-container");
                        d.removeClass(o, "show")
                    },
                    u.disableButtons = c.disableButtons = function () {
                        var e = p.getModal(),
                            t = e.querySelector("button.confirm"),
                            n = e.querySelector("button.cancel");
                        t.disabled = !0,
                            n.disabled = !0
                    },
                    u.enableButtons = c.enableButtons = function () {
                        var e = p.getModal(),
                            t = e.querySelector("button.confirm"),
                            n = e.querySelector("button.cancel");
                        t.disabled = !1,
                            n.disabled = !1
                    },
                    "undefined" != typeof e ? e.sweetAlert = e.swal = u : f.logStr("SweetAlert is a frontend module!"),
                    a.exports = r["default"]
            }, {
                "./modules/default-params": 2,
                "./modules/handle-click": 3,
                "./modules/handle-dom": 4,
                "./modules/handle-key": 5,
                "./modules/handle-swal-dom": 6,
                "./modules/set-params": 8,
                "./modules/utils": 9
            }],
            2: [function (e, t, n) {
                Object.defineProperty(n, "__esModule", {
                    value: !0
                });
                var o = {
                    title: "",
                    text: "",
                    type: null,
                    allowOutsideClick: !1,
                    showConfirmButton: !0,
                    showCancelButton: !1,
                    closeOnConfirm: !0,
                    closeOnCancel: !0,
                    confirmButtonText: "OK",
                    confirmButtonColor: "#8CD4F5",
                    cancelButtonText: "Cancel",
                    imageUrl: null,
                    imageSize: null,
                    timer: null,
                    customClass: "",
                    html: !1,
                    animation: !0,
                    allowEscapeKey: !0,
                    inputType: "text",
                    inputPlaceholder: "",
                    inputValue: "",
                    showLoaderOnConfirm: !1
                };
                n["default"] = o,
                    t.exports = n["default"]
            }, {}],
            3: [function (t, n, o) {
                Object.defineProperty(o, "__esModule", {
                    value: !0
                });
                var a = t("./utils"),
                    r = (t("./handle-swal-dom"),
                        t("./handle-dom")),
                    s = function (t, n, o) {
                        function s(e) {
                            m && n.confirmButtonColor && (p.style.backgroundColor = e)
                        }
                        var u, c, d, f = t || e.event,
                            p = f.target || f.srcElement,
                            m = -1 !== p.className.indexOf("confirm"),
                            v = -1 !== p.className.indexOf("sweet-overlay"),
                            y = r.hasClass(o, "visible"),
                            h = n.doneFunction && "true" === o.getAttribute("data-has-done-function");
                        switch (m && n.confirmButtonColor && (u = n.confirmButtonColor,
                                c = a.colorLuminance(u, -.04),
                                d = a.colorLuminance(u, -.14)),
                            f.type) {
                            case "mouseover":
                                s(c);
                                break;
                            case "mouseout":
                                s(u);
                                break;
                            case "mousedown":
                                s(d);
                                break;
                            case "mouseup":
                                s(c);
                                break;
                            case "focus":
                                var b = o.querySelector("button.confirm"),
                                    g = o.querySelector("button.cancel");
                                m ? g.style.boxShadow = "none" : b.style.boxShadow = "none";
                                break;
                            case "click":
                                var w = o === p,
                                    C = r.isDescendant(o, p);
                                if (!w && !C && y && !n.allowOutsideClick)
                                    break;
                                m && h && y ? l(o, n) : h && y || v ? i(o, n) : r.isDescendant(o, p) && "BUTTON" === p.tagName && sweetAlert.close()
                        }
                    },
                    l = function (e, t) {
                        var n = !0;
                        r.hasClass(e, "show-input") && (n = e.querySelector("input").value,
                                n || (n = "")),
                            t.doneFunction(n),
                            t.closeOnConfirm && sweetAlert.close(),
                            t.showLoaderOnConfirm && sweetAlert.disableButtons()
                    },
                    i = function (e, t) {
                        var n = String(t.doneFunction).replace(/\s/g, ""),
                            o = "function(" === n.substring(0, 9) && ")" !== n.substring(9, 10);
                        o && t.doneFunction(!1),
                            t.closeOnCancel && sweetAlert.close()
                    };
                o["default"] = {
                        handleButton: s,
                        handleConfirm: l,
                        handleCancel: i
                    },
                    n.exports = o["default"]
            }, {
                "./handle-dom": 4,
                "./handle-swal-dom": 6,
                "./utils": 9
            }],
            4: [function (n, o, a) {
                Object.defineProperty(a, "__esModule", {
                    value: !0
                });
                var r = function (e, t) {
                        return new RegExp(" " + t + " ").test(" " + e.className + " ")
                    },
                    s = function (e, t) {
                        r(e, t) || (e.className += " " + t)
                    },
                    l = function (e, t) {
                        var n = " " + e.className.replace(/[\t\r\n]/g, " ") + " ";
                        if (r(e, t)) {
                            for (; n.indexOf(" " + t + " ") >= 0;)
                                n = n.replace(" " + t + " ", " ");
                            e.className = n.replace(/^\s+|\s+$/g, "")
                        }
                    },
                    i = function (e) {
                        var n = t.createElement("div");
                        return n.appendChild(t.createTextNode(e)),
                            n.innerHTML
                    },
                    u = function (e) {
                        e.style.opacity = "",
                            e.style.display = "block"
                    },
                    c = function (e) {
                        if (e && !e.length)
                            return u(e);
                        for (var t = 0; t < e.length; ++t)
                            u(e[t])
                    },
                    d = function (e) {
                        e.style.opacity = "",
                            e.style.display = "none"
                    },
                    f = function (e) {
                        if (e && !e.length)
                            return d(e);
                        for (var t = 0; t < e.length; ++t)
                            d(e[t])
                    },
                    p = function (e, t) {
                        for (var n = t.parentNode; null !== n;) {
                            if (n === e)
                                return !0;
                            n = n.parentNode
                        }
                        return !1
                    },
                    m = function (e) {
                        e.style.left = "-9999px",
                            e.style.display = "block";
                        var t, n = e.clientHeight;
                        return t = "undefined" != typeof getComputedStyle ? parseInt(getComputedStyle(e).getPropertyValue("padding-top"), 10) : parseInt(e.currentStyle.padding),
                            e.style.left = "",
                            e.style.display = "none",
                            "-" + parseInt((n + t) / 2) + "px"
                    },
                    v = function (e, t) {
                        if (+e.style.opacity < 1) {
                            t = t || 16,
                                e.style.opacity = 0,
                                e.style.display = "block";
                            var n = +new Date,
                                o = function (e) {
                                    function t() {
                                        return e.apply(this, arguments)
                                    }
                                    return t.toString = function () {
                                            return e.toString()
                                        },
                                        t
                                }(function () {
                                    e.style.opacity = +e.style.opacity + (new Date - n) / 100,
                                        n = +new Date,
                                        +e.style.opacity < 1 && setTimeout(o, t)
                                });
                            o()
                        }
                        e.style.display = "block"
                    },
                    y = function (e, t) {
                        t = t || 16,
                            e.style.opacity = 1;
                        var n = +new Date,
                            o = function (e) {
                                function t() {
                                    return e.apply(this, arguments)
                                }
                                return t.toString = function () {
                                        return e.toString()
                                    },
                                    t
                            }(function () {
                                e.style.opacity = +e.style.opacity - (new Date - n) / 100,
                                    n = +new Date,
                                    +e.style.opacity > 0 ? setTimeout(o, t) : e.style.display = "none"
                            });
                        o()
                    },
                    h = function (n) {
                        if ("function" == typeof MouseEvent) {
                            var o = new MouseEvent("click", {
                                view: e,
                                bubbles: !1,
                                cancelable: !0
                            });
                            n.dispatchEvent(o)
                        } else if (t.createEvent) {
                            var a = t.createEvent("MouseEvents");
                            a.initEvent("click", !1, !1),
                                n.dispatchEvent(a)
                        } else
                            t.createEventObject ? n.fireEvent("onclick") : "function" == typeof n.onclick && n.onclick()
                    },
                    b = function (t) {
                        "function" == typeof t.stopPropagation ? (t.stopPropagation(),
                            t.preventDefault()) : e.event && e.event.hasOwnProperty("cancelBubble") && (e.event.cancelBubble = !0)
                    };
                a.hasClass = r,
                    a.addClass = s,
                    a.removeClass = l,
                    a.escapeHtml = i,
                    a._show = u,
                    a.show = c,
                    a._hide = d,
                    a.hide = f,
                    a.isDescendant = p,
                    a.getTopMargin = m,
                    a.fadeIn = v,
                    a.fadeOut = y,
                    a.fireClick = h,
                    a.stopEventPropagation = b
            }, {}],
            5: [function (t, o, a) {
                Object.defineProperty(a, "__esModule", {
                    value: !0
                });
                var r = t("./handle-dom"),
                    s = t("./handle-swal-dom"),
                    l = function (t, o, a) {
                        var l = t || e.event,
                            i = l.keyCode || l.which,
                            u = a.querySelector("button.confirm"),
                            c = a.querySelector("button.cancel"),
                            d = a.querySelectorAll("button[tabindex]");
                        if (-1 !== [9, 13, 32, 27].indexOf(i)) {
                            for (var f = l.target || l.srcElement, p = -1, m = 0; m < d.length; m++)
                                if (f === d[m]) {
                                    p = m;
                                    break
                                }
                            9 === i ? (f = -1 === p ? u : p === d.length - 1 ? d[0] : d[p + 1],
                                r.stopEventPropagation(l),
                                f.focus(),
                                o.confirmButtonColor && s.setFocusStyle(f, o.confirmButtonColor)) : 13 === i ? ("INPUT" === f.tagName && (f = u,
                                    u.focus()),
                                f = -1 === p ? u : n) : 27 === i && o.allowEscapeKey === !0 ? (f = c,
                                r.fireClick(f, l)) : f = n
                        }
                    };
                a["default"] = l,
                    o.exports = a["default"]
            }, {
                "./handle-dom": 4,
                "./handle-swal-dom": 6
            }],
            6: [function (n, o, a) {
                var r = function (e) {
                    return e && e.__esModule ? e : {
                        "default": e
                    }
                };
                Object.defineProperty(a, "__esModule", {
                    value: !0
                });
                var s = n("./utils"),
                    l = n("./handle-dom"),
                    i = n("./default-params"),
                    u = r(i),
                    c = n("./injected-html"),
                    d = r(c),
                    f = ".sweet-alert",
                    p = ".sweet-overlay",
                    m = function () {
                        var e = t.createElement("div");
                        for (e.innerHTML = d["default"]; e.firstChild;)
                            t.body.appendChild(e.firstChild)
                    },
                    v = function (e) {
                        function t() {
                            return e.apply(this, arguments)
                        }
                        return t.toString = function () {
                                return e.toString()
                            },
                            t
                    }(function () {
                        var e = t.querySelector(f);
                        return e || (m(),
                                e = v()),
                            e
                    }),
                    y = function () {
                        var e = v();
                        return e ? e.querySelector("input") : void 0
                    },
                    h = function () {
                        return t.querySelector(p)
                    },
                    b = function (e, t) {
                        var n = s.hexToRgb(t);
                        e.style.boxShadow = "0 0 2px rgba(" + n + ", 0.8), inset 0 0 0 1px rgba(0, 0, 0, 0.05)"
                    },
                    g = function (n) {
                        var o = v();
                        l.fadeIn(h(), 10),
                            l.show(o),
                            l.addClass(o, "showSweetAlert"),
                            l.removeClass(o, "hideSweetAlert"),
                            e.previousActiveElement = t.activeElement;
                        var a = o.querySelector("button.confirm");
                        a.focus(),
                            setTimeout(function () {
                                l.addClass(o, "visible")
                            }, 500);
                        var r = o.getAttribute("data-timer");
                        if ("null" !== r && "" !== r) {
                            var s = n;
                            o.timeout = setTimeout(function () {
                                var e = (s || null) && "true" === o.getAttribute("data-has-done-function");
                                e ? s(null) : sweetAlert.close()
                            }, r)
                        }
                    },
                    w = function () {
                        var e = v(),
                            t = y();
                        l.removeClass(e, "show-input"),
                            t.value = u["default"].inputValue,
                            t.setAttribute("type", u["default"].inputType),
                            t.setAttribute("placeholder", u["default"].inputPlaceholder),
                            C()
                    },
                    C = function (e) {
                        if (e && 13 === e.keyCode)
                            return !1;
                        var t = v(),
                            n = t.querySelector(".sa-input-error");
                        l.removeClass(n, "show");
                        var o = t.querySelector(".sa-error-container");
                        l.removeClass(o, "show")
                    },
                    S = function () {
                        var e = v();
                        e.style.marginTop = l.getTopMargin(v())
                    };
                a.sweetAlertInitialize = m,
                    a.getModal = v,
                    a.getOverlay = h,
                    a.getInput = y,
                    a.setFocusStyle = b,
                    a.openModal = g,
                    a.resetInput = w,
                    a.resetInputError = C,
                    a.fixVerticalPosition = S
            }, {
                "./default-params": 2,
                "./handle-dom": 4,
                "./injected-html": 7,
                "./utils": 9
            }],
            7: [function (e, t, n) {
                Object.defineProperty(n, "__esModule", {
                    value: !0
                });
                var o = '<div class="sweet-overlay" tabIndex="-1"></div><div class="sweet-alert"><div class="sa-icon sa-error">\n      <span class="sa-x-mark">\n        <span class="sa-line sa-left"></span>\n        <span class="sa-line sa-right"></span>\n      </span>\n    </div><div class="sa-icon sa-warning">\n      <span class="sa-body"></span>\n      <span class="sa-dot"></span>\n    </div><div class="sa-icon sa-info"></div><div class="sa-icon sa-success">\n      <span class="sa-line sa-tip"></span>\n      <span class="sa-line sa-long"></span>\n\n      <div class="sa-placeholder"></div>\n      <div class="sa-fix"></div>\n    </div><div class="sa-icon sa-custom"></div><h2>Title</h2>\n    <p>Text</p>\n    <fieldset>\n      <input type="text" tabIndex="3" />\n      <div class="sa-input-error"></div>\n    </fieldset><div class="sa-error-container">\n      <div class="icon">!</div>\n      <p>Not valid!</p>\n    </div><div class="sa-button-container">\n      <button class="cancel" tabIndex="2">Cancel</button>\n      <div class="sa-confirm-button-container">\n        <button class="confirm" tabIndex="1">OK</button><div class="la-ball-fall">\n          <div></div>\n          <div></div>\n          <div></div>\n        </div>\n      </div>\n    </div></div>';
                n["default"] = o,
                    t.exports = n["default"]
            }, {}],
            8: [function (e, t, o) {
                Object.defineProperty(o, "__esModule", {
                    value: !0
                });
                var a = e("./utils"),
                    r = e("./handle-swal-dom"),
                    s = e("./handle-dom"),
                    l = ["error", "warning", "info", "success", "input", "prompt"],
                    i = function (e) {
                        var t = r.getModal(),
                            o = t.querySelector("h2"),
                            i = t.querySelector("p"),
                            u = t.querySelector("button.cancel"),
                            c = t.querySelector("button.confirm");
                        if (o.innerHTML = e.html ? e.title : s.escapeHtml(e.title).split("\n").join("<br>"),
                            i.innerHTML = e.html ? e.text : s.escapeHtml(e.text || "").split("\n").join("<br>"),
                            e.text && s.show(i),
                            e.customClass)
                            s.addClass(t, e.customClass),
                            t.setAttribute("data-custom-class", e.customClass);
                        else {
                            var d = t.getAttribute("data-custom-class");
                            s.removeClass(t, d),
                                t.setAttribute("data-custom-class", "")
                        }
                        if (s.hide(t.querySelectorAll(".sa-icon")),
                            e.type && !a.isIE8()) {
                            var f = function () {
                                for (var o = !1, a = 0; a < l.length; a++)
                                    if (e.type === l[a]) {
                                        o = !0;
                                        break
                                    }
                                if (!o)
                                    return logStr("Unknown alert type: " + e.type), {
                                        v: !1
                                    };
                                var i = ["success", "error", "warning", "info"],
                                    u = n; -
                                1 !== i.indexOf(e.type) && (u = t.querySelector(".sa-icon.sa-" + e.type),
                                    s.show(u));
                                var c = r.getInput();
                                switch (e.type) {
                                    case "success":
                                        s.addClass(u, "animate"),
                                            s.addClass(u.querySelector(".sa-tip"), "animateSuccessTip"),
                                            s.addClass(u.querySelector(".sa-long"), "animateSuccessLong");
                                        break;
                                    case "error":
                                        s.addClass(u, "animateErrorIcon"),
                                            s.addClass(u.querySelector(".sa-x-mark"), "animateXMark");
                                        break;
                                    case "warning":
                                        s.addClass(u, "pulseWarning"),
                                            s.addClass(u.querySelector(".sa-body"), "pulseWarningIns"),
                                            s.addClass(u.querySelector(".sa-dot"), "pulseWarningIns");
                                        break;
                                    case "input":
                                    case "prompt":
                                        c.setAttribute("type", e.inputType),
                                            c.value = e.inputValue,
                                            c.setAttribute("placeholder", e.inputPlaceholder),
                                            s.addClass(t, "show-input"),
                                            setTimeout(function () {
                                                c.focus(),
                                                    c.addEventListener("keyup", swal.resetInputError)
                                            }, 400)
                                }
                            }();
                            if ("object" == typeof f)
                                return f.v
                        }
                        if (e.imageUrl) {
                            var p = t.querySelector(".sa-icon.sa-custom");
                            p.style.backgroundImage = "url(" + e.imageUrl + ")",
                                s.show(p);
                            var m = 80,
                                v = 80;
                            if (e.imageSize) {
                                var y = e.imageSize.toString().split("x"),
                                    h = y[0],
                                    b = y[1];
                                h && b ? (m = h,
                                    v = b) : logStr("Parameter imageSize expects value with format WIDTHxHEIGHT, got " + e.imageSize)
                            }
                            p.setAttribute("style", p.getAttribute("style") + "width:" + m + "px; height:" + v + "px")
                        }
                        t.setAttribute("data-has-cancel-button", e.showCancelButton),
                            e.showCancelButton ? u.style.display = "inline-block" : s.hide(u),
                            t.setAttribute("data-has-confirm-button", e.showConfirmButton),
                            e.showConfirmButton ? c.style.display = "inline-block" : s.hide(c),
                            e.cancelButtonText && (u.innerHTML = s.escapeHtml(e.cancelButtonText)),
                            e.confirmButtonText && (c.innerHTML = s.escapeHtml(e.confirmButtonText)),
                            e.confirmButtonColor && (c.style.backgroundColor = e.confirmButtonColor,
                                c.style.borderLeftColor = e.confirmLoadingButtonColor,
                                c.style.borderRightColor = e.confirmLoadingButtonColor,
                                r.setFocusStyle(c, e.confirmButtonColor)),
                            t.setAttribute("data-allow-outside-click", e.allowOutsideClick);
                        var g = e.doneFunction ? !0 : !1;
                        t.setAttribute("data-has-done-function", g),
                            e.animation ? "string" == typeof e.animation ? t.setAttribute("data-animation", e.animation) : t.setAttribute("data-animation", "pop") : t.setAttribute("data-animation", "none"),
                            t.setAttribute("data-timer", e.timer)
                    };
                o["default"] = i,
                    t.exports = o["default"]
            }, {
                "./handle-dom": 4,
                "./handle-swal-dom": 6,
                "./utils": 9
            }],
            9: [function (t, n, o) {
                Object.defineProperty(o, "__esModule", {
                    value: !0
                });
                var a = function (e, t) {
                        for (var n in t)
                            t.hasOwnProperty(n) && (e[n] = t[n]);
                        return e
                    },
                    r = function (e) {
                        var t = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(e);
                        return t ? parseInt(t[1], 16) + ", " + parseInt(t[2], 16) + ", " + parseInt(t[3], 16) : null
                    },
                    s = function () {
                        return e.attachEvent && !e.addEventListener
                    },
                    l = function (t) {
                        e.console && e.console.log("SweetAlert: " + t)
                    },
                    i = function (e, t) {
                        e = String(e).replace(/[^0-9a-f]/gi, ""),
                            e.length < 6 && (e = e[0] + e[0] + e[1] + e[1] + e[2] + e[2]),
                            t = t || 0;
                        var n, o, a = "#";
                        for (o = 0; 3 > o; o++)
                            n = parseInt(e.substr(2 * o, 2), 16),
                            n = Math.round(Math.min(Math.max(0, n + n * t), 255)).toString(16),
                            a += ("00" + n).substr(n.length);
                        return a
                    };
                o.extend = a,
                    o.hexToRgb = r,
                    o.isIE8 = s,
                    o.logStr = l,
                    o.colorLuminance = i
            }, {}]
        }, {}, [1]),
        "function" == typeof define && define.amd ? define(function () {
            return sweetAlert
        }) : "undefined" != typeof module && module.exports && (module.exports = sweetAlert)
    }(window, document);
var Froogaloop = function () {
    function Froogaloop(iframe) {
        return new Froogaloop.fn.init(iframe)
    }

    function postMessage(method, params, target) {
        if (!target.contentWindow.postMessage)
            return !1;
        var data = JSON.stringify({
            method: method,
            value: params
        });
        target.contentWindow.postMessage(data, playerOrigin)
    }

    function onMessageReceived(event) {
        var data, method;
        try {
            data = JSON.parse(event.data),
                method = data.event || data.method
        } catch (e) {}
        if ("ready" != method || isReady || (isReady = !0),
            !/^https?:\/\/player.vimeo.com/.test(event.origin))
            return !1;
        "*" === playerOrigin && (playerOrigin = event.origin);
        var value = data.value,
            eventData = data.data,
            target_id = "" === target_id ? null : data.player_id,
            callback = getCallback(method, target_id),
            params = [];
        return callback ? (void 0 !== value && params.push(value),
            eventData && params.push(eventData),
            target_id && params.push(target_id),
            params.length > 0 ? callback.apply(null, params) : callback.call()) : !1
    }

    function storeCallback(eventName, callback, target_id) {
        target_id ? (eventCallbacks[target_id] || (eventCallbacks[target_id] = {}),
            eventCallbacks[target_id][eventName] = callback) : eventCallbacks[eventName] = callback
    }

    function getCallback(eventName, target_id) {
        return target_id ? eventCallbacks[target_id][eventName] : eventCallbacks[eventName]
    }

    function removeCallback(eventName, target_id) {
        if (target_id && eventCallbacks[target_id]) {
            if (!eventCallbacks[target_id][eventName])
                return !1;
            eventCallbacks[target_id][eventName] = null
        } else {
            if (!eventCallbacks[eventName])
                return !1;
            eventCallbacks[eventName] = null
        }
        return !0
    }

    function isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply)
    }
    var eventCallbacks = {},
        isReady = !1,
        playerOrigin = (Array.prototype.slice,
            "*");
    return Froogaloop.fn = Froogaloop.prototype = {
            element: null,
            init: function (iframe) {
                return "string" == typeof iframe && (iframe = document.getElementById(iframe)),
                    this.element = iframe,
                    this
            },
            api: function (method, valueOrCallback) {
                if (!this.element || !method)
                    return !1;
                var self = this,
                    element = self.element,
                    target_id = "" !== element.id ? element.id : null,
                    params = isFunction(valueOrCallback) ? null : valueOrCallback,
                    callback = isFunction(valueOrCallback) ? valueOrCallback : null;
                return callback && storeCallback(method, callback, target_id),
                    postMessage(method, params, element),
                    self
            },
            addEvent: function (eventName, callback) {
                if (!this.element)
                    return !1;
                var self = this,
                    element = self.element,
                    target_id = "" !== element.id ? element.id : null;
                return storeCallback(eventName, callback, target_id),
                    "ready" != eventName ? postMessage("addEventListener", eventName, element) : "ready" == eventName && isReady && callback.call(null, target_id),
                    self
            },
            removeEvent: function (eventName) {
                if (!this.element)
                    return !1;
                var self = this,
                    element = self.element,
                    target_id = "" !== element.id ? element.id : null,
                    removed = removeCallback(eventName, target_id);
                "ready" != eventName && removed && postMessage("removeEventListener", eventName, element)
            }
        },
        Froogaloop.fn.init.prototype = Froogaloop.fn,
        window.addEventListener ? window.addEventListener("message", onMessageReceived, !1) : window.attachEvent("onmessage", onMessageReceived),
        window.Froogaloop = window.$f = Froogaloop
}();
(function () {
    var Instafeed;
    Instafeed = function () {
            function Instafeed(params, context) {
                var option, value;
                if (this.options = {
                        target: "instafeed",
                        get: "popular",
                        resolution: "thumbnail",
                        sortBy: "none",
                        links: !0,
                        mock: !1,
                        useHttp: !1
                    },
                    "object" == typeof params)
                    for (option in params)
                        value = params[option],
                        this.options[option] = value;
                this.context = null != context ? context : this,
                    this.unique = this._genKey()
            }
            return Instafeed.prototype.hasNext = function () {
                    return "string" == typeof this.context.nextUrl && this.context.nextUrl.length > 0
                },
                Instafeed.prototype.next = function () {
                    return this.hasNext() ? this.run(this.context.nextUrl) : !1
                },
                Instafeed.prototype.run = function (url) {
                    var header, instanceName, script;
                    if ("string" != typeof this.options.clientId && "string" != typeof this.options.accessToken)
                        throw new Error("Missing clientId or accessToken.");
                    if ("string" != typeof this.options.accessToken && "string" != typeof this.options.clientId)
                        throw new Error("Missing clientId or accessToken.");
                    return null != this.options.before && "function" == typeof this.options.before && this.options.before.call(this),
                        "undefined" != typeof document && null !== document && (script = document.createElement("script"),
                            script.id = "instafeed-fetcher",
                            script.src = url || this._buildUrl(),
                            header = document.getElementsByTagName("head"),
                            header[0].appendChild(script),
                            instanceName = "instafeedCache" + this.unique,
                            window[instanceName] = new Instafeed(this.options, this),
                            window[instanceName].unique = this.unique),
                        !0
                },
                Instafeed.prototype.parse = function (response) {
                    var anchor, childNodeCount, childNodeIndex, childNodesArr, e, eMsg, fragment, header, htmlString, httpProtocol, i, image, imageObj, imageString, imageUrl, images, img, imgHeight, imgOrient, imgUrl, imgWidth, instanceName, j, k, len, len1, len2, node, parsedLimit, reverse, sortSettings, targetEl, tmpEl;
                    if ("object" != typeof response) {
                        if (null != this.options.error && "function" == typeof this.options.error)
                            return this.options.error.call(this, "Invalid JSON data"),
                                !1;
                        throw new Error("Invalid JSON response")
                    }
                    if (200 !== response.meta.code) {
                        if (null != this.options.error && "function" == typeof this.options.error)
                            return this.options.error.call(this, response.meta.error_message),
                                !1;
                        throw new Error("Error from Instagram: " + response.meta.error_message)
                    }
                    if (0 === response.data.length) {
                        if (null != this.options.error && "function" == typeof this.options.error)
                            return this.options.error.call(this, "No images were returned from Instagram"),
                                !1;
                        throw new Error("No images were returned from Instagram")
                    }
                    if (null != this.options.success && "function" == typeof this.options.success && this.options.success.call(this, response),
                        this.context.nextUrl = "",
                        null != response.pagination && (this.context.nextUrl = response.pagination.next_url),
                        "none" !== this.options.sortBy)
                        switch (sortSettings = "random" === this.options.sortBy ? ["", "random"] : this.options.sortBy.split("-"),
                            reverse = "least" === sortSettings[0] ? !0 : !1,
                            sortSettings[1]) {
                            case "random":
                                response.data.sort(function () {
                                    return .5 - Math.random()
                                });
                                break;
                            case "recent":
                                response.data = this._sortBy(response.data, "created_time", reverse);
                                break;
                            case "liked":
                                response.data = this._sortBy(response.data, "likes.count", reverse);
                                break;
                            case "commented":
                                response.data = this._sortBy(response.data, "comments.count", reverse);
                                break;
                            default:
                                throw new Error("Invalid option for sortBy: '" + this.options.sortBy + "'.")
                        }
                    if ("undefined" != typeof document && null !== document && this.options.mock === !1) {
                        if (images = response.data,
                            parsedLimit = parseInt(this.options.limit, 10),
                            null != this.options.limit && images.length > parsedLimit && (images = images.slice(0, parsedLimit)),
                            fragment = document.createDocumentFragment(),
                            null != this.options.filter && "function" == typeof this.options.filter && (images = this._filter(images, this.options.filter)),
                            null != this.options.template && "string" == typeof this.options.template) {
                            for (htmlString = "",
                                imageString = "",
                                imgUrl = "",
                                tmpEl = document.createElement("div"),
                                i = 0,
                                len = images.length; len > i; i++) {
                                if (image = images[i],
                                    imageObj = image.images[this.options.resolution],
                                    "object" != typeof imageObj)
                                    throw eMsg = "No image found for resolution: " + this.options.resolution + ".",
                                        new Error(eMsg);
                                imgWidth = imageObj.width,
                                    imgHeight = imageObj.height,
                                    imgOrient = "square",
                                    imgWidth > imgHeight && (imgOrient = "landscape"),
                                    imgHeight > imgWidth && (imgOrient = "portrait"),
                                    imageUrl = imageObj.url,
                                    httpProtocol = window.location.protocol.indexOf("http") >= 0,
                                    httpProtocol && !this.options.useHttp && (imageUrl = imageUrl.replace(/https?:\/\//, "//")),
                                    imageString = this._makeTemplate(this.options.template, {
                                        model: image,
                                        id: image.id,
                                        link: image.link,
                                        type: image.type,
                                        image: imageUrl,
                                        width: imgWidth,
                                        height: imgHeight,
                                        orientation: imgOrient,
                                        caption: this._getObjectProperty(image, "caption.text"),
                                        likes: image.likes.count,
                                        comments: image.comments.count,
                                        location: this._getObjectProperty(image, "location.name")
                                    }),
                                    htmlString += imageString
                            }
                            for (tmpEl.innerHTML = htmlString,
                                childNodesArr = [],
                                childNodeIndex = 0,
                                childNodeCount = tmpEl.childNodes.length; childNodeCount > childNodeIndex;)
                                childNodesArr.push(tmpEl.childNodes[childNodeIndex]),
                                childNodeIndex += 1;
                            for (j = 0,
                                len1 = childNodesArr.length; len1 > j; j++)
                                node = childNodesArr[j],
                                fragment.appendChild(node)
                        } else
                            for (k = 0,
                                len2 = images.length; len2 > k; k++) {
                                if (image = images[k],
                                    img = document.createElement("img"),
                                    imageObj = image.images[this.options.resolution],
                                    "object" != typeof imageObj)
                                    throw eMsg = "No image found for resolution: " + this.options.resolution + ".",
                                        new Error(eMsg);
                                imageUrl = imageObj.url,
                                    httpProtocol = window.location.protocol.indexOf("http") >= 0,
                                    httpProtocol && !this.options.useHttp && (imageUrl = imageUrl.replace(/https?:\/\//, "//")),
                                    img.src = imageUrl,
                                    this.options.links === !0 ? (anchor = document.createElement("a"),
                                        anchor.href = image.link,
                                        anchor.appendChild(img),
                                        fragment.appendChild(anchor)) : fragment.appendChild(img)
                            }
                        if (targetEl = this.options.target,
                            "string" == typeof targetEl && (targetEl = document.getElementById(targetEl)),
                            null == targetEl)
                            throw eMsg = 'No element with id="' + this.options.target + '" on page.',
                                new Error(eMsg);
                        targetEl.appendChild(fragment),
                            header = document.getElementsByTagName("head")[0],
                            header.removeChild(document.getElementById("instafeed-fetcher")),
                            instanceName = "instafeedCache" + this.unique,
                            window[instanceName] = void 0;
                        try {
                            delete window[instanceName]
                        } catch (_error) {
                            e = _error
                        }
                    }
                    return null != this.options.after && "function" == typeof this.options.after && this.options.after.call(this),
                        !0
                },
                Instafeed.prototype._buildUrl = function () {
                    var base, endpoint, final;
                    switch (base = "https://api.instagram.com/v1",
                        this.options.get) {
                        case "popular":
                            endpoint = "media/popular";
                            break;
                        case "tagged":
                            if (!this.options.tagName)
                                throw new Error("No tag name specified. Use the 'tagName' option.");
                            endpoint = "tags/" + this.options.tagName + "/media/recent";
                            break;
                        case "location":
                            if (!this.options.locationId)
                                throw new Error("No location specified. Use the 'locationId' option.");
                            endpoint = "locations/" + this.options.locationId + "/media/recent";
                            break;
                        case "user":
                            if (!this.options.userId)
                                throw new Error("No user specified. Use the 'userId' option.");
                            endpoint = "users/" + this.options.userId + "/media/recent";
                            break;
                        default:
                            throw new Error("Invalid option for get: '" + this.options.get + "'.")
                    }
                    return final = base + "/" + endpoint,
                        final += null != this.options.accessToken ? "?access_token=" + this.options.accessToken : "?client_id=" + this.options.clientId,
                        null != this.options.limit && (final += "&count=" + this.options.limit),
                        final += "&callback=instafeedCache" + this.unique + ".parse"
                },
                Instafeed.prototype._genKey = function () {
                    var S4;
                    return S4 = function () {
                            return (65536 * (1 + Math.random()) | 0).toString(16).substring(1)
                        },
                        "" + S4() + S4() + S4() + S4()
                },
                Instafeed.prototype._makeTemplate = function (template, data) {
                    var output, pattern, ref, varName, varValue;
                    for (pattern = /(?:\{{2})([\w\[\]\.]+)(?:\}{2})/,
                        output = template; pattern.test(output);)
                        varName = output.match(pattern)[1],
                        varValue = null != (ref = this._getObjectProperty(data, varName)) ? ref : "",
                        output = output.replace(pattern, function () {
                            return "" + varValue
                        });
                    return output
                },
                Instafeed.prototype._getObjectProperty = function (object, property) {
                    var piece, pieces;
                    for (property = property.replace(/\[(\w+)\]/g, ".$1"),
                        pieces = property.split("."); pieces.length;) {
                        if (piece = pieces.shift(),
                            !(null != object && piece in object))
                            return null;
                        object = object[piece]
                    }
                    return object
                },
                Instafeed.prototype._sortBy = function (data, property, reverse) {
                    var sorter;
                    return sorter = function (a, b) {
                            var valueA, valueB;
                            return valueA = this._getObjectProperty(a, property),
                                valueB = this._getObjectProperty(b, property),
                                reverse ? valueA > valueB ? 1 : -1 : valueB > valueA ? 1 : -1
                        },
                        data.sort(sorter.bind(this)),
                        data
                },
                Instafeed.prototype._filter = function (images, filter) {
                    var filteredImages, fn, i, image, len;
                    for (filteredImages = [],
                        fn = function (image) {
                            return filter(image) ? filteredImages.push(image) : void 0
                        },
                        i = 0,
                        len = images.length; len > i; i++)
                        image = images[i],
                        fn(image);
                    return filteredImages
                },
                Instafeed
        }(),
        function (root, factory) {
            return "function" == typeof define && define.amd ? define([], factory) : "object" == typeof module && module.exports ? module.exports = factory() : root.Instafeed = factory()
        }(this, function () {
            return Instafeed
        })
}).call(this);