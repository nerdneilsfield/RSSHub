const got = require('@/utils/got')
const googleTranslate = require("@/utils/google-translate");
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const currentUrl = `http://export.arxiv.org/api/query?${ctx.params.query}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = cheerio.load(response.data);
    const list = $('entry')
        .map( async (_, item) => {
            item = $(item);
            var title = item.find('title').text();
            var description = item.find('summary').text();
            var title_trans = await googleTranslate(title, "en", "zh-CN");
            var description_trans = await googleTranslate(description, "en", "zh-CN");
            return {
                title: title_trans + " " + title,
                link: item.find('link[type="text/html"]').attr('href'),
                pubDate: new Date(item.find('published').text()).toUTCString(),
                description: description_trans + " " + description,
            };
        })
        .get();

    ctx.state.data = {
        title: 'arXiv (' + ctx.params.query + ')',
        link: currentUrl,
        item: list,
    };
};
