define([

    'app',
    'spinners',
    'views/copy-protector',
    'views/menu',
    'views/header'

], function(app, Spinners, CopyProtector, Menu, Header) {

    app.start();

    new Menu({
        el: $('header nav.menu')
    });


    if ($('.page').is('.desktop')) {
        new Header({
            el: $('header.default')
        });
    }

    if ($('body').hasClass('protect-images')) {

        (new CopyProtector({
            el: $('body'),
            text: $('.photographer-copyright').text()
        }))
        .render();
    }
});