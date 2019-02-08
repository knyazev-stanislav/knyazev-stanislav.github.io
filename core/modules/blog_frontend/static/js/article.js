define([

    'module-blog-frontend-static/widget-factory'

], function(WidgetFactory) {

    var Article = Backbone.View.extend({

        widgets: [],

        options: {
            mobile: 0,
            blog: {}
        },

        events: {
            'mouseenter .gallery-photo-box-image': 'showPinterestBtn',
            'mouseleave .gallery-photo-box-image': 'hidePinterestBtn',

            'mouseenter .simple-image .image-block': 'showPinterestBtn',
            'mouseleave .simple-image .image-block': 'hidePinterestBtn',

            'mouseenter .bgi_imageWrap': 'showPinterestBtn',
            'mouseleave .bgi_imageWrap': 'hidePinterestBtn',

            'mouseenter .bgi_imageHold': 'showPinterestBtn',
            'mouseleave .bgi_imageHold': 'hidePinterestBtn'
        },

        initialize: function(options) {

            this.options.mobile = options.mobile;

            /* remove widgets 'post-vertical-break-line' for mobile version */
            if ($(document.body).is('.adaptive-mobile')) {
                $('.widget[data-type="post-vertical-break-line"]').each(function() {
                    $(this).parent().remove();
                });
            }

            if ($('#blog-options').length) {

                this.options.blog = $.parseJSON($.trim($('#blog-options').html()));
            }

            this.renderWidgets();

            return this;
        },

        render: function() {
            return this;
        },

        hidePinterestBtn: function(ev) {

            var isMobile = $(this.el.closest(".blog-content")).hasClass("blog-mobile");
            if (!isMobile) {

                if (typeof ev.toElement !== "undefined" && !$(ev.toElement).hasClass('pinterest-btn')) {
                    $(".pinterest-btn").remove();
                }

                if (typeof ev.relatedTarget !== "undefined" && !$(ev.relatedTarget).hasClass('pinterest-btn')) {
                    $(".pinterest-btn").remove();
                }
            }

        },

        showPinterestBtn: function(ev) {
            var isMobile = $(this.el.closest(".blog-content")).hasClass("blog-mobile");
            if (!isMobile) {
                if (this.options.blog.design != undefined && this.options.blog.design['display-pinterest'] == "y") {
                    var $image = $(ev.currentTarget),
                        $imageBlock = $image.parent(),
                        $offset = $image.position(),
                        buttonWidth = 42,
                        buttonOffset = 10,
                        left = ($offset.left + parseFloat($image.css('margin-left')) + $image.width() - buttonWidth - buttonOffset) + 'px',
                        top = (parseFloat($image.css('margin-top')) + $offset.top + buttonOffset) + 'px',
                        $boxElement = $imageBlock.parent();

                    var $imageDescription = null;
                    if ($boxElement.hasClass("gallery-photo-box")) {
                        $imageDescription = $boxElement.children(".gallery-photo-box-title");
                    } else if ($boxElement.hasClass("image-box")) {
                        $imageDescription = $boxElement.children(".imageTitle");
                    }

                    var imageDescription = ($imageDescription != null && $imageDescription.length > 0) ?
                        $imageDescription.text() : "";

                    if (!$('.pinterest-btn').length) {

                        if ($imageBlock.find(".bgi_imageHold").length) {
                            var url = $imageBlock.find(".bgi_imageHold").data('url');
                            var pinUrl = '//pinterest.com/pin/create/button/?url=' + encodeURIComponent(document.location.href) + '&' +
                                'media=' + encodeURIComponent(url) + '&' + 'description=' + encodeURIComponent(imageDescription);
                        } else {
                            var pinUrl = '//pinterest.com/pin/create/button/?url=' + encodeURIComponent(document.location.href) + '&' +
                                'media=' + encodeURIComponent($imageBlock.find('img').attr('src')) + '&' + 'description=' + encodeURIComponent(imageDescription);
                        }

                        var html = '<a ' +
                            'style="top:' + top + ';left:' + left + '"' +
                            'id="pinterest-btn"' +
                            'class="pinterest-btn"' +
                            'target="_blank" rel="noopener noreferrer" ' +
                            'href="' + pinUrl + '" ' +
                            'data-pin-do="buttonPin"' +
                            'data-pin-config="beside">' +
                            '</a>';
                        $imageBlock.prepend(html);

                        $('#pinterest-btn').click(function(e) {
                            window.open(pinUrl, '', 'width=600,height=300');
                            e.stopPropagation();
                            return false;
                        })
                    }
                }
            }
        },

        renderWidgets: function() {

            var self = this;

            this.$('.post-body .widget').each(function(key, $widget) {

                var options = {};
                options.$el = $(this);
                options.type = options.$el.data('type');

                if (options.$el.data('type') == 'post-subscribe') {

                    var form = $(this).find('.element').find('.subscribe-form');

                    new ProgressButton(document.querySelectorAll('button.progress-button.subscribe-button')[0], {
                        callback: function(instance) {

                            if (form.parent().find('[name=i_agree]').length && !form.parent().find('[name=i_agree]:checked').length) {
                                $('#progressButton').removeAttr('disabled');
                                $('.subscribe-checkbox .form__field_bg').css('color', 'red');
                                $('.subscribe-checkbox .form__checkbox_text span').css('color', 'red');
                                _.delay(function() {
                                    $('.subscribe-checkbox .form__field_bg').css('color', '');
                                    $('.subscribe-checkbox .form__checkbox_text span').css('color', '');
                                }, 2000);
                                return true;
                            }

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

                var widgetNeedRender = [];
                if (self.options.mobile) {

                    widgetNeedRender = ['post-gallery', 'simple-video']
                } else {

                    widgetNeedRender = ['post-gallery', 'simple-video', 'simple-image', 'post-map', 'post-instagram', 'post-form', 'post-button'];
                }
                // Можно убрать эту проверку, тогда для остальных виджетов 
                // "фабрика" будет создаваться пустые вьюшки.
                if (!_.include(widgetNeedRender, options.type)) return this;

                var widget = WidgetFactory.create(options);

                widget.render();

                self.widgets[key] = widget
            });
        },

    })

    return Article;
})

$(document).ready(function() {
    $(document).on('click', '.blog-content .blog_grid_item a,.blog-content .paging a', function() {
        var href = $(this).attr('href');

        var header = getHeaderHeight();

        var offsetTop = ($('body').hasClass('oliver') || $('body').hasClass('polina')) ? $('.blog-content')[0].offsetTop : $('.blog-content').offset().top;
        var pageScrollTop = ($('body').hasClass('oliver')) ? $('#content').scrollTop() : $(document).scrollTop();

        var position = ($(this).parents('.paging').size()) ? offsetTop - header : pageScrollTop;

        sessionStorage.setItem('position', position);
        sessionStorage.setItem('href-from', href);

        window.onbeforeunload = function() {
            sessionStorage.setItem('href-to', location.href);
        }
        $(window).unload(function() {
            var header = getHeaderHeight();
            $(this).scrollTop($('.blog-content').offset().top - header);
        });
    });

    $(document).on('click', '.blog-content article header a,.blog-content article .post-link-more a', function() {
        var pageScrollTop = ($('body').hasClass('oliver')) ? $('#content').scrollTop() : $(document).scrollTop();
        sessionStorage.setItem('feedposition', pageScrollTop);
    });

    function getHeaderHeight() {
        var header = 0;
        if ($('header.alternate').size()) {
            header = $('header.alternate').height();
        }
        return header;
    }

    $('span.field.tt .bgi_toolTip a').on('click', function(e) {
        e.preventDefault();
        var link = $(this).attr('href');
        window.open(link, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=600');
    });
});