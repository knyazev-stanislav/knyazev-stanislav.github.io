define(function() {

    var DecorationRenderer = function() {};

    DecorationRenderer.prototype = (function() {

        return {

            renderCommentIcons: function(className) {

                if (this.$('.' + className).size()) {

                    this.$('.' + className).each(function() {
                        var paper = Raphael(this, 30, 16);

                        paper.path("m14.70038,2.25124l0,0c0,-0.9672 -0.73568,-1.75124 " +
                                "-1.64325,-1.75124l-0.74698,0l0,0l-3.58548,0l-6.72263,0c-0.43581,0 " +
                                "-0.85381,0.18453 -1.16204,0.51291c-0.30814,0.32847 -0.4813,0.77383 " +
                                "-0.4813,1.23833l0,4.37808l0,0l0,2.62685l0,0c0,0.96723 0.73579,1.75123 " +
                                "1.64335,1.75123l6.72263,0l3.7881,3.4235l-0.20262,-3.4235l0.74698,0c0.90758,0 " +
                                "1.64325,-0.784 1.64325,-1.75123l0,0l0,-2.62685l0,0l0,-4.37808z")
                            .attr({
                                fill: 'none',
                                'stroke-width': 1
                            })
                            .translate(0.5, 0.5);

                        paper.path("M3.6,4L11.4,4")
                            .attr({
                                fill: 'none',
                                'stroke-width': 1
                            })
                            .translate(0.5, 0.5);

                        paper.path("M3.6,7L11.4,7")
                            .attr({
                                fill: 'none',
                                'stroke-width': 1
                            })
                            .translate(0.5, 0.5);
                    });
                }
            },

            renderShareIcons: function(className) {

                if (this.$('.' + className).size()) {

                    this.$('.' + className).each(function() {
                        var paper = Raphael(this, 11, 11);

                        paper.path("M 0 5 L 10 5 M 5 0 L 5 10")
                            .attr({
                                fill: 'none',
                                'stroke-width': 1
                            })
                            .translate(0.5, 0.5);
                    });
                }
            },

            renderLikeIcons: function(className) {



            },

            renderArrow: function(id, direction) {

                if (this.$('#' + id).size()) {

                    var paper = Raphael(id, 16, 18);
                    if (direction == 'right') {
                        var el = paper.path("M 1 1 L 8 9 L 1 17").attr({
                            fill: 'none',
                            'stroke-width': 1
                        });
                    } else {
                        var el = paper.path("M 7 1 L 1 9 L 7 17").attr({
                            fill: 'none',
                            'stroke-width': 1
                        });
                    }
                }
            }

        }
    })();

    return DecorationRenderer;
});