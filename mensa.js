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

// define i18n strings
const waiting = {
	fr: ' attend, je vais demander Hans...   ',
	de: ' wart, mues schnäu de Hans go frage...   '
}
const nodata = {
	fr: 'Pas de cuisine aujourd\'hui.',
	de: 'Höt gits nüd.'
}

const alternatives = [
	{
		fr: 'Allez au Küban. 🥙',
		de: 'Gang halt zum Küban. 🌯'
	},
	{
		fr: 'Commandez une pizza. 🍕',
		de: 'Bstell der en Pizza. 🍕'
	},
	{
		fr: 'Va te chercher une baguette. 🥖',
		de: 'Bitz Diät schadt der eh ned. 🤭'
	}
]


const request = require('request');
const cheerio = require('cheerio');
const today = new Date();

// setting for mardi francophone (can be overwritten)
let lang = today.getDay() == 2 ? 'fr' : 'de';

// specify the URIs of the sites which contain the cantina menu
const uriDE = 'https://www.bfh.ch/ti/de/ueber-das-ti/standort-infrastruktur/';
const uriFR = 'https://www.bfh.ch/ti/fr/le-ti/lieux-infrastructures/';

// Read the args for multilingual menu
const args = process.argv.slice(1);
const uri = getMultilingualURI(args);

// Setting flag before displaying the menu
let dinnerReady = false;

// Starting the program
console.clear();
walk(1);

/*
* Connects to the specified URI and reads today's cantina menu in Biel.
* The validation process only checks against today's day to only display relevant menu entries.
*/
request(uri, (error, response, html) => {
	// empty data array for results
	var data = [];

	if (response.statusCode == 200) {
		// define the loaded DOM as $ for jQuery syntax
		var $ = cheerio.load(html);

		$('table').each((i, element) => {
			// retrieve all tr elements inside the current table element
			var rows = $(element).children('tbody').children('tr');

			rows.each((i, element) => {
				// retrieve all td elements inside the current row element
				var column = $(element).children('td');

				// validates the retrieved set of columns by checking the content of the second column
				var check = formatColumnString($(column.get(1)).text());
				if (checkTodayDate(check)) {
					column.each((i, element) => {
						// pushes each column with completely unformatted text
						data.push(formatColumnString($(element).text()));
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
	// set German URI as default
	var uri = uriDE;

	// check if the argument for FR has been specified (optional)
	if(args.some((val) => {
		return val === '--fr';
	})){
		lang = 'fr';
	}

	// make it possible to override mardi francophone
	if(args.some((val) => {
		return val === '--de';
	})){
		lang = 'de';
	}

	// set URI to correct language
	lang == 'fr' ? uri = uriFR : uri = uriDE;

	return uri;
}

/*
* Returns the current date as dd.mm.yyyy
* Formatted explicitly to match the content on site
*
* @return: today's date in the validating format
*/
function checkTodayDate(check) {
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear()
	var yy = yyyy % 100;
	return false //(check == dd + '.' + mm + '.' + yy) || (check == dd + '.' + mm + '.' + yyyy);
}

/*
* Returns the string of a column without spacing-characters
*
* @return: Formatted string without spacing
*/
function formatColumnString(input) {
	return input.replace(/([\r\t\n])+/g, '')
}

/*
* Print the menu inside the console.
* See README.md to learn how you can bind this output to a terminal command!
*/
function printMenu(data) {
	dinnerReady = true;
	const food = ['🍳', '🍝', '🥗', '🥘', '🌭', '🍔', '🍟', '🥙', '🍛'];

	console.clear();
	if(data[0]){
		console.log(food[Math.floor(Math.random() * food.length)] + ' ' + data[0] + ' ' + data[1]);
		console.log(data[2].replace(/([a-z]|[à-ú])([A-Z]|[À-Ú])/g, '$1, $2') + '\n');
	}
	else {
		console.log('\n' + nodata[lang]);
		console.log(alternatives[Math.floor(Math.random() * alternatives.length)][lang] + '\n');
	}

}

/*
* Loading animation, custom made for slow BFH network ;)
*/
function walk(i) {
	if (!dinnerReady) {
		const walker = ['🚶🏼', '🏃'];
		const text = waiting[lang];
		process.stdout.write('  ' + walker[i] + text);
		process.stdout.write("\r");
		setTimeout(() => {
			walk(i == 1 ? 0 : 1);
		}, 200);
	}
}
