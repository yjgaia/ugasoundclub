import { BigNumber } from "@ethersproject/bignumber";
import fs from "fs";
import superagent from "superagent";

const TOTAL_PAGE = 152;

(async () => {
    const results: { address: string, count: number }[] = [];
    const promises: Promise<void>[] = [];
    for (let page = 101; page <= TOTAL_PAGE; page += 1) {
        promises.push(new Promise(async (resolve) => {
            const run = async () => {
                try {
                    const result = (await superagent.get(`https://api-cypress.scope.klaytn.com/v1/tokens/0x5a293a1e234f4c26251fa0c69f33c83c38c091ff/holders?page=${page}`)).body;
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
    fs.writeFileSync("./kongz-holders3.json", JSON.stringify(results));
})();