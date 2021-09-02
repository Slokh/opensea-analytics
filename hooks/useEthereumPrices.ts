import { addDays } from "date-fns";
import { useEffect, useState } from "react";
import { TODAY, YESTERDAY } from "../utils/dates";

const PRICES_API =
  "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=90&interval=daily";

export const useEthereumPrices = () => {
  const [prices, setPrices] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(PRICES_API);
      const data = await response.json();
      setPrices(
        data?.prices.reduce(
          (
            acc: { [key: number]: number },
            [timestamp, price]: [number, number]
          ) => {
            acc[addDays(timestamp, 1).getTime() / 1000] = price;
            return acc;
          },
          {}
        )
      );
    };
    fetchData();
  }, []);

  return {
    prices,
    latestPrice: prices[TODAY],
  };
};
