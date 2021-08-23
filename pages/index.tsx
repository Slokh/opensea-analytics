import {
  Flex,
  Image,
  Link,
  SimpleGrid,
  Spacer,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
//@ts-ignore
import AnimatedNumber from "react-animated-number";
import { useOpenSea } from "../context/opensea";

const VolumeItem = ({ label, value }: { label: string; value: number }) => {
  const { ethPrice } = useOpenSea();

  const format = (value: number) =>
    value
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <Flex
      direction="column"
      p={8}
      pt={6}
      pb={6}
      borderColor="#2D3841"
      borderRightWidth={1}
      borderBottomWidth={1}
      _even={{ borderRightWidth: 0 }}
    >
      <Text
        fontWeight="semibold"
        fontSize="sm"
        textTransform="uppercase"
        color="#C0C3C6"
      >
        {label}
      </Text>
      <Text fontSize="4xl">
        <AnimatedNumber
          component="text"
          // @ts-ignore
          value={value}
          style={{
            transition: "0.8s ease-out",
            transitionProperty: "background-color, color, opacity",
          }}
          duration={2000}
          formatValue={(n: number) => `$${format(n)}`}
        />
      </Text>
      <Text fontSize="sm" textTransform="uppercase" color="#C0C3C6">
        {format(value && ethPrice ? value / ethPrice : 0)} ETH
      </Text>
    </Flex>
  );
};

const Home: NextPage = () => {
  const {
    dailyVolume,
    weeklyVolume,
    monthlyVolume,
    previousDailyVolume,
    previousWeeklyVolume,
    previousMonthlyVolume,
  } = useOpenSea();

  return (
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
      <SimpleGrid columns={2}>
        <VolumeItem label="Today's volume" value={dailyVolume} />
        <VolumeItem label="Yesterday's volume" value={previousDailyVolume} />
        <VolumeItem label="This week's volume" value={weeklyVolume} />
        <VolumeItem label="Last week's volume" value={previousWeeklyVolume} />
        <VolumeItem label="This month's volume" value={monthlyVolume} />
        <VolumeItem label="Last month's volume" value={previousMonthlyVolume} />
      </SimpleGrid>
      <Spacer />
      <Stack
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
        <Text color="#C0C3C6">made by</Text>
        <Flex align="center" fontWeight="semibold">
          <Image w={4} h={4} mr={0.5} src="twitter.svg" />
          <Link href="https://twitter.com/Slokh" _hover={{ color: "#C0C3C6" }}>
            Slokh
          </Link>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default Home;
