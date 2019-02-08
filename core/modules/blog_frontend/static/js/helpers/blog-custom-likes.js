define([

    'module-blog-frontend-static/helpers/local-storage',

], function(HelperLocalStorage) {

    function CustomLikes(options) {

        var defaultOption = {
            elements: [],
            selectorSVG: '.icon-like-heart',
            blogId: 0,
        }

        if (options.elements) {

            // NodeList to Array
            this.elements = Array.prototype.slice.call(options.elements);
        } else {

            this.elements = defaultOption.elements;
        }

        this.selectorSVG = options.selectorSVG || defaultOption.selectorSVG;
        this.blogId = options.blogId || defaultOption.blogId;

        this.helperLocalStorage = new HelperLocalStorage();

        __initialization.call(this);
    }

    CustomLikes.prototype = (function() {

        return {

            render: function() {
                // @TODO-NY: jQuery to Javascript
                $(this.elements).find(this.selectorSVG).each(function() {

                    var paper = Raphael(this, 13, 12);

                    paper.path("M14,26.4L13.5,26C13,25.7,1.6,17.5,1.6,10.6c0-4.3,2.6-7.1,6.4-7.1c2,0,4.3,1,5.9,3.1c1.8-1.8,4-3,5.9-3" +
                            "c3.8,0,6.4,2.8,6.4,7.1c0,6.8-11.4,15-11.9,15.3L14,26.4z M8.1,5.4c-3.3,0-4.8,2.6-4.8,5.1c0,4.8,7.2,11.2,10.7,13.7" +
                            "c3.3-2.5,10.7-8.9,10.7-13.7c0-2.5-1.2-5.1-4.8-5.1c-1.6,0-3.3,0.8-4.9,2.5c1.2,1.8,2.1,3.6,2.1,5.4c0,1-0.3,2-1,2.8" +
                            "c-0.5,0.5-1.2,0.8-2.1,0.8s-1.6-0.3-2.1-1c-0.7-0.5-1.2-1.6-1-2.6c0-1.6,0.8-3.6,2-5.3C11.4,6.4,9.6,5.4,8.1,5.4z M14,9.6" +
                            "c-0.8,1.2-1.5,2.6-1.5,3.8c0,0.5,0.2,1,0.5,1.6c0.5,0.5,1.2,0.5,1.6,0c0.3-0.5,0.5-1,0.5-1.6C15.5,12.2,14.8,10.7,14,9.6z")
                        .attr({
                            fill: 'none',
                            'stroke-width': 1
                        })
                        .transform('T-7,-9S0.45');
                });
            },
        }

    })();

    function __initialization() {

        var self = this;

        this.elements.forEach(function(element) {

            element.addEventListener('click', function(event) {

                event.preventDefault();

                _eventLike.call(self, event);

                return false;
            });

            var postId = element.getAttribute('data-id');

            if (!self.helperLocalStorage.isAllowLike("blog-" + self.blogId + "-" + postId) || $('.like[data-state="checked"][data-id=' + postId + ']').size()) {

                $('.like[data-id=' + postId + ']').addClass('checked');
                _feedSVGLikedPath(postId);
            }
        });

    }

    function _eventLike(event) {

        var postId = event.currentTarget.getAttribute('data-id');

        if (this.helperLocalStorage.isAllowLike("blog-" + this.blogId + "-" + postId)) {

            _sendLike.call(this, this.blogId, postId);
        }
    }

    function _feedSVGLikedPath(postId) {
        $('.like[data-id=' + postId + '] svg path').attr('d', 'M14.1,26.5L13.5,26C13,25.7,1.6,17.5,1.6,10.6c0-4.3,2.6-7.1,6.4-7.1c2,0,4.3,1,5.9,3.1c1.8-1.8,4-3,5.9-3c3.8,0,6.4,2.8,6.4,7.1c0,6.8-11.4,15-11.9,15.3L14.1,26.5z');
    }

    function _sendLike(blogId, postId) {

        var self = this,
            storageName = "blog-" + blogId + "-" + postId,
            data = {
                sid: blogId,
                id: postId,
                _ajax: true
            };

        $.ajax({
            url: '/__api/blog/like',
            type: 'POST',
            dataType: 'json',
            data: data,
            success: function(json) {
                if (json.success) {
                    var span = $('.like[data-id=' + postId + ']').find('span');
                    if (span.size()) {
                        var count = parseInt(span.text()) + 1;
                        span.text(count);
                        $('.like[data-id=' + postId + ']').addClass('checked');
                        _feedSVGLikedPath(postId);
                    }
                }

                self.helperLocalStorage.setItem(storageName, new Date());
            },
            error: function(response) {
                console.log(response);
            }
        });
    }

    return CustomLikes;
});