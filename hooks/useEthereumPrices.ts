import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import { TIMESTAMP_TO_PRICES } from "../util/blocks";

const PRICES_API =
  "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=120&interval=daily";

export const useEthereumPrices = () => {
  const [latestPrice, setLatestPrice] = useState(0);
  const [prices, setPrices] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(PRICES_API);
      const data = await response.json();
      setLatestPrice(data.prices[data.prices.length - 1][1]);
      setPrices(
        data?.prices.reduce(
          (
            acc: { [key: number]: number },
            [timestamp, price]: [number, number]
          ) => {
            acc[addDays(timestamp, 1).getTime() / 1000] = price;
            return acc;
          },
          TIMESTAMP_TO_PRICES
        )
      );
    };
    fetchData();
  }, []);

  return {
    prices,
    latestPrice,
  };
};
