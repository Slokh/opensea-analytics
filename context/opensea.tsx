import {
  addDays,
  eachDayOfInterval,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { createContext, useContext } from "react";
import { useCurrentData } from "../hooks/useCurrentData";
import { useEthereumPrices } from "../hooks/useEthereumPrices";
import { useHistoricalData } from "../hooks/useHistoricalData";

const today = new Date(new Date().setUTCHours(0, 0, 0, 0)).getTime() / 1000;
const yesterday = subDays(today * 1000, 1).getTime() / 1000;
const thisWeek =
  startOfWeek((today + new Date().getTimezoneOffset() * 60) * 1000).getTime() /
    1000 -
  new Date().getTimezoneOffset() * 60;
const lastWeek = subWeeks(thisWeek * 1000, 1).getTime() / 1000;
const thisMonth =
  startOfMonth((today + new Date().getTimezoneOffset() * 60) * 1000).getTime() /
    1000 -
  new Date().getTimezoneOffset() * 60;
const lastMonth = subMonths(thisMonth * 1000, 1).getTime() / 1000;

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
  const { prices } = useEthereumPrices();
  const { historicalData } = useHistoricalData();
  const { ethereumVolume, ethereumQuantity } = useCurrentData();

  const ethereumVolumes = historicalData.reduce(
    (acc: any, { ethereum, timestamp }: any, i: number) => {
      if (i === 0) return acc;
      return acc.concat({
        timestamp,
        volume:
          acc[i - 1].volume +
          (ethereum.volume - historicalData[i - 1].ethereum.volume) *
            prices[timestamp],
      });
    },
    [{ timestamp: historicalData[0]?.timestamp, volume: 0 }]
  );

  const currentEthereumQuantity = ethereumQuantity;
  const currentEthereumVolume =
    ethereumVolumes.length > 1
      ? ethereumVolumes[ethereumVolumes.length - 1].volume +
        (ethereumVolume -
          historicalData[historicalData.length - 1].ethereum.volume) *
          prices[today]
      : 0;

  const ethereumVolumeDifference = (start: number, end?: number) => {
    if (!historicalData.length) return 0;
    const startVolume = ethereumVolumes.find(
      ({ timestamp }: any) => timestamp === start
    ).volume;

    if (!end) {
      return currentEthereumVolume > 0
        ? currentEthereumVolume - startVolume
        : 0;
    }

    const endVolume = ethereumVolumes.find(
      ({ timestamp }: any) => timestamp === end
    ).volume;

    return endVolume - startVolume;
  };

  const ethereumQuantityDifference = (start: number, end?: number) => {
    if (!historicalData.length) return 0;
    const startQuantity = historicalData.find(
      ({ timestamp }: any) => timestamp === start
    ).ethereum.quantity;

    if (!end) {
      return currentEthereumQuantity > 0
        ? currentEthereumQuantity - startQuantity
        : 0;
    }

    const endQuantity = historicalData.find(
      ({ timestamp }: any) => timestamp === end
    ).ethereum.quantity;

    return endQuantity - startQuantity;
  };

  console.log(new Date(today * 1000));

  return (
    <OpenSeaContext.Provider
      value={{
        ethPrice: prices[today],
        dailyVolume: ethereumVolumeDifference(today),
        weeklyVolume: ethereumVolumeDifference(thisWeek),
        monthlyVolume: ethereumVolumeDifference(thisMonth),
        previousDailyVolume: ethereumVolumeDifference(yesterday, today),
        previousWeeklyVolume: ethereumVolumeDifference(lastWeek, thisWeek),
        previousMonthlyVolume: ethereumVolumeDifference(lastMonth, thisMonth),
        dailyQuantity: ethereumQuantityDifference(today),
        weeklyQuantity: ethereumQuantityDifference(thisWeek),
        monthlyQuantity: ethereumQuantityDifference(thisMonth),
        previousDailyQuantity: ethereumQuantityDifference(yesterday, today),
        previousWeeklyQuantity: ethereumQuantityDifference(lastWeek, thisWeek),
        previousMonthlyQuantity: ethereumQuantityDifference(
          lastMonth,
          thisMonth
        ),
      }}
    >
      {children}
    </OpenSeaContext.Provider>
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
