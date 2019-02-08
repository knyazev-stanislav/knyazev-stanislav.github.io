define("slide", [], function() {
    return {
        $slide: null,
        box: null,
        nextSlide: null,
        prevSlide: null,
        loaded: !1,
        isLoading: !1,
        setNextSlide: function(e) {
            var t = this;
            this.nextSlide = e, this.$slide.click(function() {
                t.box.next()
            })
        },
        setPrevSlide: function(e) {
            this.prevSlide = e
        },
        showExecutor: function(e, t) {
            e.css("opacity", 0), e.show(), e.animate({
                opacity: 1
            }, t)
        },
        show: function() {
            var e = this,
                t = function() {
                    e.prevSlide && e.prevSlide.load(), e.nextSlide && e.nextSlide.load(), e.box.isSwitching = !1
                };
            this.loaded ? this.showExecutor(this.$slide, t) : this.isLoading ? this.$slide.load(function() {
                e.showExecutor(e.$slide, t)
            }) : this.load(function() {
                e.showExecutor(e.$slide, t)
            }), this.prevSlide ? this.box.$prevControl.show() : this.box.$prevControl.hide(), this.nextSlide ? this.box.$nextControl.show() : this.box.$nextControl.hide()
        },
        hideExecutor: function(e, t) {
            e.animate({
                opacity: 0
            }, function() {
                $(this).hide(), t && t.apply(this)
            })
        },
        hide: function(e) {
            this.hideExecutor(this.$slide, e)
        },
        center: function() {
            if (!this.loaded) return;
            this.$slide.css({
                position: "absolute",
                top: (this.$slide.parent().height() - this.$slide.height()) / 2,
                left: (this.$slide.parent().width() - this.$slide.width()) / 2
            })
        }
    }
}), define("imgslide", ["slide"], function(e) {
    return function(t, n) {
        jQuery.extend(this, e, {
            load: function(e) {
                var r = this,
                    i = t.data("fsboxSrc"),
                    s = t.attr("src");
                i && s != i && (n.spinner.show(t.get()[0]), t.load(function() {
                    r.loaded = !0, r.center(), n.spinner.hide(this)
                }), e && t.load(e), this.isLoading = !0, t.attr("src", i))
            }
        }), this.$slide = t, this.box = n
    }
}), define("divslide", ["slide"], function(e) {
    return function(t, n) {
        jQuery.extend(this, e, {
            load: function(e) {
                this.loaded = !0, this.center(), e && e.call(t.get)
            }
        }), this.$slide = t, this.box = n
    }
}), define("spinner", [], function() {
    return function(e) {
        return function(t) {
            var n = new Array;
            e.extend(this, {
                show: function(e) {
                    n.push(e), t.show()
                },
                hide: function(r) {
                    var i = e.inArray(r, n);
                    delete n[i], e.grep(n, function(e) {
                        return e !== undefined
                    }).length == 0 && t.hide()
                }
            })
        }
    }(jQuery)
}), define("fsbox", ["imgslide", "divslide", "spinner"], function(e, t, n) {
    (function(r) {
        var i = function(n, r) {
                return n.is("img") ? new e(n, r) : n.is("div") ? new t(n, r) : null
            },
            s = function(e, t) {
                var s = {
                    prevControlSelector: ".prev",
                    nextControlSelector: ".next",
                    closeBindTo: ".close a",
                    prevBindTo: ".prev a",
                    nextBindTo: ".next a",
                    slidesSelector: ".slides > *",
                    spinnerSelector: ".spinner",
                    cycle: !0,
                    closeKeyCode: 27
                };
                typeof t == "object" && r.extend(s, t);
                var o = e.data("fsbox");
                if (o && o.box) return o.box;
                e.detach().css({
                    position: "fixed"
                }).appendTo(r("body"));
                var u = this;
                e.find(s.closeBindTo).click(function() {
                    return u.close(), !1
                }), e.find(s.prevBindTo).click(function() {
                    return u.prev(), !1
                }), e.find(s.nextBindTo).click(function() {
                    return u.next(), !1
                });
                var a = null,
                    f = null,
                    l = e.find(s.slidesSelector).map(function() {
                        var e = r(this);
                        return slide = i(e, u), e.hide(), a ? (a.setNextSlide(slide), slide.setPrevSlide(a)) : f = slide, a = slide, r(window).resize(function() {
                            slide.center()
                        }), e.click(function(e) {
                            e.stopPropagation()
                        }), slide
                    }).get();
                s.cycle == 1 && (l[0].setPrevSlide(l[l.length - 1]), l[l.length - 1].setNextSlide(l[0])), r(document).keydown(function(e) {
                    e.keyCode == s.closeKeyCode && u.close()
                }), e.data("fsbox", {
                    box: this
                });
                var c = null;
                r.extend(this, {
                    $prevControl: e.find(s.prevControlSelector),
                    $nextControl: e.find(s.nextControlSelector),
                    isSwitching: !1,
                    spinner: new n(e.find(s.spinnerSelector)),
                    open: function(t) {
                        c = r("body").css("overflow"), r("body").css("overflow", "hidden"), e.fadeIn(), l.forEach(function(e) {
                            e.center()
                        }), t !== undefined && (f = l[t]), e.trigger("open.fsbox", [f]), f.show()
                    },
                    close: function() {
                        e.trigger("close.fsbox", [f]), e.fadeOut(), r("body").css("overflow", c), l.forEach(function(e) {
                            e.hide()
                        })
                    },
                    prev: function() {
                        if (f.prevSlide && !u.isSwitching) {
                            u.isSwitching = !0;
                            var t = f.prevSlide;
                            e.trigger("change.fsbox", [f, t]), f.hide(function() {
                                t.show()
                            }), f = f.prevSlide
                        }
                    },
                    next: function() {
                        if (f.nextSlide && !u.isSwitching) {
                            u.isSwitching = !0;
                            var t = f.nextSlide;
                            e.trigger("change.fsbox", [f, t]), f.hide(function() {
                                t.show()
                            }), f = f.nextSlide
                        }
                    }
                })
            };
        r.fn.fsbox = function(e) {
            var t = arguments;
            return this.each(function() {
                var n = r(this),
                    i = n.data("fsbox");
                if (i && i.box && i.box[e]) return i.box[e].apply(i.box, Array.prototype.slice.call(t, 1));
                typeof e == "object" || !e ? new s(n, e) : r.error("Method " + e + " does not exist on jQuery.fsbox")
            })
        }, r.fn.fsbox.defaults = {
            autoSelector: ".fsbox"
        }, r(document).ready(function() {
            r(r.fn.fsbox.defaults.autoSelector).fsbox()
        })
    })(jQuery)
});