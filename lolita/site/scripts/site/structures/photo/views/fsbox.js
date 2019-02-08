define([

    'spinners',
    'raphael',
    'views/vk-share',
    'touch-swipe',
    'fsbox'

], function(Spinners, Raphael, VKShare) {

    var MainView = Backbone.View.extend({

        initialize: function() {

        },

        renderArrow: function(id, direction) {
            var paper = Raphael(id, 25, 51);
            var attrs = {
                'fill': '#555',
                'stroke': 'none'
            };
            var el = paper
                .path("m 24.96877,0.0 -24.87294,24.74994 c -0.13429,0.51019 -0.13062,1.42012 0.0312,1.81396 l 24.85509,24.4361 0,-2.51505 -23.01637,-22.83805 23.03423,-22.95379 z")
                .attr(attrs);
            if (direction == 'right')
                el.transform('s0.8r180')
            else
                el.transform('s0.8')
        },

        renderCross: function(id) {
            var paper = Raphael(id, 30, 30);
            var attrs = {
                'fill': '#555',
                'stroke': 'none',
                'stroke-width': '0'
            };
            var el = paper
                .path("M 6.875 6.15625 L 6.15625 6.875 L 14.28125 15 L 6.15625 23.125 L 6.875 23.84375 L 15 15.71875" +
                    " L 23.125 23.84375 L 23.84375 23.125 L 15.71875 15 L 23.84375 6.875 L 23.125 6.15625 L 15 14.28125 L 6.875 6.15625 z ")
                .attr(attrs);
            el.transform('s1.5')
        },

        render: function() {
            var self = this;

            this.renderArrow('fsbox-prev');
            this.renderArrow('fsbox-next', 'right');
            this.renderCross('fsbox-close');

            // Fsbox plugin
            $(document).ready(function() {
                (function($box) {
                    var centerArrows = function() {
                        $box.find('.control.prev, .control.next').each(function() {
                            $(this).css('top', ($box.height() - $(this).height()) / 2)
                        });
                    }
                    $box.on('open.fsbox change.fsbox', function(event, slide, changeTo) {
                        if (jQuery().swipe) {
                            $box.swipe({
                                triggerOnTouchEnd: true,
                                swipeStatus: function swipeStatus(event, phase, direction, distance) {
                                    if (phase == "end") {
                                        if (direction == "right") {
                                            $box.fsbox('prev');
                                        } else if (direction == "left") {
                                            $box.fsbox('next');
                                        }
                                    }
                                },
                                allowPageScroll: "vertical",
                                threshold: 75
                            });
                        }
                        if (changeTo) slide = changeTo
                        document.location.hash = '#' + slide.$slide.index();

                        var socialLink = document.location.href;
                        socialLink = socialLink.replace(document.location.hash, "/" + slide.$slide.index());

                        if ($(this).find('.facebook.share')) {
                            try {
                                $(this).find('.fb-share-button').remove();
                                $(this).find('.button.share.facebook').append('<div class="fb-share-button" data-href="' + socialLink + '" data-layout="button_count"></div>');
                                FB.XFBML.parse();
                            } catch (e) {}
                        }
                        if ($(this).find('.vk.share')) {
                            var vkShare = new VKShare({
                                el: $(this).find('.vk.share'),
                                image: slide.$slide.data('fsbox-src'),
                                href: socialLink
                            }).render();
                        }
                    })
                    if ($('.page').is('.desktop')) {
                        function keypressFsbox(eventObject) {
                            if (eventObject.which == 37) {
                                $box.fsbox('prev');
                            } else if (eventObject.which == 39) {
                                $box.fsbox('next');
                            }
                        }

                        $box.on('open.fsbox', function() {
                            $('html').bind('keyup', keypressFsbox);
                        });
                        $box.on('close.fsbox', function() {
                            $('html').unbind('keyup', keypressFsbox);
                            document.location.hash = '';
                            history.pushState("", document.title, window.location.pathname);
                        });
                    }

                    $(window).on('resize.fsbox', function() {
                        setTimeout(function() {
                            $box.find(".slides > img").each(function() {
                                var image = $(this);
                                image.css({
                                    top: (image.parent().height() - image.height()) / 2,
                                    left: (image.parent().width() - image.width()) / 2
                                });
                            });
                        }, 100);

                        centerArrows();
                    });


                    Spinners.create($box.find('.spinner'), {
                        radius: 7,
                        height: 10,
                        width: 1.5,
                        dashes: 20,
                        opacity: 0.85,
                        rotation: 800,
                        color: '#000000'
                    }).center().play()

                    centerArrows()
                    var matches = document.location.hash.match(/^#(\d+)$/)
                    if (matches)
                        $box.fsbox('open', matches[1])

                })($('.fsbox'))


                if ($('.page').is('.desktop')) {
                    $('.fsbox').bind('click', function(e) {
                        $('.fsbox').fsbox('close');
                    });
                }

                $('.fsbox .vk.share').bind('click', function(e) {
                    e.preventDefault();

                    return false;
                });
            });
            return this;
        }
    });


    return MainView;
});