import { Controller, Get, Next, Query, Res } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import { AppService } from '@app/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  serverStats(@Res() response: Response) {
    response.send(this.appService.serverStats);
  }

  @Get('ping')
  ping(): string {
    return this.appService.ping;
  }

  @Get('website')
  async links(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Query('q') website: string,
    @Query('noQuery') noQuery: string,
  ) {
    const links = await this.appService.getLinks(website, noQuery === 'true');
    if (links.size) {
      res.writeHead(200, {
        'Content-Type': 'text/!*',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename="' + website + '.csv"',
      });
      res.write(Array.from(links).join('\n'));
      return next();
    } else {
      res.json({ data: [], message: 'No links or failure' });
    }
  }
}
