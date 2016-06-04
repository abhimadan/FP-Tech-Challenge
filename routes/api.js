/*
 * Serve JSON to our AngularJS client
 */
var express     = require('express');
var https       = require('https');
var q           = require('q');
var querystring = require('querystring');
var api         = express.Router();
var db          = require('../config/db').connection;

// API endpoint for /api/apparel
api.get('/api/apparel/:styleCode?', function(req, res) {
    if (req.params.styleCode) {
        db.query("SELECT * FROM main_db.apparel WHERE style_code = ?", [req.params.styleCode], function(err, rows, fields) {
            // TODO: return some JSON for the angular controller to parse and display stuff; they give colour codes so maybe use those somehow?
            res.send(rows[0]);
        });
    } else {
        db.query("SELECT * FROM main_db.apparel", function(err, rows, fields) {
            // TODO: return some JSON for the angular controller to parse and display stuff; they give colour codes so maybe use those somehow?
            res.send(rows);
        });
    }
});

// API endpoint for /api/quote
api.post('/api/quote', function(req, res) {
    // TODO: take style code, colour, size, weight, number of apparel as request data
    // fetch price
    var price = getApparelPrice(req.body.styleCode, req.body.colorCode, req.body.sizeCode)
        .then(function(value) {
            var price = value.price;
            var quantity = req.body.quantity;

            var lqShippingCost, hqShippingCost;
            if (req.body.weight <= 0.4) {
                lqShippingCost = 1.00;
                hqShippingCost = 0.75;
            } else {
                lqShippingCost = 0.50;
                hqShippingCost = 0.25;
            }
            var shippingPrice = price + (quantity < 48 ? lqShippingCost : hqShippingCost);

            var salesmanCompPrice = shippingPrice * 1.07;

            var markupPrice = salesmanCompPrice * ((salesmanCompPrice * quantity) <= 800 ? 1.5 : 1.45);

            var totalPrice = markupPrice * quantity;

            res.send({
                basePrice: price.toFixed(2),
                shippingPrice: shippingPrice.toFixed(2),
                salesmanCompPrice: salesmanCompPrice.toFixed(2),
                markupPrice: markupPrice.toFixed(2),
                totalPrice: totalPrice.toFixed(2)
            });
        });
});

// Function for making an Inventory API call
var getApparelPrice = function getPrice(style_code, color_code, size_code) {
	var	apparelPriceDeferred = q.defer();

    var url = 'https://www.alphashirt.com/cgi-bin/online/xml/inv-request.w';
    var query = {
        in1: style_code + color_code + size_code,
        pr: 'y',
        zp: '10002',
        username: 'triggered1111',
        password: 'triggered2222'
    };
    url += '?' + querystring.stringify(query);

	// Format the Inventory API endpoint as explained in the documentation
	https.get(url, function(res) {
        res.setEncoding('utf8');
		res.on('data', function (data) {
            var parsedPrice = data.match(/\sprice=\"\$\d+\.\d{2}\"/)[0];
            var price = parseFloat(parsedPrice.substring(9, parsedPrice.length-1));

            apparelPriceDeferred.resolve({price: price});
		});
	}).on('error', function(error) {
        apparelPriceDeferred.reject(error);
	});

	return apparelPriceDeferred.promise;
}

module.exports = api;
