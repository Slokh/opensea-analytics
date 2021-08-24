import { useInterval } from "@chakra-ui/react";
import {
  eachDayOfInterval,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import startOfDay from "date-fns/startOfDay";
import { formatEther } from "ethers/lib/utils";
import { createContext, useContext, useEffect, useState } from "react";
import {
  getBlockNumberForTimestamp,
  getHistoricalTokenPrice,
  getLastProcessedBlock,
  getVolumeAtBlock,
} from "../utils";
import { TIMESTAMP_TO_BLOCK, WETH } from "../utils/constants";

type State = {
  ethPrice: number;
  isLoading: boolean;
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
  const [volumes, setVolumes] = useState<any>({});
  const [quantities, setQuantities] = useState<any>({});
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);

  const toUTC = (date: Date) =>
    date.getTime() / 1000 - date.getTimezoneOffset() * 60;

  const now = new Date();
  const today = toUTC(startOfDay(now));
  const yesterday = toUTC(startOfDay(subDays(today * 1000, 1)));
  const thisWeek = toUTC(startOfWeek(now));
  const lastWeek = toUTC(startOfWeek(subWeeks(thisWeek * 1000, 1)));
  const thisMonth = toUTC(startOfMonth(now));
  const lastMonth = toUTC(startOfMonth(subMonths(now, 1)));

  useEffect(() => {
    const init = async () => {
      const timestamps = eachDayOfInterval({
        start: lastMonth * 1000,
        end: now,
      }).map((t) => toUTC(t));

      const price = await getHistoricalTokenPrice(WETH);
      setEthPrice(price[today]);

      const dailyTokenList = await Promise.all(
        timestamps.map(async (timestamp) => {
          let block = TIMESTAMP_TO_BLOCK[timestamp];
          if (!block) {
            block = await getBlockNumberForTimestamp(timestamp);
          }

          return await getVolumeAtBlock(block);
        })
      );

      setQuantities(
        dailyTokenList.reduce((acc: { [key: number]: number }, tokens, i) => {
          acc[timestamps[i]] = tokens.reduce(
            (acc, { quantity }) => acc + quantity,
            0
          );
          return acc;
        }, {})
      );

      setVolumes(
        dailyTokenList.reduce((acc: { [key: number]: number }, tokens, i) => {
          acc[timestamps[i]] = tokens.reduce(
            (acc, { volume }) =>
              acc + parseFloat(formatEther(volume)) * price[timestamps[i]],
            0
          );
          return acc;
        }, {})
      );

      const tokens = await getVolumeAtBlock();
      setCurrentQuantity(
        tokens.reduce((acc, { quantity }) => acc + quantity, 0)
      );
      setCurrentVolume(
        tokens.reduce(
          (acc, { volume }) => acc + parseFloat(formatEther(volume)) * ethPrice,
          0
        )
      );
    };
    init();
  }, []);

  useEffect(() => {
    const fetchCurrent = async () => {
      const tokens = await getVolumeAtBlock();
      setCurrentQuantity(
        tokens.reduce((acc, { quantity }) => acc + quantity, 0)
      );
      setCurrentVolume(
        tokens.reduce(
          (acc, { volume }) => acc + parseFloat(formatEther(volume)) * ethPrice,
          0
        )
      );
    };
    fetchCurrent();
  }, [lastProcessedBlock]);

  useInterval(async () => {
    const block = await getLastProcessedBlock();
    if (block !== lastProcessedBlock) {
      setLastProcessedBlock(block);
    }
  }, 10000);

  const value = {
    ethPrice,
    isLoading: !currentVolume || !currentQuantity,
    dailyVolume: volumes[today] ? currentVolume - volumes[today] : 0,
    weeklyVolume: volumes[thisWeek] ? currentVolume - volumes[thisWeek] : 0,
    monthlyVolume: volumes[thisMonth] ? currentVolume - volumes[thisMonth] : 0,
    previousDailyVolume: volumes[today]
      ? volumes[today] - volumes[yesterday]
      : 0,
    previousWeeklyVolume: volumes[thisWeek]
      ? volumes[thisWeek] - volumes[lastWeek]
      : 0,
    previousMonthlyVolume: volumes[thisMonth]
      ? volumes[thisMonth] - volumes[lastMonth]
      : 0,
    dailyQuantity: quantities[today] ? currentQuantity - quantities[today] : 0,
    weeklyQuantity: quantities[thisWeek]
      ? currentQuantity - quantities[thisWeek]
      : 0,
    monthlyQuantity: quantities[thisMonth]
      ? currentQuantity - quantities[thisMonth]
      : 0,
    previousDailyQuantity: quantities[today]
      ? quantities[today] - quantities[yesterday]
      : 0,
    previousWeeklyQuantity: quantities[thisWeek]
      ? quantities[thisWeek] - quantities[lastWeek]
      : 0,
    previousMonthlyQuantity: quantities[thisMonth]
      ? quantities[thisMonth] - quantities[lastMonth]
      : 0,
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
