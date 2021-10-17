import { Injectable } from '@nestjs/common';
import * as scalper from "src/modules/scalper"
import * as fs from 'fs';

@Injectable()
export class AppService {
	products : {categorie: string, items : scalper.Item[]}[];

	constructor() {
		if (fs.existsSync("out.json"))
			this.products = JSON.parse(fs.readFileSync("out.json", 'utf-8'));
		else
			scalper.getItems().then(res => {
				this.products = res
				fs.writeFileSync("out.json", JSON.stringify(this.products));
			});
	}

	async createItemList(cat : string) {
		let rval = `<table class="sortable">
					<tr>
						<th>Naam</th>
						<th>Staat</th>
						<th>Oude Prijs</th>
						<th>Nieuwe Prijs</th>
						<th>Korting</th>
					</tr>`;

		if (this.products == undefined)
			return rval += `<h1>Indexing.. please wait</h1></table>`;
		const foundProducts = this.products.find(x => x.categorie == cat);

		if (foundProducts == undefined)
			rval += `<h3>Nothing found!</h3>`
		else
		{
			for (let i = 0; i < foundProducts.items.length; i++) {
				const e = foundProducts.items[i];
					
				rval += `
					<tr onclick="OpenInNewTab('${e.link}')" class="item">
						<td>${e.naam}</td>
						<td>${e.staat}</td>
						<td>€ ${e.oudePrijs}</td>
						<td>€ ${e.nieuwePrijs}</td>
						<td>${e.prijsDiff}%</td>
					</tr>
						`
			}
		}
		rval += '</table>'
		return rval;
	}

	async getCategories() {
		let rval : string = '';

		if (this.products == undefined)
			return rval;
		for (let i = 0; i < this.products.length; i++) {
			const e = this.products[i];
			rval += `<option value="${e.categorie}">${e.categorie}</option>`
		}
		return rval;
	}

	async getraw() {
		return JSON.stringify(this.products);
	}
}
