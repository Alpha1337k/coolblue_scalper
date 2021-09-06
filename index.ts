import * as puppeteer from "puppeteer";

export enum ItemStaat {
	GOOD 	= "Tweedekans in nieuwstaat",
	DECENT	= "Tweedekans met lichte gebruikssporen",
	WORN	= "Tweedekans met zichtbare beschadigingen",
	OTHER	= "" 
}

export class CBItem {
	naam		: string;
	itemDetails	: string[] = [];
	oudePrijs	: string;
	nieuwePrijs	: string;
	link		: string;
	staat		: string;

	constructor() {}
}

export class Item {
	naam		: string;
	itemDetails	: string[] = [];
	link		: string;
	staat		: ItemStaat;	
	
	oudePrijs	: number;
	nieuwePrijs	: number;
	prijsDiff	: number;

	constructor(item : CBItem) {
		this.naam = item.naam;
		this.itemDetails = item.itemDetails;
		this.link = item.link;
		this.staat = parseState(item.staat);

		this.oudePrijs = parsePrice(item.oudePrijs);
		this.nieuwePrijs = parsePrice(item.nieuwePrijs);
		this.prijsDiff = (this.oudePrijs - this.nieuwePrijs) / this.oudePrijs; 

	}
}

function parseState(state:string) {
	switch (state) {
		case ItemStaat.GOOD:
			return ItemStaat.GOOD;
		case ItemStaat.DECENT:
			return ItemStaat.DECENT;
		case ItemStaat.WORN:
			return ItemStaat.WORN;
		default:
			return ItemStaat.OTHER;
	}
}

function parsePrice(str : string) {
	let pricecut : string = str.match(/\d+,\d*/)[0];

	pricecut = pricecut.replace(',', '.');

	return parseFloat(pricecut);
}

async function load_file(path : string) : Promise<CBItem[]> {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(path, {waitUntil: 'load'});

	const dimensions = await page.evaluate(() => {
		class CBItem {
			naam		: string;
			itemDetails	: string[] = [];
			oudePrijs	: string;
			nieuwePrijs	: string;
			link		: string;
			staat		: string;

			constructor() {}
		}

		const values = document.getElementsByClassName("grid product-grid__products");
		let rval : CBItem [] = [];
		console.log("Elementzzz", );
		for (let i = 0; i < values[0].children.length; i++) {
			try {
				const e = values[0].children[i];
				let newitem = new CBItem();

				newitem.naam = e.getElementsByClassName("h3 mt--4@md")[0].children[0].getAttribute('title');
				newitem.link = e.getElementsByClassName("h3 mt--4@md")[0].children[0].getAttribute('href');
				const details = e.getElementsByClassName("pt--1")[0];
				newitem.staat = details.children[0].innerHTML;
				for (let x = 2; x < details.children.length; x += 2) {
					newitem.itemDetails.push(details.children[x].innerHTML);				
				}
				newitem.oudePrijs = e.getElementsByClassName("sales-price__former-price")[0].innerHTML;
				newitem.nieuwePrijs = e.getElementsByClassName("sales-price__current")[0].innerHTML;
				rval.push(newitem);
				}
			catch (err)
			{
				console.error("ERRRIRIRIRIIR", err);
			}
		}
		return rval;
	  });
	browser.close();
	return dimensions;
}

async function main() {
	let basic_items = await load_file("file:///home/alpha/Desktop/coolblue_scalper/tmp_input/page.html");
	let items : Item[] = [];

	for (let i = 0; i < basic_items.length; i++) {
		const e = basic_items[i];
		items.push(new Item(e));
	}


	console.log(items);

	return "";
}

main();