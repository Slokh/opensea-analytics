import "source-map-support";
import { DynamoDB } from "aws-sdk";
import * as fetch from "node-fetch";
import { formatEther } from "ethers/lib/utils";
import { addDays, eachDayOfInterval, startOfMonth, subMonths } from "date-fns";

const dynamo = new DynamoDB.DocumentClient();

enum Network {
  Ethereum = "ethereum",
  Polygon = "polygon",
}

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const POLYGON_WETH = "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619";

const ETHERSCAN_API = "https://api.etherscan.io";
const POLYGONSCAN_API = "https://api.polygonscan.com";

const ETHEREUM_GRAPH_API =
  "https://api.studio.thegraph.com/query/6515/opensea/v0.5.2";
const POLYGON_GRAPH_API =
  "https://api.thegraph.com/subgraphs/name/slokh/opensea-polygon";

const getBlockNumberForTimestamp = async (
  network: Network,
  timestamp: number
) => {
  const data = await fetch(
    `${ETHERSCAN_API}/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=${process.env.ETHERSCAN_API_KEY}`
  );
  console.log(data);
  const { result } = await data.json();
  return parseInt(result, 10);
};

const getVolumeAtBlock = async (network: Network, block?: number) => {
  const response = await fetch(ETHEREUM_GRAPH_API, {
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
    return getVolumeAtBlock(network, block);
  }

  const { data } = await response.json();

  return data?.tokens || [];
};

const getDataForTimestamp = async (timestamp: number) => {
  const data = await dynamo
    .get({
      TableName: "opensea",
      Key: {
        timestamp,
      },
    })
    .promise();

  let volume = 0;
  let quantity = 0;
  let polygonVolume = 0;
  let polygonQuantity = 0;

  if (
    !data.Item ||
    data.Item.volume === 0 ||
    data.Item.quantity === 0 ||
    data.Item.polygonVolume === 0 ||
    data.Item.polygonQuantity === 0
  ) {
    const block = await getBlockNumberForTimestamp(Network.Ethereum, timestamp);
    const tokens = await getVolumeAtBlock(Network.Ethereum, block);

    quantity = tokens.reduce((acc, { quantity }) => acc + quantity, 0);
    volume = tokens.reduce(
      (acc, { volume }) => acc + parseFloat(formatEther(volume)),
      0
    );

    const polygonBlock = await getBlockNumberForTimestamp(
      Network.Polygon,
      timestamp
    );
    const polygonTokens = await getVolumeAtBlock(Network.Polygon, polygonBlock);

    polygonQuantity = polygonTokens.reduce(
      (acc, { quantity }) => acc + quantity,
      0
    );
    polygonVolume = polygonTokens.reduce(
      (acc, { volume }) => acc + parseFloat(formatEther(volume)),
      0
    );

    await dynamo
      .put({
        TableName: "opensea",
        Item: {
          timestamp,
          block,
          volume,
          quantity,
          polygonVolume,
          polygonQuantity,
        },
      })
      .promise();
  } else {
    volume = data.Item.volume;
    quantity = data.Item.quantity;
    polygonVolume = data.Item.polygonVolume;
    polygonQuantity = data.Item.polygonQuantity;
  }

  return {
    timestamp,
    ethereum: { volume, quantity },
    polygon: { volume: polygonVolume, quantity: polygonQuantity },
  };
};

export const handler = async (event) => {
  if (event?.queryStringParameters?.current) {
    const tokens = await getVolumeAtBlock(Network.Ethereum);
    const polygonTokens = await getVolumeAtBlock(Network.Polygon);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        ethereum: {
          quantity: tokens.reduce((acc, { quantity }) => acc + quantity, 0),
          volume: tokens.reduce(
            (acc, { volume }) => acc + parseFloat(formatEther(volume)),
            0
          ),
        },
        polygon: {
          quantity: polygonTokens.reduce(
            (acc, { quantity }) => acc + quantity,
            0
          ),
          volume: polygonTokens.reduce(
            (acc, { volume }) => acc + parseFloat(formatEther(volume)),
            0
          ),
        },
      }),
    };
  }

  const today = new Date();
  const timestamps = eachDayOfInterval({
    start: subMonths(startOfMonth(today), 1),
    end: today,
  }).map((date) => date.getTime() / 1000 - date.getTimezoneOffset() * 60);

  const data = await Promise.all(
    timestamps.map((timestamp) => getDataForTimestamp(timestamp))
  );

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      data,
    }),
  };
};
