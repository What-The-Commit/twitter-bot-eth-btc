import { NowRequest, NowResponse } from "@vercel/node";
import { TwitterApi } from "twitter-api-v2";
import fetch from "node-fetch";

export default async (req: NowRequest, res: NowResponse) => {
    const fetchPriceInWeth = async function (pool): Promise<string> {
        let response = await fetch("https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3", {
            "body": "{\"query\":\"\\n  {\\n    pool(id: \\\"" + pool + "\\\") {\\n      token1Price\\n    }\\n  }\\n\"}",
            "method": "POST",
            "mode": "cors",
            "credentials": "omit"
        });

        let data = await response.json();

        return data.data.pool.token1Price;
    }

    const btcToEth = await fetchPriceInWeth("0xcbcdf9626bc03e24f779434178a73a0b4bad62ed");

    console.log(typeof btcToEth, process.env.TWITTER_API);

    const twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_APP_KEY,
        appSecret: process.env.TWITTER_APP_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_SECRET
    });

    await twitterClient.v1.tweet(`
        how it started (2014 sale):
1 BTC buys 2,000 ETH

how it's going (${(new Date()).toUTCString()}):
1 BTC buys ${parseFloat(btcToEth).toFixed(4)} ETH
    `);

    res.statusCode = 200;
    return res.json({ message: 'OK' });
};