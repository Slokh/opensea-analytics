import { eachMonthOfInterval } from "date-fns";
import { TIMESTAMP_TO_BLOCKS } from "./blocks";

const GRAPH_API =
  "https://api.thegraph.com/subgraphs/id/QmXmZKF3VsLFfVxZoDNZ16tu59GwE5TA1uZVzGAPFJjf5s";

const VALID_TOKENS = [
  "0x0000000000000000000000000000000000000000",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
];

export const fetchData = async (query: string): Promise<any> => {
  const response = await fetch(GRAPH_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  });

  if (response.status !== 200) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return await fetchData(query);
  }

  const { data } = await response.json();

  return data;
};

export const fetchMonthlyAggregateData = async (): Promise<any> => {
  const months = eachMonthOfInterval({
    start: new Date(2018, 6, 12),
    end: new Date(),
  }).map((m) => m.setUTCHours(0, 0, 0, 0) / 1000);

  const data = await fetchData(`{
            ${months.map(
              (month) => `
              t_${month}: aggregateDatas(block:{number: ${
                TIMESTAMP_TO_BLOCKS[month]
              }}) {
                id
                timestamp
                paymentTokens (where: {address_in: ${JSON.stringify(
                  VALID_TOKENS
                )}}) {
                  address
                  volume
                  royalties
                  fees
                  transfers
                  newAssets
                  newAccounts
                }
              }
            `
            )}
          }`);

  return (
    months.map((month) => ({ ...data[`t_${month}`][0], timestamp: month })) ||
    []
  );
};

export const fetchDailyAggregateData = async (): Promise<any> => {
  const data = await fetchData(`{
            dailyAggregateDatas(orderBy: timestamp, orderDirection: desc, first: 60) {
              id
              timestamp
              paymentTokens (where: {address_in: ${JSON.stringify(
                VALID_TOKENS
              )}}) {
                address
                volume
                royalties
                fees
                transfers
                newAssets
                newAccounts
              }
            }
          }`);

  return data?.dailyAggregateDatas?.reverse() || [];
};

export const fetchHourlyAggregateData = async (): Promise<any> => {
  const data = await fetchData(`{
            hourlyAggregateDatas(orderBy: timestamp, orderDirection: desc, first: 60) {
              id
              timestamp
              paymentTokens (where: {address_in: ${JSON.stringify(
                VALID_TOKENS
              )}}) {
                address
                volume
                royalties
                fees
                transfers
                newAssets
                newAccounts
              }
            }
          }`);

  return data?.hourlyAggregateDatas?.reverse() || [];
};
