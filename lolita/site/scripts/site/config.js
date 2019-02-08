requirejs.config({
    waitSeconds: 180,
    deps: [
        'main',
        window.cdn_paths.modules + 'blog_frontend/static/js/vendor/requirejs-config.js',
    ],
    paths: {
        'vendor': '../vendor',
        'backbone': '../vendor/backbone-min',
        'raphael': '../vendor/raphael-min',
        'underscore': '../vendor/underscore-min',
        'spinners': '../vendor/spinners.min',
        'jquery': '../vendor/noconflict',
        'jquery.defaultvalue': '../vendor/jquery.defaultvalue',
        'jqueryui': '../vendor/jquery-ui-1.10.2.custom.min',
        'lenta': '../vendor/lenta/lenta.min',
        'cycled-lenta': '../vendor/lenta/cycled-lenta.min',
        'one-height-grid': '../vendor/one-height-grid.min',
        'fsbox': '../vendor/fsbox',
        'mousewheel': '../vendor/jquery.mousewheel',
        'fluid-grid': '../vendor/fluid-grid',
        'static-grid': '../vendor/static-grid',
        'loading-queue': '../vendor/jquery.loading-queue.min',
        //'touch' : '../vendor/jquery.touch',
        'jstween': '../vendor/jstween-1.1.min',
        'waypoints': '../vendor/waypoints.min',
        'touch-swipe': '../vendor/jquery.touchSwipe.min'
    },
    shim: {
        'underscore': {
            exports: '_'
        },
        'spinners': {
            deps: ['jquery'],
            exports: 'Spinners'
        },
        'backbone': {
            deps: ['underscore'],
            exports: 'Backbone'
        },
        'jqueryui': {
            deps: ['jquery'],
            exports: '$'
        },
        'jquery.defaultvalue': {
            deps: ['jquery']
        },
        'fsbox': {
            deps: ['jquery', 'raphael']
        },
        'mousewheel': {
            deps: ['jquery']
        },
        'loading-queue': {
            deps: ['jquery']
        }
        // 'touch': {
        //      exports: '$'
        // }
    }
});
if (typeof jQuery === 'function') {
    //jQuery already loaded, just use that
    define('jquery', function() {
        return jQuery;
    });
}
if (typeof Raphael === 'function') {
    //Raphael already loaded, just use that
    define('raphael', function() {
        return Raphael;
    });
}