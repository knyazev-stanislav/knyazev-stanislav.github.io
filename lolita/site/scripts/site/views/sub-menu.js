define([

    'backbone'

], function(Backbone) {

    return Backbone.View.extend({

        options: {
            speed: 300,
            header: null,
            activeItem: null,
            delay: 500,
            mouseLoc: {
                x: 0,
                y: 0
            }
        },

        timer: null,

        initialize: function() {
            _.bindAll(this);
        },

        unbind: function() {

            this.undelegateEvents();

            this.$el.add($('header .inner .menu .menu-item#' + $(this).data('parent-id')))
                .unbind('mouseout.menu')
                .unbind('mouseover.menu');
        },

        show: function() {

            var self = this;

            $(document).on('mousemove', function(e) {

                self.options.mouseLoc.x = e.pageX;
                self.options.mouseLoc.y = e.pageY;
            });

            var parent = this.options.header.find('.menu .menu-item#' + this.$el.data('parent-id'));

            self.$('.menu-item').css('padding-left', parent.offset().left);

            this.$el.add(this.options.header.find('.menu .menu-item#' + this.$el.data('parent-id')))
                .bind('mouseout.menu', function() {

                    self.possibleHide.call(self);
                })
                .bind('mouseover.menu', function() {

                    if (self.timer) {

                        clearTimeout(self.timer);
                    }
                });

            if (!this.$el.is(':visible')) {
                this.$el.slideDown(this.options.speed);
            }
        },

        possibleHide: function() {

            var self = this;

            this.timer = setTimeout(function() {
                var mouseLoc = self.options.mouseLoc,
                    activeItem = self.options.activeItem,
                    offsetSub = self.$el.offset(),
                    checkAvailableArea = activeItem.offset().left > mouseLoc.x ||
                    activeItem.offset().left + activeItem.width() < mouseLoc.x ||
                    activeItem.offset().top > mouseLoc.y ||
                    offsetSub.top < mouseLoc.y;



                if (checkAvailableArea) {

                    self.hide();
                } else {

                    self.possibleHide();
                }
            }, this.options.delay);
        },

        hide: function() {

            clearTimeout(this.timer);
            this.$el.slideUp(this.options.speed);

            $(document).unbind('mousemove');
        },

        render: function() {
            return this;
        }
    });
});