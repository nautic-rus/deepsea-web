/*! svg.js v2.3.2 MIT*/
;
!function (t, e) {
    "function" == typeof define && define.amd ? define(function () {
        return e(t, t.document)
    }) : "object" == typeof exports ? module.exports = t.document ? e(t, t.document) : function (t) {
        return e(t, t.document)
    } : t.SVG = e(t, t.document)
}("undefined" != typeof window ? window : this, function (t, e) {
    function i(t, e) {
        return t instanceof e
    }

    function n(t, e) {
        return (t.matches || t.matchesSelector || t.msMatchesSelector || t.mozMatchesSelector || t.webkitMatchesSelector || t.oMatchesSelector).call(t, e)
    }

    function r(t) {
        return t.toLowerCase().replace(/-(.)/g, function (t, e) {
            return e.toUpperCase()
        })
    }

    function s(t) {
        return t.charAt(0).toUpperCase() + t.slice(1)
    }

    function a(t) {
        return 4 == t.length ? ["#", t.substring(1, 2), t.substring(1, 2), t.substring(2, 3), t.substring(2, 3), t.substring(3, 4), t.substring(3, 4)].join("") : t
    }

    function o(t) {
        var e = t.toString(16);
        return 1 == e.length ? "0" + e : e
    }

    function h(t, e, i) {
        return null == i ? i = t.height / t.width * e : null == e && (e = t.width / t.height * i), {width: e, height: i}
    }

    function u(t, e, i) {
        return {x: e * t.a + i * t.c + 0, y: e * t.b + i * t.d + 0}
    }

    function l(t) {
        return {a: t[0], b: t[1], c: t[2], d: t[3], e: t[4], f: t[5]}
    }

    function c(t) {
        return t instanceof v.Matrix || (t = new v.Matrix(t)), t
    }

    function f(t, e) {
        t.cx = null == t.cx ? e.bbox().cx : t.cx, t.cy = null == t.cy ? e.bbox().cy : t.cy
    }

    function d(t) {
        return t = t.replace(v.regex.whitespace, "").replace(v.regex.matrix, "").split(v.regex.matrixElements), l(v.utils.map(t, function (t) {
            return parseFloat(t)
        }))
    }

    function p(t) {
        for (var e = 0, i = t.length, n = ""; i > e; e++)n += t[e][0], null != t[e][1] && (n += t[e][1], null != t[e][2] && (n += " ", n += t[e][2], null != t[e][3] && (n += " ", n += t[e][3], n += " ", n += t[e][4], null != t[e][5] && (n += " ", n += t[e][5], n += " ", n += t[e][6], null != t[e][7] && (n += " ", n += t[e][7])))));
        return n + " "
    }

    function m(t) {
        for (var e = t.childNodes.length - 1; e >= 0; e--)t.childNodes[e]instanceof SVGElement && m(t.childNodes[e]);
        return v.adopt(t).id(v.eid(t.nodeName))
    }

    function x(t) {
        return null == t.x && (t.x = 0, t.y = 0, t.width = 0, t.height = 0), t.w = t.width, t.h = t.height, t.x2 = t.x + t.width, t.y2 = t.y + t.height, t.cx = t.x + t.width / 2, t.cy = t.y + t.height / 2, t
    }

    function g(t) {
        var e = t.toString().match(v.regex.reference);
        return e ? e[1] : void 0
    }

    var v = this.SVG = function (t) {
        return v.supported ? (t = new v.Doc(t), v.parser.draw || v.prepare(), t) : void 0
    };
    if (v.ns = "http://www.w3.org/2000/svg", v.xmlns = "http://www.w3.org/2000/xmlns/", v.xlink = "http://www.w3.org/1999/xlink", v.svgjs = "http://svgjs.com/svgjs", v.supported = function () {
            return !!e.createElementNS && !!e.createElementNS(v.ns, "svg").createSVGRect
        }(), !v.supported)return !1;
    v.did = 1e3, v.eid = function (t) {
        return "Svgjs" + s(t) + v.did++
    }, v.create = function (t) {
        var i = e.createElementNS(this.ns, t);
        return i.setAttribute("id", this.eid(t)), i
    }, v.extend = function () {
        var t, e, i, n;
        for (t = [].slice.call(arguments), e = t.pop(), n = t.length - 1; n >= 0; n--)if (t[n])for (i in e)t[n].prototype[i] = e[i];
        v.Set && v.Set.inherit && v.Set.inherit()
    }, v.invent = function (t) {
        var e = "function" == typeof t.create ? t.create : function () {
            this.constructor.call(this, v.create(t.create))
        };
        return t.inherit && (e.prototype = new t.inherit), t.extend && v.extend(e, t.extend), t.construct && v.extend(t.parent || v.Container, t.construct), e
    }, v.adopt = function (t) {
        if (!t)return null;
        if (t.instance)return t.instance;
        var e;
        return e = "svg" == t.nodeName ? t.parentNode instanceof SVGElement ? new v.Nested : new v.Doc : "linearGradient" == t.nodeName ? new v.Gradient("linear") : "radialGradient" == t.nodeName ? new v.Gradient("radial") : v[s(t.nodeName)] ? new (v[s(t.nodeName)]) : new v.Element(t), e.type = t.nodeName, e.node = t, t.instance = e, e instanceof v.Doc && e.namespace().defs(), e.setData(JSON.parse(t.getAttribute("svgjs:data")) || {}), e
    }, v.prepare = function () {
        var t = e.getElementsByTagName("body")[0], i = (t ? new v.Doc(t) : new v.Doc(e.documentElement).nested()).size(2, 0);
        v.parser = {
            body: t || e.documentElement,
            draw: i.style("opacity:0;position:fixed;left:100%;top:100%;overflow:hidden"),
            poly: i.polyline().node,
            path: i.path().node,
            "native": v.create("svg")
        }
    }, v.parser = {"native": v.create("svg")}, e.addEventListener("DOMContentLoaded", function () {
        v.parser.draw || v.prepare()
    }, !1), v.regex = {
        numberAndUnit: /^([+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?)([a-z%]*)$/i,
        hex: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i,
        rgb: /rgb\((\d+),(\d+),(\d+)\)/,
        reference: /#([a-z0-9\-_]+)/i,
        matrix: /matrix\(|\)/g,
        matrixElements: /,*\s+|,/,
        whitespace: /\s/g,
        isHex: /^#[a-f0-9]{3,6}$/i,
        isRgb: /^rgb\(/,
        isCss: /[^:]+:[^;]+;?/,
        isBlank: /^(\s+)?$/,
        isNumber: /^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        isPercent: /^-?[\d\.]+%$/,
        isImage: /\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i,
        negExp: /e\-/gi,
        comma: /,/g,
        hyphen: /\-/g,
        pathLetters: /[MLHVCSQTAZ]/gi,
        isPathLetter: /[MLHVCSQTAZ]/i,
        whitespaces: /\s+/,
        X: /X/g
    }, v.utils = {
        map: function (t, e) {
            var i, n = t.length, r = [];
            for (i = 0; n > i; i++)r.push(e(t[i]));
            return r
        }, radians: function (t) {
            return t % 360 * Math.PI / 180
        }, degrees: function (t) {
            return 180 * t / Math.PI % 360
        }, filterSVGElements: function (t) {
            return [].filter.call(t, function (t) {
                return t instanceof SVGElement
            })
        }
    }, v.defaults = {
        attrs: {
            "fill-opacity": 1,
            "stroke-opacity": 1,
            "stroke-width": 0,
            "stroke-linejoin": "miter",
            "stroke-linecap": "butt",
            fill: "#000000",
            stroke: "#000000",
            opacity: 1,
            x: 0,
            y: 0,
            cx: 0,
            cy: 0,
            width: 0,
            height: 0,
            r: 0,
            rx: 0,
            ry: 0,
            offset: 0,
            "stop-opacity": 1,
            "stop-color": "#000000",
            "font-size": 16,
            "font-family": "Helvetica, Arial, sans-serif",
            "text-anchor": "start"
        }
    }, v.Color = function (t) {
        var e;
        this.r = 0, this.g = 0, this.b = 0, t && ("string" == typeof t ? v.regex.isRgb.test(t) ? (e = v.regex.rgb.exec(t.replace(/\s/g, "")), this.r = parseInt(e[1]), this.g = parseInt(e[2]), this.b = parseInt(e[3])) : v.regex.isHex.test(t) && (e = v.regex.hex.exec(a(t)), this.r = parseInt(e[1], 16), this.g = parseInt(e[2], 16), this.b = parseInt(e[3], 16)) : "object" == typeof t && (this.r = t.r, this.g = t.g, this.b = t.b))
    }, v.extend(v.Color, {
        toString: function () {
            return this.toHex()
        }, toHex: function () {
            return "#" + o(this.r) + o(this.g) + o(this.b)
        }, toRgb: function () {
            return "rgb(" + [this.r, this.g, this.b].join() + ")"
        }, brightness: function () {
            return this.r / 255 * .3 + this.g / 255 * .59 + this.b / 255 * .11
        }, morph: function (t) {
            return this.destination = new v.Color(t), this
        }, at: function (t) {
            return this.destination ? (t = 0 > t ? 0 : t > 1 ? 1 : t, new v.Color({
                r: ~~(this.r + (this.destination.r - this.r) * t),
                g: ~~(this.g + (this.destination.g - this.g) * t),
                b: ~~(this.b + (this.destination.b - this.b) * t)
            })) : this
        }
    }), v.Color.test = function (t) {
        return t += "", v.regex.isHex.test(t) || v.regex.isRgb.test(t)
    }, v.Color.isRgb = function (t) {
        return t && "number" == typeof t.r && "number" == typeof t.g && "number" == typeof t.b
    }, v.Color.isColor = function (t) {
        return v.Color.isRgb(t) || v.Color.test(t)
    }, v.Array = function (t, e) {
        t = (t || []).valueOf(), 0 == t.length && e && (t = e.valueOf()), this.value = this.parse(t)
    }, v.extend(v.Array, {
        morph: function (t) {
            if (this.destination = this.parse(t), this.value.length != this.destination.length) {
                for (var e = this.value[this.value.length - 1], i = this.destination[this.destination.length - 1]; this.value.length > this.destination.length;)this.destination.push(i);
                for (; this.value.length < this.destination.length;)this.value.push(e)
            }
            return this
        }, settle: function () {
            for (var t = 0, e = this.value.length, i = []; e > t; t++)-1 == i.indexOf(this.value[t]) && i.push(this.value[t]);
            return this.value = i
        }, at: function (t) {
            if (!this.destination)return this;
            for (var e = 0, i = this.value.length, n = []; i > e; e++)n.push(this.value[e] + (this.destination[e] - this.value[e]) * t);
            return new v.Array(n)
        }, toString: function () {
            return this.value.join(" ")
        }, valueOf: function () {
            return this.value
        }, parse: function (t) {
            return t = t.valueOf(), Array.isArray(t) ? t : this.split(t)
        }, split: function (t) {
            return t.trim().split(/\s+/)
        }, reverse: function () {
            return this.value.reverse(), this
        }
    }), v.PointArray = function (t, e) {
        this.constructor.call(this, t, e || [[0, 0]])
    }, v.PointArray.prototype = new v.Array, v.extend(v.PointArray, {
        toString: function () {
            for (var t = 0, e = this.value.length, i = []; e > t; t++)i.push(this.value[t].join(","));
            return i.join(" ")
        }, toLine: function () {
            return {x1: this.value[0][0], y1: this.value[0][1], x2: this.value[1][0], y2: this.value[1][1]}
        }, at: function (t) {
            if (!this.destination)return this;
            for (var e = 0, i = this.value.length, n = []; i > e; e++)n.push([this.value[e][0] + (this.destination[e][0] - this.value[e][0]) * t, this.value[e][1] + (this.destination[e][1] - this.value[e][1]) * t]);
            return new v.PointArray(n)
        }, parse: function (t) {
            if (t = t.valueOf(), Array.isArray(t))return t;
            t = this.split(t);
            for (var e, i = 0, n = t.length, r = []; n > i; i++)e = t[i].split(","), r.push([parseFloat(e[0]), parseFloat(e[1])]);
            return r
        }, move: function (t, e) {
            var i = this.bbox();
            if (t -= i.x, e -= i.y, !isNaN(t) && !isNaN(e))for (var n = this.value.length - 1; n >= 0; n--)this.value[n] = [this.value[n][0] + t, this.value[n][1] + e];
            return this
        }, size: function (t, e) {
            var i, n = this.bbox();
            for (i = this.value.length - 1; i >= 0; i--)this.value[i][0] = (this.value[i][0] - n.x) * t / n.width + n.x, this.value[i][1] = (this.value[i][1] - n.y) * e / n.height + n.y;
            return this
        }, bbox: function () {
            return v.parser.poly.setAttribute("points", this.toString()), v.parser.poly.getBBox()
        }
    }), v.PathArray = function (t, e) {
        this.constructor.call(this, t, e || [["M", 0, 0]])
    }, v.PathArray.prototype = new v.Array, v.extend(v.PathArray, {
        toString: function () {
            return p(this.value)
        }, move: function (t, e) {
            var i = this.bbox();
            if (t -= i.x, e -= i.y, !isNaN(t) && !isNaN(e))for (var n, r = this.value.length - 1; r >= 0; r--)n = this.value[r][0], "M" == n || "L" == n || "T" == n ? (this.value[r][1] += t, this.value[r][2] += e) : "H" == n ? this.value[r][1] += t : "V" == n ? this.value[r][1] += e : "C" == n || "S" == n || "Q" == n ? (this.value[r][1] += t, this.value[r][2] += e, this.value[r][3] += t, this.value[r][4] += e, "C" == n && (this.value[r][5] += t, this.value[r][6] += e)) : "A" == n && (this.value[r][6] += t, this.value[r][7] += e);
            return this
        }, size: function (t, e) {
            var i, n, r = this.bbox();
            for (i = this.value.length - 1; i >= 0; i--)n = this.value[i][0], "M" == n || "L" == n || "T" == n ? (this.value[i][1] = (this.value[i][1] - r.x) * t / r.width + r.x, this.value[i][2] = (this.value[i][2] - r.y) * e / r.height + r.y) : "H" == n ? this.value[i][1] = (this.value[i][1] - r.x) * t / r.width + r.x : "V" == n ? this.value[i][1] = (this.value[i][1] - r.y) * e / r.height + r.y : "C" == n || "S" == n || "Q" == n ? (this.value[i][1] = (this.value[i][1] - r.x) * t / r.width + r.x, this.value[i][2] = (this.value[i][2] - r.y) * e / r.height + r.y, this.value[i][3] = (this.value[i][3] - r.x) * t / r.width + r.x, this.value[i][4] = (this.value[i][4] - r.y) * e / r.height + r.y, "C" == n && (this.value[i][5] = (this.value[i][5] - r.x) * t / r.width + r.x, this.value[i][6] = (this.value[i][6] - r.y) * e / r.height + r.y)) : "A" == n && (this.value[i][1] = this.value[i][1] * t / r.width, this.value[i][2] = this.value[i][2] * e / r.height, this.value[i][6] = (this.value[i][6] - r.x) * t / r.width + r.x, this.value[i][7] = (this.value[i][7] - r.y) * e / r.height + r.y);
            return this
        }, parse: function (t) {
            if (t instanceof v.PathArray)return t.valueOf();
            var e, i, n, r, s, a, o = 0, h = 0, u = {M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7};
            if ("string" == typeof t) {
                for (t = t.replace(v.regex.negExp, "X").replace(v.regex.pathLetters, " $& ").replace(v.regex.hyphen, " -").replace(v.regex.comma, " ").replace(v.regex.X, "e-").trim().split(v.regex.whitespaces), e = t.length; --e;)if (t[e].indexOf(".") != t[e].lastIndexOf(".")) {
                    var l = t[e].split("."), c = [l.shift(), l.shift()].join(".");
                    t.splice.apply(t, [e, 1].concat(c, l.map(function (t) {
                        return "." + t
                    })))
                }
            } else t = t.reduce(function (t, e) {
                return [].concat.apply(t, e)
            }, []);
            var a = [];
            do {
                for (v.regex.isPathLetter.test(t[0]) ? (r = t[0], t.shift()) : "M" == r ? r = "L" : "m" == r && (r = "l"), s = [r.toUpperCase()], e = 0; e < u[s[0]]; ++e)s.push(parseFloat(t.shift()));
                r == s[0] ? "M" == r || "L" == r || "C" == r || "Q" == r || "S" == r || "T" == r ? (o = s[u[s[0]] - 1], h = s[u[s[0]]]) : "V" == r ? h = s[1] : "H" == r ? o = s[1] : "A" == r && (o = s[6], h = s[7]) : "m" == r || "l" == r || "c" == r || "s" == r || "q" == r || "t" == r ? (s[1] += o, s[2] += h, null != s[3] && (s[3] += o, s[4] += h), null != s[5] && (s[5] += o, s[6] += h), o = s[u[s[0]] - 1], h = s[u[s[0]]]) : "v" == r ? (s[1] += h, h = s[1]) : "h" == r ? (s[1] += o, o = s[1]) : "a" == r && (s[6] += o, s[7] += h, o = s[6], h = s[7]), "M" == s[0] && (i = o, n = h), "Z" == s[0] && (o = i, h = n), a.push(s)
            } while (t.length);
            return a
        }, bbox: function () {
            return v.parser.path.setAttribute("d", this.toString()), v.parser.path.getBBox()
        }
    }), v.Number = v.invent({
        create: function (t, e) {
            this.value = 0, this.unit = e || "", "number" == typeof t ? this.value = isNaN(t) ? 0 : isFinite(t) ? t : 0 > t ? -3.4e38 : 3.4e38 : "string" == typeof t ? (e = t.match(v.regex.numberAndUnit), e && (this.value = parseFloat(e[1]), "%" == e[5] ? this.value /= 100 : "s" == e[5] && (this.value *= 1e3), this.unit = e[5])) : t instanceof v.Number && (this.value = t.valueOf(), this.unit = t.unit)
        }, extend: {
            toString: function () {
                return ("%" == this.unit ? ~~(1e8 * this.value) / 1e6 : "s" == this.unit ? this.value / 1e3 : this.value) + this.unit
            }, toJSON: function () {
                return this.toString()
            }, valueOf: function () {
                return this.value
            }, plus: function (t) {
                return new v.Number(this + new v.Number(t), this.unit)
            }, minus: function (t) {
                return this.plus(-new v.Number(t))
            }, times: function (t) {
                return new v.Number(this * new v.Number(t), this.unit)
            }, divide: function (t) {
                return new v.Number(this / new v.Number(t), this.unit)
            }, to: function (t) {
                var e = new v.Number(this);
                return "string" == typeof t && (e.unit = t), e
            }, morph: function (t) {
                return this.destination = new v.Number(t), this
            }, at: function (t) {
                return this.destination ? new v.Number(this.destination).minus(this).times(t).plus(this) : this
            }
        }
    }), v.Element = v.invent({
        create: function (t) {
            this._stroke = v.defaults.attrs.stroke, this.dom = {}, (this.node = t) && (this.type = t.nodeName, this.node.instance = this, this._stroke = t.getAttribute("stroke") || this._stroke)
        }, extend: {
            x: function (t) {
                return this.attr("x", t)
            }, y: function (t) {
                return this.attr("y", t)
            }, cx: function (t) {
                return null == t ? this.x() + this.width() / 2 : this.x(t - this.width() / 2)
            }, cy: function (t) {
                return null == t ? this.y() + this.height() / 2 : this.y(t - this.height() / 2)
            }, move: function (t, e) {
                return this.x(t).y(e)
            }, center: function (t, e) {
                return this.cx(t).cy(e)
            }, width: function (t) {
                return this.attr("width", t)
            }, height: function (t) {
                return this.attr("height", t)
            }, size: function (t, e) {
                var i = h(this.bbox(), t, e);
                return this.width(new v.Number(i.width)).height(new v.Number(i.height))
            }, clone: function (t) {
                var e = m(this.node.cloneNode(!0));
                return t ? t.add(e) : this.after(e), e
            }, remove: function () {
                return this.parent() && this.parent().removeElement(this), this
            }, replace: function (t) {
                return this.after(t).remove(), t
            }, addTo: function (t) {
                return t.put(this)
            }, putIn: function (t) {
                return t.add(this)
            }, id: function (t) {
                return this.attr("id", t)
            }, inside: function (t, e) {
                var i = this.bbox();
                return t > i.x && e > i.y && t < i.x + i.width && e < i.y + i.height
            }, show: function () {
                return this.style("display", "")
            }, hide: function () {
                return this.style("display", "none")
            }, visible: function () {
                return "none" != this.style("display")
            }, toString: function () {
                return this.attr("id")
            }, classes: function () {
                var t = this.attr("class");
                return null == t ? [] : t.trim().split(/\s+/)
            }, hasClass: function (t) {
                return -1 != this.classes().indexOf(t)
            }, addClass: function (t) {
                if (!this.hasClass(t)) {
                    var e = this.classes();
                    e.push(t), this.attr("class", e.join(" "))
                }
                return this
            }, removeClass: function (t) {
                return this.hasClass(t) && this.attr("class", this.classes().filter(function (e) {
                    return e != t
                }).join(" ")), this
            }, toggleClass: function (t) {
                return this.hasClass(t) ? this.removeClass(t) : this.addClass(t)
            }, reference: function (t) {
                return v.get(this.attr(t))
            }, parent: function (t) {
                var e = this;
                if (!e.node.parentNode)return null;
                if (e = v.adopt(e.node.parentNode), !t)return e;
                for (; e && e.node instanceof SVGElement;) {
                    if ("string" == typeof t ? e.matches(t) : e instanceof t)return e;
                    e = v.adopt(e.node.parentNode)
                }
            }, doc: function () {
                return this instanceof v.Doc ? this : this.parent(v.Doc)
            }, parents: function (t) {
                var e = [], i = this;
                do {
                    if (i = i.parent(t), !i || !i.node)break;
                    e.push(i)
                } while (i.parent);
                return e
            }, matches: function (t) {
                return n(this.node, t)
            }, "native": function () {
                return this.node
            }, svg: function (t) {
                var i = e.createElement("svg");
                if (!(t && this instanceof v.Parent))return i.appendChild(t = e.createElement("svg")), this.writeDataToDom(), t.appendChild(this.node.cloneNode(!0)), i.innerHTML.replace(/^<svg>/, "").replace(/<\/svg>$/, "");
                i.innerHTML = "<svg>" + t.replace(/\n/, "").replace(/<(\w+)([^<]+?)\/>/g, "<$1$2></$1>") + "</svg>";
                for (var n = 0, r = i.firstChild.childNodes.length; r > n; n++)this.node.appendChild(i.firstChild.firstChild);
                return this
            }, writeDataToDom: function () {
                if (this.each || this.lines) {
                    var t = this.each ? this : this.lines();
                    t.each(function () {
                        this.writeDataToDom()
                    })
                }
                return this.node.removeAttribute("svgjs:data"), Object.keys(this.dom).length && this.node.setAttribute("svgjs:data", JSON.stringify(this.dom)), this
            }, setData: function (t) {
                return this.dom = t, this
            }, is: function (t) {
                return i(this, t)
            }
        }
    }), v.easing = {
        "-": function (t) {
            return t
        }, "<>": function (t) {
            return -Math.cos(t * Math.PI) / 2 + .5
        }, ">": function (t) {
            return Math.sin(t * Math.PI / 2)
        }, "<": function (t) {
            return -Math.cos(t * Math.PI / 2) + 1
        }
    }, v.morph = function (t) {
        return function (e, i) {
            return new v.MorphObj(e, i).at(t)
        }
    }, v.Situation = v.invent({
        create: function (t) {
            this.init = !1, this.reversed = !1, this.reversing = !1, this.duration = new v.Number(t.duration).valueOf(), this.delay = new v.Number(t.delay).valueOf(), this.start = +new Date + this.delay, this.finish = this.start + this.duration, this.ease = t.ease, this.loop = !1, this.loops = !1, this.animations = {}, this.attrs = {}, this.styles = {}, this.transforms = [], this.once = {}
        }
    }), v.Delay = function (t) {
        this.delay = new v.Number(t).valueOf()
    }, v.FX = v.invent({
        create: function (t) {
            this._target = t, this.situations = [], this.active = !1, this.situation = null, this.paused = !1, this.lastPos = 0, this.pos = 0
        }, extend: {
            animate: function (t, e, i) {
                "object" == typeof t && (e = t.ease, i = t.delay, t = t.duration);
                var n = new v.Situation({duration: t || 1e3, delay: i || 0, ease: v.easing[e || "-"] || e});
                return this.queue(n), this
            }, delay: function (t) {
                var t = new v.Delay(t);
                return this.queue(t)
            }, target: function (t) {
                return t && t instanceof v.Element ? (this._target = t, this) : this._target
            }, timeToPos: function (t) {
                return (t - this.situation.start) / this.situation.duration
            }, posToTime: function (t) {
                return this.situation.duration * t + this.situation.start
            }, startAnimFrame: function () {
                this.stopAnimFrame(), this.animationFrame = requestAnimationFrame(function () {
                    this.step()
                }.bind(this))
            }, stopAnimFrame: function () {
                cancelAnimationFrame(this.animationFrame)
            }, start: function () {
                return !this.active && this.situation && (this.situation.start = +new Date + this.situation.delay, this.situation.finish = this.situation.start + this.situation.duration, this.initAnimations(), this.active = !0, this.startAnimFrame()), this
            }, queue: function (t) {
                return ("function" == typeof t || t instanceof v.Situation || t instanceof v.Delay) && this.situations.push(t), this.situation || (this.situation = this.situations.shift()), this
            }, dequeue: function () {
                if (this.situation && this.situation.stop && this.situation.stop(), this.situation = this.situations.shift(), this.situation) {
                    var t = function () {
                        this.situation instanceof v.Situation ? this.initAnimations().at(0) : this.situation instanceof v.Delay ? this.dequeue() : this.situation.call(this)
                    }.bind(this);
                    this.situation.delay ? setTimeout(function () {
                        t()
                    }, this.situation.delay) : t()
                }
                return this
            }, initAnimations: function () {
                var t, e = this.situation;
                if (e.init)return this;
                for (t in e.animations)"viewbox" == t ? e.animations[t] = this.target().viewbox().morph(e.animations[t]) : (e.animations[t].value = "plot" == t ? this.target().array().value : this.target()[t](), e.animations[t].value.value && (e.animations[t].value = e.animations[t].value.value), e.animations[t].relative && (e.animations[t].destination.value = e.animations[t].destination.value + e.animations[t].value));
                for (t in e.attrs)if (e.attrs[t]instanceof v.Color) {
                    var i = new v.Color(this.target().attr(t));
                    e.attrs[t].r = i.r, e.attrs[t].g = i.g, e.attrs[t].b = i.b
                } else e.attrs[t].value = this.target().attr(t);
                for (t in e.styles)e.styles[t].value = this.target().style(t);
                return e.initialTransformation = this.target().matrixify(), e.init = !0, this
            }, clearQueue: function () {
                return this.situations = [], this
            }, clearCurrent: function () {
                return this.situation = null, this
            }, stop: function (t, e) {
                return this.active || this.start(), e && this.clearQueue(), this.active = !1, t && this.situation && (this.situation.loop = !1, this.situation.loops % 2 == 0 && this.situation.reversing && (this.situation.reversed = !0), this.at(1)), this.stopAnimFrame(), clearTimeout(this.timeout), this.clearCurrent()
            }, reset: function () {
                if (this.situation) {
                    var t = this.situation;
                    this.stop(), this.situation = t, this.at(0)
                }
                return this
            }, finish: function () {
                for (this.stop(!0, !1); this.dequeue().situation && this.stop(!0, !1););
                return this.clearQueue().clearCurrent(), this
            }, at: function (t) {
                return this.pos = t, this.situation.start = +new Date - t * this.situation.duration, this.situation.finish = this.situation.start + this.situation.duration, this.step(!0)
            }, speed: function (t) {
                return this.situation.duration = this.situation.duration * this.pos + (1 - this.pos) * this.situation.duration / t, this.situation.finish = this.situation.start + this.situation.duration, this.at(this.pos)
            }, loop: function (t, e) {
                return this.situation.loop = this.situation.loops = t || !0, e && (this.last().reversing = !0), this
            }, pause: function () {
                return this.paused = !0, this.stopAnimFrame(), clearTimeout(this.timeout), this
            }, play: function () {
                return this.paused ? (this.paused = !1, this.at(this.pos)) : this
            }, reverse: function (t) {
                var e = this.last();
                return e.reversed = "undefined" == typeof t ? !e.reversed : t, this
            }, progress: function (t) {
                return t ? this.situation.ease(this.pos) : this.pos
            }, after: function (t) {
                var e = this.last(), i = function n(i) {
                    i.detail.situation == e && (t.call(this, e), this.off("finished.fx", n))
                };
                return this.target().on("finished.fx", i), this
            }, during: function (t) {
                var e = this.last(), i = function (i) {
                    i.detail.situation == e && t.call(this, i.detail.pos, v.morph(i.detail.pos), i.detail.eased, e)
                };
                return this.target().off("during.fx", i).on("during.fx", i), this.after(function () {
                    this.off("during.fx", i)
                })
            }, afterAll: function (t) {
                var e = function i() {
                    t.call(this), this.off("allfinished.fx", i)
                };
                return this.target().off("allfinished.fx", e).on("allfinished.fx", e), this
            }, duringAll: function (t) {
                var e = function (e) {
                    t.call(this, e.detail.pos, v.morph(e.detail.pos), e.detail.eased, e.detail.situation)
                };
                return this.target().off("during.fx", e).on("during.fx", e), this.afterAll(function () {
                    this.off("during.fx", e)
                })
            }, last: function () {
                return this.situations.length ? this.situations[this.situations.length - 1] : this.situation
            }, add: function (t, e, i) {
                return this.last()[i || "animations"][t] = e, setTimeout(function () {
                    this.start()
                }.bind(this), 0), this
            }, step: function (t) {
                if (t || (this.pos = this.timeToPos(+new Date)), this.pos >= 1 && (this.situation.loop === !0 || "number" == typeof this.situation.loop && --this.situation.loop))return this.situation.reversing && (this.situation.reversed = !this.situation.reversed), this.at(this.pos - 1);
                this.situation.reversed && (this.pos = 1 - this.pos), this.pos > 1 && (this.pos = 1), this.pos < 0 && (this.pos = 0);
                var e = this.situation.ease(this.pos);
                for (var i in this.situation.once)i > this.lastPos && e >= i && (this.situation.once[i].call(this.target(), this.pos, e), delete this.situation.once[i]);
                return this.active && this.target().fire("during", {
                    pos: this.pos,
                    eased: e,
                    fx: this,
                    situation: this.situation
                }), this.situation ? (this.eachAt(), 1 == this.pos && !this.situation.reversed || this.situation.reversed && 0 == this.pos ? (this.stopAnimFrame(), this.target().fire("finished", {
                    fx: this,
                    situation: this.situation
                }), this.situations.length || (this.target().fire("allfinished"), this.target().off(".fx"), this.active = !1), this.active ? this.dequeue() : this.clearCurrent()) : !this.paused && this.active && this.startAnimFrame(), this.lastPos = e, this) : this
            }, eachAt: function () {
                var t, e, i = this, n = this.target(), r = this.situation;
                for (t in r.animations)e = [].concat(r.animations[t]).map(function (t) {
                    return t.at ? t.at(r.ease(i.pos), i.pos) : t
                }), n[t].apply(n, e);
                for (t in r.attrs)e = [t].concat(r.attrs[t]).map(function (t) {
                    return t.at ? t.at(r.ease(i.pos), i.pos) : t
                }), n.attr.apply(n, e);
                for (t in r.styles)e = [t].concat(r.styles[t]).map(function (t) {
                    return t.at ? t.at(r.ease(i.pos), i.pos) : t
                }), n.style.apply(n, e);
                if (r.transforms.length) {
                    e = r.initialTransformation;
                    for (t in r.transforms) {
                        var s = r.transforms[t];
                        s instanceof v.Matrix ? e = s.relative ? e.multiply(s.at(r.ease(this.pos))) : e.morph(s).at(r.ease(this.pos)) : (s.relative || s.undo(e.extract()), e = e.multiply(s.at(r.ease(this.pos))))
                    }
                    n.matrix(e)
                }
                return this
            }, once: function (t, e, i) {
                return i || (t = this.situation.ease(t)), this.situation.once[t] = e, this
            }
        }, parent: v.Element, construct: {
            animate: function (t, e, i) {
                return (this.fx || (this.fx = new v.FX(this))).animate(t, e, i)
            }, delay: function (t) {
                return (this.fx || (this.fx = new v.FX(this))).delay(t)
            }, stop: function (t, e) {
                return this.fx && this.fx.stop(t, e), this
            }, finish: function () {
                return this.fx && this.fx.finish(), this
            }, pause: function () {
                return this.fx && this.fx.pause(), this
            }, play: function () {
                return this.fx && this.fx.play(), this
            }
        }
    }), v.MorphObj = v.invent({
        create: function (t, e) {
            return v.Color.isColor(e) ? new v.Color(t).morph(e) : v.regex.numberAndUnit.test(e) ? new v.Number(t).morph(e) : (this.value = 0, this.destination = e, void 0)
        }, extend: {
            at: function (t, e) {
                return 1 > e ? this.value : this.destination
            }, valueOf: function () {
                return this.value
            }
        }
    }), v.extend(v.FX, {
        attr: function (t, e) {
            if ("object" == typeof t)for (var i in t)this.attr(i, t[i]); else this.add(t, new v.MorphObj(null, e), "attrs");
            return this
        }, style: function (t, e) {
            if ("object" == typeof t)for (var i in t)this.style(i, t[i]); else this.add(t, new v.MorphObj(null, e), "styles");
            return this
        }, x: function (t, e) {
            if (this.target()instanceof v.G)return this.transform({x: t}, e), this;
            var i = (new v.Number).morph(t);
            return i.relative = e, this.add("x", i)
        }, y: function (t, e) {
            if (this.target()instanceof v.G)return this.transform({y: t}, e), this;
            var i = (new v.Number).morph(t);
            return i.relative = e, this.add("y", i)
        }, cx: function (t) {
            return this.add("cx", (new v.Number).morph(t))
        }, cy: function (t) {
            return this.add("cy", (new v.Number).morph(t))
        }, move: function (t, e) {
            return this.x(t).y(e)
        }, center: function (t, e) {
            return this.cx(t).cy(e)
        }, size: function (t, e) {
            if (this.target()instanceof v.Text)this.attr("font-size", t); else {
                var i;
                t && e || (i = this.target().bbox()), t || (t = i.width / i.height * e), e || (e = i.height / i.width * t), this.add("width", (new v.Number).morph(t)).add("height", (new v.Number).morph(e))
            }
            return this
        }, plot: function (t) {
            return this.add("plot", this.target().array().morph(t))
        }, leading: function (t) {
            return this.target().leading ? this.add("leading", (new v.Number).morph(t)) : this
        }, viewbox: function (t, e, i, n) {
            return this.target()instanceof v.Container && this.add("viewbox", new v.ViewBox(t, e, i, n)), this
        }, update: function (t) {
            if (this.target()instanceof v.Stop) {
                if ("number" == typeof t || t instanceof v.Number)return this.update({
                    offset: arguments[0],
                    color: arguments[1],
                    opacity: arguments[2]
                });
                null != t.opacity && this.attr("stop-opacity", t.opacity), null != t.color && this.attr("stop-color", t.color), null != t.offset && this.attr("offset", t.offset)
            }
            return this
        }
    }), v.BBox = v.invent({
        create: function (t) {
            if (t) {
                var i;
                try {
                    if (!e.documentElement.contains(t.node))throw new Exception("Element not in the dom");
                    i = t.node.getBBox()
                } catch (n) {
                    if (t instanceof v.Shape) {
                        var r = t.clone(v.parser.draw);
                        i = r.bbox(), r.remove()
                    } else i = {
                        x: t.node.clientLeft,
                        y: t.node.clientTop,
                        width: t.node.clientWidth,
                        height: t.node.clientHeight
                    }
                }
                this.x = i.x, this.y = i.y, this.width = i.width, this.height = i.height
            }
            x(this)
        }, parent: v.Element, construct: {
            bbox: function () {
                return new v.BBox(this)
            }
        }
    }), v.TBox = v.invent({
        create: function (t) {
            if (t) {
                var e = t.ctm().extract(), i = t.bbox();
                this.width = i.width * e.scaleX, this.height = i.height * e.scaleY, this.x = i.x + e.x, this.y = i.y + e.y
            }
            x(this)
        }, parent: v.Element, construct: {
            tbox: function () {
                return new v.TBox(this)
            }
        }
    }), v.RBox = v.invent({
        create: function (e) {
            if (e) {
                var i = e.doc().parent(), n = e.node.getBoundingClientRect(), r = 1;
                for (this.x = n.left, this.y = n.top, this.x -= i.offsetLeft, this.y -= i.offsetTop; i = i.offsetParent;)this.x -= i.offsetLeft, this.y -= i.offsetTop;
                for (i = e; i.parent && (i = i.parent());)i.viewbox && (r *= i.viewbox().zoom, this.x -= i.x() || 0, this.y -= i.y() || 0);
                this.width = n.width /= r, this.height = n.height /= r
            }
            x(this), this.x += t.pageXOffset, this.y += t.pageYOffset
        }, parent: v.Element, construct: {
            rbox: function () {
                return new v.RBox(this)
            }
        }
    }), [v.BBox, v.TBox, v.RBox].forEach(function (t) {
        v.extend(t, {
            merge: function (e) {
                var i = new t;
                return i.x = Math.min(this.x, e.x), i.y = Math.min(this.y, e.y), i.width = Math.max(this.x + this.width, e.x + e.width) - i.x, i.height = Math.max(this.y + this.height, e.y + e.height) - i.y, x(i)
            }
        })
    }), v.Matrix = v.invent({
        create: function (t) {
            var e, i = l([1, 0, 0, 1, 0, 0]);
            for (t = t instanceof v.Element ? t.matrixify() : "string" == typeof t ? d(t) : 6 == arguments.length ? l([].slice.call(arguments)) : "object" == typeof t ? t : i, e = w.length - 1; e >= 0; --e)this[w[e]] = t && "number" == typeof t[w[e]] ? t[w[e]] : i[w[e]]
        }, extend: {
            extract: function () {
                var t = u(this, 0, 1), e = u(this, 1, 0), i = 180 / Math.PI * Math.atan2(t.y, t.x) - 90;
                return {
                    x: this.e,
                    y: this.f,
                    transformedX: (this.e * Math.cos(i * Math.PI / 180) + this.f * Math.sin(i * Math.PI / 180)) / Math.sqrt(this.a * this.a + this.b * this.b),
                    transformedY: (this.f * Math.cos(i * Math.PI / 180) + this.e * Math.sin(-i * Math.PI / 180)) / Math.sqrt(this.c * this.c + this.d * this.d),
                    skewX: -i,
                    skewY: 180 / Math.PI * Math.atan2(e.y, e.x),
                    scaleX: Math.sqrt(this.a * this.a + this.b * this.b),
                    scaleY: Math.sqrt(this.c * this.c + this.d * this.d),
                    rotation: i,
                    a: this.a,
                    b: this.b,
                    c: this.c,
                    d: this.d,
                    e: this.e,
                    f: this.f,
                    matrix: new v.Matrix(this)
                }
            }, clone: function () {
                return new v.Matrix(this)
            }, morph: function (t) {
                return this.destination = new v.Matrix(t), this
            }, at: function (t) {
                if (!this.destination)return this;
                var e = new v.Matrix({
                    a: this.a + (this.destination.a - this.a) * t,
                    b: this.b + (this.destination.b - this.b) * t,
                    c: this.c + (this.destination.c - this.c) * t,
                    d: this.d + (this.destination.d - this.d) * t,
                    e: this.e + (this.destination.e - this.e) * t,
                    f: this.f + (this.destination.f - this.f) * t
                });
                if (this.param && this.param.to) {
                    var i = {
                        rotation: this.param.from.rotation + (this.param.to.rotation - this.param.from.rotation) * t,
                        cx: this.param.from.cx,
                        cy: this.param.from.cy
                    };
                    e = e.rotate((this.param.to.rotation - 2 * this.param.from.rotation) * t, i.cx, i.cy), e.param = i
                }
                return e
            }, multiply: function (t) {
                return new v.Matrix(this.native().multiply(c(t).native()))
            }, inverse: function () {
                return new v.Matrix(this.native().inverse())
            }, translate: function (t, e) {
                return new v.Matrix(this.native().translate(t || 0, e || 0))
            }, scale: function (t, e, i, n) {
                return (1 == arguments.length || 3 == arguments.length) && (e = t), 3 == arguments.length && (n = i, i = e), this.around(i, n, new v.Matrix(t, 0, 0, e, 0, 0))
            }, rotate: function (t, e, i) {
                return t = v.utils.radians(t), this.around(e, i, new v.Matrix(Math.cos(t), Math.sin(t), -Math.sin(t), Math.cos(t), 0, 0))
            }, flip: function (t, e) {
                return "x" == t ? this.scale(-1, 1, e, 0) : this.scale(1, -1, 0, e)
            }, skew: function (t, e, i, n) {
                return this.around(i, n, this.native().skewX(t || 0).skewY(e || 0))
            }, skewX: function (t, e, i) {
                return this.around(e, i, this.native().skewX(t || 0))
            }, skewY: function (t, e, i) {
                return this.around(e, i, this.native().skewY(t || 0))
            }, around: function (t, e, i) {
                return this.multiply(new v.Matrix(1, 0, 0, 1, t || 0, e || 0)).multiply(i).multiply(new v.Matrix(1, 0, 0, 1, -t || 0, -e || 0))
            }, "native": function () {
                for (var t = v.parser.native.createSVGMatrix(), e = w.length - 1; e >= 0; e--)t[w[e]] = this[w[e]];
                return t
            }, toString: function () {
                return "matrix(" + this.a + "," + this.b + "," + this.c + "," + this.d + "," + this.e + "," + this.f + ")"
            }
        }, parent: v.Element, construct: {
            ctm: function () {
                return new v.Matrix(this.node.getCTM())
            }, screenCTM: function () {
                return new v.Matrix(this.node.getScreenCTM())
            }
        }
    }), v.Point = v.invent({
        create: function (t, e) {
            var i, n = {x: 0, y: 0};
            i = Array.isArray(t) ? {x: t[0], y: t[1]} : "object" == typeof t ? {x: t.x, y: t.y} : null != e ? {
                x: t,
                y: e
            } : n, this.x = i.x, this.y = i.y
        }, extend: {
            clone: function () {
                return new v.Point(this)
            }, morph: function (t) {
                return this.destination = new v.Point(t), this
            }, at: function (t) {
                if (!this.destination)return this;
                var e = new v.Point({
                    x: this.x + (this.destination.x - this.x) * t,
                    y: this.y + (this.destination.y - this.y) * t
                });
                return e
            }, "native": function () {
                var t = v.parser.native.createSVGPoint();
                return t.x = this.x, t.y = this.y, t
            }, transform: function (t) {
                return new v.Point(this.native().matrixTransform(t.native()))
            }
        }
    }), v.extend(v.Element, {
        point: function (t, e) {
            return new v.Point(t, e).transform(this.screenCTM().inverse())
        }
    }), v.extend(v.Element, {
        attr: function (t, e, i) {
            if (null == t) {
                for (t = {}, e = this.node.attributes, i = e.length - 1; i >= 0; i--)t[e[i].nodeName] = v.regex.isNumber.test(e[i].nodeValue) ? parseFloat(e[i].nodeValue) : e[i].nodeValue;
                return t
            }
            if ("object" == typeof t)for (e in t)this.attr(e, t[e]); else if (null === e)this.node.removeAttribute(t); else {
                if (null == e)return e = this.node.getAttribute(t), null == e ? v.defaults.attrs[t] : v.regex.isNumber.test(e) ? parseFloat(e) : e;
                "stroke-width" == t ? this.attr("stroke", parseFloat(e) > 0 ? this._stroke : null) : "stroke" == t && (this._stroke = e), ("fill" == t || "stroke" == t) && (v.regex.isImage.test(e) && (e = this.doc().defs().image(e, 0, 0)), e instanceof v.Image && (e = this.doc().defs().pattern(0, 0, function () {
                    this.add(e)
                }))), "number" == typeof e ? e = new v.Number(e) : v.Color.isColor(e) ? e = new v.Color(e) : Array.isArray(e) ? e = new v.Array(e) : e instanceof v.Matrix && e.param && (this.param = e.param), "leading" == t ? this.leading && this.leading(e) : "string" == typeof i ? this.node.setAttributeNS(i, t, e.toString()) : this.node.setAttribute(t, e.toString()), !this.rebuild || "font-size" != t && "x" != t || this.rebuild(t, e)
            }
            return this
        }
    }), v.extend(v.Element, {
        transform: function (t, e) {
            var i, n = this;
            if ("object" != typeof t)return i = new v.Matrix(n).extract(), "string" == typeof t ? i[t] : i;
            if (i = new v.Matrix(n), e = !!e || !!t.relative, null != t.a)i = e ? i.multiply(new v.Matrix(t)) : new v.Matrix(t);
            else if (null != t.rotation)f(t, n), i = e ? i.rotate(t.rotation, t.cx, t.cy) : i.rotate(t.rotation - i.extract().rotation, t.cx, t.cy); else if (null != t.scale || null != t.scaleX || null != t.scaleY) {
                if (f(t, n), t.scaleX = null != t.scale ? t.scale : null != t.scaleX ? t.scaleX : 1, t.scaleY = null != t.scale ? t.scale : null != t.scaleY ? t.scaleY : 1, !e) {
                    var r = i.extract();
                    t.scaleX = 1 * t.scaleX / r.scaleX, t.scaleY = 1 * t.scaleY / r.scaleY
                }
                i = i.scale(t.scaleX, t.scaleY, t.cx, t.cy)
            } else if (null != t.skewX || null != t.skewY) {
                if (f(t, n), t.skewX = null != t.skewX ? t.skewX : 0, t.skewY = null != t.skewY ? t.skewY : 0, !e) {
                    var r = i.extract();
                    i = i.multiply((new v.Matrix).skew(r.skewX, r.skewY, t.cx, t.cy).inverse())
                }
                i = i.skew(t.skewX, t.skewY, t.cx, t.cy)
            } else t.flip ? i = i.flip(t.flip, null == t.offset ? n.bbox()["c" + t.flip] : t.offset) : (null != t.x || null != t.y) && (e ? i = i.translate(t.x, t.y) : (null != t.x && (i.e = t.x), null != t.y && (i.f = t.y)));
            return this.attr("transform", i)
        }
    }), v.extend(v.FX, {
        transform: function (t, e) {
            var i, n = this.target();
            return "object" != typeof t ? (i = new v.Matrix(n).extract(), "string" == typeof t ? i[t] : i) : (e = !!e || !!t.relative, null != t.a ? i = new v.Matrix(t) : null != t.rotation ? (f(t, n), i = new v.Rotate(t.rotation, t.cx, t.cy)) : null != t.scale || null != t.scaleX || null != t.scaleY ? (f(t, n), t.scaleX = null != t.scale ? t.scale : null != t.scaleX ? t.scaleX : 1, t.scaleY = null != t.scale ? t.scale : null != t.scaleY ? t.scaleY : 1, i = new v.Scale(t.scaleX, t.scaleY, t.cx, t.cy)) : null != t.skewX || null != t.skewY ? (f(t, n), t.skewX = null != t.skewX ? t.skewX : 0, t.skewY = null != t.skewY ? t.skewY : 0, i = new v.Skew(t.skewX, t.skewY, t.cx, t.cy)) : t.flip ? i = (new v.Matrix).morph((new v.Matrix).flip(t.flip, null == t.offset ? n.bbox()["c" + t.flip] : t.offset)) : (null != t.x || null != t.y) && (i = new v.Translate(t.x, t.y)), i ? (i.relative = e, this.last().transforms.push(i), setTimeout(function () {
                this.start()
            }.bind(this), 0), this) : this)
        }
    }), v.extend(v.Element, {
        untransform: function () {
            return this.attr("transform", null)
        }, matrixify: function () {
            var t = (this.attr("transform") || "").split(/\)\s*/).slice(0, -1).map(function (t) {
                var e = t.trim().split("(");
                return [e[0], e[1].split(v.regex.matrixElements).map(function (t) {
                    return parseFloat(t)
                })]
            }).reduce(function (t, e) {
                return "matrix" == e[0] ? t.multiply(l(e[1])) : t[e[0]].apply(t, e[1])
            }, new v.Matrix);
            return t
        }, toParent: function (t) {
            if (this == t)return this;
            var e = this.screenCTM(), i = t.rect(1, 1), n = i.screenCTM().inverse();
            return i.remove(), this.addTo(t).untransform().transform(n.multiply(e)), this
        }, toDoc: function () {
            return this.toParent(this.doc())
        }
    }), v.Transformation = v.invent({
        create: function (t, e) {
            if (arguments.length > 1 && "boolean" != typeof e)return this.create([].slice.call(arguments));
            if ("object" == typeof t)for (var i = 0, n = this.arguments.length; n > i; ++i)this[this.arguments[i]] = t[this.arguments[i]];
            if (Array.isArray(t))for (var i = 0, n = this.arguments.length; n > i; ++i)this[this.arguments[i]] = t[i];
            this.inversed = !1, e === !0 && (this.inversed = !0)
        }, extend: {
            at: function (t) {
                for (var e = [], i = 0, n = this.arguments.length; n > i; ++i)e.push(this[this.arguments[i]]);
                var r = this._undo || new v.Matrix;
                return r = (new v.Matrix).morph(v.Matrix.prototype[this.method].apply(r, e)).at(t), this.inversed ? r.inverse() : r
            }, undo: function (t) {
                for (var e = 0, i = this.arguments.length; i > e; ++e)t[this.arguments[e]] = "undefined" == typeof this[this.arguments[e]] ? 0 : t[this.arguments[e]];
                return this._undo = new (v[s(this.method)])(t, !0).at(1), this
            }
        }
    }), v.Translate = v.invent({
        parent: v.Matrix, inherit: v.Transformation, create: function (t, e) {
            "object" == typeof t ? this.constructor.call(this, t, e) : this.constructor.call(this, [].slice.call(arguments))
        }, extend: {arguments: ["transformedX", "transformedY"], method: "translate"}
    }), v.Rotate = v.invent({
        parent: v.Matrix, inherit: v.Transformation, create: function (t, e) {
            "object" == typeof t ? this.constructor.call(this, t, e) : this.constructor.call(this, [].slice.call(arguments))
        }, extend: {
            arguments: ["rotation", "cx", "cy"], method: "rotate", at: function (t) {
                var e = (new v.Matrix).rotate((new v.Number).morph(this.rotation - (this._undo ? this._undo.rotation : 0)).at(t), this.cx, this.cy);
                return this.inversed ? e.inverse() : e
            }, undo: function (t) {
                this._undo = t
            }
        }
    }), v.Scale = v.invent({
        parent: v.Matrix, inherit: v.Transformation, create: function (t, e) {
            "object" == typeof t ? this.constructor.call(this, t, e) : this.constructor.call(this, [].slice.call(arguments))
        }, extend: {arguments: ["scaleX", "scaleY", "cx", "cy"], method: "scale"}
    }), v.Skew = v.invent({
        parent: v.Matrix, inherit: v.Transformation, create: function (t, e) {
            "object" == typeof t ? this.constructor.call(this, t, e) : this.constructor.call(this, [].slice.call(arguments))
        }, extend: {arguments: ["skewX", "skewY", "cx", "cy"], method: "skew"}
    }), v.extend(v.Element, {
        style: function (t, e) {
            if (0 == arguments.length)return this.node.style.cssText || "";
            if (arguments.length < 2)if ("object" == typeof t)for (e in t)this.style(e, t[e]); else {
                if (!v.regex.isCss.test(t))return this.node.style[r(t)];
                t = t.split(";");
                for (var i = 0; i < t.length; i++)e = t[i].split(":"), this.style(e[0].replace(/\s+/g, ""), e[1])
            } else this.node.style[r(t)] = null === e || v.regex.isBlank.test(e) ? "" : e;
            return this
        }
    }), v.Parent = v.invent({
        create: function (t) {
            this.constructor.call(this, t)
        }, inherit: v.Element, extend: {
            children: function () {
                return v.utils.map(v.utils.filterSVGElements(this.node.childNodes), function (t) {
                    return v.adopt(t)
                })
            }, add: function (t, e) {
                return this.has(t) || (e = null == e ? this.children().length : e, this.node.insertBefore(t.node, v.utils.filterSVGElements(this.node.childNodes)[e] || null)), this
            }, put: function (t, e) {
                return this.add(t, e), t
            }, has: function (t) {
                return this.index(t) >= 0
            }, index: function (t) {
                return this.children().indexOf(t)
            }, get: function (t) {
                return this.children()[t]
            }, first: function () {
                return this.children()[0]
            }, last: function () {
                return this.children()[this.children().length - 1]
            }, each: function (t, e) {
                var i, n, r = this.children();
                for (i = 0, n = r.length; n > i; i++)r[i]instanceof v.Element && t.apply(r[i], [i, r]), e && r[i]instanceof v.Container && r[i].each(t, e);
                return this
            }, removeElement: function (t) {
                return this.node.removeChild(t.node), this
            }, clear: function () {
                for (; this.node.hasChildNodes();)this.node.removeChild(this.node.lastChild);
                return delete this._defs, this
            }, defs: function () {
                return this.doc().defs()
            }
        }
    }), v.extend(v.Parent, {
        ungroup: function (t, e) {
            return 0 === e || this instanceof v.Defs ? this : (t = t || (this instanceof v.Doc ? this : this.parent(v.Parent)), e = e || 1 / 0, this.each(function () {
                return this instanceof v.Defs ? this : this instanceof v.Parent ? this.ungroup(t, e - 1) : this.toParent(t)
            }), this.node.firstChild || this.remove(), this)
        }, flatten: function (t, e) {
            return this.ungroup(t, e)
        }
    }), v.Container = v.invent({
        create: function (t) {
            this.constructor.call(this, t)
        }, inherit: v.Parent
    }), v.ViewBox = v.invent({
        create: function (t) {
            var e, i, n, r, s, a, o, h, u = [0, 0, 0, 0], l = 1, c = 1, f = /[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/gi;
            if (t instanceof v.Element) {
                for (o = t, h = t, a = (t.attr("viewBox") || "").match(f), s = t.bbox, n = new v.Number(t.width()), r = new v.Number(t.height()); "%" == n.unit;)l *= n.value, n = new v.Number(o instanceof v.Doc ? o.parent().offsetWidth : o.parent().width()), o = o.parent();
                for (; "%" == r.unit;)c *= r.value, r = new v.Number(h instanceof v.Doc ? h.parent().offsetHeight : h.parent().height()), h = h.parent();
                this.x = 0, this.y = 0, this.width = n * l, this.height = r * c, this.zoom = 1, a && (e = parseFloat(a[0]), i = parseFloat(a[1]), n = parseFloat(a[2]), r = parseFloat(a[3]), this.zoom = this.width / this.height > n / r ? this.height / r : this.width / n, this.x = e, this.y = i, this.width = n, this.height = r)
            } else t = "string" == typeof t ? t.match(f).map(function (t) {
                return parseFloat(t)
            }) : Array.isArray(t) ? t : "object" == typeof t ? [t.x, t.y, t.width, t.height] : 4 == arguments.length ? [].slice.call(arguments) : u, this.x = t[0], this.y = t[1], this.width = t[2], this.height = t[3]
        }, extend: {
            toString: function () {
                return this.x + " " + this.y + " " + this.width + " " + this.height
            }, morph: function (t) {
                var t = 1 == arguments.length ? [t.x, t.y, t.width, t.height] : [].slice.call(arguments);
                return this.destination = new v.ViewBox(t), this
            }, at: function (t) {
                return this.destination ? new v.ViewBox([this.x + (this.destination.x - this.x) * t, this.y + (this.destination.y - this.y) * t, this.width + (this.destination.width - this.width) * t, this.height + (this.destination.height - this.height) * t]) : this
            }
        }, parent: v.Container, construct: {
            viewbox: function (t) {
                return 0 == arguments.length ? new v.ViewBox(this) : (t = 1 == arguments.length ? [t.x, t.y, t.width, t.height] : [].slice.call(arguments), this.attr("viewBox", t))
            }
        }
    }), ["click", "dblclick", "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "touchstart", "touchmove", "touchleave", "touchend", "touchcancel"].forEach(function (t) {
        v.Element.prototype[t] = function (e) {
            var i = this;
            return this.node["on" + t] = "function" == typeof e ? function () {
                return e.apply(i, arguments)
            } : null, this
        }
    }), v.listeners = [], v.handlerMap = [], v.listenerId = 0, v.on = function (t, e, i, n) {
        var r = i.bind(n || t.instance || t), s = (v.handlerMap.indexOf(t) + 1 || v.handlerMap.push(t)) - 1, a = e.split(".")[0], o = e.split(".")[1] || "*";
        v.listeners[s] = v.listeners[s] || {}, v.listeners[s][a] = v.listeners[s][a] || {}, v.listeners[s][a][o] = v.listeners[s][a][o] || {}, i._svgjsListenerId || (i._svgjsListenerId = ++v.listenerId), v.listeners[s][a][o][i._svgjsListenerId] = r, t.addEventListener(a, r, !1)
    }, v.off = function (t, e, i) {
        var n = v.handlerMap.indexOf(t), r = e && e.split(".")[0], s = e && e.split(".")[1];
        if (-1 != n)if (i) {
            if ("function" == typeof i && (i = i._svgjsListenerId), !i)return;
            v.listeners[n][r] && v.listeners[n][r][s || "*"] && (t.removeEventListener(r, v.listeners[n][r][s || "*"][i], !1), delete v.listeners[n][r][s || "*"][i])
        } else if (s && r) {
            if (v.listeners[n][r] && v.listeners[n][r][s]) {
                for (i in v.listeners[n][r][s])v.off(t, [r, s].join("."), i);
                delete v.listeners[n][r][s]
            }
        } else if (s)for (e in v.listeners[n])for (namespace in v.listeners[n][e])s === namespace && v.off(t, [e, s].join(".")); else if (r) {
            if (v.listeners[n][r]) {
                for (namespace in v.listeners[n][r])v.off(t, [r, namespace].join("."));
                delete v.listeners[n][r]
            }
        } else {
            for (e in v.listeners[n])v.off(t, e);
            delete v.listeners[n]
        }
    }, v.extend(v.Element, {
        on: function (t, e, i) {
            return v.on(this.node, t, e, i), this
        }, off: function (t, e) {
            return v.off(this.node, t, e), this
        }, fire: function (t, e) {
            return t instanceof Event ? this.node.dispatchEvent(t) : this.node.dispatchEvent(new b(t, {detail: e})), this
        }
    }), v.Defs = v.invent({create: "defs", inherit: v.Container}), v.G = v.invent({
        create: "g",
        inherit: v.Container,
        extend: {
            x: function (t) {
                return null == t ? this.transform("x") : this.transform({x: t - this.x()}, !0)
            }, y: function (t) {
                return null == t ? this.transform("y") : this.transform({y: t - this.y()}, !0)
            }, cx: function (t) {
                return null == t ? this.gbox().cx : this.x(t - this.gbox().width / 2)
            }, cy: function (t) {
                return null == t ? this.gbox().cy : this.y(t - this.gbox().height / 2)
            }, gbox: function () {
                var t = this.bbox(), e = this.transform();
                return t.x += e.x, t.x2 += e.x, t.cx += e.x, t.y += e.y, t.y2 += e.y, t.cy += e.y, t
            }
        },
        construct: {
            group: function () {
                return this.put(new v.G)
            }
        }
    }), v.extend(v.Element, {
        siblings: function () {
            return this.parent().children()
        }, position: function () {
            return this.parent().index(this)
        }, next: function () {
            return this.siblings()[this.position() + 1]
        }, previous: function () {
            return this.siblings()[this.position() - 1]
        }, forward: function () {
            var t = this.position() + 1, e = this.parent();
            return e.removeElement(this).add(this, t), e instanceof v.Doc && e.node.appendChild(e.defs().node), this
        }, backward: function () {
            var t = this.position();
            return t > 0 && this.parent().removeElement(this).add(this, t - 1), this
        }, front: function () {
            var t = this.parent();
            return t.node.appendChild(this.node), t instanceof v.Doc && t.node.appendChild(t.defs().node), this
        }, back: function () {
            return this.position() > 0 && this.parent().removeElement(this).add(this, 0), this
        }, before: function (t) {
            t.remove();
            var e = this.position();
            return this.parent().add(t, e), this
        }, after: function (t) {
            t.remove();
            var e = this.position();
            return this.parent().add(t, e + 1), this
        }
    }), v.Mask = v.invent({
        create: function () {
            this.constructor.call(this, v.create("mask")), this.targets = []
        }, inherit: v.Container, extend: {
            remove: function () {
                for (var t = this.targets.length - 1; t >= 0; t--)this.targets[t] && this.targets[t].unmask();
                return this.targets = [], this.parent().removeElement(this), this
            }
        }, construct: {
            mask: function () {
                return this.defs().put(new v.Mask)
            }
        }
    }), v.extend(v.Element, {
        maskWith: function (t) {
            return this.masker = t instanceof v.Mask ? t : this.parent().mask().add(t), this.masker.targets.push(this), this.attr("mask", 'url("#' + this.masker.attr("id") + '")')
        }, unmask: function () {
            return delete this.masker, this.attr("mask", null)
        }
    }), v.ClipPath = v.invent({
        create: function () {
            this.constructor.call(this, v.create("clipPath")), this.targets = []
        }, inherit: v.Container, extend: {
            remove: function () {
                for (var t = this.targets.length - 1; t >= 0; t--)this.targets[t] && this.targets[t].unclip();
                return this.targets = [], this.parent().removeElement(this), this
            }
        }, construct: {
            clip: function () {
                return this.defs().put(new v.ClipPath)
            }
        }
    }), v.extend(v.Element, {
        clipWith: function (t) {
            return this.clipper = t instanceof v.ClipPath ? t : this.parent().clip().add(t), this.clipper.targets.push(this), this.attr("clip-path", 'url("#' + this.clipper.attr("id") + '")')
        }, unclip: function () {
            return delete this.clipper, this.attr("clip-path", null)
        }
    }), v.Gradient = v.invent({
        create: function (t) {
            this.constructor.call(this, v.create(t + "Gradient")), this.type = t
        }, inherit: v.Container, extend: {
            at: function (t, e, i) {
                return this.put(new v.Stop).update(t, e, i)
            }, update: function (t) {
                return this.clear(), "function" == typeof t && t.call(this, this), this
            }, fill: function () {
                return "url(#" + this.id() + ")"
            }, toString: function () {
                return this.fill()
            }, attr: function (t, e, i) {
                return "transform" == t && (t = "gradientTransform"), v.Container.prototype.attr.call(this, t, e, i)
            }
        }, construct: {
            gradient: function (t, e) {
                return this.defs().gradient(t, e)
            }
        }
    }), v.extend(v.Gradient, v.FX, {
        from: function (t, e) {
            return "radial" == (this._target || this).type ? this.attr({
                fx: new v.Number(t),
                fy: new v.Number(e)
            }) : this.attr({x1: new v.Number(t), y1: new v.Number(e)})
        }, to: function (t, e) {
            return "radial" == (this._target || this).type ? this.attr({
                cx: new v.Number(t),
                cy: new v.Number(e)
            }) : this.attr({x2: new v.Number(t), y2: new v.Number(e)})
        }
    }), v.extend(v.Defs, {
        gradient: function (t, e) {
            return this.put(new v.Gradient(t)).update(e)
        }
    }), v.Stop = v.invent({
        create: "stop", inherit: v.Element, extend: {
            update: function (t) {
                return ("number" == typeof t || t instanceof v.Number) && (t = {
                    offset: arguments[0],
                    color: arguments[1],
                    opacity: arguments[2]
                }), null != t.opacity && this.attr("stop-opacity", t.opacity), null != t.color && this.attr("stop-color", t.color), null != t.offset && this.attr("offset", new v.Number(t.offset)), this
            }
        }
    }), v.Pattern = v.invent({
        create: "pattern", inherit: v.Container, extend: {
            fill: function () {
                return "url(#" + this.id() + ")"
            }, update: function (t) {
                return this.clear(), "function" == typeof t && t.call(this, this), this
            }, toString: function () {
                return this.fill()
            }, attr: function (t, e, i) {
                return "transform" == t && (t = "patternTransform"), v.Container.prototype.attr.call(this, t, e, i)
            }
        }, construct: {
            pattern: function (t, e, i) {
                return this.defs().pattern(t, e, i)
            }
        }
    }), v.extend(v.Defs, {
        pattern: function (t, e, i) {
            return this.put(new v.Pattern).update(i).attr({
                x: 0,
                y: 0,
                width: t,
                height: e,
                patternUnits: "userSpaceOnUse"
            })
        }
    }), v.Doc = v.invent({
        create: function (t) {
            t && (t = "string" == typeof t ? e.getElementById(t) : t, "svg" == t.nodeName ? this.constructor.call(this, t) : (this.constructor.call(this, v.create("svg")), t.appendChild(this.node), this.size("100%", "100%")), this.namespace().defs())
        }, inherit: v.Container, extend: {
            namespace: function () {
                return this.attr({
                    xmlns: v.ns,
                    version: "1.1"
                }).attr("xmlns:xlink", v.xlink, v.xmlns).attr("xmlns:svgjs", v.svgjs, v.xmlns)
            }, defs: function () {
                if (!this._defs) {
                    var t;
                    this._defs = (t = this.node.getElementsByTagName("defs")[0]) ? v.adopt(t) : new v.Defs, this.node.appendChild(this._defs.node)
                }
                return this._defs
            }, parent: function () {
                return "#document" == this.node.parentNode.nodeName ? null : this.node.parentNode
            }, spof: function () {
                var t = this.node.getScreenCTM();
                return t && this.style("left", -t.e % 1 + "px").style("top", -t.f % 1 + "px"), this
            }, remove: function () {
                return this.parent() && this.parent().removeChild(this.node), this
            }
        }
    }), v.Shape = v.invent({
        create: function (t) {
            this.constructor.call(this, t)
        }, inherit: v.Element
    }), v.Bare = v.invent({
        create: function (t, e) {
            if (this.constructor.call(this, v.create(t)), e)for (var i in e.prototype)"function" == typeof e.prototype[i] && (this[i] = e.prototype[i])
        }, inherit: v.Element, extend: {
            words: function (t) {
                for (; this.node.hasChildNodes();)this.node.removeChild(this.node.lastChild);
                return this.node.appendChild(e.createTextNode(t)), this
            }
        }
    }), v.extend(v.Parent, {
        element: function (t, e) {
            return this.put(new v.Bare(t, e))
        }, symbol: function () {
            return this.defs().element("symbol", v.Container)
        }
    }), v.Use = v.invent({
        create: "use", inherit: v.Shape, extend: {
            element: function (t, e) {
                return this.attr("href", (e || "") + "#" + t, v.xlink)
            }
        }, construct: {
            use: function (t, e) {
                return this.put(new v.Use).element(t, e)
            }
        }
    }), v.Rect = v.invent({
        create: "rect", inherit: v.Shape, construct: {
            rect: function (t, e) {
                return this.put(new v.Rect).size(t, e)
            }
        }
    }), v.Circle = v.invent({
        create: "circle", inherit: v.Shape, construct: {
            circle: function (t) {
                return this.put(new v.Circle).rx(new v.Number(t).divide(2)).move(0, 0)
            }
        }
    }), v.extend(v.Circle, v.FX, {
        rx: function (t) {
            return this.attr("r", t)
        }, ry: function (t) {
            return this.rx(t)
        }
    }), v.Ellipse = v.invent({
        create: "ellipse", inherit: v.Shape, construct: {
            ellipse: function (t, e) {
                return this.put(new v.Ellipse).size(t, e).move(0, 0)
            }
        }
    }), v.extend(v.Ellipse, v.Rect, v.FX, {
        rx: function (t) {
            return this.attr("rx", t)
        }, ry: function (t) {
            return this.attr("ry", t)
        }
    }), v.extend(v.Circle, v.Ellipse, {
        x: function (t) {
            return null == t ? this.cx() - this.rx() : this.cx(t + this.rx())
        }, y: function (t) {
            return null == t ? this.cy() - this.ry() : this.cy(t + this.ry())
        }, cx: function (t) {
            return null == t ? this.attr("cx") : this.attr("cx", t)
        }, cy: function (t) {
            return null == t ? this.attr("cy") : this.attr("cy", t)
        }, width: function (t) {
            return null == t ? 2 * this.rx() : this.rx(new v.Number(t).divide(2))
        }, height: function (t) {
            return null == t ? 2 * this.ry() : this.ry(new v.Number(t).divide(2))
        }, size: function (t, e) {
            var i = h(this.bbox(), t, e);
            return this.rx(new v.Number(i.width).divide(2)).ry(new v.Number(i.height).divide(2))
        }
    }), v.Line = v.invent({
        create: "line", inherit: v.Shape, extend: {
            array: function () {
                return new v.PointArray([[this.attr("x1"), this.attr("y1")], [this.attr("x2"), this.attr("y2")]])
            }, plot: function (t, e, i, n) {
                return t = "undefined" != typeof e ? {
                    x1: t,
                    y1: e,
                    x2: i,
                    y2: n
                } : new v.PointArray(t).toLine(), this.attr(t)
            }, move: function (t, e) {
                return this.attr(this.array().move(t, e).toLine())
            }, size: function (t, e) {
                var i = h(this.bbox(), t, e);
                return this.attr(this.array().size(i.width, i.height).toLine())
            }
        }, construct: {
            line: function (t, e, i, n) {
                return this.put(new v.Line).plot(t, e, i, n)
            }
        }
    }), v.Polyline = v.invent({
        create: "polyline", inherit: v.Shape, construct: {
            polyline: function (t) {
                return this.put(new v.Polyline).plot(t)
            }
        }
    }), v.Polygon = v.invent({
        create: "polygon", inherit: v.Shape, construct: {
            polygon: function (t) {
                return this.put(new v.Polygon).plot(t)
            }
        }
    }), v.extend(v.Polyline, v.Polygon, {
        array: function () {
            return this._array || (this._array = new v.PointArray(this.attr("points")))
        }, plot: function (t) {
            return this.attr("points", this._array = new v.PointArray(t))
        }, move: function (t, e) {
            return this.attr("points", this.array().move(t, e))
        }, size: function (t, e) {
            var i = h(this.bbox(), t, e);
            return this.attr("points", this.array().size(i.width, i.height))
        }
    }), v.extend(v.Line, v.Polyline, v.Polygon, {
        morphArray: v.PointArray, x: function (t) {
            return null == t ? this.bbox().x : this.move(t, this.bbox().y)
        }, y: function (t) {
            return null == t ? this.bbox().y : this.move(this.bbox().x, t)
        }, width: function (t) {
            var e = this.bbox();
            return null == t ? e.width : this.size(t, e.height)
        }, height: function (t) {
            var e = this.bbox();
            return null == t ? e.height : this.size(e.width, t)
        }
    }), v.Path = v.invent({
        create: "path", inherit: v.Shape, extend: {
            morphArray: v.PathArray, array: function () {
                return this._array || (this._array = new v.PathArray(this.attr("d")))
            }, plot: function (t) {
                return this.attr("d", this._array = new v.PathArray(t))
            }, move: function (t, e) {
                return this.attr("d", this.array().move(t, e))
            }, x: function (t) {
                return null == t ? this.bbox().x : this.move(t, this.bbox().y)
            }, y: function (t) {
                return null == t ? this.bbox().y : this.move(this.bbox().x, t)
            }, size: function (t, e) {
                var i = h(this.bbox(), t, e);
                return this.attr("d", this.array().size(i.width, i.height))
            }, width: function (t) {
                return null == t ? this.bbox().width : this.size(t, this.bbox().height)
            }, height: function (t) {
                return null == t ? this.bbox().height : this.size(this.bbox().width, t)
            }
        }, construct: {
            path: function (t) {
                return this.put(new v.Path).plot(t)
            }
        }
    }), v.Image = v.invent({
        create: "image", inherit: v.Shape, extend: {
            load: function (t) {
                if (!t)return this;
                var i = this, n = e.createElement("img");
                return n.onload = function () {
                    var e = i.parent(v.Pattern);
                    null !== e && (0 == i.width() && 0 == i.height() && i.size(n.width, n.height), e && 0 == e.width() && 0 == e.height() && e.size(i.width(), i.height()), "function" == typeof i._loaded && i._loaded.call(i, {
                        width: n.width,
                        height: n.height,
                        ratio: n.width / n.height,
                        url: t
                    }))
                }, this.attr("href", n.src = this.src = t, v.xlink)
            }, loaded: function (t) {
                return this._loaded = t, this
            }
        }, construct: {
            image: function (t, e, i) {
                return this.put(new v.Image).load(t).size(e || 0, i || e || 0)
            }
        }
    }), v.Text = v.invent({
        create: function () {
            this.constructor.call(this, v.create("text")), this.dom.leading = new v.Number(1.3), this._rebuild = !0, this._build = !1, this.attr("font-family", v.defaults.attrs["font-family"])
        }, inherit: v.Shape, extend: {
            clone: function () {
                var t = m(this.node.cloneNode(!0));
                return this.after(t), t
            }, x: function (t) {
                return null == t ? this.attr("x") : (this.textPath || this.lines().each(function () {
                    this.dom.newLined && this.x(t)
                }), this.attr("x", t))
            }, y: function (t) {
                var e = this.attr("y"), i = "number" == typeof e ? e - this.bbox().y : 0;
                return null == t ? "number" == typeof e ? e - i : e : this.attr("y", "number" == typeof t ? t + i : t)
            }, cx: function (t) {
                return null == t ? this.bbox().cx : this.x(t - this.bbox().width / 2)
            }, cy: function (t) {
                return null == t ? this.bbox().cy : this.y(t - this.bbox().height / 2)
            }, text: function (t) {
                if ("undefined" == typeof t) {
                    for (var t = "", e = this.node.childNodes, i = 0, n = e.length; n > i; ++i)0 != i && 3 != e[i].nodeType && 1 == v.adopt(e[i]).dom.newLined && (t += "\n"), t += e[i].textContent;
                    return t
                }
                if (this.clear().build(!0), "function" == typeof t)t.call(this, this); else {
                    t = t.split("\n");
                    for (var i = 0, r = t.length; r > i; i++)this.tspan(t[i]).newLine()
                }
                return this.build(!1).rebuild()
            }, size: function (t) {
                return this.attr("font-size", t).rebuild()
            }, leading: function (t) {
                return null == t ? this.dom.leading : (this.dom.leading = new v.Number(t), this.rebuild())
            }, lines: function () {
                var t = (this.textPath && this.textPath() || this).node, e = v.utils.map(v.utils.filterSVGElements(t.childNodes), function (t) {
                    return v.adopt(t)
                });
                return new v.Set(e)
            }, rebuild: function (t) {
                if ("boolean" == typeof t && (this._rebuild = t), this._rebuild) {
                    var e = this, i = 0, n = this.dom.leading * new v.Number(this.attr("font-size"));
                    this.lines().each(function () {
                        this.dom.newLined && (this.textPath || this.attr("x", e.attr("x")), "\n" == this.text() ? i += n : (this.attr("dy", n + i), i = 0))
                    }), this.fire("rebuild")
                }
                return this
            }, build: function (t) {
                return this._build = !!t, this
            }, setData: function (t) {
                return this.dom = t, this.dom.leading = new v.Number(t.leading || 1.3), this
            }
        }, construct: {
            text: function (t) {
                return this.put(new v.Text).text(t)
            }, plain: function (t) {
                return this.put(new v.Text).plain(t)
            }
        }
    }), v.Tspan = v.invent({
        create: "tspan", inherit: v.Shape, extend: {
            text: function (t) {
                return null == t ? this.node.textContent + (this.dom.newLined ? "\n" : "") : ("function" == typeof t ? t.call(this, this) : this.plain(t), this)
            }, dx: function (t) {
                return this.attr("dx", t)
            }, dy: function (t) {
                return this.attr("dy", t)
            }, newLine: function () {
                var t = this.parent(v.Text);
                return this.dom.newLined = !0, this.dy(t.dom.leading * t.attr("font-size")).attr("x", t.x())
            }
        }
    }), v.extend(v.Text, v.Tspan, {
        plain: function (t) {
            return this._build === !1 && this.clear(), this.node.appendChild(e.createTextNode(t)), this
        }, tspan: function (t) {
            var e = (this.textPath && this.textPath() || this).node, i = new v.Tspan;
            return this._build === !1 && this.clear(), e.appendChild(i.node), i.text(t)
        }, clear: function () {
            for (var t = (this.textPath && this.textPath() || this).node; t.hasChildNodes();)t.removeChild(t.lastChild);
            return this
        }, length: function () {
            return this.node.getComputedTextLength()
        }
    }), v.TextPath = v.invent({
        create: "textPath", inherit: v.Parent, parent: v.Text, construct: {
            path: function (t) {
                for (var e = new v.TextPath, i = this.doc().defs().path(t); this.node.hasChildNodes();)e.node.appendChild(this.node.firstChild);
                return this.node.appendChild(e.node), e.attr("href", "#" + i, v.xlink), this
            }, plot: function (t) {
                var e = this.track();
                return e && e.plot(t), this
            }, track: function () {
                var t = this.textPath();
                return t ? t.reference("href") : void 0
            }, textPath: function () {
                return this.node.firstChild && "textPath" == this.node.firstChild.nodeName ? v.adopt(this.node.firstChild) : void 0
            }
        }
    }), v.Nested = v.invent({
        create: function () {
            this.constructor.call(this, v.create("svg")), this.style("overflow", "visible")
        }, inherit: v.Container, construct: {
            nested: function () {
                return this.put(new v.Nested)
            }
        }
    }), v.A = v.invent({
        create: "a", inherit: v.Container, extend: {
            to: function (t) {
                return this.attr("href", t, v.xlink)
            }, show: function (t) {
                return this.attr("show", t, v.xlink)
            }, target: function (t) {
                return this.attr("target", t)
            }
        }, construct: {
            link: function (t) {
                return this.put(new v.A).to(t)
            }
        }
    }), v.extend(v.Element, {
        linkTo: function (t) {
            var e = new v.A;
            return "function" == typeof t ? t.call(e, e) : e.to(t), this.parent().put(e).put(this)
        }
    }), v.Marker = v.invent({
        create: "marker", inherit: v.Container, extend: {
            width: function (t) {
                return this.attr("markerWidth", t)
            }, height: function (t) {
                return this.attr("markerHeight", t)
            }, ref: function (t, e) {
                return this.attr("refX", t).attr("refY", e)
            }, update: function (t) {
                return this.clear(), "function" == typeof t && t.call(this, this), this
            }, toString: function () {
                return "url(#" + this.id() + ")"
            }
        }, construct: {
            marker: function (t, e, i) {
                return this.defs().marker(t, e, i)
            }
        }
    }),v.extend(v.Defs, {
        marker: function (t, e, i) {
            return this.put(new v.Marker).size(t, e).ref(t / 2, e / 2).viewbox(0, 0, t, e).attr("orient", "auto").update(i)
        }
    }),v.extend(v.Line, v.Polyline, v.Polygon, v.Path, {
        marker: function (t, e, i, n) {
            var r = ["marker"];
            return "all" != t && r.push(t), r = r.join("-"), t = arguments[1]instanceof v.Marker ? arguments[1] : this.doc().marker(e, i, n), this.attr(r, t)
        }
    });
    var y = {
        stroke: ["color", "width", "opacity", "linecap", "linejoin", "miterlimit", "dasharray", "dashoffset"],
        fill: ["color", "opacity", "rule"],
        prefix: function (t, e) {
            return "color" == e ? t : t + "-" + e
        }
    };
    ["fill", "stroke"].forEach(function (t) {
        var e, i = {};
        i[t] = function (i) {
            if ("string" == typeof i || v.Color.isRgb(i) || i && "function" == typeof i.fill)this.attr(t, i); else for (e = y[t].length - 1; e >= 0; e--)null != i[y[t][e]] && this.attr(y.prefix(t, y[t][e]), i[y[t][e]]);
            return this
        }, v.extend(v.Element, v.FX, i)
    }), v.extend(v.Element, v.FX, {
        rotate: function (t, e, i) {
            return this.transform({rotation: t, cx: e, cy: i})
        }, skew: function (t, e, i, n) {
            return this.transform({skewX: t, skewY: e, cx: i, cy: n})
        }, scale: function (t, e, i, n) {
            return 1 == arguments.length || 3 == arguments.length ? this.transform({
                scale: t,
                cx: e,
                cy: i
            }) : this.transform({scaleX: t, scaleY: e, cx: i, cy: n})
        }, translate: function (t, e) {
            return this.transform({x: t, y: e})
        }, flip: function (t, e) {
            return this.transform({flip: t, offset: e})
        }, matrix: function (t) {
            return this.attr("transform", new v.Matrix(t))
        }, opacity: function (t) {
            return this.attr("opacity", t)
        }, dx: function (t) {
            return this.x((this instanceof v.FX ? 0 : this.x()) + t, !0)
        }, dy: function (t) {
            return this.y((this instanceof v.FX ? 0 : this.y()) + t, !0)
        }, dmove: function (t, e) {
            return this.dx(t).dy(e)
        }
    }), v.extend(v.Rect, v.Ellipse, v.Circle, v.Gradient, v.FX, {
        radius: function (t, e) {
            var i = (this._target || this).type;
            return "radial" == i || "circle" == i ? this.attr("r", new v.Number(t)) : this.rx(t).ry(null == e ? t : e)
        }
    }), v.extend(v.Path, {
        length: function () {
            return this.node.getTotalLength()
        }, pointAt: function (t) {
            return this.node.getPointAtLength(t)
        }
    }), v.extend(v.Parent, v.Text, v.FX, {
        font: function (t) {
            for (var e in t)"leading" == e ? this.leading(t[e]) : "anchor" == e ? this.attr("text-anchor", t[e]) : "size" == e || "family" == e || "weight" == e || "stretch" == e || "variant" == e || "style" == e ? this.attr("font-" + e, t[e]) : this.attr(e, t[e]);
            return this
        }
    }), v.Set = v.invent({
        create: function (t) {
            Array.isArray(t) ? this.members = t : this.clear()
        }, extend: {
            add: function () {
                var t, e, i = [].slice.call(arguments);
                for (t = 0, e = i.length; e > t; t++)this.members.push(i[t]);
                return this
            }, remove: function (t) {
                var e = this.index(t);
                return e > -1 && this.members.splice(e, 1), this
            }, each: function (t) {
                for (var e = 0, i = this.members.length; i > e; e++)t.apply(this.members[e], [e, this.members]);
                return this
            }, clear: function () {
                return this.members = [], this
            }, length: function () {
                return this.members.length
            }, has: function (t) {
                return this.index(t) >= 0
            }, index: function (t) {
                return this.members.indexOf(t)
            }, get: function (t) {
                return this.members[t]
            }, first: function () {
                return this.get(0)
            }, last: function () {
                return this.get(this.members.length - 1)
            }, valueOf: function () {
                return this.members
            }, bbox: function () {
                var t = new v.BBox;
                if (0 == this.members.length)return t;
                var e = this.members[0].rbox();
                return t.x = e.x, t.y = e.y, t.width = e.width, t.height = e.height, this.each(function () {
                    t = t.merge(this.rbox())
                }), t
            }
        }, construct: {
            set: function (t) {
                return new v.Set(t)
            }
        }
    }), v.FX.Set = v.invent({
        create: function (t) {
            this.set = t
        }
    }), v.Set.inherit = function () {
        var t, e = [];
        for (var t in v.Shape.prototype)"function" == typeof v.Shape.prototype[t] && "function" != typeof v.Set.prototype[t] && e.push(t);
        e.forEach(function (t) {
            v.Set.prototype[t] = function () {
                for (var e = 0, i = this.members.length; i > e; e++)this.members[e] && "function" == typeof this.members[e][t] && this.members[e][t].apply(this.members[e], arguments);
                return "animate" == t ? this.fx || (this.fx = new v.FX.Set(this)) : this
            }
        }), e = [];
        for (var t in v.FX.prototype)"function" == typeof v.FX.prototype[t] && "function" != typeof v.FX.Set.prototype[t] && e.push(t);
        e.forEach(function (t) {
            v.FX.Set.prototype[t] = function () {
                for (var e = 0, i = this.set.members.length; i > e; e++)this.set.members[e].fx[t].apply(this.set.members[e].fx, arguments);
                return this
            }
        })
    }, v.extend(v.Element, {
        data: function (t, e, i) {
            if ("object" == typeof t)for (e in t)this.data(e, t[e]); else if (arguments.length < 2)try {
                return JSON.parse(this.attr("data-" + t))
            } catch (n) {
                return this.attr("data-" + t)
            } else this.attr("data-" + t, null === e ? null : i === !0 || "string" == typeof e || "number" == typeof e ? e : JSON.stringify(e));
            return this
        }
    }), v.extend(v.Element, {
        remember: function (t, e) {
            if ("object" == typeof arguments[0])for (var e in t)this.remember(e, t[e]); else {
                if (1 == arguments.length)return this.memory()[t];
                this.memory()[t] = e
            }
            return this
        }, forget: function () {
            if (0 == arguments.length)this._memory = {}; else for (var t = arguments.length - 1; t >= 0; t--)delete this.memory()[arguments[t]];
            return this
        }, memory: function () {
            return this._memory || (this._memory = {})
        }
    }), v.get = function (t) {
        var i = e.getElementById(g(t) || t);
        return v.adopt(i)
    }, v.select = function (t, i) {
        return new v.Set(v.utils.map((i || e).querySelectorAll(t), function (t) {
            return v.adopt(t)
        }))
    }, v.extend(v.Parent, {
        select: function (t) {
            return v.select(t, this.node)
        }
    });
    var w = "abcdef".split("");
    if ("function" != typeof b) {
        var b = function (t, i) {
            i = i || {bubbles: !1, cancelable: !1, detail: void 0};
            var n = e.createEvent("CustomEvent");
            return n.initCustomEvent(t, i.bubbles, i.cancelable, i.detail), n
        };
        b.prototype = t.Event.prototype, t.CustomEvent = b
    }
    return function (e) {
        for (var i = 0, n = ["moz", "webkit"], r = 0; r < n.length && !t.requestAnimationFrame; ++r)e.requestAnimationFrame = e[n[r] + "RequestAnimationFrame"], e.cancelAnimationFrame = e[n[r] + "CancelAnimationFrame"] || e[n[r] + "CancelRequestAnimationFrame"];
        e.requestAnimationFrame = e.requestAnimationFrame || function (t) {
            var n = (new Date).getTime(), r = Math.max(0, 16 - (n - i)), s = e.setTimeout(function () {
                t(n + r)
            }, r);
            return i = n + r, s
        }, e.cancelAnimationFrame = e.cancelAnimationFrame || e.clearTimeout
    }(t), v
});
