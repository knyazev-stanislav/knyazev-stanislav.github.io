define([

    'backbone',

], function(Backbone) {
    var StaticGrid = Backbone.View.extend({
        // Queue for images
        queue: [],

        options: {
            itemSelector: '.static-grid-item',
            itemMargin: 0,
            imageContainerSelector: '.static-grid-item .image',
            imageSelector: '.static-grid-item .image img',
            imageRate: 1,
            imageCol: 4,
            imagePosition: 'inner',
        },

        parseOptions: function() {

            var self = this;

            var data = this.$el.data() || {};


            $.each(data, function(name, value) {

                if (data.hasOwnProperty(name)) {
                    self.options[name] = value;
                }
            });

            return this;
        },

        initialize: function() {
            var self = this;

            this.queue = [];
            this.parseOptions();
            this.$el.addClass('c' + this.options.imageCol);

            var size = this.$el.find(this.options.itemSelector).size();
            var cols = this.options.imageCol - 1;
            var cnt = 0;

            for (var i = 0; i < size; i++) {
                if (cnt == cols) {
                    $('<div class="static-grid-clearfix"></div>').insertAfter(self.$el.find(this.options.itemSelector).eq(i));
                    cnt = 0;
                } else {
                    cnt = cnt + 1;
                }
            }

            this.setItemsSize();

            /* on android event 'onorientationchange' work with delay -> for android use event 'resize' */
            if (true == ('onorientationchange' in window) && navigator.userAgent.toLowerCase().indexOf("android") < 0) {
                $(window).on('orientationchange', function() {
                    self.setItemsSize();
                    self.$el.find(self.options.imageSelector).each(function() {
                        self.setImageSize(this);
                    });
                });
            } else {
                $(window).resize(function() {
                    self.setItemsSize();
                    self.$el.find(self.options.imageSelector).each(function() {
                        self.setImageSize(this);
                    });
                });
            }
        },

        createQueue: function() {
            var self = this;

            this.$el.find(this.options.imageSelector).each(function() {
                self.queue.push(this);
            });

            this.$el.find(this.options.imageSelector).on('load.gallery', function() {
                self.loadQueueItem();
            });

            self.loadQueueItem();
        },

        loadQueueItem: function() {
            var self = this;
            if (self.queue.length > 0) {
                //var box = self.queue.shift();
                var img = self.queue.shift();

                $(img).attr('src', $(img).attr('data-src')).on('load error', function() {
                    // Set image position and scale
                    //if ($(img).data('type') == 'photo') {
                    //    self.setImageSize(this, 1,5, self.options.imagePosition);
                    //    //$(img).parent().hide();
                    //}
                    //else
                    //    self.setImageSize(this, 1, 'out')
                    // Remove loading class (fade in transition effect)
                    $(img).removeClass('loading').addClass('loaded');
                    // Start slideshow
                    //if (self.options.slideshow.status == 'start' && $(box).index() == 0 && $(img).data('type') == 'photo') {
                    //    self.startSlideshow();
                    //}
                    // Slideshow status = wait
                    //if (self.options.slideshow.status == 'wait' && $(box).index() > 0 && $(img).data('type') == 'photo') {
                    //    self.options.slideshow.status = 'start';
                    //    self.showImage($(box).index());
                    //}
                    // Load next image
                    self.setImageSize(img);
                    $(img).trigger('load.gallery');
                });
            }
        },

        getImageSize: function(totalWidth) {
            var matrixWidth = []
            var items = this.$el.find(this.options.itemSelector);
            var itemWidth = 10000;
            var sum = 0;
            for (var i = 0; i < this.options.imageCol; i++) {
                var width = $(items[i]).width();
                sum = sum + width;
                width = width - this.options.itemMargin;
                if (width > 0) {
                    itemWidth = (width < itemWidth) ? width : itemWidth;
                }
            }
            // IE & FF auto width for table-cell bug
            if (sum > totalWidth) {
                itemWidth = itemWidth - 1;
            }
            var itemHeight = this.options.imageRate > 0 ? parseInt(itemWidth / this.options.imageRate) : 0;
            return {
                itemWidth: itemWidth,
                itemHeight: itemHeight,
                totalWidth: totalWidth
            }
        },


        setItemsSize: function() {
            var self = this;
            var scrollDetect = $(window).height() - $(document).height();

            // Auto size
            this.$el.width('');
            this.$el.find(this.options.itemSelector).each(function() {
                $(this).width('');
            });

            // Width for wrapper with margin
            this.$el.width(this.$el.parent().width() + this.options.itemMargin);
            // Get item size
            itemSize = this.getImageSize(this.$el.width());

            this.$el.find(this.options.itemSelector).each(function() {
                $(this).width(itemSize.itemWidth + self.options.itemMargin);

                var img = $(this).find('.image');

                if (itemSize.itemHeight > 0)
                    $(img).height(itemSize.itemHeight);

                var imageWidth = parseInt($(img).attr('data-width'));
                var imageHeight = parseInt($(img).attr('data-height'));
                var imageRate = imageWidth / imageHeight;

                $(img).data('imageRate', imageRate).addClass(self.options.imageRate >= 1 ? 'w' : 'h');
            });

            this.$el.css('visibility', 'visible');

            if ($(window).height() - $(document).height() < 0 && scrollDetect == 0) {
                this.setItemsSize();
            }
        },

        setImageSize: function(img) {
            // Set image class
            var ci = $(img).parent().data('imageRate');
            var cw = $(img).parent().width() / $(img).parent().height();
            // Inner
            if (this.options.imagePosition == 'inner') {
                if (cw >= 1) {
                    var c = (ci <= cw) ? 'h' : 'w';
                } else {
                    var c = (cw <= ci) ? 'w' : 'h';
                }
            }
            // Outer
            else {
                if (cw >= 1) {
                    var c = (ci <= cw) ? 'w' : 'h';
                } else {
                    var c = (cw <= ci) ? 'h' : 'w';
                }
            }
            $(img).removeClass('w h').addClass(c);
            // Set margin top for inner position
            if (this.options.imagePosition == 'inner') {
                var hi = $(img).height();
                var hw = $(img).parent().height();
                $(img).css('marginTop', parseInt((hw - hi) / 2) + 'px');
            } else {
                $(img).css({
                    'marginTop': 0,
                    'marginLeft': 0
                });

                var wi = $(img).width();
                var ww = $(img).parent().width();

                if (wi != ww) {
                    var align = $(img).attr('data-align');
                    switch (align) {
                        case 'left':
                            align = 0;
                            break;
                        case 'right':
                            align = ww - wi;
                            break;
                        default:
                            align = parseInt((ww - wi) / 2);
                    }
                    $(img).css('marginLeft', align + 'px');

                }
                var hi = $(img).height();
                var hw = $(img).parent().height();

                if (hi != hw) {
                    $(img).css('marginTop', parseInt((hw - hi) / 2) + 'px');
                }
            }
        },

        render: function() {
            // Create queue
            this.createQueue();

            this.$el.find(this.options.imageContainerSelector).on('click', function() {
                if ($(this).find('img').is('.loaded') && $(this).data('link')) {
                    window.open($(this).data('link'), '_blank');
                }
            });

            return this;
        }
    });

    return StaticGrid;
});