import { addDays } from "date-fns";

export const getHistoricalETHPrices = async (): Promise<{
  [key: number]: number;
}> => {
  const data = await fetch(
    "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=90&interval=daily"
  );
  const { prices } = await data.json();

  return prices.reduce(
    (acc: { [key: number]: number }, [timestamp, price]: [number, number]) => {
      acc[addDays(timestamp, 1).getTime() / 1000] = price;
      return acc;
    },
    {}
  );
};
