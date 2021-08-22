import { Contract, ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { createContext, useContext, useEffect, useState } from "react";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

type Asset = {
  id: string;
  volume: string;
};

type Assets = {
  [key: string]: number;
};

type State = { blockNumber: number; totalVolume: number };
type OpenSeaProviderProps = {
  provider: ethers.providers.Web3Provider;
  children: React.ReactNode;
};

const OpenSeaContext = createContext<State | undefined>(undefined);

const OpenSeaProvider = ({ provider, children }: OpenSeaProviderProps) => {
  const [blockNumber, setBlockNumber] = useState<number>(0);
  const [totalVolume, setTotalVolume] = useState<number>(0);

  const blockNumberForTimestamp = async (timestamp: number) => {
    const data = await fetch(
      `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API}`
    );
    const { result } = await data.json();
    return parseInt(result, 10);
  };

  const tokenPrices = async (
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

  const tokenDecimals = async (
    tokens: string[]
  ): Promise<{ [key: string]: number }> => {
    let decimals: { [key: string]: number } = {};
    for (let i in tokens) {
      const address = tokens[i];
      const erc20 = new Contract(
        address,
        ["function decimals() view returns (uint8)"],
        provider
      );
      decimals[address] = await erc20.decimals();
    }
    return decimals;
  };

  const volumeAtBlock = async (block?: number) => {
    const query = `{
      assets(first: 1000 ${block ? `, block: { number: ${block} } ` : ""}) {
        id
        volume
      }
    }`;

    const response = await fetch(
      "https://api.studio.thegraph.com/query/6515/opensea/v0.4.0",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    const {
      data: { assets },
    }: { data: { assets: Asset[] } } = await response.json();

    const tokens = assets
      .map(({ id }) => `0x${id}`)
      .filter((id) => id !== NULL_ADDRESS);

    const [decimals, prices] = await Promise.all([
      tokenDecimals(tokens),
      tokenPrices(tokens),
    ]);

    const volumes = assets.reduce(
      (acc: any, { id, volume }: { id: string; volume: string }) => {
        const address = id === NULL_ADDRESS.slice(2) ? WETH : `0x${id}`;

        if (!acc[address]) {
          acc[address] = 0;
        }

        acc[address] =
          acc[address] + parseFloat(formatUnits(volume, decimals[address]));

        return acc;
      },
      {}
    );

    return Object.keys(volumes).reduce((acc, key) => {
      if (prices[key]) {
        return acc + volumes[key] * prices[key];
      }

      return acc;
    }, 0);
  };

  useEffect(() => {
    const call = async () => {
      // const currentBlock = await provider.getBlockNumber();
      // setBlockNumber(currentBlock);

      // const now = new Date();
      // let startBlock = await blockNumberForTimestamp(
      //   startOfDay(now).getTime() / 1000 - now.getTimezoneOffset() * 60
      // );

      // Generate the query

      // const april1 = await blockNumberForTimestamp(1617235200);
      // const april30 = await blockNumberForTimestamp(1619827199);

      setTotalVolume(await volumeAtBlock());
    };

    call();
  }, []);

  provider.on("block", (blockNumber: number) => {
    setBlockNumber(blockNumber);
  });

  const value = { blockNumber, totalVolume };
  return (
    <OpenSeaContext.Provider value={value}>{children}</OpenSeaContext.Provider>
  );
};

const useOpenSea = () => {
  const context = useContext(OpenSeaContext);
  if (context === undefined) {
    throw new Error("useCount must be used within a CountProvider");
  }
  return context;
};

export { OpenSeaProvider, useOpenSea };
