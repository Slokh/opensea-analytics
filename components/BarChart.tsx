import { Box, Flex, Stack, Text } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/react";
import { commify } from "@ethersproject/units";
import { format } from "date-fns";
import React from "react";
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ dataKey, title, payload, tooltipFormatter }: any) => {
  if (!payload?.length) {
    return <></>;
  }

  const data = payload[0].payload;

  return (
    <Stack bgColor="#1E2D37" w={48} p={2} borderRadius={8} fontSize="sm">
      <Flex justify="space-between">
        <Text fontWeight="bold">Date</Text>
        <Text>{tooltipFormatter(data.timestamp)}</Text>
      </Flex>
      <Flex justify="space-between">
        <Text fontWeight="bold">{title}</Text>
        <Text>{`${dataKey.includes("USD") ? "$" : ""}${commify(
          data[dataKey].toFixed(2)
        )}`}</Text>
      </Flex>
    </Stack>
  );
};

export const BarChart = ({
  title,
  loading,
  data,
  dataKey,
  xTickFormatter,
  tooltipFormatter,
}: any) => (
  <Box w="full" h="xs" bgColor="#091822" borderRadius={8} pt={4} pb={4}>
    {loading ? (
      <Flex w="full" h="full" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Flex>
    ) : (
      <ResponsiveContainer>
        <RechartsBarChart
          data={data}
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
            tickFormatter={xTickFormatter}
            ticks={
              data?.length
                ? [
                    data[Math.floor(data?.length / 6)].timestamp,
                    data[Math.floor((2 * data?.length) / 6)].timestamp,
                    data[Math.floor((3 * data?.length) / 6)].timestamp,
                    data[Math.floor((4 * data?.length) / 6)].timestamp,
                    data[Math.floor((5 * data?.length) / 6)].timestamp,
                  ]
                : undefined
            }
          />
          <YAxis
            tick={{ fontSize: 14 }}
            tickCount={5}
            tickFormatter={(t) => {
              let value = t;
              if (t > 1000000000) {
                value = `${(t / 1000000000).toFixed(1)}B`;
              } else if (t > 1000000) {
                value = `${(t / 1000000).toFixed(1)}M`;
              } else if (t > 1000) {
                value = `${(t / 1000).toFixed(1)}K`;
              }
              return `${dataKey.includes("USD") ? "$" : ""}${value}`;
            }}
          />
          <Tooltip
            cursor={{ fill: "#1E2D37" }}
            content={
              <CustomTooltip
                payload={undefined}
                dataKey={dataKey}
                title={title}
                tooltipFormatter={tooltipFormatter}
              />
            }
          />
          <CartesianGrid stroke="#1E2D37" strokeDasharray="3 3" />
          <Bar dataKey={dataKey} fill="#1867B6" />
        </RechartsBarChart>
      </ResponsiveContainer>
    )}
  </Box>
);
