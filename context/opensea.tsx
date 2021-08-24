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
import { createContext, useContext, useEffect, useState } from "react";
import { getHistoricalETHPrices, toUTC } from "../utils";

const ANALYTICS_ENDPOINT =
  "https://pw1494iz47.execute-api.us-east-1.amazonaws.com/dev/analytics";

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
  const [volumes, setVolumes] = useState<any>({});
  const [quantities, setQuantities] = useState<any>({});
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [currentVolume, setCurrentVolume] = useState<number>(0);
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [analytics, setAnalytics] = useState<any>([]);

  const now = new Date();
  const today = toUTC(startOfDay(now));
  const yesterday = toUTC(startOfDay(subDays(now, 1)));
  const thisWeek = toUTC(startOfWeek(now));
  const lastWeek = toUTC(startOfWeek(subWeeks(thisWeek * 1000, 1)));
  const thisMonth = toUTC(startOfMonth(now));
  const lastMonth = toUTC(startOfMonth(subMonths(now, 1)));

  const getVolumeAtTimestamp = async (timestamp?: number) => {
    return await (
      await fetch(`${ANALYTICS_ENDPOINT}?timestamp=${timestamp || ""}`)
    ).json();
  };

  useEffect(() => {
    const init = async () => {
      const price = await getHistoricalETHPrices();
      setEthPrice(price[today]);

      const timestamps = eachDayOfInterval({
        start: lastMonth * 1000,
        end: now,
      })
        .map((t) => toUTC(t))
        .slice(1);

      const analyticsList: {
        timestamp: number;
        volume: number;
        quantity: number;
      }[] = await Promise.all(
        timestamps.map(
          async (timestamp) => await getVolumeAtTimestamp(timestamp)
        )
      );

      const volumes = [
        analyticsList[0].volume * price[analyticsList[0].timestamp],
      ];
      for (let i = 1; i < analyticsList.length; i++) {
        volumes.push(
          volumes[i - 1] +
            (analyticsList[i].volume - analyticsList[i - 1].volume) *
              price[analyticsList[i].timestamp]
        );
      }

      setVolumes(
        volumes.reduce((acc: { [key: string]: number }, volume, i) => {
          acc[analyticsList[i].timestamp] = volume;
          return acc;
        }, {})
      );
      setAnalytics(analyticsList);

      setQuantities(
        analyticsList.reduce(
          (acc: { [key: string]: number }, { timestamp, quantity }) => {
            acc[timestamp] = quantity;
            return acc;
          },
          {}
        )
      );

      const { volume, quantity } = await getVolumeAtTimestamp();
      setCurrentVolume(
        volumes[volumes.length - 1] +
          (volume - analyticsList[analyticsList.length - 1].volume) *
            price[today]
      );
      setCurrentQuantity(quantity);
    };
    init();
  }, []);

  useInterval(async () => {
    const { volume, quantity } = await getVolumeAtTimestamp();
    const last = analytics[analytics.length - 1];
    setCurrentVolume(
      volumes[last.timestamp] + (volume - last.volume) * ethPrice
    );
    setCurrentQuantity(quantity);
  }, 10000);

  const volumeDifference = (start: number, end: number) => {
    if (!start || !end) {
      return 0;
    }

    const startVolume = volumes[start] ?? currentVolume;
    const endVolume = volumes[end] ?? currentVolume;
    return endVolume - startVolume;
  };

  const quantityDifference = (start: number, end: number) => {
    if (!start || !end) {
      return 0;
    }

    const startQuantity = quantities[start] ?? currentQuantity;
    const endQuantity = quantities[end] ?? currentQuantity;
    return endQuantity - startQuantity;
  };

  const value = {
    ethPrice,
    dailyVolume: volumeDifference(today, currentVolume),
    weeklyVolume: volumeDifference(thisWeek, currentVolume),
    monthlyVolume: volumeDifference(thisMonth, currentVolume),
    previousDailyVolume: volumeDifference(yesterday, today),
    previousWeeklyVolume: volumeDifference(lastWeek, thisWeek),
    previousMonthlyVolume: volumeDifference(lastMonth, thisMonth),
    dailyQuantity: quantityDifference(today, currentQuantity),
    weeklyQuantity: quantityDifference(thisWeek, currentQuantity),
    monthlyQuantity: quantityDifference(thisMonth, currentQuantity),
    previousDailyQuantity: quantityDifference(yesterday, today),
    previousWeeklyQuantity: quantityDifference(lastWeek, thisWeek),
    previousMonthlyQuantity: quantityDifference(lastMonth, thisMonth),
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
