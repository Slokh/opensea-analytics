export const blockNumberForTimestamp = async (timestamp: number) => {
  const data = await fetch(
    `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API}`
  );
  const { result } = await data.json();
  return parseInt(result, 10);
};

export const tokenPrices = async (
  tokens: string[]
): Promise<{ [key: string]: number }> => {
  const BATCH_SIZE = 50;
  let prices: { [key: string]: number } = {};
  for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
    const data = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${tokens
        .slice(i, i + BATCH_SIZE)
        .join(",")}&vs_currencies=usd`
    );

    const json = await data.json();
    Object.keys(json).forEach((key) => {
      prices[key] = parseFloat(json[key].usd);
    });
  }

  return prices;
};
