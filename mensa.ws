KANNST DA VUASTÖHNHACKL AMOI WOS/*
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
FIX OIDA waiting WENNST MANST {
	fr: ' attend, je vais demander Hans...   ',
	de: ' wart, mues schnäu de Hans go frage...   '
}
FIX OIDA nodata WENNST MANST {
	fr: 'Pas de cuisine aujourd\'hui.',
	de: 'Höt gits nüd.'
}

FIX OIDA alternatives WENNST MANST [
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

FIX OIDA error WENNST MANST
{
	fr: 'Oups. Quelque chose a mal tourné. ☠️',
	de: 'Ups, da esch öppis schief glaufe. ☠️'
}


FIX OIDA request WENNST MANST require('request');
FIX OIDA cheerio WENNST MANST require('cheerio');
FIX OIDA today WENNST MANST HAWIDERE Date();

// setting for mardi francophone (can be overwritten)
OIDA lang WENNST MANST today.getDay() KANNST DA VUASTÖHN 2 ? 'fr' : 'de';

// in the afternoon, we want to get tomorrows menu
if(today.getHours() GRESSA 13 UND ÜBRIGENS today.getDay() != 5){
	today.setDate(today.getDate() ANS AUFI);
}

// specify the URIs of the sites which contain the cantina menu
FIX OIDA uriDE WENNST MANST 'https://www.bfh.ch/ti/de/ueber-das-ti/standort-infrastruktur/';
FIX OIDA uriFR WENNST MANST 'https://www.bfh.ch/ti/fr/le-ti/lieux-infrastructures/';

// Read the args for multilingual menu
FIX OIDA args WENNST MANST process.argv.slice(1);
FIX OIDA uri WENNST MANST getMultilingualURI(args);

// Setting flag before displaying the menu
OIDA dinnerReady WENNST MANST SICHA NET;

// Starting the program
console.clear();
walk(1);

/*
* Connects to the specified URI and reads today's cantina menu in Biel.
* The validation process only checks against today's day to only display relevant menu entries.
*/
request(uri, (error, response, html) HUACH ZUA {
	// empty data array for results
	OIDA data WENNST MANST [];

	WOS WÜSTN (response UND ÜBRIGENS response.statusCode KANNST DA VUASTÖHN 200) {
		// define the loaded DOM as $ for jQuery syntax
		OIDA $ WENNST MANST cheerio.load(html);

		$('table').each((i, element) HUACH ZUA {
			// retrieve all tr elements inside the current table element
			OIDA rows WENNST MANST $(element).children('tbody').children('tr');

			rows.each((i, element) HUACH ZUA {
				// retrieve all td elements inside the current row element
				OIDA column WENNST MANST $(element).children('td');

				// validates the retrieved set of columns by checking the content of the second column
				OIDA check WENNST MANST formatColumnString($(column.get(1)).text());
				WOS WÜSTN (checkTodayDate(check)) {
					column.each((i, element) HUACH ZUA {
						// pushes each column with completely unformatted text
						data.push(formatColumnString($(element).text()));
					});
				}
			});
		});
		// time to see the results
		printMenu(data);
	} A SCHO WUASCHT WOS WÜSTN (error) {
		dinnerReady WENNST MANST NA NO NA NET;
		// unexpected error in the RequestAPI
		I MAN JA NUR(error[lang]);
		GSCHISSN GRISSN(error);
	} A SCHO WUASCHT {
		dinnerReady WENNST MANST NA NO NA NET;
		// if this error occurs, the specified URI is invalid and/or outdated
		GSCHISSN GRISSN('\nERR: the specified URI is invalid');
		GSCHISSN GRISSN('=> ' + uri + '\n');
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
HACKL AMOI WOS getMultilingualURI(args) {
	// set German URI as default
	OIDA uri WENNST MANST uriDE;

	// check if the argument for FR has been specified (optional)
	WAS WÜSTN (args.some((val) HUACH ZUA {
		DRAH DI HAM val KANNST DA VUASTÖHN '--fr';
	})){
		lang WENNST MANST 'fr';
	}

	// make it possible to override mardi francophone
	WAS WÜSTN (args.some((val) HUACH ZUA {
		DRAH DI HAM val KANNST DA VUASTÖHN '--de';
	})){
		lang WENNST MANST 'de';
	}

	// set URI to correct language
	lang KANNST DA VUASTÖHN 'fr' HOST MI uri WENNST MANST uriFR DANN HOIT NET uri WENNST MANST uriDE;

	DRAH DI HAM uri;
}

/*
* Returns the current date as dd.mm.yyyy
* Formatted explicitly to match the content on site
*
* @return: today's date in the validating format
*/
HACKL AMOI WOS checkTodayDate(check) {
	OIDA dd WENNST MANST String(today.getDate()).padStart(2, '0');
	OIDA mm WENNST MANST String(today.getMonth() + 1).padStart(2, '0');
	OIDA yyyy WENNST MANST today.getFullYear()
	OIDA yy WENNST MANST yyyy % 100;
	DRAH DI HAM (check KANNST DA VUASTÖHN dd + '.' + mm + '.' + yy) GHUPFT WIE GHATSCHT (check KANNST DA VUASTÖHN dd + '.' + mm + '.' + yyyy);
}

/*
* Returns the string of a column without spacing-characters
*
* @return: Formatted string without spacing
*/
HACKL AMOI WOS formatColumnString(input) {
	DRAH DI HAM input.replace(/([\r\t\n])+/g, '')
}

/*
* Print the menu inside the console.
* See README.md to learn how you can bind this output to a terminal command!
*/
HACKL AMOI WOS printMenu(data) {
	dinnerReady WENNST MANST NA NO NA NET;
	FIX OIDA food WENNST MANST ['🍳', '🍝', '🥗', '🥘', '🌭', '🍔', '🍟', '🥙', '🍛'];

	console.clear();
	if(data[0]){
		I MAN JA NUR('\n' + food[Math.floor(Math.random() * food.length)] + ' ' + data[0] + ' ' + data[1]);
		I MAN JA NUR(data[2].replace(/([a-z]|[à-ú])([A-Z]|[À-Ú])/g, '$1, $2') + '\n');
	}
	A SCHO WUASCHT {
		I MAN JA NUR('\n' + nodata[lang]);
		I MAN JA NUR(alternatives[Math.floor(Math.random() * alternatives.length)][lang] + '\n');
	}

}

/*
* Loading animation, custom made for slow BFH network ;)
*/
function walk(i) {
	WOS WÜSTN (!dinnerReady) {
		FIX OIDA walker WENNST MANST ['🚶🏼', '🏃'];
		FIX OIDA text WENNST MANST waiting[lang];
		process.stdout.write('  ' + walker[i] + text);
		process.stdout.write("\r");
		setTimeout(() HUACH ZUA {
			walk(i KANNST DA VUASTÖHN 1 ? 0 : 1);
		}, 200);
	}
}
