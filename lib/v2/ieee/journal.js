const got = require('@/utils/got');
const googleTranslate = require('@/utils/google-translate');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const punumber = ctx.params.journal;
    const sortType = ctx.params.sortType ?? 'vol-only-seq';
    const host = 'https://ieeexplore.ieee.org';
    const jrnlUrl = `${host}/xpl/mostRecentIssue.jsp?punumber=${punumber}`;

    const response = await got(`${host}/rest/publication/home/metadata?pubid=${punumber}`, {
        cookieJar,
    }).json();
    const volume = response.currentIssue.volume;
    const isnumber = response.currentIssue.issueNumber;
    const jrnlName = response.displayTitle;

    const response2 = await got
        .post(`${host}/rest/search/pub/${punumber}/issue/${isnumber}/toc`, {
            cookieJar,
            json: {
                punumber,
                isnumber,
                sortType,
                rowsPerPage: '100',
            },
        })
        .json();
    let list = response2.records.map((item) => {
        const $2 = cheerio.load(item.articleTitle);
        const title = $2.text();
        const link = item.htmlLink;
        const doi = item.doi;
        let authors = 'Do not have author';
        if (item.hasOwnProperty('authors')) {
            authors = item.authors.map((itemAuth) => itemAuth.preferredName).join('; ');
        }
        let abstract = '';
        item.hasOwnProperty('abstract') ? (abstract = item.abstract) : (abstract = '');
        return {
            title,
            link,
            authors,
            doi,
            volume,
            abstract,
        };
    });

    const renderDesc = (item) =>
        art(path.join(__dirname, 'templates/description.art'), {
            item,
        });
    list = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.abstract !== '') {
                    const response3 = await got(`${host}${item.link}`);
                    const { abstract } = JSON.parse(response3.body.match(/metadata=(.*);/)[1]);
                    const $3 = cheerio.load(abstract);
                    const translate_text = await googleTranslate($3.text(), 'auto', 'zh-CN');
                    item.abstract = translate_text + '<br><br>' + $3.text();
                    // item.abstract = $3.text();
                    item.description = renderDesc(item);
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
    };
};
