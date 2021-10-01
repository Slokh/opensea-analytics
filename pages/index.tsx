import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/layout";
import { commify } from "@ethersproject/units";
import { format } from "date-fns";
import { NextPage } from "next";
import React from "react";
import { BarChart } from "../components/BarChart";
import { Currency, Period, useOpenSea } from "../context/opensea";

const GenericBarChart = ({ label, field }: any) => {
  const { ethereumData, currency, period } = useOpenSea();

  const current = ethereumData.length
    ? ethereumData[ethereumData.length - 1]
    : undefined;

  const previous = ethereumData.length
    ? ethereumData[ethereumData.length - 2]
    : undefined;

  const isCurrency = ["volume", "fees", "royalties"].includes(field);
  const _field =
    isCurrency && currency === Currency.USD ? `${field}USD` : field;

  return (
    <Stack p={4}>
      <Flex justify="space-between" pl={8} pr={8} align="center">
        <Heading fontSize="xl">{label}</Heading>
        <Stack direction="row" align="center">
          {current && (
            <Flex direction="column" w={40} align="flex-end">
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                color="#51606A"
              >
                {period === Period.Hourly
                  ? "This Hour"
                  : period === Period.Daily
                  ? "Today"
                  : "This Month"}
              </Text>
              <Text fontWeight="semibold">
                {`${
                  isCurrency ? (currency === Currency.USD ? "$" : "Ξ") : ""
                }${commify(
                  current[_field].toFixed(
                    Number.isInteger(current[_field]) ? 0 : 2
                  )
                )}`}
              </Text>
            </Flex>
          )}
          {previous && (
            <Flex direction="column" w={40} align="flex-end">
              <Text
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
                color="#51606A"
              >
                {period === Period.Hourly
                  ? "Last Hour"
                  : period === Period.Daily
                  ? "Yesterday"
                  : "Last Month"}
              </Text>
              <Text fontWeight="semibold">
                {`${
                  isCurrency ? (currency === Currency.USD ? "$" : "Ξ") : ""
                }${commify(
                  previous[_field].toFixed(
                    Number.isInteger(previous[_field]) ? 0 : 2
                  )
                )}`}
              </Text>
            </Flex>
          )}
        </Stack>
      </Flex>
      <BarChart
        data={ethereumData}
        dataKey={_field}
        title={label}
        xTickFormatter={(t: any) =>
          Number.isNaN(t) || t === 0 || t == "auto"
            ? ""
            : period === Period.Hourly
            ? format(new Date(t * 1000), "HH:mm")
            : format(new Date(t * 1000), "LLL do")
        }
      />
    </Stack>
  );
};

const Charts: NextPage = () => {
  const { currency, setCurrency, period, updatePeriod } = useOpenSea();

  return (
    <Stack h="100vh" w="full" spacing={0}>
      <Stack
        direction={{ base: "column", sm: "row" }}
        borderColor="#2D3841"
        borderBottomWidth={1}
        align="center"
        p={3}
        justify="space-between"
      >
        <Stack direction="row" align="center" p={3}>
          <Image h={8} w={8} src="opensea.svg" />
          <Text fontSize="xl" fontWeight="bold">
            OpenSea Analytics
          </Text>
        </Stack>
      </Stack>
      <Stack direction="row" justify="flex-end" align="center" p={4}>
        <Button
          size="sm"
          onClick={() =>
            updatePeriod(
              period === Period.Daily
                ? Period.Monthly
                : period === Period.Monthly
                ? Period.Hourly
                : Period.Daily
            )
          }
        >
          {`Period: ${period}`}
        </Button>
        <Button
          size="sm"
          onClick={() =>
            setCurrency(
              currency === Currency.Ethereum ? Currency.USD : Currency.Ethereum
            )
          }
        >
          {`Currency: ${currency}`}
        </Button>
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2 }}>
        <GenericBarChart field="volume" label="Volume" />
        <GenericBarChart field="transfers" label="Transactions" />
        <GenericBarChart field="fees" label="OpenSea Fees" />
        <GenericBarChart field="newAccounts" label="New Users" />
        <GenericBarChart field="royalties" label="Seller Fees" />
        <GenericBarChart field="newAssets" label="New Assets" />
      </SimpleGrid>
    </Stack>
  );
};

export default Charts;
