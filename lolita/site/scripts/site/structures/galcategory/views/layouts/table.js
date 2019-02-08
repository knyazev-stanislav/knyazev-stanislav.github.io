define([

    'static-grid',
    'loading-queue',

], function(StaticGrid) {
    var MainView = Backbone.View.extend({

        grid: null,
        gridImgSelector: '',

        initialize: function() {
            var self = this;

            _.bindAll(this);

            this.grid = new StaticGrid({
                el: $('.static-grid')
            });

            var col = self.grid.options.imageCol,
                j = 0,
                maxHeight = 0,
                heights = [];
            items = self.grid.$el.find(self.grid.options.itemSelector);
            for (var i = 0; i <= items.length; i++) {

                heights.push($(items[i]).height());

                if ((heights.length == col) || ((i + 1) == items.length)) {

                    maxHeight = Math.max.apply(Math, heights);
                    heights = [];

                    for (; j <= i; j++) {
                        $(items[j]).height(maxHeight);
                    }
                }
            }

        },

        render: function() {
            $('footer').css('opacity', 1);
            var self = this;

            self.grid.render();

            var images = self.grid.$el.find(self.grid.options.imageSelector);

            /* fix size(prefix) images - select min optimal size(300, 500, ...)*/
            $(self.grid.$el.find('img')).each(function() {
                var img = $(this);

                var sizesJson = img.attr('data-size');
                var sizes = sizesJson && sizesJson != "" ? $.parseJSON(sizesJson) : {};

                var file = '1000-';
                var w = img.parent().width();
                var h = img.parent().height();

                if (Object.getOwnPropertyNames(sizes).length !== 0) {
                    var firstKey = Object.keys(sizes)[0];
                    var sizesHasWidthAndHeight = (sizes[firstKey].h && sizes[firstKey].w) ? true : false;

                    for (i in sizes) {
                        if (sizesHasWidthAndHeight) {
                            if (sizes[i].w >= w && sizes[i].h >= h) {
                                file = i + '-';
                                break;
                            }
                        } else {
                            if (i >= w && i >= h) {
                                file = i + '-';
                                break;
                            }
                        }
                    }

                    var defaultSrc = img.attr('data-file-name');
                    var nameFile = img.attr('data-fname');
                    var path = defaultSrc.substring(0, defaultSrc.lastIndexOf("/") + 1);

                    file = path + file + nameFile;
                    img.attr('data-file-name', file);

                    img.removeAttr('data-fname');
                    img.removeAttr('data-sizes');
                }
            });

            images.loadingQueue();
            images.on('load', function() {
                self.grid.setImageSize(this);
                $(this).addClass('loaded');
            });
            images.first().on('loaded', function() {
                $('footer').css('opacity', 1);
            });
            $(window).on('resize', function() {
                self.grid.$el.find(self.grid.options.itemSelector).each(function() {
                    $(this).height($(this).find('.image').height() + $(this).find('.description').height() + self.grid.options.itemMargin);
                });
            });
        }
    });

    return MainView;
});