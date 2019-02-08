define([

    'backbone',
    'jquery',
    'waypoints',
    'jstween'

], function(Backbone, jQuery) {

    return Backbone.View.extend({

        options: {
            speed: 300,
            heightMenu: 300,
            offsetHeight: 300,
            durationShow: 0.8,
            durationHide: 0.6
        },

        waypoint: null,

        initialize: function() {

            _.bindAll(this);

            var self = this;

            this.options.offsetHeight = this.$el.outerHeight(true);
            this.options.heightMenu = $('header.alternate .container').outerHeight(true);

            $(document).on('info-polosa.closed', function() {
                $(window).trigger('resize');
            });

            this.scroll();
        },

        scroll: function() {

            var self = this;

            self.waypoint = jQuery('header.default').waypoint(function(duration) {

                // For ie 9
                if (typeof jQuery('header.alternate').tween == 'function') {
                    $ = jQuery;
                }

                if (duration === 'down') {

                    $('header.alternate').data('state', 'show');

                    $('header.alternate').tween({
                        height: {
                            start: 0,
                            stop: self.options.heightMenu,
                            time: 0,
                            units: 'px',
                            duration: self.options.durationShow,
                            effect: 'expoOut',
                            onStart: function() {
                                if ($('header.alternate div.inner').children().length) {
                                    $('header.alternate').addClass('visible');
                                }
                            }
                        },
                        top: {
                            start: (-1) * self.options.heightMenu,
                            stop: 0,
                            time: 0,
                            units: 'px',
                            duration: self.options.durationShow,
                            effect: 'expoOut'
                        }
                    });

                    $.play();
                } else if (duration === 'up') {

                    $('header.alternate').data('state', 'hide');

                    $('header.alternate').tween({
                        height: {
                            start: self.options.heightMenu,
                            stop: 0,
                            time: 0,
                            units: 'px',
                            duration: self.options.durationHide,
                            effect: 'expoIn',
                            onStop: function() {
                                if ($('header.alternate').data('state') === 'hide') {

                                    $('header.alternate').removeClass('visible');
                                }
                            }
                        },
                        top: {
                            start: 0,
                            stop: (-1) * self.options.heightMenu,
                            time: 0,
                            units: 'px',
                            duration: self.options.durationHide,
                            effect: 'expoIn'
                        }
                    });

                    $.play();
                }
            }, {
                offset: (-1) * self.options.offsetHeight
            });
        },

        render: function() {

            return this;
        }

    });
})