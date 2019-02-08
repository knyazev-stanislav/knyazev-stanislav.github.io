define([

    'jquery',
    'backbone',
    'module-blog-frontend-static/vendor/fsbox-view'

], function($, Backbone, Fsbox) {

    var MainView = Backbone.View.extend({

        selector: {
            options: '.widget-options',

            gallery: '.post-gallery',
            row: '.gallery-row',
            photo: '.gallery-photo-box',
        },

        options: {
            width: 0,
            photoGap: 0,
            photos: [],
        },

        indexes: [500, 1000, 1500, 2000],
        // removed size 300 for mobile

        fsbox: null,

        mediaQuery: "(-webkit-min-device-pixel-ratio: 2),\(min--moz-device-pixel-ratio: 2),\(-o-min-device-pixel-ratio: 4/2),\(min-resolution: 2dppx)",

        retina: ((window.devicePixelRatio > 1.5) || (window.matchMedia && window.matchMedia(self.mediaQuery).matches)) ? true : false,

        isMobile: null,

        initialize: function() {

            var jsonOptions = this.$el.children(this.selector.options).text();

            if (_.isString(jsonOptions) && jsonOptions !== "") {

                var options = JSON.parse(jsonOptions);

                if (_.isObject(options)) {

                    this.options = options;
                }
            }

            this._initEvents();

            return this;
        },

        render: function() {

            var self = this;

            // Делаем всем галереям на странице абсолютное позиционирование,
            // чтобы их установки ширины не мешали нам ресайзить страницу в сторону уменьшения
            if (!$('body').hasClass('mobile')) {
                $('#post-content .gallery-row').css({
                    position: 'absolute'
                })
            }

            //window.innerWidth
            this.options.width = this.$(this.selector.gallery).width();
            if (!$('body').hasClass('mobile')) {
                $('#post-content .gallery-row').css({
                    position: ''
                });
            }

            this.$(this.selector.row).each(function(indexRow, row) {

                self._calculateSizeCells($(row), indexRow);
            });

            return this;
        },

        _initEvents: function() {

            var self = this;

            self.isMobile = $('body').hasClass('mobile');

            // FSBOX
            if (self.options.fullscreen == 'y') {

                self.$el.find('.gallery-photo-box-image.fullscreen').click(function() {
                    var fsbox = $('body > #fsbox');
                    var fsboxData = self.$el.find('.fsbox-data');
                    // Если fsbox не инициализирован, либо data-id не совпадают,
                    // то создаем новый
                    if (fsbox.attr('data-id') != self.$el.attr('data-id')) {
                        $('body > #fsbox').remove();
                        fsbox = $('<div id="fsbox" class="fsbox-blog" data-id="' + self.$el.attr('data-id') + '" data-storage="' + fsboxData.attr('data-storage') + '"></div>');
                        fsbox.appendTo('body');

                        fsbox = $('#fsbox');
                        $('#fsbox').html(fsboxData.html())

                        self.fsbox = new Fsbox({
                            el: $('#fsbox')
                        }).render();
                    }

                    self.fsbox.box.open(self.$el.find('.gallery-photo-box-image.fullscreen').index(this));
                    return false;
                });
            }

            $(window).on('resize', function() {

                self.render();
            });




        },

        _calculateSizeCells: function($row, indexRow) {

            // Расчёт размеров взят из плагина one-height-grid
            // Этот механизм отличается от того, который используется в админке
            // в конструкторе блога.
            var self = this;
            var $cells = $row.find(this.selector.photo);
            var rowWidth = this.options.width;
            var photoGap = this.options.photoGap;
            var initialPhotoGap = this.options.photoGap;

            // Step 1 get sizes
            var photos = this.options.photos[indexRow];
            var width = _.pluck(photos, 'width');
            var height = _.pluck(photos, 'height');
            var minH = _.min(height);
            var tmpWidth = 0;

            // Step 2 calculate temp width
            for (var i = 0; i < width.length; i++) {

                width[i] = minH * width[i] / height[i];
                tmpWidth = tmpWidth + width[i];
            }

            // Step 3 calculate rate
            rate = (rowWidth - ((width.length - 1) * photoGap)) / tmpWidth;

            minH = Math.round(minH * rate);

            tmpWidth = 0;

            $cells.find('img').css('height', minH + 'px');

            for (var i = 0; i < width.length; i++) {

                var cellWidth = width[i] = Math.round(width[i] * rate);
                tmpWidth = +tmpWidth + cellWidth;

                var rowHeight = Math.min(minH, height[i]);

                if (photoGap < 11 && !$cells.eq(i).find('.gallery-photo-box-title').is(':empty')) {
                    photoGap = 10;
                }

                $cells.eq(i).css({
                    'width': cellWidth + 'px',
                    'marginBottom': photoGap + 'px'
                });

                if (i != width.length - 1) {
                    $cells.eq(i).css({
                        'marginRight': initialPhotoGap + 'px'
                    });
                    tmpWidth = +tmpWidth + (+initialPhotoGap);
                } else {
                    if (rowWidth != tmpWidth) {
                        width[i] = width[i] - (tmpWidth - rowWidth);
                        $cells.eq(i).css({
                            'width': width[i] + 'px'
                        });
                    }
                }

                $cells.eq(i).find('img').css({
                    'width': $cells.eq(i).width() + 'px'
                });
            }

            $row.css('width', rowWidth);

            $cells.find('img').each(function() {
                var image = $(this);
                var file = '';
                var size = $(this).data('sizes');
                var w = $(this).parent().width();
                var h = $(this).parent().height();
                if (size) {
                    for (i in self.indexes) {
                        if (size[self.indexes[i]] && (size[self.indexes[i]].w >= w && size[self.indexes[i]].h >= h)) {

                            if (self.retina && !self.isMobile && i != self.indexes.length - 1) {
                                newIndex = +i + 1;
                                file = self.indexes[newIndex] + '-';
                            } else {
                                file = self.indexes[i] + '-';
                            }

                            break;
                        }
                    }
                }

                // Для вертикальных фоток
                if (file == '') {
                    for (i in self.indexes) {
                        if (size[self.indexes[i]] && size[self.indexes[i]].w >= w) {
                            if (self.retina && !self.isMobile && i != self.indexes.length - 1) {
                                newIndex = +i + 1;
                                file = self.indexes[newIndex] + '-';
                            } else {
                                file = self.indexes[i] + '-';
                            }

                            break;
                        }
                    }
                    if (file == '') {
                        file = '2000-'
                    }
                }

                var filename = file + $(this).attr('data-src');
                file = self.options.storage + file + $(this).attr('data-src');

                // for dynamic loader in blog and on composite page
                if ($('body').hasClass('desktop')) {
                    image.attr('data-dynamic', true);
                    image.attr('data-file-name', filename);
                    image.attr('data-base-path', self.options.storage);
                    image.on('load', function() {
                        $(this).removeData("dynamic");
                    });
                } else {
                    image.attr('src', file);
                }
            });

        }
    });

    return MainView;
});