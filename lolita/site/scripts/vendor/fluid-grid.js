define("fluid-grid/image-loader", [], function() {
    var e = this,
        t = new Array,
        n = !1,
        r = function() {
            var e = t.shift();
            if (e) {
                n = !0;
                var i = e.image.data("src");

                if (retina && ($('.galcategory').length || $('.photo.gallery').length)) {
                    var sizes = [300, 500, 1000, 1500, 2000];
                    var fileName = i;
                    var fullFileInfo = fileName.split('/');
                    var fileFullName = fullFileInfo.pop();
                    var basePath = fullFileInfo.join('/');

                    var fileInfo = fileFullName.split('-');
                    var prefix = fileInfo[0];
                    fileInfo.shift()
                    var file = fileInfo.join('-');

                    if (parseInt(prefix) < 2000 && parseInt(prefix) >= 300) {
                        var index = sizes.indexOf((parseInt(prefix)));
                        prefix = sizes[index + 1];
                        i = basePath + '/' + prefix + '-' + file;
                    }
                }

                if (document.cookie.indexOf('_gphw_mobile=1') > -1 && ($('.galcategory').length || $('.photo.gallery').length)) {
                    var fileName = i;
                    var fullFileInfo = fileName.split('/');
                    var fileFullName = fullFileInfo.pop();
                    var basePath = fullFileInfo.join('/');
                    var fileInfo = fileFullName.split('-');
                    fileInfo.shift();
                    var file = fileInfo.join('-');

                    i = basePath + '/1000-' + file;
                }

                i ? e.image.on("load", function() {
                    e.def.resolve(e.image), r()
                }).on("error", function() {
                    e.def.reject(e.image), r()
                }).attr("src", i) : (e.def.reject(e.image), r())
            } else n = !1
        },
        i = function(e) {
            var n = $.Deferred();
            return t.push({
                def: n,
                image: $(e)
            }), n.promise()
        };
    return {
        load: function(e) {
            var t = i(e);
            return n || r(), t
        }
    }
}), define("fluid-grid/mixins/data-options", [], function() {
    return {
        optionsPrefix: "",
        parseOptions: function() {
            var e = this,
                t = this.$el.data() || {},
                n = new RegExp("^" + this.optionsPrefix + "([a-zA-Z]+)");
            return $.each(t, function(r, i) {
                t.hasOwnProperty(r) && n.test(r) && (shortName = r.match(n)[1].replace(/[A-Z]/, function(e) {
                    return (e || "").toLowerCase()
                }), e.options[shortName] = i)
            }), this
        }
    }
}), define("fluid-grid/item", ["backbone", "fluid-grid/image-loader", "fluid-grid/mixins/data-options"], function(e, t, n) {
    var r = e.View.extend({
        optionsPrefix: "fluidGrid",
        initialize: function() {
            this.parseOptions()
        },
        resize: function(e, t) {
            var n = e.width - this.getOffset();
            this.$el.width(Math.floor(n));
            if (t) {
                var r = n * this.getAspectRation();
                this.$el.height(Math.floor(r))
            }
            return this
        },
        getOffset: function() {
            var e = this.$el.outerWidth(!0) - this.$el.width();
            return e
        },
        getAspectRation: function() {
            return this.$el.height() / this.$el.width()
        },
        position: function(e) {
            return this.$el.css({
                top: e.top || 0,
                left: e.left || 0
            }), this
        },
        render: function() {
            var e = this;
            return this.$el.css("position", "absolute"), this.$el.find("img").each(function(n, r) {
                t.load(r).then(function(t) {
                    e.$el.removeClass("loading"), e.trigger("item:loaded")
                }).always(function() {
                    if (e.$el.find('img').data('src') == '') {
                        e.$el.removeClass("loading"), setTimeout(function() {
                            e.trigger("item:loaded")
                        }, 1)
                    }
                })
            }), this
        }
    });
    return _.extend(r.prototype, n), r
}), define("fluid-grid", ["fluid-grid/item", "backbone", "fluid-grid/mixins/data-options"], function(e, t, n) {
    var r = t.View.extend({
        optionsPrefix: "grid",
        options: {
            itemSelector: ".item",
            columnminWidth: 50,
            columnscount: 2,
            keepAspectRetio: !1
        },
        columns: {},
        items: [],
        initialize: function() {
            var e = this;
            this.parseOptions(), this.options.columnmaxWidth = Math.ceil(this.$el.width() / this.options.columnscount), this.$el.find(this.options.itemSelector).each(function(t, n) {
                e.addItem(n)
            }), 1 == "onorientationchange" in window ? $(window).on("orientationchange", function() {
                e.options.columnmaxWidth = Math.ceil(e.$el.width() / e.options.columnscount), e.resize()
            }) : $(window).on("resize", function() {
                e.resize()
            })
        },
        addItem: function(t) {
            var n = new e({
                el: $(t)
            });
            return this.items.push(n), this.$el.append(n.el), this.$el.trigger("item-added.fluid-grid", [n]), this
        },
        getColumnsCount: function() {
            var e = Math.ceil(this.width / this.options.columnmaxWidth);
            return e > this.options.columnscount && (e = this.options.columnscount), e > this.items.length && (e = this.items.length), e
        },
        getColumnWidth: function() {
            var e = Math.ceil(this.width / this.options.columnscount);
            return e
        },
        getColumnWidth: function() {
            var e = Math.ceil(this.width / this.getColumnsCount());
            return e > this.options.columnmaxWidth && (e = this.options.columnmaxWidth), e
        },
        getItemsOffset: function() {
            var e = 0;
            return this.items[0] && (e = this.items[0].getOffset()), e
        },
        findSmallestColumn: function() {
            var e = null;
            return $.each(this.columns, function(t, n) {
                if (!e || e.height > n.height) e = n
            }), e
        },
        findHighestColumn: function() {
            var e = null;
            return $.each(this.columns, function(t, n) {
                if (!e || e.height < n.height) e = n
            }), e
        },
        createColumns: function() {
            this.columns = {};
            for (var e = 1; e <= this.getColumnsCount(); e++) this.columns[e] = {
                sort: e,
                height: 0
            }
        },
        resize: function() {
            var e = this;
            return this.width = this.$el.width(), this.createColumns(), $.each(this.items, function(t, n) {
                var r = e.findSmallestColumn();
                n.render().resize({
                    width: e.getColumnWidth()
                }, e.options.keepAspectRetio).position({
                    top: r.height,
                    left: (r.sort - 1) * e.getColumnWidth()
                }), r.height += n.$el.outerHeight(!0);
                var i = e.findHighestColumn();
                i && e.$el.height(i.height)
            }), this
        },
        render: function() {
            var e = this;

            /* plugin set width of image ONLY when image loaded -> set current max width = columnmaxWidth - margin */
            var margin = parseInt($('.grid .item').css('margin')) * 2;
            var w = e.options.columnmaxWidth - margin;

            /* fix size(prefix) images - select min optimal size(300, 500, ...)*/
            $(e.$el.find('img')).each(function() {
                var img = $(this);
                var sizesJson = img.attr('data-size');
                var sizes = sizesJson && sizesJson != "" ? $.parseJSON(sizesJson) : {};

                var file = '1000-';
                //var w = img.parent().width();
                //var h = img.parent().height();

                if (Object.getOwnPropertyNames(sizes).length !== 0) {
                    var firstKey = Object.keys(sizes)[0];
                    var sizesHasWidthAndHeight = (sizes[firstKey].h && sizes[firstKey].w) ? true : false;

                    for (i in sizes) {
                        if (sizesHasWidthAndHeight) {
                            if (sizes[i].w >= w /*&& sizes[i].h >= h*/ ) {
                                file = i + '-';
                                break;
                            }
                        } else {
                            if (i >= w /*&& i >= h*/ ) {
                                file = i + '-';
                                break;
                            }
                        }
                    }

                    var defaultSrc = img.attr('data-src');
                    var nameFile = img.attr('data-fname');
                    var path = defaultSrc.substring(0, defaultSrc.lastIndexOf("/") + 1);

                    file = path + file + nameFile;
                    //img.attr('src', file);
                    img.attr('data-src', file);

                    img.removeAttr('data-fname');
                }
            });

            return this.width = this.$el.width(), this.$el.css({
                position: "relative",
                visibility: "visible"
            }), this.createColumns(), $.each(this.items, function(t, n) {
                n.render().on("item:loaded", function() {
                    var t = e.findSmallestColumn();
                    n.resize({
                        width: e.getColumnWidth()
                    }, e.options.keepAspectRetio).position({
                        top: t.height,
                        left: (t.sort - 1) * e.getColumnWidth()
                    }), t.height += n.$el.outerHeight(!0);
                    var r = e.findHighestColumn();
                    r && e.$el.height(r.height), n.off("item:loaded")
                })
            }), this
        }
    });
    return _.extend(r.prototype, n), r
});