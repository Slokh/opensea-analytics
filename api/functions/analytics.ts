import { DynamoDB } from "aws-sdk";
import { eachDayOfInterval, startOfMonth, subMonths } from "date-fns";
import { formatEther } from "ethers/lib/utils";
import * as fetch from "node-fetch";
import "source-map-support";

const dynamo = new DynamoDB.DocumentClient();

enum Network {
  Ethereum = "ethereum",
  Polygon = "polygon",
}

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const ETHERSCAN_API = "https://api.etherscan.io";
const POLYGONSCAN_API = "https://api.polygonscan.com";

const ETHEREUM_GRAPH_API =
  "https://api.thegraph.com/subgraphs/name/slokh/opensea";

const POLYGON_GRAPH_API =
  "https://api.studio.thegraph.com/query/6515/opensea-polygon/v0.3.1";

const getBlockNumberForTimestamp = async (
  network: Network,
  timestamp: number
) => {
  const data = await fetch(
    `${
      network == Network.Ethereum ? ETHERSCAN_API : POLYGONSCAN_API
    }/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=${
      network == Network.Ethereum
        ? process.env.ETHERSCAN_API_KEY
        : process.env.POLYGONSCAN_API_KEY
    }`
  );
  const { result } = await data.json();
  return parseInt(result, 10);
};

const getVolumeAtBlock = async (network: Network, block?: number) => {
  const response = await fetch(
    network == Network.Ethereum ? ETHEREUM_GRAPH_API : POLYGON_GRAPH_API,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `{
        tokenAggregates(first: 1000, where: {id_in: ["${NULL_ADDRESS}", "${WETH}"]}, ${
          block ? `, block: { number: ${block} } ` : ""
        }) {
          id
          volume
          transactions
        }
      }`,
      }),
    }
  );

  if (response.status !== 200) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return getVolumeAtBlock(network, block);
  }

  const { data } = await response.json();

  return data?.tokenAggregates || [];
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

  if (!data.Item || data.Item.volume === 0 || data.Item.quantity === 0) {
    const block = await getBlockNumberForTimestamp(Network.Ethereum, timestamp);
    const tokens = await getVolumeAtBlock(Network.Ethereum, block);

    quantity = tokens.reduce((acc, { transactions }) => acc + transactions, 0);
    volume = tokens.reduce(
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
        },
      })
      .promise();
  } else {
    volume = data.Item.volume;
    quantity = data.Item.quantity;
  }

  return {
    timestamp,
    ethereum: { volume, quantity },
  };
};

export const handler = async (event) => {
  if (event?.queryStringParameters?.current) {
    const tokens = await getVolumeAtBlock(Network.Ethereum);
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        ethereum: {
          quantity: tokens.reduce(
            (acc, { transactions }) => acc + transactions,
            0
          ),
          volume: tokens.reduce(
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
