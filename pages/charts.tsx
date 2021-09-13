import { Image } from "@chakra-ui/image";
import { Box, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/layout";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther } from "@ethersproject/units";
import { format } from "date-fns";
import { NextPage } from "next";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDailyAggregate } from "../hooks/useDailyAggregate";

const CustomTooltip = ({ payload }) => {
  if (!payload?.length) {
    return <></>;
  }

  const { timestamp, volume } = payload[0].payload;

  return (
    <Stack bgColor="#1E2D37" w={48} p={2} borderRadius={8}>
      <Flex justify="space-between">
        <Text>Date</Text>
        <Text>{format(timestamp * 1000, "LLL d, YYY")}</Text>
      </Flex>
      <Flex justify="space-between">
        <Text>Volume</Text>
        <Text>{`${volume.toFixed(2)} ETH`}</Text>
      </Flex>
    </Stack>
  );
};

const Charts: NextPage = () => {
  const [volume, setVolume] = useState([]);
  const { ethDailyAggregate } = useDailyAggregate();

  useEffect(() => {
    if (ethDailyAggregate?.length) {
      const volume = ethDailyAggregate.map(
        ({ timestamp, paymentTokens }: any) => ({
          timestamp,
          volume: parseFloat(
            formatEther(
              paymentTokens.reduce(
                (acc: any, { volume }: any) => acc.add(volume),
                BigNumber.from(0)
              )
            )
          ),
        })
      );
      setVolume(volume);
    }
  }, [ethDailyAggregate]);

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
      <SimpleGrid columns={{ base: 1, md: 2 }}>
        <Box w="full" h={80} p={2}>
          <Heading fontSize="lg" pb={6}>
            Daily Volume
          </Heading>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={volume}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 14 }}
                tickFormatter={(t) =>
                  t > 0 ? format(new Date(t * 1000), "LLL d, YYY") : ""
                }
              />
              <YAxis tick={{ fontSize: 14 }} />
              <Tooltip
                cursor={{ fill: "#1E2D37" }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="volume" fill="#1867B6" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </SimpleGrid>
    </Stack>
  );
};

export default Charts;
