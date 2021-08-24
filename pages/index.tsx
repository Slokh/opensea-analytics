import {
  Flex,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Skeleton,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
//@ts-ignore
import AnimatedNumber from "react-animated-number";
import { useOpenSea } from "../context/opensea";

const commify = (n: number | string) =>
  n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const DisplayItem = ({
  label,
  value,
  valueFormatter,
  description,
}: {
  label: string;
  value: number;
  valueFormatter: (n: number) => string;
  description?: string;
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return (
    <Flex w="xs" p={4} direction="column">
      <Text
        fontWeight="medium"
        fontSize="xs"
        textTransform="uppercase"
        color="#C0C3C6"
      >
        {label}
      </Text>
      <Text fontSize="3xl" fontWeight="bold">
        <AnimatedNumber
          component="text"
          value={display}
          duration={2000}
          formatValue={valueFormatter}
        />
      </Text>
      <Text
        fontSize="sm"
        fontWeight="semibold"
        textTransform="uppercase"
        color="#C0C3C6"
      >
        {description}
      </Text>
    </Flex>
  );
};

const DisplayGroup = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Flex
    p={4}
    direction="column"
    borderColor="#2D3841"
    borderRightWidth={1}
    borderBottomWidth={1}
    _even={{ borderRightWidth: 0 }}
  >
    <Heading fontSize="lg">{title}</Heading>
    <SimpleGrid pt={2} columns={{ base: 1, xl: 2 }}>
      {children}
    </SimpleGrid>
  </Flex>
);

const VolumeItem = ({ label, value }: { label: string; value: number }) => {
  const { ethPrice } = useOpenSea();

  return (
    <DisplayItem
      label={label}
      value={value}
      valueFormatter={(value: number) => `$${commify(value.toFixed(2))}`}
      description={`${commify((value / (ethPrice || 1)).toFixed(2))} ETH`}
    />
  );
};

const QuantityItem = ({ label, value }: { label: string; value: number }) => {
  return (
    <DisplayItem
      label={label}
      value={value}
      valueFormatter={(value: number) => commify(value.toFixed(0))}
      description="NFTs sold"
    />
  );
};

const DailyVolume = () => {
  const { dailyVolume, previousDailyVolume } = useOpenSea();

  return (
    <DisplayGroup title="Daily Volume">
      <VolumeItem label="Today" value={dailyVolume} />
      <VolumeItem label="Yesterday" value={previousDailyVolume} />
    </DisplayGroup>
  );
};

const WeeklyVolume = () => {
  const { weeklyVolume, previousWeeklyVolume } = useOpenSea();

  return (
    <DisplayGroup title="Weekly Volume">
      <VolumeItem label="This Week" value={weeklyVolume} />
      <VolumeItem label="Last Week" value={previousWeeklyVolume} />
    </DisplayGroup>
  );
};

const MonthlyVolume = () => {
  const { monthlyVolume, previousMonthlyVolume } = useOpenSea();

  return (
    <DisplayGroup title="Monthly Volume">
      <VolumeItem label="This Month" value={monthlyVolume} />
      <VolumeItem label="Last Month" value={previousMonthlyVolume} />
    </DisplayGroup>
  );
};

const DailyQuantity = () => {
  const { dailyQuantity, previousDailyQuantity } = useOpenSea();

  return (
    <DisplayGroup title="Daily Quantity">
      <QuantityItem label="Today" value={dailyQuantity} />
      <QuantityItem label="Yesterday" value={previousDailyQuantity} />
    </DisplayGroup>
  );
};

const WeeklyQuantity = () => {
  const { weeklyQuantity, previousWeeklyQuantity } = useOpenSea();

  return (
    <DisplayGroup title="Weekly Quantity">
      <QuantityItem label="This Week" value={weeklyQuantity} />
      <QuantityItem label="Last Week" value={previousWeeklyQuantity} />
    </DisplayGroup>
  );
};

const MonthlyQuantity = () => {
  const { monthlyQuantity, previousMonthlyQuantity } = useOpenSea();

  return (
    <DisplayGroup title="Monthly Quantity">
      <QuantityItem label="This Month" value={monthlyQuantity} />
      <QuantityItem label="Last Month" value={previousMonthlyQuantity} />
    </DisplayGroup>
  );
};

const Home: NextPage = () => (
  <Stack minH="100vh" w="full" spacing={0}>
    <Stack
      direction="row"
      borderColor="#2D3841"
      borderBottomWidth={1}
      align="center"
      p={6}
    >
      <Image h={8} w={8} src="opensea.svg" />
      <Text fontSize="xl" fontWeight="bold">
        OpenSea Analytics
      </Text>
    </Stack>
    <SimpleGrid columns={{ base: 1, md: 2 }}>
      <DailyVolume />
      <DailyQuantity />
      <WeeklyVolume />
      <WeeklyQuantity />
      <MonthlyVolume />
      <MonthlyQuantity />
    </SimpleGrid>
    <Spacer />
    <Flex
      w="full"
      p={2}
      fontSize="sm"
      fontWeight="normal"
      direction="row"
      align="center"
      spacing={1}
      justify="space-between"
      borderColor="#2D3841"
      borderTopWidth={1}
    >
      <Text>These analytics only include Ethereum.</Text>
      <Stack
        fontSize="sm"
        fontWeight="normal"
        direction="row"
        align="center"
        spacing={1}
      >
        <Text color="#C0C3C6">made by</Text>
        <Flex align="center" fontWeight="semibold">
          <Image w={4} h={4} mr={0.5} src="twitter.svg" />
          <Link href="https://twitter.com/Slokh" _hover={{ color: "#C0C3C6" }}>
            Slokh
          </Link>
        </Flex>
      </Stack>
    </Flex>
  </Stack>
);

export default Home;
