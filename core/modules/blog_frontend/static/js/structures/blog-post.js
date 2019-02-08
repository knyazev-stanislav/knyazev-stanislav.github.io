define([

    'jquery',
    'module-blog-frontend-static/article',
    'module-blog-frontend-static/vendor/gallery',
    'module-blog-frontend-static/vendor/static-grid',
    'module-blog-frontend-static/helpers/blog-protect-module',
    'module-blog-frontend-static/helpers/blog-decoration-renderer',
    'module-blog-frontend-static/helpers/blog-custom-likes',
    'module-blog-frontend-static/vendor/dynamic-loader',
    'module-blog-frontend-static/widgets/post-map/index',
    'module-blog-progressButton',
    'fileinput',
    'selectize',
    'perfect-scroll'


], function($, Article, gallerySlideshow, galleryStaticGrid, ProtectModule, DecorationRenderer, CustomLikes, DynamicLoader, AsideMap) {

    var MainView = Backbone.View.extend({
        options: {
            'landing': false,
        },

        events: {
            'click .share-link > a': 'share'
        },

        initialize: function(options) {

            this.options = _.extend(options, this.options);

            // fix size cols, if exist empty cols (without widgets)
            $('article').find('.row').each(function() {
                var unusedSize = 0;
                var emptyCol = $(this).find('.col:empty');

                // if exist empty col
                if (emptyCol.length) {
                    // get value unused size and remove empty col
                    emptyCol.each(function() {
                        var className = this.className.match(/col-md-\d+/);
                        unusedSize += parseInt(className[0].split('col-md-')[1]);

                        $(this).remove();
                    });

                    var cols = $(this).find('.col');
                    if (unusedSize % cols.length == 0) {
                        var addSize = unusedSize / cols.length;

                        // change size
                        $(this).find('.col').each(function() {
                            var className = this.className.match(/col-md-\d+/);
                            var curSize = parseInt(className[0].split('col-md-')[1]);
                            $(this).removeClass(className[0]).addClass('col-md-' + (curSize + addSize))
                        });
                    } else {
                        addSize = parseInt(unusedSize / cols.length);
                        var leftValue = unusedSize - (addSize * cols.length)

                        var minColElem = null;
                        var minColValue = 24;
                        $(this).find('.col').each(function() {
                            var className = this.className.match(/col-md-\d+/);
                            var curSize = parseInt(className[0].split('col-md-')[1]);
                            if (curSize < minColValue) {
                                minColValue = curSize;
                                minColElem = $(this);
                            }
                            if (addSize != 0) {
                                $(this).removeClass(className[0]).addClass('col-md-' + (curSize + addSize))
                            }
                        });
                        if (minColElem) {
                            minColElem.removeClass('col-md-' + minColValue).addClass('col-md-' + (leftValue + minColValue))
                        }
                    }
                }
            });

            new Article({
                el: this.$('article')
            }).render();

            var self = this;

            if (self.$el.find('.post-body').size() > 0) {
                var dynamicImages = new DynamicLoader({
                    el: self.$el.find('.post-body'),
                    items: [".widget[data-type='simple-image']", ".widget[data-type='post-gallery'] .gallery-row"],
                    factor: 6,
                    overflow: ($('body').is('.oliver') && $('body').is('.mobile') == false) ? true : false
                });
                dynamicImages.render();
            }

            $dl = dynamicImages;

            $(window).on('resize',
                _.debounce(function() {
                    $dl.initialize({
                        el: self.$el.find('.post-body'),
                        items: '.widget[data-type="simple-image"]',
                        factor: 2,
                        overflow: ($('body').is('.oliver') && $('body').is('.mobile') == false) ? true : false
                    });
                }, 500)
            );

            if (this.options.landing == true)
                var parentSection = this.$el.parent();

            var blogOptions = this.options.landing == false ?
                $('#blog-options') :
                $(parentSection).find('#blog-options');

            if ($(blogOptions).length) {
                this.options = _.extend(this.options, $.parseJSON($.trim($(blogOptions).html())));
            }

            this.helperRenderer = new DecorationRenderer();

            this.customLikes = new CustomLikes({
                elements: this.$('.like'),
                selectorSVG: '.icon-like-heart',
                blogId: this.options.sid
            });

            this.protectImages();

            return this;
        },

        protectImages: function() {

            var $protectOptions = $('#blog-protect-images-options');

            if ($protectOptions.length === 1) {

                this.optionsProtect = $.parseJSON($.trim($protectOptions.html()));

                if (this.optionsProtect.protectImage === 'y') {

                    var Protector = new ProtectModule(this.optionsProtect.message);

                    Protector.initProtector('.blog-content .widget .simple-image');
                    Protector.disableDragAndDrop('.blog-content .widget .simple-image img');

                    Protector.initProtector('.blog-content .widget .post-gallery img');
                }
            }
        },

        render: function() {
            $('#content').trigger('renderContent');

            /*if (this.$('.posts-paging').size()) {
                this.renderArrow('l-paging-arrow', 'left');
                this.renderArrow('r-paging-arrow', 'right');
            }*/

            if (window.location.hash == '#more' && $('#more').length) {
                $('body').scrollTop($('#more').offset().top);
            }

            if (window.location.hash == '#blog-comments') {
                $('body').scrollTop($('#blog-comments').offset().top);
            }

            if (this.$('.blog-sidebar').size()) {

                this.renderAside(this.$('.blog-sidebar'));
            }

            var widgets = this.options.landing == false ?
                $('.blog-content .widget') :
                this.$el.parent().find('.blog-content .widget');


            $(widgets).each(function() {

                var $widget = $(this);
                var $element = $widget.find('.element');

                if ($widget.data('type') == 'post-instagram') {

                    if ($element.data('layout') == 'slideshow') {
                        (new gallerySlideshow({
                            el: $element.find('.instagram-box')
                        })).render();
                    }
                    if ($element.data('layout') == 'grid') {
                        (new galleryStaticGrid({
                            el: $element.find('.static-grid')
                        })).render();
                    }
                }
            });

            /* fix kevin */
            if ($(document.body).is('.mobile')) {
                /* fix bug ios hover */
                if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
                    $('.post-button-content').on('touchstart', function() {
                        $(this).trigger('hover');
                    }).on('touchend', function() {
                        $(this).trigger('hover');
                    });
                }
            }

            this.customLikes.render();

            this.trigger('render:finish');

            this.$el.trigger('rendered');

            return this;
        },

        share: function(e) {

            e.preventDefault();

            var link = this.$(e.currentTarget).attr('href');

            window.open(link, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
        },

        renderArrow: function(id, direction) {

            if (this.$('#' + id).size()) {

                var paper = Raphael(id, 10, 18);
                if (direction == 'right')
                    var el = paper.path("M 1 1 L 8 9 L 1 17").attr({
                        fill: 'none',
                        'stroke-width': 1
                    });
                else
                    var el = paper.path("M 7 1 L 1 9 L 7 17").attr({
                        fill: 'none',
                        'stroke-width': 1
                    });
            }
        },

        renderAside: function($el) {

            function fixPositionImage(elem) {
                var self = elem;

                if (self.find('.image-block').data('naturalWidth') == undefined || self.find('.image-block').data('naturalWidth') == 0) {
                    // get naturalWidth/naturalHeight
                    self.find('.image-block')
                        .data('naturalWidth', self.find('.image-block img').get(0).naturalWidth)
                        .data('naturalHeight', self.find('.image-block img').get(0).naturalHeight);
                }

                if (self.find('> .element').is('.imageNoStretch') && self.find('.image-block').data('naturalWidth') != undefined && self.find('.image-block').data('naturalWidth') != 0) {
                    self.find('.image-block')
                        .css('max-height', self.find('.image-block').width() * self.find('.image-block').data('naturalHeight') / self.find('.image-block').data('naturalWidth') + 'px');

                    self.find('.image-block img')
                        .css('margin-left', -self.find('.image-block').data('naturalWidth') / 2 + self.find('.image-block').width() / 2)
                        .css('margin-top', -self.find('.image-block').data('naturalHeight') / 2 + self.find('.image-block').height() / 2)
                }
            }

            $el.find('.aside .widget').each(function() {

                var $widget = $(this);
                var $element = $widget.find('.element');

                if ($widget.data('type') == 'aside-instagram') {

                    if ($element.data('layout') == 'slideshow') {
                        (new gallerySlideshow({
                            el: $element.find('.instagram-box')
                        })).render();
                    }
                    if ($element.data('layout') == 'grid') {
                        (new galleryStaticGrid({
                            el: $element.find('.static-grid')
                        })).render();
                    }
                }

                if ($widget.data('type') == 'aside-image') {

                    if ($widget.find('> .element').is('.imageNoStretch')) {
                        $widget.find('> .element img').on('load', function() {
                            fixPositionImage($widget);
                        });
                        fixPositionImage($widget);
                    }
                }

                if ($widget.data('type') == 'aside-subscribe') {
                    var form = $element.find('.subscribe-form');
                    new ProgressButton(document.querySelectorAll('button.progress-button')[0], {
                        callback: function(instance) {
                            var emailrule = new RegExp('^[a-zA-Z0-9._-]+@[a-zA-Z0-9_-]+[\.][a-zA-Z0-9._-]+$');
                            var email = form.find('input[name=email]').val();
                            form.find('.field-error').hide();
                            if (email && emailrule.test(email)) {
                                submitForm();

                                var progress = 0,
                                    interval = setInterval(function() {
                                        progress = Math.min(progress + Math.random() * 0.15, 1);
                                        instance._setProgress(progress);

                                        if ($('button#progressButton').hasClass('loading-end')) {
                                            instance._setProgress(1);
                                            instance._stop(1);
                                            clearInterval(interval);
                                        }
                                    }, 100);
                            } else {
                                instance._stop(1);

                                form.find('.field-error').show();

                                form.find('.input-for-error').addClass('form-input-error').on('keyup change paste input',
                                    function() {
                                        form.find('.input-for-error').off('keyup change paste input').removeClass('form-input-error');
                                    }
                                )
                            }
                        }
                    });
                }

                if ($widget.data('type') == 'aside-map') {
                    (new AsideMap({
                        el: $element,
                        isAside: true
                    })).render();
                }
            });
        },
    });

    return MainView;
});