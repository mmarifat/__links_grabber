import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { EnvConfigService } from '@shared/services/env-config.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly envConfigService: EnvConfigService) {}

  get serverStats() {
    const PORT = this.envConfigService.get('PORT');
    return (
      '<div style="text-align: center">' +
      '<h1>...................Server Running...................</h1>' +
      '<hr>' +
      '<p>Navigate to the url by giving parameter of <b>any website</b></p>' +
      '<p>Hint:' +
      `<a href="http://localhost:${PORT}/website?noQuery=true&q=pahe.li" target="_blank">localhost:${PORT}/website?noQuery=true&q=pahe.li</a>` +
      '</p>' +
      '</div>'
    );
  }

  get ping() {
    return 'PONG!';
  }
  async getLinks(website: string, noQuery: boolean) {
    const visitedLinks = new Set<string>();
    try {
      const startTime = +new Date();
      const browser = await puppeteer.launch({ headless: 'new' });

      const page = await browser.newPage();
      const grabbingLinks = async (siteLink: string) => {
        if (
          !['https://', 'http://'].some((s) => siteLink.trim().startsWith(s))
        ) {
          siteLink = `https://${siteLink.trim()}`;
        }
        if (noQuery) {
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
              this.logger.error(e);
            });
        }
      };
      await grabbingLinks(website);

      await browser.close();

      const timeInSec = (+new Date() - startTime) / 1000;
      this.logger.log('Time Taken: (Sec): ' + timeInSec);
      return visitedLinks;
    } catch (e) {
      this.logger.error('Reason of failure', e);
      return visitedLinks;
    }
  }
}
