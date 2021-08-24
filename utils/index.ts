export const getHistoricalETHPrices = async (): Promise<{
  [key: number]: number;
}> => {
  const data = await fetch(
    "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=90&interval=daily"
  );
  const { prices } = await data.json();

  return prices.reduce(
    (acc: { [key: number]: number }, [timestamp, price]: [number, number]) => {
      acc[timestamp / 1000] = price;
      return acc;
    },
    {}
  );
};

export const toUTC = (date: Date) =>
  date.getTime() / 1000 - date.getTimezoneOffset() * 60;

export const fromUTC = (date: Date) =>
  date.getTime() / 1000 + date.getTimezoneOffset() * 60;
