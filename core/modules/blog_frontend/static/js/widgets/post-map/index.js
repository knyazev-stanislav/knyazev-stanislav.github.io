define([

    'backbone',
    'module-blog-frontend-static/widgets/post-map/model',
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyAlb21YToNOBTdDpv1ozMIwvPIElV3JoU0&libraries=places'

], function(Backbone, WidgetMapModel) {

    var MapView = Backbone.View.extend({

        selector: {
            options: '.widget-options'
        },

        defaultLocation: {
            latitude: 55.755826,
            longitude: 37.6173
        },

        'iconImage': "M10 0c-5.5 0-10 4.5-10 10 0 7.5 10 22 10 22s10-14.5 10-22c0-5.5-4.5-10-10-10zm0 5c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5z",

        initialize: function(options) {

            this.model = null;

            this.options = options;

            var jsonOptions = (this.options.isAside != null && this.options.isAside == true) ? this.$el.parent().find(this.selector.options).text() : this.$el.children(this.selector.options).text();

            if (_.isString(jsonOptions) && jsonOptions !== "") {

                var options = JSON.parse(jsonOptions);
                if (_.isObject(options)) {
                    this.model = new WidgetMapModel(options.options);
                }
            }

            return this;
        },

        render: function() {

            if (_.isNull(this.model)) {
                return this;
            }

            this.renderMap();
        },

        /**
         * Method of rendering map with default coordinate or current position of users
         */
        renderMap: function() {
            var self = this;

            var mapOptions = {
                zoom: this.model.get('zoomMap'),
                disableDefaultUI: true,
                styles: this.getMapStylesConfiguration(),
                scrollwheel: false,
                zoomControl: (this.model.get('activeZoomMap') === 'active' || !this.model.get('activeZoomMap')) ? true : false,
                draggable: window.widgetPostMapScroll
            };

            var mapLayout = (this.options.isAside != null && this.options.isAside == true) ? this.$el[0] : this.$el.find('.layout-map')[0];

            if (self.model.get('latitude') && self.model.get('longitude')) {
                var url = "https://www.google.com/maps/embed/v1/place?key=AIzaSyAlb21YToNOBTdDpv1ozMIwvPIElV3JoU0&q=" + self.model.get('latitude') + "," + self.model.get('longitude') + "&center=" + self.model.get('latitude') + "," + self.model.get('longitude') + "&zoom=" + this.model.get('zoomMap');
                $(mapLayout).html('<iframe style="width:100%; height:100%; border:0;" src="' + url + '">');
            } else {

                var geocoder = new google.maps.Geocoder(),
                    zoomControl;
                geocoder.geocode({
                    'address': self.model.get('locationMap')
                }, function(results, status) {
                    var location;

                    if (status === google.maps.GeocoderStatus.OK) {
                        location = results[0].geometry.location;
                        var url = "https://www.google.com/maps/embed/v1/place?key=AIzaSyAlb21YToNOBTdDpv1ozMIwvPIElV3JoU0&q=" + location.lat() + "," + location.lng() + "&center=" + location.lat() + "," + location.lng() + "&zoom=" + this.model.get('zoomMap');
                        $(mapLayout).html('<iframe style="width:100%; height:100%; border:0;" src="' + url + '">');
                    } else {

                        navigator.geolocation.getCurrentPosition(function(position) {
                            self._renderMapWithCurrentPosition(position, location, map);
                        }.bind(self), self._renderMapWithDefaultPosition.bind(self, location, map));
                    }

                }.bind(self));

            }



            return false;

            var map = new google.maps.Map(mapLayout, mapOptions);

            // If we have latitude/longitude
            if (this.model.get('latitude') && this.model.get('longitude')) {
                var location = new google.maps.LatLng(this.model.get('latitude'), this.model.get('longitude'));
                map.setCenter(location);
                this._setMarker(location, map);
            } else {
                var geocoder = new google.maps.Geocoder(),
                    zoomControl;
                geocoder.geocode({
                    'address': this.model.get('locationMap')
                }, function(results, status) {
                    var location;

                    if (status === google.maps.GeocoderStatus.OK) {
                        location = results[0].geometry.location;

                        map.setCenter(location);

                        this._setMarker(location, map);
                    } else {

                        navigator.geolocation.getCurrentPosition(function(position) {
                            this._renderMapWithCurrentPosition(position, location, map);
                        }.bind(this), this._renderMapWithDefaultPosition.bind(this, location, map));
                    }

                }.bind(this));
            }
        },

        /**
         * Method of rendering map with current position of users
         *
         * @private
         */
        _renderMapWithCurrentPosition: function(position, location, map) {

            location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            map.setCenter(location);

            this._setMarker(location, map);

        },

        _setMarker: function(location, map) {
            var marker = new google.maps.Marker({
                map: map,
                icon: {
                    url: 'data:image/svg+xml;utf-8, ' + encodeURIComponent('<svg width="22" height="34" viewBox="-1 -1 22 34" xmlns="https://www.w3.org/2000/svg"><path fill="' + this.model.get('color') + '" stroke="' + this.model.get('color') + '" stroke-width="1" d="' + this.iconImage + '" ></path></svg>')
                }
            });

            marker.setPosition(location);
        },

        /**
         * Method of rendering map with cdefault coordinate
         *
         * @private
         */
        _renderMapWithDefaultPosition: function(location, map) {

            location = new google.maps.LatLng(this.defaultLocation.latitude, this.defaultLocation.longitude);

            map.setCenter(location);

            this._setMarker(location, map);
        },

        /**
         * Method of getting styles for google maps ('light-dream', 'red-hat-antwerp', 'shades-of-grey', 'cool-grey')
         *
         * @returns {*[]}
         */
        getMapStylesConfiguration: function() {
            switch (this.model.get('mapLayout')) {
                case 'light-dream':
                    return [{
                        "featureType": "landscape",
                        "stylers": [{
                            "hue": "#FFBB00"
                        }, {
                            "saturation": 43.400000000000006
                        }, {
                            "lightness": 37.599999999999994
                        }, {
                            "gamma": 1
                        }]
                    }, {
                        "featureType": "road.highway",
                        "stylers": [{
                            "hue": "#FFC200"
                        }, {
                            "saturation": -61.8
                        }, {
                            "lightness": 45.599999999999994
                        }, {
                            "gamma": 1
                        }]
                    }, {
                        "featureType": "road.arterial",
                        "stylers": [{
                            "hue": "#FF0300"
                        }, {
                            "saturation": -100
                        }, {
                            "lightness": 51.19999999999999
                        }, {
                            "gamma": 1
                        }]
                    }, {
                        "featureType": "road.local",
                        "stylers": [{
                            "hue": "#FF0300"
                        }, {
                            "saturation": -100
                        }, {
                            "lightness": 52
                        }, {
                            "gamma": 1
                        }]
                    }, {
                        "featureType": "water",
                        "stylers": [{
                            "hue": "#0078FF"
                        }, {
                            "saturation": -13.200000000000003
                        }, {
                            "lightness": 2.4000000000000057
                        }, {
                            "gamma": 1
                        }]
                    }, {
                        "featureType": "poi",
                        "stylers": [{
                            "hue": "#00FF6A"
                        }, {
                            "saturation": -1.0989010989011234
                        }, {
                            "lightness": 11.200000000000017
                        }, {
                            "gamma": 1
                        }]
                    }];
                case 'red-hat-antwerp':
                    return [{
                        "featureType": "administrative",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "color": "#444444"
                        }]
                    }, {
                        "featureType": "landscape",
                        "elementType": "all",
                        "stylers": [{
                            "color": "#f2f2f2"
                        }]
                    }, {
                        "featureType": "poi",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "poi.business",
                        "elementType": "geometry.fill",
                        "stylers": [{
                            "visibility": "on"
                        }]
                    }, {
                        "featureType": "road",
                        "elementType": "all",
                        "stylers": [{
                            "saturation": -100
                        }, {
                            "lightness": 45
                        }]
                    }, {
                        "featureType": "road.highway",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "simplified"
                        }]
                    }, {
                        "featureType": "road.arterial",
                        "elementType": "labels.icon",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "transit",
                        "elementType": "all",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "water",
                        "elementType": "all",
                        "stylers": [{
                            "color": "#b4d4e1"
                        }, {
                            "visibility": "on"
                        }]
                    }]
                case 'shades-of-grey':
                    return [{
                        "featureType": "all",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "saturation": 36
                        }, {
                            "color": "#000000"
                        }, {
                            "lightness": 40
                        }]
                    }, {
                        "featureType": "all",
                        "elementType": "labels.text.stroke",
                        "stylers": [{
                            "visibility": "on"
                        }, {
                            "color": "#000000"
                        }, {
                            "lightness": 16
                        }]
                    }, {
                        "featureType": "all",
                        "elementType": "labels.icon",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "administrative",
                        "elementType": "geometry.fill",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 20
                        }]
                    }, {
                        "featureType": "administrative",
                        "elementType": "geometry.stroke",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 17
                        }, {
                            "weight": 1.2
                        }]
                    }, {
                        "featureType": "landscape",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 20
                        }]
                    }, {
                        "featureType": "poi",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 21
                        }]
                    }, {
                        "featureType": "road.highway",
                        "elementType": "geometry.fill",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 17
                        }]
                    }, {
                        "featureType": "road.highway",
                        "elementType": "geometry.stroke",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 29
                        }, {
                            "weight": 0.2
                        }]
                    }, {
                        "featureType": "road.arterial",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 18
                        }]
                    }, {
                        "featureType": "road.local",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 16
                        }]
                    }, {
                        "featureType": "transit",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 19
                        }]
                    }, {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{
                            "color": "#000000"
                        }, {
                            "lightness": 17
                        }]
                    }];
                case 'cool-grey':
                    return [{
                        "featureType": "landscape",
                        "elementType": "labels",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "transit",
                        "elementType": "labels",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "poi",
                        "elementType": "labels",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "water",
                        "elementType": "labels",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "featureType": "road",
                        "elementType": "labels.icon",
                        "stylers": [{
                            "visibility": "off"
                        }]
                    }, {
                        "stylers": [{
                            "hue": "#00aaff"
                        }, {
                            "saturation": -100
                        }, {
                            "gamma": 2.15
                        }, {
                            "lightness": 12
                        }]
                    }, {
                        "featureType": "road",
                        "elementType": "labels.text.fill",
                        "stylers": [{
                            "visibility": "on"
                        }, {
                            "lightness": 24
                        }]
                    }, {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [{
                            "lightness": 57
                        }]
                    }]
            }
        }

    });

    return MapView;
});
