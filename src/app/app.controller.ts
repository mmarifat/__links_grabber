import { Controller, Get, Logger, Next, Query, Res } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as puppeteer from 'puppeteer';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  serverStats(@Res() response: Response) {
    response.send(
      '<div style="text-align: center">' +
        '<h1>...................Server Running...................</h1>' +
        '<hr>' +
        '<p>Navigate to url by giving parameter of <b>any website</b></p>' +
        '<p>Hint:' +
        `<a href="http://localhost:${process.env.PORT}/website?noQuery=true&q=pahe.li" target="_blank">localhost:${process.env.PORT}/website?noQuery=true&q=pahe.li</a>` +
        '</p>' +
        '</div>',
    );
  }
  @Get('ping')
  ping(): string {
    return 'PONG!';
  }
  @Get('website')
  async links(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Query('q') website: string,
    @Query('noQuery') noQuery: string,
  ) {
    const startTime = +new Date();
    const browser = await puppeteer.launch({ headless: 'new' });
    try {
      const visitedLinks = new Set<string>();
      const page = await browser.newPage();
      const grabbingLinks = async (siteLink: string) => {
        if (
          !['https://', 'http://'].some((s) => siteLink.trim().startsWith(s))
        ) {
          siteLink = `https://${siteLink.trim()}`;
        }
        if (noQuery === 'true') {
          siteLink = siteLink.split('?')[0];
          if (siteLink.includes('#')) {
            siteLink = siteLink.split('#')[0];
          }
          if (siteLink.endsWith('/')) {
            siteLink = siteLink.slice(0, -1);
          }
        }
        if (
          !visitedLinks.has(siteLink) &&
          siteLink.includes(website) &&
          !siteLink.includes('mailto:') &&
          !['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'xlxs', 'xls'].some(
            (s) => siteLink.toLowerCase().endsWith(s),
          )
        ) {
          visitedLinks.add(siteLink);
          this.logger.log(
            visitedLinks.size + ': Grabbing links from :' + siteLink,
          );

          await page.goto(siteLink, {
            waitUntil: 'networkidle0',
            timeout: 60 * 1000,
          });
          await page
            .$$eval('a', (anchors: any) =>
              [].map
                .call(anchors, (a: any) => a.href)
                .filter((f: string) => !!f),
            )
            .then(async (res) => {
              const __links = new Set(res);
              for (const subLink of __links) {
                await grabbingLinks(subLink.toString());
              }
            })
            .catch((e) => {
              this.logger.error(e, 'im error');
            });
        }
      };
      await grabbingLinks(website);

      await browser.close();

      const timeInSec = (+new Date() - startTime) / 1000;
      this.logger.log('Time Taken: (Sec): ' + timeInSec);

      res.writeHead(200, {
        'Content-Type': 'text/!*',
        'Access-Control-Allow-Origin': '*',
        'Content-Disposition': 'attachment; filename="' + website + '.csv"',
      });
      res.write(Array.from(visitedLinks).join('\n'));
      return next();
    } catch (e) {
      this.logger.error('Reason of failure', e);
    } finally {
      res.end();
    }
  }
}
