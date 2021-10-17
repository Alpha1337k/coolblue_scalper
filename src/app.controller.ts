import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get("items/:id")
	async getItems(@Param() params): Promise<string> {
		return await this.appService.createItemList(params.id as string);
	}

	@Get("categories")
	async getCategories(): Promise<string> {
		return await this.appService.getCategories();
	}
}
