import { createContext, useContext, useState } from "react";
import { useCurrentData } from "../hooks/useCurrentData";
import { useEthereumPrices } from "../hooks/useEthereumPrices";
import { useHistoricalData } from "../hooks/useHistoricalData";
import {
  LAST_MONTH,
  LAST_WEEK,
  THIS_MONTH,
  THIS_WEEK,
  TODAY,
  YESTERDAY,
} from "../utils/dates";

export enum Network {
  Ethereum = "ethereum",
  Polygon = "polygon",
}

type State = {
  network: Network;
  setNetwork: (network: Network) => void;
  latestPrice: number;
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
  const [network, setNetwork] = useState<Network>(Network.Ethereum);
  const { latestPrice } = useEthereumPrices();
  const { historicalData, latestData } = useHistoricalData();
  const { ethereum, polygon } = useCurrentData();

  const current = {
    ethereum: {
      quantity: ethereum.quantity,
      volume: latestData?.ethereum?.usdTotalVolumeChange
        ? latestData.ethereum.usdTotalVolumeChange +
          (ethereum.volume - latestData.ethereum.volume) * latestPrice
        : 0,
    },
    polygon: {
      quantity: polygon.quantity,
      volume: latestData?.polygon?.usdTotalVolumeChange
        ? latestData.polygon.usdTotalVolumeChange +
          (polygon.volume - latestData.polygon.volume) * latestPrice
        : 0,
    },
  };

  const volumeDifference = (start: number, end?: number) => {
    if (!historicalData.length) return 0;
    const startVolume = historicalData.find(
      ({ timestamp }: any) => timestamp === start
    )[network].usdTotalVolumeChange;

    if (!end) {
      return current[network].volume > 0
        ? current[network].volume - startVolume
        : 0;
    }

    const endVolume = historicalData.find(
      ({ timestamp }: any) => timestamp === end
    )[network].usdTotalVolumeChange;

    return endVolume - startVolume;
  };

  const quantityDifference = (start: number, end?: number) => {
    if (!historicalData.length) return 0;
    const startQuantity = historicalData.find(
      ({ timestamp }: any) => timestamp === start
    )[network].quantity;

    if (!end) {
      return current[network].quantity > 0
        ? current[network].quantity - startQuantity
        : 0;
    }

    const endQuantity = historicalData.find(
      ({ timestamp }: any) => timestamp === end
    )[network].quantity;

    return endQuantity - startQuantity;
  };

  return (
    <OpenSeaContext.Provider
      value={{
        network,
        setNetwork,
        latestPrice,
        dailyVolume: volumeDifference(TODAY),
        weeklyVolume: volumeDifference(THIS_WEEK),
        monthlyVolume: volumeDifference(THIS_MONTH),
        previousDailyVolume: volumeDifference(YESTERDAY, TODAY),
        previousWeeklyVolume: volumeDifference(LAST_WEEK, THIS_WEEK),
        previousMonthlyVolume: volumeDifference(LAST_MONTH, THIS_MONTH),
        dailyQuantity: quantityDifference(TODAY),
        weeklyQuantity: quantityDifference(THIS_WEEK),
        monthlyQuantity: quantityDifference(THIS_MONTH),
        previousDailyQuantity: quantityDifference(YESTERDAY, TODAY),
        previousWeeklyQuantity: quantityDifference(LAST_WEEK, THIS_WEEK),
        previousMonthlyQuantity: quantityDifference(LAST_MONTH, THIS_MONTH),
      }}
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
