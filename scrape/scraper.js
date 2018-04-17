var _ = require('lodash');
var cheerio = require('cheerio');
var tabletojson = require('tabletojson');
var request = require('request');
var async = require('async');
var Baby = require('babyparse');
var fs = require('fs');
var print = console.log;

var ENDPOINT = "http://www.spotrac.com/mlb/disabled-list/{year}/";
const SELECTOR = "#player-season table";

var Scraper = {};

Scraper.buildEndpoint = function(year) {
	return ENDPOINT.replace("{year}", year);
};

Scraper.parseHTML = function(html) {
	var $ = cheerio.load(html);
	var data = $(SELECTOR).html()
	fs.writeFileSync('data.html', data);
	// for some reason just grabbing the thead
	data = "<table>" + data + "</table>"
	var json = tabletojson.convert(data);
	return json[0];
};

/* take parsed table and make it more useful
  Elements look like this 
   { 'Player (528)': 'Adam Frazier                                     \t2B, PIT',
    'Pos.': '2B',
    Team: 'PIT',
    Injury: 'Hamstring',
    Status: '20170828 10-day | 8/28 - 9/810-day | 4/23 - 5/12',
    Days: '32', }

   We want name, position, days on DL, and Injury type
*/
Scraper.parseTable = function(tableFromHTML) {
	var initKeys = Object.keys(tableFromHTML[0]);
	// order of keys is name, position, team, injury, status, days, cash_earned.
	// we care about name, position,  injury, days
	var nameIx = initKeys[0];
	var posIx = initKeys[1];
	var typeIx = initKeys[3];
	var daysIx = initKeys[5];

	// but name is a stupid long thing
	var nameReg = /([^\t]*)\t/;

	return tableFromHTML.map(function(element) {
		var name = element[nameIx];
		var match = nameReg.exec(name);
		
		if (!match) return false;

		name = match[1].trim();

		print(element);

		return {
			name: name,
			pos: element[posIx],
			type: element[typeIx],
			days: element[daysIx]
		}
	}).filter(d => !!d);
};

/* 
 * Dump the data to a csv file. Ultimately what we want
 */

Scraper.writeToFile = function(json, year) {
	var csv = Baby.unparse(json);
	fs.writeFileSync(`./data/injuries_${year}.csv`, csv);
	print(`Successfully wrote ${year}'s data to disk.`);
};

Scraper.getData = function(year, cb) {
	var _endpoint = Scraper.buildEndpoint(year);
	request(_endpoint, (err, response, body) => {
		if (err) return cb(err);
		cb(null, body);
	});
};

// grab a season, write it to disk
Scraper.run = function(season, cb) {
	Scraper.getData(season, function(err, data) {
		if (err) return cb(err);
		var parsed = Scraper.parseHTML(data);
		var cleanedJson = Scraper.parseTable(parsed);
		Scraper.writeToFile(cleanedJson, season);
		print(`Finished running scraper for ${season}`);
		return cb(null, true);
	});
};


module.exports = Scraper;


Scraper.run("2015", function(err, success) {
	if (err) throw err;
	print(success);
});	