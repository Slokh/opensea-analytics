import { useEffect, useState } from "react";
import { useEthereumPrices } from "./useEthereumPrices";

const ANALYTICS_API =
  "https://vt8v9g7f6h.execute-api.us-east-1.amazonaws.com/dev/analytics";

export const useHistoricalData = () => {
  const [data, setData] = useState<any>();
  const { prices } = useEthereumPrices();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await (await fetch(ANALYTICS_API)).json();

      setData(data);
    };
    fetchData();
  }, []);

  if (!data || !prices) {
    return {
      historicalData: [],
    };
  }

  const historicalData = data.reduce((acc: any, data: any, i: number) => {
    const volumeChange =
      i === 0 ? 0 : data.ethereum.volume - acc[i - 1].ethereum.volume;
    const quantityChange =
      i === 0 ? 0 : data.ethereum.quantity - acc[i - 1].ethereum.quantity;
    const totalVolumeChange =
      i === 0 ? 0 : volumeChange + acc[i - 1].ethereum.totalVolumeChange;
    const totalQuantityChange =
      i === 0 ? 0 : quantityChange + acc[i - 1].ethereum.totalQuantityChange;
    const usdTotalVolumeChange =
      i === 0
        ? 0
        : volumeChange * prices[data.timestamp] +
          acc[i - 1].ethereum.usdTotalVolumeChange;

    const polygonVolumeChange =
      i === 0 ? 0 : data.polygon.volume - acc[i - 1].polygon.volume;
    const polygonQuantityChange =
      i === 0 ? 0 : data.polygon.quantity - acc[i - 1].polygon.quantity;
    const polygonTotalVolumeChange =
      i === 0 ? 0 : polygonVolumeChange + acc[i - 1].polygon.totalVolumeChange;
    const polygonTotalQuantityChange =
      i === 0
        ? 0
        : polygonQuantityChange + acc[i - 1].polygon.totalQuantityChange;
    const polygonUsdTotalVolumeChange =
      i === 0
        ? 0
        : polygonVolumeChange * prices[data.timestamp] +
          acc[i - 1].polygon.usdTotalVolumeChange;

    return acc.concat({
      ...data,
      ethereum: {
        ...data.ethereum,
        volumeChange,
        usdVolumeChange: volumeChange * prices[data.timestamp],
        totalVolumeChange: totalVolumeChange,
        usdTotalVolumeChange,
        quantityChange,
        totalQuantityChange,
      },
      polygon: {
        ...data.polygon,
        usdVolumeChange: polygonVolumeChange * prices[data.timestamp],
        totalVolumeChange: polygonTotalVolumeChange,
        usdTotalVolumeChange: polygonUsdTotalVolumeChange,
        quantityChange: polygonQuantityChange,
        totalQuantityChange: polygonTotalQuantityChange,
      },
    });
  }, []);

  return {
    historicalData,
    latestData: historicalData[historicalData.length - 1],
  };
};
