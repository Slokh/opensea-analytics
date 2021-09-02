import {
  Flex,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
//@ts-ignore
import AnimatedNumber from "react-animated-number";
import { Network, useOpenSea } from "../context/opensea";

const now = new Date().getTime() / 1000 + new Date().getTimezoneOffset() * 60;

const percentageOfDay = () =>
  (now -
    startOfDay(now * 1000).getTime() / 1000 -
    (new Date().getTimezoneOffset() * 60) / 1000) /
  ((endOfDay(now).getTime() - startOfDay(now).getTime()) / 1000);

const percentageOfWeek = () =>
  (now -
    startOfWeek(now * 1000).getTime() / 1000 -
    (new Date().getTimezoneOffset() * 60) / 1000) /
  ((endOfWeek(now).getTime() - startOfWeek(now).getTime()) / 1000);

const percentageOfMonth = () =>
  (now -
    startOfMonth(now * 1000).getTime() / 1000 -
    (new Date().getTimezoneOffset() * 60) / 1000) /
  ((endOfMonth(now).getTime() - startOfMonth(now).getTime()) / 1000);

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
  description?: React.ReactNode;
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  return (
    <Flex w={{ base: "full", md: "xs" }} p={4} direction="column">
      <Flex
        fontWeight="medium"
        fontSize="xs"
        textTransform="uppercase"
        color="#C0C3C6"
      >
        {label}
      </Flex>
      <Text fontSize="3xl" fontWeight="bold">
        <AnimatedNumber
          component="text"
          value={display}
          duration={2000}
          formatValue={valueFormatter}
        />
      </Text>
      <Flex fontSize="sm" fontWeight="semibold" color="#C0C3C6">
        {description}
      </Flex>
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
    w="full"
    direction="column"
    borderColor="#2D3841"
    borderRightWidth={{ base: 0, md: 1 }}
    borderBottomWidth={1}
    _even={{ borderRightWidth: 0 }}
  >
    <Heading fontSize="lg">{title}</Heading>
    <SimpleGrid pt={2} columns={{ base: 1, xl: 2 }}>
      {children}
    </SimpleGrid>
  </Flex>
);

const VolumeItem = ({
  label,
  value,
  projection,
}: {
  label: string;
  value: number;
  projection?: number;
}) => {
  const { latestPrice } = useOpenSea();

  return (
    <DisplayItem
      label={`${label} - ${commify(
        (value / (latestPrice || 1)).toFixed(0)
      )} ETH`}
      value={value}
      valueFormatter={(value: number) => `$${commify(value.toFixed(2))}`}
      description={projection && `$${commify(projection.toFixed(2))} projected`}
    />
  );
};

const QuantityItem = ({
  label,
  value,
  projection,
}: {
  label: string;
  value: number;
  projection?: number;
}) => {
  return (
    <DisplayItem
      label={label}
      value={value}
      valueFormatter={(value: number) => commify(value.toFixed(0))}
      description={projection && `${commify(projection.toFixed(0))} projected`}
    />
  );
};

const DailyVolume = () => {
  const { dailyVolume, previousDailyVolume } = useOpenSea();
  const [projection, setProjection] = useState(0);

  useEffect(() => {
    setProjection(dailyVolume / percentageOfDay());
  }, [dailyVolume]);

  return (
    <DisplayGroup title="Daily Volume">
      <VolumeItem label="Today" value={dailyVolume} projection={projection} />
      <VolumeItem label="Yesterday" value={previousDailyVolume} />
    </DisplayGroup>
  );
};

const WeeklyVolume = () => {
  const { weeklyVolume, previousWeeklyVolume } = useOpenSea();
  const [projection, setProjection] = useState(0);

  useEffect(() => {
    setProjection(weeklyVolume / percentageOfWeek());
  }, [weeklyVolume]);

  return (
    <DisplayGroup title="Weekly Volume">
      <VolumeItem
        label="This Week"
        value={weeklyVolume}
        projection={projection}
      />
      <VolumeItem label="Last Week" value={previousWeeklyVolume} />
    </DisplayGroup>
  );
};

const MonthlyVolume = () => {
  const { monthlyVolume, previousMonthlyVolume } = useOpenSea();
  const [projection, setProjection] = useState(0);

  useEffect(() => {
    setProjection(monthlyVolume / percentageOfMonth());
  }, [monthlyVolume]);

  return (
    <DisplayGroup title="Monthly Volume">
      <VolumeItem
        label="This Month"
        value={monthlyVolume}
        projection={projection}
      />
      <VolumeItem label="Last Month" value={previousMonthlyVolume} />
    </DisplayGroup>
  );
};

const DailyQuantity = () => {
  const { dailyQuantity, previousDailyQuantity } = useOpenSea();
  const [projection, setProjection] = useState(0);

  useEffect(() => {
    setProjection(dailyQuantity / percentageOfDay());
  }, [dailyQuantity]);

  return (
    <DisplayGroup title="Daily Quantity">
      <QuantityItem
        label="Today"
        value={dailyQuantity}
        projection={projection}
      />
      <QuantityItem label="Yesterday" value={previousDailyQuantity} />
    </DisplayGroup>
  );
};

const WeeklyQuantity = () => {
  const { weeklyQuantity, previousWeeklyQuantity } = useOpenSea();
  const [projection, setProjection] = useState(0);

  useEffect(() => {
    setProjection(weeklyQuantity / percentageOfWeek());
  }, [weeklyQuantity]);

  return (
    <DisplayGroup title="Weekly Quantity">
      <QuantityItem
        label="This Week"
        value={weeklyQuantity}
        projection={projection}
      />
      <QuantityItem label="Last Week" value={previousWeeklyQuantity} />
    </DisplayGroup>
  );
};

const MonthlyQuantity = () => {
  const { monthlyQuantity, previousMonthlyQuantity } = useOpenSea();
  const [projection, setProjection] = useState(0);

  useEffect(() => {
    setProjection(monthlyQuantity / percentageOfMonth());
  }, [monthlyQuantity]);

  return (
    <DisplayGroup title="Monthly Quantity">
      <QuantityItem
        label="This Month"
        value={monthlyQuantity}
        projection={projection}
      />
      <QuantityItem label="Last Month" value={previousMonthlyQuantity} />
    </DisplayGroup>
  );
};

const Nav = () => {
  const { network, setNetwork } = useOpenSea();

  return (
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
      <Stack direction="row" align="center" p={3} spacing={6}>
        {[Network.Ethereum, Network.Polygon].map((n) => (
          <Text
            cursor="pointer"
            color={network === n ? "white" : "#C0C3C6"}
            fontWeight={network === n ? "bold" : "regular"}
            onClick={() => setNetwork(n)}
          >{`${n.substr(0, 1).toUpperCase()}${n.substr(1)}`}</Text>
        ))}
      </Stack>
    </Stack>
  );
};

const Home: NextPage = () => (
  <Stack minH="100vh" w="full" spacing={0}>
    <Nav />
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
      justify="flex-end"
      borderColor="#2D3841"
      borderTopWidth={1}
    >
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
            Kartik
          </Link>
        </Flex>
      </Stack>
    </Flex>
  </Stack>
);

export default Home;
