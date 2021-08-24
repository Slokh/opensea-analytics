import { NULL_ADDRESS, WETH } from "./constants";

export type Token = {
  id: string;
  volume: number;
  quantity: number;
};

const GRAPHQL_ENDPONT =
  "https://api.studio.thegraph.com/query/6515/opensea/v0.5.2";

export const getVolumeAtBlock = async (block?: number): Promise<Token[]> => {
  const response = await fetch(GRAPHQL_ENDPONT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `{
        tokens(first: 1000, where: {id_in: ["${NULL_ADDRESS}", "${WETH}"]} ${
        block ? `, block: { number: ${block} } ` : ""
      }) {
          id
          volume
          quantity
        }
      }`,
    }),
  });

  if (response.status !== 200) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getVolumeAtBlock(block);
  }

  const { data } = await response.json();

  return data?.tokens || [];
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
