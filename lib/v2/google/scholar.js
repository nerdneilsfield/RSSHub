const got = require('@/utils/got');
const cheerio = require('cheerio');
const googleTranslate = require('@/utils/google-translate');

module.exports = async (ctx) => {
    let params = ctx.params.query;
    let query = params;
    let description = `Google Scholar Monitor Query: ${query}`;

    if (params.indexOf('as_q=', 0) !== -1) {
        const reg = /as_q=(.*?)&/g;
        query = reg.exec(params)[1];
        description = `Google Scholar Monitor Advanced Query: ${query}`;
    } else {
        params = 'q=' + params;
    }

    const url = `https://scholar.google.com/scholar?${params}`;

    const response = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(response.data);
    const list = $('#gs_res_ccl_mid .gs_r.gs_or.gs_scl .gs_ri').get();

    const out = list.map(async (item) => {
        const $ = cheerio.load(item);
        const itemUrl = $('h3 a').attr('href');
        const titleStr = $('h3 a').text();
        const titleTranslatedStr = await googleTranslate(titleStr, 'auto', 'zh-CN');
        const descStr = $('.gs_rs').text();
        const descTransStr = await googleTranslate(descStr, 'auto', 'zh-CN');
        return {
            title: titleTranslatedStr + ' ' + titleStr,
            author: $('.gs_a').text(),
            description: descTransStr + ' ' + descStr,
            link: itemUrl,
            guid: itemUrl,
        };
    });

    ctx.state.data = {
        title: `Google Scholar Monitor: ${query}`,
        link: url,
        description,
        item: out,
    };
};
