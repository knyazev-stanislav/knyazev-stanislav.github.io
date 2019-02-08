define([
    'cycled-lenta',
    'spinners',
    'raphael',
    'views/mixins/script-json',
    'views/mixins/slideshow',
    'loading-queue',
    'touch-swipe'

], function(Lenta, Spinners, Raphael, ScriptJSON, SlideshowMixin) {

    var MainView = Backbone.View.extend({

        removing: false,

        options: {
            index: 1,
            switchers: '.lenta-switcher li i',
            activeSwitcher: '.lenta-switcher li i.active',
            switchEffect: 'carousel',
            effectSpinner: false,
            arrowsDisplay: false
        },

        events: {
            'click .lenta-switcher li i': 'switchByCircle',
            'click .lenta-prev': 'prev',
            'click .lenta-next': 'next',
        },

        initialized: false,

        initialize: function() {

            if ($(document.body).is('.tablet')) {
                delete this.events['click .lenta-switcher li i'];
                this.events['click .lenta-switcher li'] = 'switchByCircle';
            }

            var self = this;

            var mediaQuery = "(-webkit-min-device-pixel-ratio: 1.5),\
                   (min--moz-device-pixel-ratio: 1.5),\
                   (-o-min-device-pixel-ratio: 3/2),\
                   (min-resolution: 1.5dppx)";
            var retina = ((window.devicePixelRatio > 1) || (window.matchMedia && window.matchMedia(mediaQuery).matches)) ? true : false;

            if (retina) {
                $('.top-gallery .lenta-viewport img').each(function(index, element) {
                    var fileName = $(element).data('file-name-origin');
                    if (parseInt($(element).data('file-big')) == 1) {
                        $(element).data('file-name', '2-' + fileName);
                    } else {
                        $(element).data('file-name', '1-' + fileName);
                    }
                });
            }

            _.bindAll(this);

            this.createMainLenta();

            this.createSpinners();

            this.initSlideshow();

            this.on('remove:before', function() {
                self.removing = true;
                self.lentaMain.unbind();
                self.destroySlideshowTimer();
            });
        },

        next: function(e) {
            this.lentaMain.next(e);
            this.options.slideshow.enabled = false;
            return false;
        },

        prev: function(e) {
            this.lentaMain.prev(e);
            this.options.slideshow.enabled = false;
            return false;
        },

        switchByCircle: function(e) {
            var el = $(e.target).parents('i');
            var id = $(this.options.switchers).index(el);

            if (id < 0) {
                el = $(e.target).find('i');
                id = $(this.options.switchers).index(el);
            }

            this.options.slideshow.enabled = false;
            this.lentaMain.move(id + 1);
        },

        resizeImages: function(slide) {

            var img = slide.find('img');
            var viewportHeight = this.lentaMain.viewport.height();
            var width = slide.width();

            img.css({
                width: width,
                height: 'auto'
            });

            if (img.height() < slide.height()) {
                img.css({
                    'height': slide.height(),
                    'width': 'auto',
                    'margin-left': slide.width() / 2 - img.width() / 2,
                    'margin-top': 0
                });
            } else {
                img.css({
                    'width': slide.width(),
                    'height': 'auto',
                    'margin-left': 0,
                    'margin-top': slide.height() / 2 - img.height() / 2
                });
            }

            if ($("body").hasClass("tablet")) {
                this.lentaMain.viewport.find(".fake").css({
                    'height': viewportHeight
                });
            }
        },

        loadImages: function(slide) {
            slide.$('img').loadingQueue();
        },

        createSpinners: function() {

            var spinner = Spinners.create(this.$('.top-gallery .lenta .spinner'), {
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

        configureLenta: function(lenta) {

            var self = this;

            //_.invoke(lenta.slides, 'on', 'render:before', function() {
            //	self.loadImages(this);				
            //});

            lenta.$('li img').loadingQueue();

            _.invoke(lenta.slides, 'on', 'resize:after', function() {
                self.resizeImages(this.$el);
                self.lentaMain.$el.height(self.lentaMain.$el.width() / self.lentaMain.$el.data('desktop-ratio'));
            });

            lenta.$('li img').on('loaded', function() {
                // If slideshow enabled

                var parent = $(this).parent().is('li');
                parent = (parent == true) ? $(this).parent() : $(this).parent().parent();

                if (self.options.effectSpinner == true) {
                    self.lentaMain.$el.find(' > .spinner').remove();
                    self.options.effectSpinner = false;
                }

                var slide = $(this).parents('li');

                slide.find('.spinner').remove();
                slide.removeClass('loading');

                self.resizeImages(slide);

                if (self.slideshowWait == true && self.options.slideshow.enabled && $(parent).is('.fake') == false) {
                    self.slideshowWait = false;
                    self.destroySlideshowTimer();
                    self.createSlideshowTimer();
                }
            });

            return lenta;
        },

        createMainLenta: function() {

            var self = this;

            self.options.switchEffect = ($('.top-gallery .lenta').attr('data-lenta-switch-effect') == 'carousel') ? 'slide' : 'fade';
            self.options.arrowsDisplay = ($('.top-gallery .lenta').attr('data-slideshow-arrows') == 'y') ? true : false;

            if (self.options.switchEffect == 'slide') {
                this.$('.top-gallery .lenta > .spinner').remove();
            } else {
                self.options.effectSpinner = true;
            }

            this.lentaMain = new Lenta({
                el: this.$('.top-gallery .lenta'),
                prevBtnSelector: '',
                nextBtnSelector: '',
                mousewheelTracking: false,
                animatedResizing: false,
                transitionSpeed: 500,
                transitionAnimation: self.options.switchEffect,
                forcedCycling: true,
                calculateSize: function() {}
            });

            this.lentaMain =
                this.configureLenta(this.lentaMain);

            return this.lentaMain;
        },


        render: function() {
            var self = this;

            this.options.index = (this.options.index < 1 || this.options.index == undefined) ? 1 : parseInt(this.options.index);

            this.lentaMain.options.index = this.options.index;
            $('footer').css('opacity', 1);
            this.lentaMain.render();

            // Start position for slider
            $(this.lentaMain.options.sliderSelector).css('left', '-' + this.lentaMain.viewport.width() * this.options.index + 'px')

            var switchersStatus = ($(this.options.switchers).size() > 0) ? true : false;
            if (switchersStatus == true) {
                $(this.options.switchers).each(function() {
                    var paper = Raphael(this, 12, 12);
                    var el = paper.circle(6, 6, 5).attr({
                        stroke: 'none'
                    });
                    el.node.setAttribute("class", "circle");
                });

                $(this.options.switchers).eq(0).addClass('active');

                this.lentaMain.on('moving', function(e) {
                    var id = e.toIndex - 1;
                    $(self.options.activeSwitcher).removeClass('active');
                    $(self.options.switchers).eq(id).addClass('active');
                });
            }

            // Draw arrows
            if (self.options.arrowsDisplay) {
                var paper = Raphael($('.lenta-next i')[0], 20, 36);
                var el = paper
                    .path("M 0 0 l 19 17 l -19 17 M 0 0 z")
                    .attr({
                        fill: 'none',
                        stroke: '#eee',
                        'stroke-width': 2
                    });
                el.node.setAttribute("class", "arrow");

                var paper = Raphael($('.lenta-prev i')[0], 20, 36);
                var el = paper
                    .path("M 20 0 l -19 17 l 19 17 M 0 0 z")
                    .attr({
                        fill: 'none',
                        stroke: '#eee',
                        'stroke-width': 2
                    });
                el.node.setAttribute("class", "arrow");
            }

            /* Swipe for tablet */
            if (document.cookie.indexOf('_gphw_tablet=1') > -1) {
                var lentaBox = this.lentaMain.el;
                $(document).ready(function() {
                    $(function() {
                        $(lentaBox).swipe({
                            triggerOnTouchEnd: true,
                            swipeStatus: function swipeStatus(event, phase, direction, distance) {
                                if (phase == "end") {
                                    if (direction == "right") {
                                        self.lentaMain.prev();
                                    } else if (direction == "left") {
                                        self.lentaMain.next();
                                    }
                                }
                            },
                            allowPageScroll: "vertical",
                            threshold: 75
                        });
                    });
                });
            }

            return this;
        }
    });

    _.extend(MainView.prototype, ScriptJSON, SlideshowMixin);

    return MainView;
});