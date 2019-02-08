define([
    'jquery',
    'backbone',
    'module-blog-frontend-static/helpers/blog-protect-module'
], function($, Backbone, ProtectModule) {

    var Fsbox = Backbone.View.extend({

        options: {
            effectSpeed: 500,
            closeBindTo: '.close a',
            prevBindTo: '#fsbox-prev',
            nextBindTo: '#fsbox-next',
            slidesSelector: '.slides > *',
            spinnerSelector: '.spinner',
            factor: 2,
            closeKeyCode: 27,
            closeByEmptySpace: true,
            activeSlideClass: 'active'
        },

        slides: [],
        spinner: '',
        actions: false,
        body: {
            style: '',
            scroll: 0
        },
        currentSlide: 0,
        timer: null,

        initialize: function(options) {
            var self = this;

            options = options || {};
            this.options = _.extend(this.options, options);
            this.slides = [];
            this.actions = false;
            this.currentSlide = 0;
            this.timer = null;
        },

        open: function(i) {
            var self = this;

            self.body.style = $('body').css('overflow');
            self.body.scroll = $('body').scrollTop();

            self.$el.trigger('open.fsbox');

            $('body').css('overflow', 'hidden');

            self.$el.fadeIn(self.options.effectSpeed, function() {
                self.slideShow(i);
            });
        },

        close: function() {
            var self = this;

            self.$el.trigger('close.fsbox');

            /* Return body position */

            setTimeout(function() {
                $('body').scrollTop(self.body.scroll);
            }, 50);

            $('body').css('overflow', self.body.style);
            this.$el.fadeOut(self.options.effectSpeed, function() {
                self.actions = false;
                $(self.slides[self.currentSlide]).css('opacity', 0);
            });
        },

        next: function() {
            var self = this;

            if (self.actions == false) {
                self.actions = true;
                $(self.slides[self.currentSlide]).animate({
                    'opacity': 0
                }, self.options.effectSpeed, function() {
                    var i = ((self.currentSlide + 1) == self.slides.length) ? 0 : self.currentSlide + 1;
                    self.slideShow(i);
                })
            }
        },

        prev: function() {
            var self = this;

            if (self.actions == false) {
                self.actions = true;
                $(self.slides[self.currentSlide]).animate({
                    'opacity': 0
                }, self.options.effectSpeed, function() {
                    var i = ((self.currentSlide - 1) < 0) ? self.slides.length - 1 : self.currentSlide - 1;
                    self.slideShow(i);
                })
            }
        },
        render: function() {

            var self = this;

            $(document).keydown(function(e) {
                if (e.keyCode == self.options.closeKeyCode) {
                    self.close();
                }
            });

            if (self.options.closeByEmptySpace == true) {
                self.$el.off('click.fsbox-area').on('click.fsbox-area', function(e) {
                    if ($(e.target).is('.slides') || $(e.target).is('.slides-container')) {
                        self.close();
                    }
                });
            }

            self.spinner = self.$el.find(self.options.spinnerSelector);

            self.$el.find(self.options.closeBindTo).click(function() {
                self.close();
                return false;
            });
            self.$el.find(self.options.prevBindTo).click(function() {
                self.prev();
                return false;
            });
            self.$el.find(self.options.nextBindTo).click(function() {
                self.next();
                return false;
            });

            function arrowKeyPress(eventObject) {
                if (eventObject.which == 37) {
                    self.prev();
                } else if (eventObject.which == 39) {
                    self.next();
                }
            }

            self.$el.on('open.fsbox', function() {
                $('html').bind('keyup', arrowKeyPress);
            });

            self.$el.on('close.fsbox', function() {
                $('html').unbind('keyup', arrowKeyPress);
            });

            self.slides = this.$el.find(self.options.slidesSelector);

            $(window).off('resize.fsbox').on('resize.fsbox', function() {
                self.timer = setTimeout(function() {
                    $(self.slides).each(function() {
                        if ($(this).data('loaded') == true) {
                            self.slideCenter($(this));
                        }
                    });
                }, 100);
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

                    Protector.initProtector('.fsbox-blog img');
                }
            }
        },

        slideShow: function(i) {

            var self = this;
            var slide = $(self.slides[i]);
            self.slideCenter(slide);

            if (slide.data('loaded') == undefined) {
                // Show spinner
                self.spinner.fadeIn(self.options.effectSpeed, function() {
                    // Slide is image
                    if (slide.is('img')) {
                        slide.on('load', function() {
                            self.$el.trigger('change:start');
                            // Center slide
                            self.slideCenter($(this));

                            $(this).data('loaded', true).on('click', function() {
                                self.next();
                            });

                            self.spinner.fadeOut(self.options.effectSpeed, function() {
                                slide.animate({
                                    opacity: 1
                                }, self.options.effectSpeed, function() {
                                    self.slides.removeClass(self.options.activeSlideClass);
                                    slide.addClass(self.options.activeSlideClass);
                                    self.currentSlide = i;
                                    self.actions = false;
                                    self.$el.trigger('change:finish');
                                });
                            });

                            self.loadSlides(i);

                        }).on('error', function() {
                            self.currentSlide = i;
                            self.actions = false;
                        }).attr('src', slide.data('fsbox-src'));
                    } else {
                        var img = $(slide).find('img').eq(0);

                        img.on('load', function() {
                            self.$el.trigger('change:start');
                            // Center slide
                            self.slideCenter(slide);

                            slide.data('loaded', true).on('click', function() {
                                self.next();
                            });

                            self.spinner.fadeOut(self.options.effectSpeed, function() {
                                slide.animate({
                                    opacity: 1
                                }, self.options.effectSpeed, function() {
                                    self.slides.removeClass(self.options.activeSlideClass);
                                    slide.addClass(self.options.activeSlideClass);
                                    self.currentSlide = i;
                                    self.actions = false;
                                    self.$el.trigger('change:finish');
                                });
                            });
                            self.loadSlides(i);
                        }).on('error', function() {
                            self.currentSlide = i;
                            self.actions = false;
                        }).attr('src', img.data('fsbox-src'));
                    }
                });
            } else {
                self.$el.trigger('change:start');
                slide.animate({
                    opacity: 1
                }, self.options.effectSpeed, function() {
                    self.slides.removeClass(self.options.activeSlideClass);
                    slide.addClass(self.options.activeSlideClass);
                    self.currentSlide = i;
                    self.actions = false;
                    self.$el.trigger('change:finish');
                });
                self.loadSlides(i);
            }
        },

        slideCenter: function(slide) {
            /*slide.css({
            	top: (slide.parent().height() - slide.height())/2,
            	left: (slide.parent().width() - slide.width())/2
            });*/

            // center content with position relative
            var heightParent = slide.height();
            var heightCurrent = slide.find('img').height();
            if (heightCurrent < heightParent - 2) { /* 2 - border */
                slide.find('td').css('position', 'relative');
            } else {
                slide.find('td').css('position', 'absolute');
            }
        },

        loadSlides: function(i) {
            var self = this;
            var l = this.slides.length - 1;
            var a = []

            // Create queue
            for (j = i + 1; j <= i + this.options.factor; j++) {
                if (j > l) {
                    a.push(j - l - 1);
                } else {
                    a.push(j);
                }
            }
            for (j = i - 1; j >= i - this.options.factor; j--) {
                if (j < 0) {
                    a.push(l - Math.abs(j + 1));
                } else {
                    a.push(j);
                }
            }
            // Load slides
            for (j = 0; j < a.length; j++) {
                slide = $(self.slides[a[j]]);
                if (slide.data('loaded') == undefined) {
                    // Slide is image
                    if (slide.is('img')) {
                        slide.on('load', function() {
                            // Center slide
                            self.slideCenter(slide);

                            $(this).data('loaded', true).on('click', function() {
                                self.next();
                            });
                        }).attr('src', slide.data('fsbox-src'));
                    } else {
                        var img = $(slide).find('img');
                        img.attr('src', img.data('fsbox-src')).on('load', function() {
                            self.slideCenter(slide);
                            $(this).parents('div').eq(0).data('loaded', true).on('click', function() {
                                self.next();
                            });
                        });
                    }
                }
            }
        },

        getSlideNumber: function() {
            return this.currentSlide + 1;
        }
    });

    return Fsbox;
});