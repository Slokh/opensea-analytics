import { BigNumber } from "ethers";
import { NULL_ADDRESS, WETH } from "./constants";

type Asset = {
  id: string;
  volume: BigNumber;
};

const GRAPHQL_ENDPONT = "https://api.thegraph.com/subgraphs/name/slokh/opensea";

export const getVolumeAtBlock = async (block?: number) => {
  const response = await fetch(GRAPHQL_ENDPONT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        assets(first: 1000 ${block ? `, block: { number: ${block} } ` : ""}) {
          id
          volume
        }
      }`,
    }),
  });

  const {
    data: { assets },
  }: { data: { assets: Asset[] } } = await response.json();

  return assets.reduce(
    (acc: any, { id, volume }: { id: string; volume: BigNumber }) => {
      const address = id === NULL_ADDRESS.slice(2) ? WETH : `0x${id}`;

      if (!acc[address]) {
        acc[address] = BigNumber.from(0);
      }

      acc[address] = acc[address].add(volume);
      return acc;
    },
    {}
  );
};

export const getLastProcessedBlock = async () => {
  const response = await fetch(GRAPHQL_ENDPONT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
          _meta {
            block {
              number
            }
          }
        }`,
    }),
  });

  const {
    data: {
      _meta: {
        block: { number },
      },
    },
  } = await response.json();

  return number;
};
