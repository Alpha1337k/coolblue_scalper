import * as puppeteer from "puppeteer";

export enum ItemStaat {
	GOOD 	= "Tweedekans in nieuwstaat",
	DECENT	= "Tweedekans met lichte gebruikssporen",
	WORN	= "Tweedekans met zichtbare beschadigingen",
	OTHER	= "" 
}

export class Item {
	categorie	: string;

	naam		: string;
	itemDetails	: string[] = [];
	link		: string;
	staat		: ItemStaat;	
	
	oudePrijs	: number;
	nieuwePrijs	: number;
	prijsDiff	: number;

	constructor(item : CBItem, categorie : string) {
		this.categorie = categorie;
		this.naam = item.naam;
		this.link = "https://www.coolblue.nl/" + item.link;
		this.staat = parseState(item.staat);
		
		this.oudePrijs = parsePrice(item.oudePrijs);
		this.nieuwePrijs = parsePrice(item.nieuwePrijs);
		this.prijsDiff = Math.round((this.oudePrijs - this.nieuwePrijs) / this.oudePrijs * 100); 
		
		//this.itemDetails = item.itemDetails;
	}
}

class CBItem {
	naam		: string;
	//itemDetails	: string[] = [];
	oudePrijs	: string;
	nieuwePrijs	: string;
	link		: string;
	staat		: string;

	constructor() {}
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
	str = str.replace('.', '');
	let pricecut : string = str.match(/\d+,\d*/)[0];

	pricecut = pricecut.replace(',', '.');
	return parseFloat(pricecut);
}

async function load_file(path : string, browser : puppeteer.Browser) : Promise<CBItem[]> {
	const page = await browser.newPage();
	await page.goto(path, {waitUntil: 'load'});

	const getCBItems = await page.evaluate(() => {
		class CBItem {
			naam		: string;
			//itemDetails	: string[] = [];
			oudePrijs	: string;
			nieuwePrijs	: string;
			link		: string;
			staat		: string;

			constructor() {}
		}

		const values = document.getElementsByClassName("grid product-grid__products");
		let rval : CBItem [] = [];
		console.log("Elementzzz", );
		if (values == undefined)
			return [];
		for (let i = 1; i < values[0].children.length; i++) {
			try {
				const e = values[0].children[i];
				let newitem = new CBItem();

				newitem.naam = e.getElementsByClassName("h3 mt--4@md")[0].children[0].getAttribute('title');
				newitem.link = e.getElementsByClassName("h3 mt--4@md")[0].children[0].getAttribute('href');
				const details = e.getElementsByClassName("pt--1")[0];
				newitem.staat = details.children[0].innerHTML;
				//for (let x = 2; x < details.children.length; x += 2) {
				//	newitem.itemDetails.push(details.children[x].innerHTML);				
				//}
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
	return getCBItems;
}

async function get_categories(path:string) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto(path, {waitUntil: 'load'});

	const getcategories = await page.evaluate(() => {
		const values = document.getElementsByClassName("facet-value__radio hide js-facet-value");
		let rval : string[] = [];

		for (let i = 1; i < values.length; i++) {
			const e = values[i];
			rval.push(e.id.substring(12));
		}

		return rval;
	});

	return (getcategories);
}

let isgetting = false;

export async function getItems() {
	const browser = await puppeteer.launch();
	if (isgetting == true)
		return null;

	
	isgetting = true;
	let categories = await get_categories("https://www.coolblue.nl/tweedekans");
	let rval = [];


	console.log(categories);
	for (let i = 0; i < categories.length; i++) {
		let items : Item[] = [];

		const e = categories[i];
		for (let x = 0; ; x++)
		{
			let basic = await load_file("https://www.coolblue.nl/tweedekans/producttype:" + e + "?pagina=" + x, browser);
			
			if (basic.length == 0)
				break;
			console.log("mapped", e, x);
			for (let i = 0; i < basic.length; i++) {
				const b = basic[i];
				items.push(new Item(b, e));
			}
		}
		rval.push({categorie : e, items})
	}
	console.log("done!");
	browser.close();

	return rval;
}