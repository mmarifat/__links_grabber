/*
Author mma.rifat66@gmail.com <mmarifat>
Email: mma.rifat66@gmail.com
Created on : Wednesday 23 Feb, 2023 14:20:45 GMT
*/

import { Controller, Get, Next, QueryParams, Req, Res } from "@tsed/common";
import * as puppeteer from 'puppeteer'
import { capitalizeFistString } from '../Helpers/Helper';

@Controller('/')
export class scrapWebsite {
    @Get('')
    async running(@Res() res: Res, @Req() req: Req, @Next() next: Next) {
        res.send(
            '<div style="text-align: center">' +
            '<h1>...................Server Running...................</h1>' +
            '<hr>' +
            '<p>Navigate to url by giving parameter of <b>any website</b></p>' +
            '<p>Hint:' +
            '<a href="localhost:8080/pahe.li" target="_blank">localhost:8080/pahe.li</a>' +
            '</p>' +
            '</div>'
        )
    }

    @Get('/website')
    async links(@Res() res: Res, @Req() req: Req, @Next() next: Next, @QueryParams('q') website: string, @QueryParams('noQuery') noQuery: string) {
        let startTime = +new Date()
        const browser = await puppeteer.launch({ headless: false })
        try {
            const visitedLinks = new Set<string>();
            const page = await browser.newPage()
            const grabbingLinks = async (siteLink: string) => {
                if (!['https://', 'http://'].some(s => siteLink.trim().startsWith(s))) {
                    siteLink = `https://${siteLink.trim()}`
                }
                if (noQuery === 'true') {
                    siteLink = siteLink.split('?')[0]
                    if (siteLink.includes('#')) {
                        siteLink = siteLink.split('#')[0]
                    }
                    if (siteLink.endsWith('/')) {
                        siteLink = siteLink.slice(0, -1);
                    }
                }
                if (!visitedLinks.has(siteLink) && siteLink.includes(website) && !siteLink.includes('mailto:') && !['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'xlxs', 'xls'].some(s => siteLink.toLowerCase().endsWith(s))) {
                    visitedLinks.add(siteLink)
                    console.log(visitedLinks.size, 'Grabbing links from :', siteLink);

                    await page.goto(siteLink, {
                        waitUntil: "networkidle0",
                        timeout: 60 * 1000
                    })
                    await page.$$eval('a', (anchors: any) => [].map.call(anchors, (a: any) => a.href).filter((f: string) => !!f)).then(async res => {
                        const __links = new Set(res);
                        for (const subLink of __links) {
                            await grabbingLinks(subLink.toString());
                        }
                    }).catch(e => {
                        console.log(e, 'im error');
                    });
                }
            }
            await grabbingLinks(website);

            await browser.close();

            const timeInSec = ((+new Date()) - startTime) / 1000
            console.log('Time Taken: (Sec)' + timeInSec);

            res.writeHead(200, {
                'Content-Type': 'text/!*',
                'Access-Control-Allow-Origin': '*',
                'Content-Disposition': 'attachment; filename="' + capitalizeFistString(website) + '.csv"'
            });
            res.write(Array.from(visitedLinks).join("\n"))
            return next()
        } catch (e) {
            console.log('Reason of failure', e);
        } finally {
            res.end()
        }
    }
}
