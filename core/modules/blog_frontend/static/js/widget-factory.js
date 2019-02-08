define([

    'module-blog-frontend-static/widgets/post-gallery/index',
    'module-blog-frontend-static/widgets/simple-video/index',
    'module-blog-frontend-static/widgets/simple-image/index',
    'module-blog-frontend-static/widgets/post-map/index',
    'module-blog-frontend-static/widgets/post-instagram/index',
    'module-blog-frontend-static/blank-view',
    'module-blog-frontend-static/widgets/post-form/index',
    'module-blog-frontend-static/widgets/post-button/index'

], function(PostGallery, SimpleVideo, SimpleImage, PostMap, PostInstagram, BlankView, PostForm, PostButton) {

    function WidgetFactory() {};

    WidgetFactory.prototype.create = function(options) {

        var widgetType = null;

        switch (options.type) {

            case 'post-gallery':
                widgetType = PostGallery;
                break;

            case 'simple-video':
                widgetType = SimpleVideo;
                break;

            case 'simple-image':

                widgetType = SimpleImage;
                break;

            case 'post-map':

                widgetType = PostMap;
                break;

            case 'post-instagram':

                widgetType = PostInstagram;
                break;

            case 'post-form':

                widgetType = PostForm;
                break;

            case 'post-button':

                widgetType = PostButton;
                break;

            case 'post-link-more':
            case 'post-break-line':
            case 'simple-text':
                widgetType = BlankView;
                break;
        }

        if (widgetType === null) {
            return false;
        }

        var widget = new widgetType({
            el: options.$el,
        });

        return widget;
    };

    return new WidgetFactory();

});