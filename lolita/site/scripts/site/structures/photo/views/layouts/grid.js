define([
    'one-height-grid',
    'structures/photo/views/fsbox',
    'spinners',
    '',
    ''
], function(OneHeightGrid, Fsbox, Spinners, FacebookLike, VKShare) {
    var MainView = Backbone.View.extend({

        opts: {},
        spinner: null,
        loading: false,
        time: 300,

        scrollTop: 0,
        fsbox: null,

        initialize: function() {
            this.opts = $.parseJSON($.trim(this.$('#photos-options').html()));
            this.opts.limit = this.$el.find('.one-height-grid-row').size();
            this.spinner = this.$el.find('.photos-loading');
            this.indexes = $.parseJSON($.trim(this.$('#photos-indexes').html()));
            this.dp = window.devicePixelRatio;
            this.maxIndexForRetina = Math.max.apply(0, this.indexes.map(function(v) {
                return v
            }));

            var spinner = Spinners.create($(this.spinner.find('.spinner')), {
                radius: 7,
                height: 10,
                width: 1.5,
                dashes: 20,
                opacity: 0.85,
                rotation: 800,
                color: '#000000'
            });

            spinner.center().play();
        },

        correctSize: function(cell) {
            var img = $(cell).find('img');

            if ($(cell).height() > $(img).data('height')) {
                $(cell).height($(img).height());
            }
            if ($(img).data('width') >= $(cell).width() && $(img).data('height') >= $(cell).height()) {
                $(img).height($(cell).height());
                $(img).width($(cell).width());
            }
        },

        render_grid: function() {
            var self = this;

            var grid = new OneHeightGrid({
                el: $('.one-height-grid')
            });
            grid.render();

            var cellSelector = self.options.cellSelector ? self.options.cellSelector : grid.options.cellSelector;
            var fsboxFlag = grid.$el.data('fullscreen');
            var images = grid.$el.find(cellSelector + ' img')
            var photoIdexes = JSON.parseJSON

            // Set correct filename for preview
            $(cellSelector).each(function() {
                var img = $(this).find('img');
                var file = '1000-';
                var size = img.data('size');
                var w = $(this).width();
                var h = $(this).height();

                if (size) {
                    for (i in self.indexes) {
                        if (size[self.indexes[i]] && (size[self.indexes[i]].w >= w && size[self.indexes[i]].h >= h)) {
                            file = self.indexes[i] + '-';
                            break;
                        }
                    }
                    /*if (self.dp >= 2) {
                        file = self.maxIndexForRetina + '-';
                    }*/
                }

                file = file + img.attr('data-file-name');
                img.attr('data-file-name', file);
            });


            images.loadingQueue();
            images.on('load', function() {
                // Hack for Opera 12.16, load event working for 1x1 data pixel
                if (($(this).width() == 1 && $(this).height() == 1) == false) {
                    $(this).data('width', $(this).width());
                    $(this).data('height', $(this).height());

                    var parent = $(this).parent();
                    if ($(parent).is('a')) {
                        parent = $(parent).parent();
                    }

                    $(parent).find('.spinner').remove();
                    $(this).css('opacity', 1);

                    $(parent).on('render:finish', function() {
                        self.correctSize($(this));
                    });
                    $(parent).trigger('render:finish');
                }
            });

            var parent = images.parent();
            if (parent.length > 0) {
                if ($(parent).is('a')) {
                    parent = $(parent).parent();
                }
                parent.first().on('render:finish', function() {
                    $('footer').css('opacity', 1);
                });
            } else {
                $('footer').css('opacity', 1);
            }

            // FSBOX
            // Generate arrows
            if (fsboxFlag == 'y') {

                $('.fsbox .slides img').each(function() {
                    $(this).attr('data-fsbox-src', $(this).attr('data-base-path') + '2000' + $(this).attr('data-file-name'));
                });

                if (self.fsbox == null) {
                    self.fsbox = new Fsbox({
                        el: $('.fsbox')
                    });
                    self.fsbox.render();
                }

                $('.fsbox').on('close.fsbox', function() {
                    if (self.scrollTop > 0) {
                        $(window).scrollTop(self.scrollTop);
                        self.scrollTop = 0;
                    }
                    setTimeout(function() {
                        $('body').css('overflow', 'scroll');
                    }, 300);
                });

                grid.$el.find(grid.options.cellSelector + ' img').each(function(i) {
                    if ($(this).parent().is('a') == false) {
                        $(this).click(function() {
                            self.scrollTop = $(window).scrollTop();

                            // For IE9
                            if (typeof $('.fsbox').fsbox != 'undefined') {
                                $('.fsbox').fsbox('open', i);
                            } else if (typeof jQuery('.fsbox').fsbox != 'undefined') {
                                jQuery('.fsbox').fsbox('open', i);
                            }

                            return false;
                        })
                    }
                })
            }
        },

        loadPhotos: function() {
            var self = this;
            this.loading = true;
            this.spinner.show(self.time, function() {
                $(this).animate({
                    opacity: 1
                }, self.time, function() {
                    $.ajax({
                        'url': '/__api/load-photos/' + self.opts.sid + '/' + self.opts.limit + '/',
                        'dataType': 'json',
                        success: function(json) {
                            if (json.status == 'ok') {
                                self.spinner.before(json.html);
                                self.opts.limit = self.$el.find('.one-height-grid-row').size();

                                self.options.cellSelector = '.ajax-row .one-height-grid-cell'
                                self.render()
                            }
                            if (json.status == 'end' || self.opts.count == self.opts.limit) {
                                $(window).unbind('scroll.for-photos');
                            }
                            self.spinner.animate({
                                opacity: 0
                            }, self.time, function() {
                                $(this).hide(self.time, function() {
                                    self.$el.find('.one-height-grid-row.ajax-row').show(self.time * 2, function() {
                                        $(this).animate({
                                            opacity: 1
                                        }, self.time, function() {
                                            self.loading = false;
                                        });
                                        $(this).removeClass('ajax-row');
                                    });

                                });
                            });
                        },
                        error: function() {
                            self.spinner.animate({
                                opacity: 0
                            }, self.time, function() {
                                $(this).hide(self.time, function() {
                                    self.loading = false;
                                });
                            });
                        }
                    });
                });
            });
        },

        render: function() {
            var self = this;

            this.render_grid();

            /*if (self.$el.find('.facebook.share')) {
                var facebokLike = new FacebookLike({
                    el: self.$el.find('.facebook.share')
                }).render();
            }*/
            /* if (self.$el.find('.vk.share')) {
                 var vkShare = new VKShare({
                     el: self.$el.find('.vk.share'),
                     image: self.$el.find('.one-height-grid img').eq(0).attr('src')
                 }).render();
             }*/

            if (self.opts.count > self.opts.limit) {
                $(window).on('scroll.for-photos', function() {
                    var height = {
                            doc: $(document).height(),
                            footer: $('footer').height(),
                            win: $(window).height()
                        },
                        scrollTop = $(window).scrollTop();

                    var padding = height.footer + 4 * height.win;
                    if (self.$el.find('#category').size()) {
                        padding += self.$el.find('#category').height()
                    }
                    if (self.loading == false && height.doc - padding <= scrollTop + height.win) {
                        self.loadPhotos();
                    }
                });
            }

            return this;
        }
    });

    return MainView;
});