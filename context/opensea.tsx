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

const timestamps = eachDayOfInterval({
  start: addDays(lastMonth * 1000, 1),
  end: addDays(today * 1000, 1),
}).map((date) => date.getTime() / 1000 - date.getTimezoneOffset() * 60);

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
  const { historicalData } = useHistoricalData(timestamps);
  const { ethereumVolume, ethereumQuantity } = useCurrentData();

  const ethereumVolumes = historicalData.reduce(
    (acc: any, { ethereum, timestamp }: any, i: number) => {
      if (i === 0) return acc;
      return acc.concat(
        acc[i - 1] +
          (ethereum.volume - historicalData[i - 1].ethereum.volume) *
            prices[timestamp]
      );
    },
    [0]
  );

  const currentEthereumQuantity = ethereumQuantity;
  const currentEthereumVolume =
    ethereumVolumes.length > 1
      ? ethereumVolumes[ethereumVolumes.length - 1] +
        (ethereumVolume -
          historicalData[historicalData.length - 1].ethereum.volume) *
          prices[today]
      : 0;

  const ethereumVolumeDifference = (start: number, end?: number) => {
    if (!historicalData.length) return 0;
    const startIndex = timestamps.findIndex((timestamp) => timestamp === start);
    const startVolume = ethereumVolumes[startIndex];

    if (!end) {
      return currentEthereumVolume - startVolume;
    }

    const endIndex = timestamps.findIndex((timestamp) => timestamp === end);
    const endVolume = ethereumVolumes[endIndex];

    return endVolume - startVolume;
  };

  const ethereumQuantityDifference = (start: number, end?: number) => {
    if (!historicalData.length) return 0;
    const startIndex = timestamps.findIndex((timestamp) => timestamp === start);
    const startQuantity = historicalData[startIndex].ethereum.quantity;

    if (!end) {
      return currentEthereumQuantity - startQuantity;
    }

    const endIndex = timestamps.findIndex((timestamp) => timestamp === end);
    const endQuantity = historicalData[endIndex].ethereum.quantity;

    return endQuantity - startQuantity;
  };

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
