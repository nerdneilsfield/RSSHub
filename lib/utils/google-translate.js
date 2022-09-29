// const logger = require('./logger');
const got = require('./got');
const { HttpsProxyAgent } = require('hpagent');

const r = function (e, t) {
    for (var s = 0; s < t.length - 2; s += 3) {
        var r = t[s + 2];
        (r = 'a' <= r ? r.charCodeAt(0) - 87 : Number(r)), (r = '+' == t[s + 1] ? e >>> r : e << r), (e = '+' == t[s] ? (e + r) & 4294967295 : e ^ r);
    }
    return e;
};
const n = function (e) {
    for (var t = [], s = 0, n = 0; s < e.length; ++s) {
        var o = e.charCodeAt(s);
        128 > o ? (t[n++] = o) : (2048 > o ? (t[n++] = (o >> 6) | 192) : ((t[n++] = (o >> 12) | 224), (t[n++] = ((o >> 6) & 63) | 128)), (t[n++] = (63 & o) | 128));
    }
    var i = 0;
    for (n = 0; n < t.length; n++) (i += t[n]), (i = r(i, '+-a^+6'));
    return 0 > (i = r(i, '+-3^+b+-f')) && (i = 2147483648 + (2147483647 & i)), (i %= 1e6).toString() + '.' + (0 ^ i).toString();
};

const tq = function (a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = 'a' <= d ? d.charCodeAt(0) - 87 : Number(d);
        d = '+' == b.charAt(c + 1) ? a >>> d : a << d;
        a = '+' == b.charAt(c) ? (a + d) & 4294967295 : a ^ d;
    }
    return a;
};

const googleTranslate = async function (q, from, to) {
    const searchParams = new URLSearchParams([
        ['client', 'gtx'],
        ['sl', from],
        ['tl', to],
        ['q', q],
        ['tk', n(q)],
        ['dt', 't'],
        ['dt', 'bd'],
        ['dt', 'qc'],
        ['dt', 'rm'],
        ['dt', 'ex'],
        ['dt', 'at'],
        ['dt', 'ss'],
        ['dt', 'rw'],
        ['dt', 'ld'],
        ['dj', '1'],
    ]);

    const data = await got('https://translate.google.com/translate_a/single', {
        // agent: {
        //     https: new HttpsProxyAgent({
        //         keepAlive: true,
        //         keepAliveMsecs: 1000,
        //         maxSockets: 256,
        //         maxFreeSockets: 256,
        //         scheduling: 'lifo',
        //         proxy: 'http://192.168.9.63:7890',
        //     }),
        // },
        searchParams: searchParams,
        // {
        //     client: 'gtx',
        //     sl: from,
        //     tl: to,
        //     dj: '1',
        //     // ie: "UTF-8",
        //     // oe: "UTF-8",
        //     // source: "icon",
        //     dt: 't',
        //     dt: 'bd',
        //     dt: 'qc',
        //     dt: 'rm',
        //     dt: 'ex',
        //     dt: 'at',
        //     dt: 'ss',
        //     dt: 'rw',
        //     dt: 'ld',
        //     q: q,
        //     // tk: this.get_tk(q, this.tkk || (this.tkk = await this.get_tkk())),
        //     tk: n(q),
        // },
    }).json();

//     console.log(data);

    var sentences = data['sentences'];

    var sentence = ""

    var return_str =  "";

    for (var i = 0; i < sentences.length; i++) {
        sentence = sentences[i];
        // determine if the sentence has key trans
        var trans = sentence.trans;
        if (trans) {
            return_str += trans
        }
    }

//     console.log(return_str)

    return return_str;
};

module.exports = googleTranslate;
