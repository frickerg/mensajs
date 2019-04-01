const request = require('request');
const cheerio = require('cheerio');
const url = 'https://www.bfh.ch/ti/de/ueber-das-ti/standort-infrastruktur/';

request(url, function (error, response, html) {
	var data = [];
	if (!error && response.statusCode == 200) {
		var $ = cheerio.load(html);
		$('table').each(function (i, element) {
			var rows = $(element).children('tbody').children('tr');
			rows.each(function (i, element) {
				var column = $(element).children('td');
				if ($(column.get(1)).text() == getTodayDate()) {
					column.each(function (i, element) {
						data.push($(element).text().replace(/([\r\t\n])+/g, ''));
					});
				}
			});
		});
	}
	printMenu(data);
});


function getTodayDate() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	return dd + '.' + mm + '.' + yyyy;
}

function printMenu(data) {
	console.log('\n');
	console.log(data[0] + ' ' + data[1]);
	console.log(data[2]);
	console.log('\n');
}
