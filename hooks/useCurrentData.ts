import { useEffect, useState } from "react";
import useInterval from "./useInterval";

const ANALYTICS_API =
  "https://vt8v9g7f6h.execute-api.us-east-1.amazonaws.com/dev/analytics?current=true";

export const useCurrentData = () => {
  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(ANALYTICS_API);
      setData(await response.json());
    };
    fetchData();
  }, []);

  useInterval(async () => {
    const response = await fetch(ANALYTICS_API);
    const json = await response.json();
    setData(json);
  }, 10000);

  return {
    ethereum: {
      volume: data?.ethereum?.volume || 0,
      quantity: data?.ethereum?.quantity || 0,
    },
    polygon: {
      volume: data?.polygon?.volume || 0,
      quantity: data?.polygon?.quantity || 0,
    },
  };
};
