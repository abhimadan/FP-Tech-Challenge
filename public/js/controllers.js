'use strict';

/* Controller */
angular.module('myApp.controllers', []).
	controller('AppCtrl', function ($scope, $http) {
        $scope.computedPrice = false;
        $scope.errorStyle = "";

        $scope.quote = function(style, color, size, quantity, weight) {
            $http.post('/api/quote', {styleCode: style, colorCode: color, sizeCode: size, quantity: quantity, weight: weight}).then(function(res) {
                if (!res.data.error) {
                    $scope.computedPrice = true;
                    $scope.price = res.data;
                } else {
                    $scope.errorSyle = style;
                }
            });
        }

        $http.get('/api/apparel').then(function(res) {
            $scope.shirts = [];

            for (var shirt of res.data) {
                var colors = [];
                var sizes = [];

                for (var color of shirt.color_codes.split(';')) {
                    var parts = color.split(':');
                    colors.push({id: parts[0], rgb: parts[1], name: parts[2]});
                }

                for (var size of shirt.size_codes.split(';')) {
                    var parts = size.split(':');
                    sizes.push({id: parts[0], name: parts[1]});
                }

                $scope.shirts.push({
                    styleCode: shirt.style_code,
                    colorCodes: colors,
                    sizeCodes: sizes,
                    weight: shirt.weight
                });
            };
        });
	});
