define([

    'backbone'

], function(Backbone) {

    return Backbone.View.extend({

        options: {
            hideAfter: 1000,
            text: '',
            effect: {
                duration: 'fast'
            },
            offset: {
                x: 20,
                y: 20
            },
        },

        events: {
            'contextmenu .copy-protect, .zoomWindowContainer > div': 'onMenu',
            'dragstart .copy-protect': 'onDrag',
            'dragdrop .copy-protect': 'onDrag'
        },

        onDrag: function() {
            return false;
        },

        onMenu: function(e) {

            var self = this;

            if (self.timer) {
                clearTimeout(self.timer);
                self.timer = null;
            }

            this.tooltip.css({
                'left': e.pageX + this.options.offset.x,
                'top': e.pageY + this.options.offset.y
            });

            this.tooltip.fadeIn(this.options.effect.duration, function() {

                self.timer = setTimeout(function() {
                    self.tooltip.fadeOut(self.options.effect.duration);
                }, self.options.hideAfter);

            });

            return false;
        },

        render: function() {

            this.tooltip =
                $('<div class="copy-protector tooltip">' + this.options.text + '</div>');

            $('body').append(this.tooltip);

            return this;
        }
    });
});