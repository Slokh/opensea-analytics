export const getBlockNumberForTimestamp = async (timestamp: number) => {
  const data = await fetch(
    `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API}`
  );
  const { result } = await data.json();
  return parseInt(result, 10);
};

export const getHistoricalTokenPrice = async (
  token: string
): Promise<{ [key: number]: number }> => {
  const tokenData = await fetch(
    `https://api.coingecko.com/api/v3/coins/ethereum/contract/${token}`
  );

  const { id } = await tokenData.json();
  const tokenPrices = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=90&interval=daily`
  );
  const { prices } = await tokenPrices.json();

  return prices.reduce(
    (acc: { [key: number]: number }, [timestamp, price]: [number, number]) => {
      acc[timestamp / 1000] = price;
      return acc;
    },
    {}
  );
};
