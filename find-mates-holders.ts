import { BigNumber } from "@ethersproject/bignumber";
import fs from "fs";
import superagent from "superagent";

const TOTAL_PAGE = 80;

(async () => {
    const results: { address: string, count: number }[] = [];
    const promises: Promise<void>[] = [];
    for (let page = 1; page <= TOTAL_PAGE; page += 1) {
        promises.push(new Promise(async (resolve) => {
            const run = async () => {
                try {
                    const result = (await superagent.get(`https://api-cypress.scope.klaytn.com/v1/tokens/0xe47e90c58f8336a2f24bcd9bcb530e2e02e1e8ae/holders?page=${page}`)).body;
                    for (const data of result.result) {
                        results.push({ address: data.address, count: BigNumber.from(data.tokenCount).toNumber() });
                    }
                } catch (error) {
                    console.log(error, "Retry...");
                    await run();
                }
            };
            await run();
            resolve();
        }));
    }
    await Promise.all(promises);
    results.sort((a, b) => b.count - a.count);
    fs.writeFileSync("./mate-holders.json", JSON.stringify(results));
})();