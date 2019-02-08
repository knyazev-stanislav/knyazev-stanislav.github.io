define([
    'jquery',
    'backbone'

], function($) {

    var DynamicLoader = Backbone.View.extend({

        options: {},

        top: 0,
        items: [],
        height: 0,
        images: [],
        loadingFlag: false,
        scrollEl: window,
        scrollElTimer: false,
        moveDelay: null,

        initialize: function(options) {
            var self = this;
            self.options = _.extend(self.options, options);
            self.options.factor = parseInt(self.options.factor) || 1;
            self.options.factor = (self.options.factor < 1) ? 1 : self.options.factor;

            self.scrollEl = self.options.overflow == true ? '#content' : window;

            self.options.items = $.makeArray(self.options.items);

            self.options.items.forEach(function(item) {
                $(item).addClass('dynamic-loader-line');
            });
            var lazyLoad = _.debounce(function() {
                if (self.loadingFlag == false) {
                    self.checkImages();
                }
            }, 200);
            $(self.scrollEl).on('resize.dynamic-loader', function() {
                self.top = self.$el.offset().top;
                self.height = $(window).height() * self.options.factor;
                self.calcDynamicLines();
            }).on('scroll.dynamic-loader', function() {

                lazyLoad();

                /**
                 * Для Oliver скролится не window, а контейнер с overflow:hidden
                 */
                if (self.options.overflow == true && self.scrollElTimer == false) {
                    self.scrollElTimer = true;
                    var t = setTimeout(function() {
                        self.calcDynamicLines();
                        self.scrollElTimer = false;
                    }, 100);

                }
            }).trigger('resize.dynamic-loader').trigger('scroll.dynamic-loader');
        },

        calcDynamicLines: function() {
            var self = this;

            self.items = [];

            self.options.items.forEach(function(item) {
                $(item + '.dynamic-loader-line').each(function() {
                    var t = $(this).offset().top;
                    var b = t + $(this).outerHeight();
                    self.items.push([t, b, this]);
                });
            });
        },

        checkImages: function() {
            var self = this;
            if (self.loadingFlag == true)
                return false;
            self.loadingFlag = true;
            if (self.items.length == 0) {
                // Disable events scroll.dynamic-loader and resize.dynamic-loader
                $(self.scrollEl).off('resize.dynamic-loader').off('scroll.dynamic-loader');
            }

            /**
             * Для Oliver скролится не window, а контейнер с overflow:hidden
             */
            if (self.options.overflow == true) {
                var top = 0;
                var bottom = self.height;
            } else {
                var top = $(self.scrollEl).scrollTop();
                var bottom = $(self.scrollEl).scrollTop() + self.height;
            }

            var buff = [];

            for (var i = 0; i < self.items.length; i++) {
                if ((self.items[i][0] >= top && self.items[i][0] <= bottom) ||
                    (self.items[i][1] >= top && self.items[i][1] <= bottom)) {

                    var img = $(self.items[i][2]).find('img');

                    for (var j = 0; j < $(img).size(); j++) {
                        self.images.push(img[j])
                    }
                    $(self.items[i][2]).removeClass('dynamic-loader-line');
                } else {
                    buff.push(self.items[i])
                }
            }
            self.items = buff;

            // Check queue
            if (self.images.length > 0) {
                self.loadImage();
            } else {
                self.loadingFlag = false;
            }
        },

        loadImage: function() {
            var self = this;

            if (self.images.length > 0) {
                var img = self.images.shift();
                if (!_.isUndefined(img)) {
                    if ($(img).data('dynamic') == true && $(img).attr('src').substr(0, 4) != 'http') {
                        $(img).on('load', function() {
                                $(this).trigger('loaded');
                                self.loadImage();
                            })
                            .on('error', function() {
                                $(this).trigger('loaded');
                                self.loadImage();
                            })
                            .attr('src', $(img).attr('data-base-path') + $(img).attr('data-file-name'));
                    } else {
                        self.loadImage();
                    }
                }
            } else {
                self.calcDynamicLines();
                self.checkImages();
                self.loadingFlag = false;
            }
        },

        render: function() {
            return this;
        }
    });

    return DynamicLoader;
});