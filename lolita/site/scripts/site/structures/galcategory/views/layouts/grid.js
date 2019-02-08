define([

    'fluid-grid'

], function(FluidGrid) {
    var MainView = Backbone.View.extend({


        initialize: function() {
            _.bindAll(this);
        },

        render: function() {

            (new FluidGrid({
                el: $(".grid")
            }))
            .render();

            // var images = $(".grid img");

            // $(images).each(function() {
            // 	var img = $(this);

            // 	var sizesJson = img.attr('data-size');
            // 	var sizes = sizesJson && sizesJson != "" ? $.parseJSON(sizesJson) : {};

            // 	var file = '1000-';
            // 	var w = img.parent().width();
            // 	var h = img.parent().height();

            // 	if (Object.getOwnPropertyNames(sizes).length !== 0) {
            // 		var firstKey = Object.keys(sizes)[0];
            // 		var sizesHasWidthAndHeight = (sizes[firstKey].h && sizes[firstKey].w) ? true : false;

            // 		for (i in sizes) {
            // 			if (sizesHasWidthAndHeight) {
            // 				if (sizes[i].w >= w && sizes[i].h >= h) {
            // 					file = i + '-';
            // 					break;
            // 				}
            // 			} else {
            // 				if (i >= w && i >= h) {
            // 					file = i + '-';
            // 					break;
            // 				}
            // 			}
            // 		}

            // 		var defaultSrc = img.attr('data-src');
            // 		var nameFile = img.attr('data-fname');
            // 		var path = defaultSrc.substring(0, defaultSrc.lastIndexOf("/")+1);

            // 		file = path + file + nameFile;
            // 		img.attr('src', file);
            // 		img.attr('data-src', file);

            // 		img.removeAttr('data-fname');
            // 		img.removeAttr('data-sizes');
            // 	}
            // });

            $('footer').css('opacity', 1);
        }
    });

    return MainView;
});