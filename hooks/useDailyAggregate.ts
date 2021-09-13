import { useEffect, useState } from "react";

const GRAPH_API =
  "https://api.thegraph.com/subgraphs/id/QmXmZKF3VsLFfVxZoDNZ16tu59GwE5TA1uZVzGAPFJjf5s";

export const useDailyAggregate = () => {
  const [ethDailyAggregate, setEthDailyAggregate] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(GRAPH_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{
            dailyAggregateDatas(orderBy: timestamp, orderDirection: desc, first: 60) {
              id
              timestamp
              paymentTokens (where: {address_in: ["0x0000000000000000000000000000000000000000", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]}) {
                address
                volume
                royalties
                fees
                transfers
                newAssets
                newAccounts
              }
            }
          }`,
        }),
      });
      const { data } = await response.json();

      setEthDailyAggregate(data?.dailyAggregateDatas?.reverse() || []);
    };
    fetchData();
  }, []);

  return {
    ethDailyAggregate,
  };
};
