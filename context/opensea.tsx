import { formatEther } from "@ethersproject/units";
import { createContext, useContext, useEffect, useState } from "react";
import { useEthereumPrices } from "../hooks/useEthereumPrices";
import {
  fetchDailyAggregateData,
  fetchHourlyAggregateData,
  fetchMonthlyAggregateData,
} from "../util/graph";

export enum Currency {
  Ethereum = "ETH",
  USD = "USD",
}

export enum Period {
  Monthly = "Monthly",
  Daily = "Daily",
  Hourly = "Hourly",
}

type State = {
  ethereumData: any;
  currency: any;
  setCurrency: any;
  period: any;
  updatePeriod: any;
};

type OpenSeaProviderProps = {
  children: React.ReactNode;
};

const OpenSeaContext = createContext<State | undefined>(undefined);

const OpenSeaProvider = ({ children }: OpenSeaProviderProps) => {
  const [ethereumData, setEthereumData] = useState<any>([]);
  const { prices, latestPrice } = useEthereumPrices();
  const [currency, setCurrency] = useState<Currency>(Currency.Ethereum);
  const [period, setPeriod] = useState<Period>(Period.Daily);

  useEffect(() => {
    if (prices) {
      updatePeriod(Period.Monthly);
    }
  }, [prices]);

  const updatePeriod = async (newPeriod: Period) => {
    setPeriod(newPeriod);
    if (newPeriod === Period.Hourly) {
      const hourlyAggregateData = await fetchHourlyAggregateData();
      setEthereumData(
        hourlyAggregateData.map(({ timestamp, paymentTokens }: any) => {
          const periodData = paymentTokens.reduce(
            (
              acc: any,
              {
                volume,
                fees,
                royalties,
                transfers,
                newAccounts,
                newAssets,
              }: any
            ) => {
              acc.volume += parseFloat(formatEther(volume));
              acc.fees += parseFloat(formatEther(fees));
              acc.royalties += parseFloat(formatEther(royalties));
              acc.transfers += transfers;
              acc.newAccounts += newAccounts;
              acc.newAssets += newAssets;
              return acc;
            },
            {
              volume: 0,
              fees: 0,
              royalties: 0,
              transfers: 0,
              newAccounts: 0,
              newAssets: 0,
            }
          );

          return {
            timestamp,
            volumeUSD: latestPrice ? periodData.volume * latestPrice : 0,
            feesUSD: latestPrice ? periodData.fees * latestPrice : 0,
            royaltiesUSD: latestPrice ? periodData.royalties * latestPrice : 0,
            ...periodData,
          };
        })
      );
    } else if (newPeriod === Period.Monthly) {
      const monthlyAggregateData = await fetchMonthlyAggregateData();
      setEthereumData(
        monthlyAggregateData.reduce(
          (arr: any[], { timestamp, paymentTokens }: any, i: number) => {
            const periodData = paymentTokens.reduce(
              (
                acc: any,
                {
                  volume,
                  fees,
                  royalties,
                  transfers,
                  newAccounts,
                  newAssets,
                }: any
              ) => {
                acc.volume += parseFloat(formatEther(volume));
                acc.fees += parseFloat(formatEther(fees));
                acc.royalties += parseFloat(formatEther(royalties));
                acc.transfers += transfers;
                acc.newAccounts += newAccounts;
                acc.newAssets += newAssets;
                return acc;
              },
              {
                volume: 0,
                fees: 0,
                royalties: 0,
                transfers: 0,
                newAccounts: 0,
                newAssets: 0,
              }
            );

            if (i === 0) {
              arr.push({
                timestamp,
                volumeUSD: prices[timestamp]
                  ? periodData.volume * prices[timestamp]
                  : 0,
                feesUSD: prices[timestamp]
                  ? periodData.fees * prices[timestamp]
                  : 0,
                royaltiesUSD: prices[timestamp]
                  ? periodData.royalties * prices[timestamp]
                  : 0,
                ...periodData,
              });
            } else {
              console.log(arr[i - 1]);
              arr.push({
                timestamp,
                volumeUSD: prices[timestamp]
                  ? periodData.volume * prices[timestamp] - arr[i - 1].volumeUSD
                  : 0,
                feesUSD: prices[timestamp]
                  ? periodData.fees * prices[timestamp] - arr[i - 1].feesUSD
                  : 0,
                royaltiesUSD: prices[timestamp]
                  ? periodData.royalties * prices[timestamp] -
                    arr[i - 1].royaltiesUSD
                  : 0,
                volume: periodData.volume - arr[i - 1].volume,
                fees: periodData.fees - arr[i - 1].fees,
                royalties: periodData.royalties - arr[i - 1].royalties,
                transfers: periodData.transfers - arr[i - 1].transfers,
                newAccounts: periodData.newAccounts - arr[i - 1].newAccounts,
                newAssets: periodData.newAssets - arr[i - 1].newAssets,
              });
            }

            return arr;
          },
          []
        )
      );
    } else {
      const dailyAggregateData = await fetchDailyAggregateData();
      setEthereumData(
        dailyAggregateData.map(({ timestamp, paymentTokens }: any) => {
          const periodData = paymentTokens.reduce(
            (
              acc: any,
              {
                volume,
                fees,
                royalties,
                transfers,
                newAccounts,
                newAssets,
              }: any
            ) => {
              acc.volume += parseFloat(formatEther(volume));
              acc.fees += parseFloat(formatEther(fees));
              acc.royalties += parseFloat(formatEther(royalties));
              acc.transfers += transfers;
              acc.newAccounts += newAccounts;
              acc.newAssets += newAssets;
              return acc;
            },
            {
              volume: 0,
              fees: 0,
              royalties: 0,
              transfers: 0,
              newAccounts: 0,
              newAssets: 0,
            }
          );

          return {
            timestamp,
            volumeUSD: prices[timestamp]
              ? periodData.volume * prices[timestamp]
              : 0,
            feesUSD: prices[timestamp]
              ? periodData.fees * prices[timestamp]
              : 0,
            royaltiesUSD: prices[timestamp]
              ? periodData.royalties * prices[timestamp]
              : 0,
            ...periodData,
          };
        })
      );
    }
  };

  return (
    <OpenSeaContext.Provider
      value={{ ethereumData, currency, setCurrency, period, updatePeriod }}
    >
      {children}
    </OpenSeaContext.Provider>
  );
};

const useOpenSea = () => {
  const context = useContext(OpenSeaContext);
  if (context === undefined) {
    throw new Error("useOpenSea must be used within a OpenSeaProvider");
  }
  return context;
};

export { OpenSeaProvider, useOpenSea };
