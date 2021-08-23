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
  Token,
  tokenPrices,
} from "../utils";
import { DECIMALS, NULL_ADDRESS, WETH } from "../utils/constants";

type State = {
  ethPrice: number;
  dailyVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  previousDailyVolume: number;
  previousWeeklyVolume: number;
  previousMonthlyVolume: number;
  dailyQuantity: number;
  weeklyQuantity: number;
  monthlyQuantity: number;
  previousDailyQuantity: number;
  previousWeeklyQuantity: number;
  previousMonthlyQuantity: number;
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
  const [dailyStartTokens, setDailyStartTokens] = useState<Token[]>();
  const [weeklyStartTokens, setWeeklyStartTokens] = useState<Token[]>();
  const [monthlyStartTokens, setMonthlyStartTokens] = useState<Token[]>();
  const [previousDailyStartTokens, setPreviousDailyStartTokens] =
    useState<Token[]>();
  const [previousWeeklyStartTokens, setPreviousWeeklyStartTokens] =
    useState<Token[]>();
  const [previousMonthlyStartTokens, setPreviousMonthlyStartTokens] =
    useState<Token[]>();
  const [currentTokens, setCurrentTokens] = useState<Token[]>();

  const getUsdTokensAtTimestamp = async (timestamp: number) => {
    const block = await blockNumberForTimestamp(timestamp);
    console.log(new Date(timestamp * 1000), block);
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
        dailyStartTokens,
        weeklyStartTokens,
        monthlyStartTokens,
        previousDailyStartTokens,
        previousWeeklyStartTokens,
        previousMonthlyStartTokens,
      ] = await Promise.all([
        await getUsdTokensAtTimestamp(currentDay),
        await getUsdTokensAtTimestamp(currentWeek),
        await getUsdTokensAtTimestamp(currentMonth),
        await getUsdTokensAtTimestamp(
          subDays(currentDay * 1000, 1).getTime() / 1000
        ),
        await getUsdTokensAtTimestamp(
          subWeeks(currentWeek * 1000, 1).getTime() / 1000
        ),
        await getUsdTokensAtTimestamp(
          subMonths(currentMonth * 1000, 1).getTime() / 1000
        ),
      ]);

      setDailyStartTokens(dailyStartTokens);
      setWeeklyStartTokens(weeklyStartTokens);
      setMonthlyStartTokens(monthlyStartTokens);
      setPreviousDailyStartTokens(previousDailyStartTokens);
      setPreviousWeeklyStartTokens(previousWeeklyStartTokens);
      setPreviousMonthlyStartTokens(previousMonthlyStartTokens);
    };
    init();
  }, []);

  useEffect(() => {
    const fetchCurrentTokens = async () => {
      const currentTokens = await getVolumeAtBlock();
      const tokens = currentTokens
        .map(({ id }) => id)
        .filter((token) => token !== NULL_ADDRESS);

      setPrices(await tokenPrices(tokens));

      setCurrentTokens(currentTokens);
    };
    fetchCurrentTokens();
  }, [lastProcessedBlock]);

  useInterval(async () => {
    const block = await getLastProcessedBlock();
    if (block !== lastProcessedBlock) {
      setLastProcessedBlock(block);
    }
  }, 10000);

  const usdVolume = (tokens?: Token[]) => {
    if (!tokens) {
      return 0;
    }

    return tokens.reduce((acc, { id, volume }) => {
      const address = id === NULL_ADDRESS ? WETH : id;
      if (prices[address]) {
        return (
          acc +
          parseFloat(formatUnits(BigNumber.from(volume), DECIMALS[address])) *
            prices[address]
        );
      }

      return acc;
    }, 0);
  };

  const totalQuantity = (tokens?: Token[]) => {
    if (!tokens) {
      return 0;
    }

    return tokens.reduce((acc, { quantity }) => {
      return acc + quantity;
    }, 0);
  };

  const value = {
    ethPrice: prices[WETH],
    dailyVolume: dailyStartTokens?.length
      ? usdVolume(currentTokens) - usdVolume(dailyStartTokens)
      : 0,
    weeklyVolume: weeklyStartTokens?.length
      ? usdVolume(currentTokens) - usdVolume(weeklyStartTokens)
      : 0,
    monthlyVolume: monthlyStartTokens?.length
      ? usdVolume(currentTokens) - usdVolume(monthlyStartTokens)
      : 0,
    previousDailyVolume:
      usdVolume(dailyStartTokens) - usdVolume(previousDailyStartTokens),
    previousWeeklyVolume:
      usdVolume(weeklyStartTokens) - usdVolume(previousWeeklyStartTokens),
    previousMonthlyVolume:
      usdVolume(monthlyStartTokens) - usdVolume(previousMonthlyStartTokens),
    dailyQuantity: dailyStartTokens?.length
      ? totalQuantity(currentTokens) - totalQuantity(dailyStartTokens)
      : 0,
    weeklyQuantity: weeklyStartTokens?.length
      ? totalQuantity(currentTokens) - totalQuantity(weeklyStartTokens)
      : 0,
    monthlyQuantity: monthlyStartTokens?.length
      ? totalQuantity(currentTokens) - totalQuantity(monthlyStartTokens)
      : 0,
    previousDailyQuantity:
      totalQuantity(dailyStartTokens) - totalQuantity(previousDailyStartTokens),
    previousWeeklyQuantity:
      totalQuantity(weeklyStartTokens) -
      totalQuantity(previousWeeklyStartTokens),
    previousMonthlyQuantity:
      totalQuantity(monthlyStartTokens) -
      totalQuantity(previousMonthlyStartTokens),
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
