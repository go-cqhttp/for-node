const axios = require('axios')
const iconv = require('iconv-lite')

async function getInfo(date = new Date()) {
    const {data} = await axios({
        responseType: 'arraybuffer',
        url: 'https://sp0.baidu.com/8aQDcjqpAAV3otqbppnN2DJv/api.php',
        params: {
            query: `${date.getFullYear()}年${date.getMonth() + 1}月`,
            resource_id: 39043,
            ie: 'utf8',
            oe: 'gbk',
            format: 'json',
            tn: 'wisetpl'
        },
        headers: {
            Referer: 'https://www.baidu.com/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        }
    })
    return JSON.parse(iconv.decode(data, 'gbk')).data[0].almanac[date.getDate() - 1]
}

async function getDetail() {
    const info = await getInfo()
    console.log(info)
    return info
    return [
        {
            type: 'text',
            data: {
                text: [
                    `${info.year}-${info.month + 1}-${info.day}`,
                    `${'一二三四五六七七八九'}`
                ].join('\n')
            }
        }
    ]
}

getDetail().then(console.log)