define([


], function() {

    return {

        slideshowTimer: null,
        slideshowWait: false,

        initSlideshow: function() {

            var self = this;
            var countSlides = this.lentaMain.getSlidesCount() - 2; // delete fake slides

            this.parseSlideshowOptions();

            if (this.options.slideshow.enabled &&
                this.options.slideshow.speed > 0 &&
                this.lentaMain && countSlides > 1) {

                this.lentaMain.on('moved', function(e) {

                    self.destroySlideshowTimer();

                    if (self.options.slideshow.enabled) {
                        if (e.to.$el.is('.loading')) {
                            self.slideshowWait = true;
                        } else {
                            self.createSlideshowTimer();
                        }
                    }

                });

                this.$('.lenta-btn, .lenta-viewport li').click(function() {

                    self.destroySlideshowTimer();
                    self.options.slideshow.enabled = false;
                });
            }

        },

        destroySlideshowTimer: function() {

            if (this.slideshowTimer) {

                window.clearTimeout(this.slideshowTimer);
                this.slideshowTimer = null;
            }
        },

        createSlideshowTimer: function() {

            var self = this;

            this.slideshowTimer = window.setTimeout(function() {

                if (self.lentaMain) {

                    self.lentaMain.next();
                }

            }, this.options.slideshow.speed * 1000);

        },

        parseSlideshowOptions: function() {

            if (!this.options.slideshow)
                this.options.slideshow = {};

            this.options.slideshow.enabled =
                this.lentaMain.$el.data('slideshowEnabled') === 'y'

            this.options.slideshow.speed =
                parseInt(this.lentaMain.$el.data('slideshowSpeed'))

            return this;
        }

    }

});