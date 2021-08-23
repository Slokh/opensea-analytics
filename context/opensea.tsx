import { useInterval } from "@chakra-ui/react";
import {
  addMinutes,
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  subWeeks,
  subMonths,
} from "date-fns";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { createContext, useContext, useEffect, useState } from "react";
import {
  blockNumberForTimestamp,
  getLastProcessedBlock,
  getVolumeAtBlock,
  tokenPrices,
} from "../utils";
import { DECIMALS, NULL_ADDRESS, WETH } from "../utils/constants";

type Volume = {
  [key: string]: BigNumber;
};

type State = {
  ethPrice: number;
  dailyVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  previousDailyVolume: number;
  previousWeeklyVolume: number;
  previousMonthlyVolume: number;
};

type OpenSeaProviderProps = {
  children: React.ReactNode;
};

const OpenSeaContext = createContext<State | undefined>(undefined);

const OpenSeaProvider = ({ children }: OpenSeaProviderProps) => {
  const [lastProcessedBlock, setLastProcessedBlock] = useState(0);
  const [prices, setPrices] = useState<{
    [key: string]: number;
  }>({});
  const [dailyStartVolume, setDailyStartVolume] = useState<Volume>();
  const [weeklyStartVolume, setWeeklyStartVolume] = useState<Volume>();
  const [monthlyStartVolume, setMonthlyStartVolume] = useState<Volume>();
  const [previousDailyStartVolume, setPreviousDailyStartVolume] =
    useState<Volume>();
  const [previousWeeklyStartVolume, setPreviousWeeklyStartVolume] =
    useState<Volume>();
  const [previousMonthlyStartVolume, setPreviousMonthlyStartVolume] =
    useState<Volume>();
  const [currentVolume, setCurrentVolume] = useState<Volume>();

  const getUsdVolumeAtTimestamp = async (timestamp: number) => {
    const block = await blockNumberForTimestamp(timestamp);
    return await getVolumeAtBlock(block);
  };

  const toUTC = (date: Date) =>
    date.getTime() / 1000 - date.getTimezoneOffset() * 60;

  useEffect(() => {
    const init = async () => {
      const now = new Date();
      const currentDay = toUTC(
        startOfDay(addMinutes(now, now.getTimezoneOffset()))
      );
      const currentWeek = toUTC(
        startOfWeek(addMinutes(now, now.getTimezoneOffset()))
      );
      const currentMonth = toUTC(
        startOfMonth(addMinutes(now, now.getTimezoneOffset()))
      );

      const [
        dailyStartVolume,
        weeklyStartVolume,
        monthlyStartVolume,
        previousDailyStartVolume,
        previousWeeklyStartVolume,
        previousMonthlyStartVolume,
      ] = await Promise.all([
        await getUsdVolumeAtTimestamp(currentDay),
        await getUsdVolumeAtTimestamp(currentWeek),
        await getUsdVolumeAtTimestamp(currentMonth),
        await getUsdVolumeAtTimestamp(toUTC(subDays(currentDay, 1))),
        await getUsdVolumeAtTimestamp(toUTC(subWeeks(currentWeek, 1))),
        await getUsdVolumeAtTimestamp(toUTC(subMonths(currentMonth, 1))),
      ]);

      setDailyStartVolume(dailyStartVolume);
      setWeeklyStartVolume(weeklyStartVolume);
      setMonthlyStartVolume(monthlyStartVolume);
      setPreviousDailyStartVolume(previousDailyStartVolume);
      setPreviousWeeklyStartVolume(previousWeeklyStartVolume);
      setPreviousMonthlyStartVolume(previousMonthlyStartVolume);
    };
    init();
  }, []);

  useEffect(() => {
    const fetchCurrentVolume = async () => {
      const currentVolume = await getVolumeAtBlock();
      const tokens = Object.keys(currentVolume).filter(
        (token) => token !== NULL_ADDRESS
      );

      setPrices(await tokenPrices(tokens));

      setCurrentVolume(currentVolume);
    };
    fetchCurrentVolume();
  }, [lastProcessedBlock]);

  useInterval(async () => {
    const block = await getLastProcessedBlock();
    if (block !== lastProcessedBlock) {
      setLastProcessedBlock(block);
    }
  }, 10000);

  const usdVolume = (volume?: Volume) => {
    if (!volume) {
      return 0;
    }

    return Object.keys(volume).reduce((acc, key) => {
      if (prices[key]) {
        return (
          acc +
          parseFloat(formatUnits(volume[key], DECIMALS[key])) * prices[key]
        );
      }

      return acc;
    }, 0);
  };

  const value = {
    ethPrice: prices[WETH],
    dailyVolume: usdVolume(currentVolume) - usdVolume(dailyStartVolume),
    weeklyVolume: usdVolume(currentVolume) - usdVolume(weeklyStartVolume),
    monthlyVolume: usdVolume(currentVolume) - usdVolume(monthlyStartVolume),
    previousDailyVolume:
      usdVolume(dailyStartVolume) - usdVolume(previousDailyStartVolume),
    previousWeeklyVolume:
      usdVolume(weeklyStartVolume) - usdVolume(previousWeeklyStartVolume),
    previousMonthlyVolume:
      usdVolume(monthlyStartVolume) - usdVolume(previousMonthlyStartVolume),
  };

  return (
    <OpenSeaContext.Provider value={value}>{children}</OpenSeaContext.Provider>
  );
};

const useOpenSea = () => {
  const context = useContext(OpenSeaContext);
  if (context === undefined) {
    throw new Error("useCount must be used within a CountProvider");
  }
  return context;
};

export { OpenSeaProvider, useOpenSea };
