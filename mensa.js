/*
+-----------------------------------+
|              mensa.js             |
+-----------------------------------+
|      Daily Cantina Webcrawler     |
|        By Guillaume Fricker       |
+-----------------------------------+
|     The world is my playground    |
+-----------------------------------+
| Follow me on GitHub:  | @frickerg |
+-----------------------+-----------+
*/

const request = require('request');
const cheerio = require('cheerio');

// specify the URIs of the sites which contain the cantina menu
const uriDE = 'https://www.bfh.ch/ti/de/ueber-das-ti/standort-infrastruktur/';
const uriFR = 'https://www.bfh.ch/ti/fr/le-ti/lieux-infrastructures/';

// Read the flags for multilingual menu
const args = process.argv.slice(1);
const uri = getMultilingualURI(args);

/*
 * Connects to the specified URI and reads today's cantina menu in Biel.
 * The validation process only checks against today's day to only display relevant menu entries.
 */
request(uri, function (error, response, html) {
	// empty data array for results
	var data = [];

	if (response.statusCode == 200) {
		// define the loaded DOM as $ for jQuery syntax
		var $ = cheerio.load(html);

		$('table').each(function (i, element) {
			// retrieve all tr elements inside the current table element
			var rows = $(element).children('tbody').children('tr');

			rows.each(function (i, element) {
				// retrieve all td elements inside the current row element
				var column = $(element).children('td');

				// validates the retrieved set of columns by checking the content of the second column
				if ($(column.get(1)).text() == getTodayDate()) {
					column.each(function (i, element) {
						// pushes each column with completely unformatted text
						data.push($(element).text().replace(/([\r\t\n])+/g, ''));
					});
				}
			});
		});
		// time to see the results
		printMenu(data);
	} else if (error) {
		// unexpected error in the RequestAPI
		console.error(error);
	} else {
		// if this error occurs, the specified URI is invalid and/or outdated
		console.error('\nERR: the specified URI is invalid');
		console.error('=> ' + uri + '\n');
	}
});

/*
 * Returns the BFH URI according to the specified language flag.

 * Running your command with --de will return the German URI.
 * Running your command with --fr will return the French URI.
 * If no language is specified, the function will return the German URI by default.
 *
 * @return: The script URI in German or French
 */
function getMultilingualURI(args) {
	var uri = uriDE;

	let flagDE = args.some(function (val) {
		return val === '--de';
	});
	let flagFR = args.some(function (val) {
		return val === '--fr';
	});

	flagDE ? uri = uriDE : uri = uriFR;
	flagFR ? uri = uriFR : uri = uriDE;

	return uri;
}

/*
 * Returns the current date as dd.mm.yyyy
 * Formatted explicitly to match the content on site
 *
 * @return: today's date in the validating format
 */
function getTodayDate() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear();
	return dd + '.' + mm + '.' + yyyy;
}

/*
 * Print the menu inside the console.
 * See README.md to learn how you can bind this output to a terminal command!
 */
function printMenu(data) {
	console.log('\n');
	console.log(data[0] + ' ' + data[1]);
	console.log(data[2]);
	console.log('\n');
}
