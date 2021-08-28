import "source-map-support";
import { DynamoDB } from "aws-sdk";
import * as fetch from "node-fetch";
import { formatEther } from "ethers/lib/utils";

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const dynamo = new DynamoDB.DocumentClient();

const GRAPHQL_ENDPOINT =
  "https://api.studio.thegraph.com/query/6515/opensea/v0.5.2";

const getBlockNumberForTimestamp = async (timestamp: number) => {
  const data = await fetch(
    `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after&apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API}`
  );
  const { result } = await data.json();
  return parseInt(result, 10);
};

const getVolumeAtBlock = async (block?: number) => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
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

export const handler = async (event) => {
  if (!event?.queryStringParameters?.timestamp) {
    const tokens = await getVolumeAtBlock();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        quantity: tokens.reduce((acc, { quantity }) => acc + quantity, 0),
        volume: tokens.reduce(
          (acc, { volume }) => acc + parseFloat(formatEther(volume)),
          0
        ),
      }),
    };
  }

  const timestamp = parseInt(event.queryStringParameters.timestamp, 10);
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

  if (
    !data.Item ||
    data.Item.volume === 0 ||
    data.Item.quantity === 0 ||
    event?.queryStringParameters?.force
  ) {
    console.log(`${timestamp} not in cache`);
    const block = await getBlockNumberForTimestamp(timestamp);
    const tokens = await getVolumeAtBlock(block);

    quantity = tokens.reduce((acc, { quantity }) => acc + quantity, 0);
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
    console.log(`${timestamp} found in cache`);
    volume = data.Item.volume;
    quantity = data.Item.quantity;
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ timestamp, volume, quantity }),
  };
};
