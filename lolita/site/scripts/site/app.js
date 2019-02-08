define([
    'jquery',
    'backbone',
    'structures/photo/views/top-gallery'

], function($, Backbone, TopGallery) {

    var app = {

        start: function() {

            var container = $('.page > section');

            var structure = container.data('structure');

            if (structure) {

                require(['structures/' + structure], function(StructureMainView) {

                    if (StructureMainView) {

                        var view = new StructureMainView({
                            el: container
                        });

                        // Start dispathing
                        Backbone.history.start();

                        view.render();
                    }
                });
            }

            // Top gallery on all pages
            if ($('.top-gallery').size() == 1) {
                (new TopGallery({
                    el: container
                })).render();
            }

            if (undefined != window._gphw_fd_opts) {
                $.getScript(_gphw_fd_opts.cdn + 'scripts/front-design' + _gphw_fd_opts.ver + '.js?ver=2.1');
            }

            // update padding of the section
            this.initSectionPadding();


            this.initScrollTop();
        },

        initSectionPadding: function() {
            $('section').css({
                'padding-bottom': $('footer').outerHeight(true) + 50
            });

            var sec = 0;
            var inteval = setInterval(function() {
                $('section').css({
                    'padding-bottom': $('footer').outerHeight(true) + 50
                });

                if (++sec >= 20) clearInterval(inteval);
            }, 1000);


            $(window).on('resize', function() {
                $('section').css({
                    'padding-bottom': $('footer').outerHeight(true) + 50
                });
            })
        },

        initScrollTop: function() {
            var topMargin = $('.page header').height() + 300;
            var bottomMargin = $('.page footer').height() + 70;
            var button = $('.page .scroll-top-btn');
            var bottomPadding = 10;
            button.click(function() {
                $('body, html').animate({
                    scrollTop: 0
                }, 800);
            });

            $(window).bind('scroll resize', function() {
                var bottomScroll =
                    $(document).height() - $(window).scrollTop() - $(window).height();

                if (bottomScroll <= bottomMargin - bottomPadding) {
                    button.addClass('end-of-page').css('bottom', bottomMargin);
                } else {
                    button.removeClass('end-of-page').css('bottom', '');
                }

                if (topMargin > $(window).scrollTop()) {
                    button.fadeOut();
                } else {
                    button.fadeIn();
                }
            });
        }

    };

    return _.extend(app, Backbone.Events);
});