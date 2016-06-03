/*
 * Serve JSON to our AngularJS client
 */
var express     = require('express');
var https       = require('https');
var q           = require('q');
var api         = express.Router();
var db          = require('../config/db').connection;

// API endpoint for /api/apparel
api.get('/api/apparel/:styleCode?', function(req, res) {
	// Insert Apparel API code here

    if (req.params.styleCode) {
        console.log(req.params.styleCode);
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
	// Insert Quoting API code here

    // TODO: take style code, colour, size, number of apparel as request data
    // fetch price
    // apply logic to add markup, bulk discounts, etc
    // return object containing all intermediary steps and final answer (as well as individual price and total price)
});

// Function for making an Inventory API call
var getApparelPrice = function getPrice(style_code, color_code, size_code) {
	var	apparelPriceDeferred = q.defer();

	// Format the Inventory API endpoint as explained in the documentation
	https.get('https://www.alphashirt.com/cgi-bin/online/xml/inv-request.w?in1=B11107196&pr=y&zp=20176&userName=triggered1111&password=triggered2222', function(res) {
		res.on('data', function (data) {
			// Parse response XML data here

            // TODO: parse, replace endpoint to take dynamic parameters
            apparelPriceDeferred.resolve(data);
		});
	}).on('error', function(error) {
		// Handle EDI call errors here

        // TODO: error handling
        apparelPriceDeferred.reject(error);
	});

	return apparelPriceDeferred.promise;
}

module.exports = api;
