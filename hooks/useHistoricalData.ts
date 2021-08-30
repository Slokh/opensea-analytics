import { useEffect, useState } from "react";

const ANALYTICS_API =
  "https://pw1494iz47.execute-api.us-east-1.amazonaws.com/dev/analytics";

export const useHistoricalData = () => {
  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await (await fetch(ANALYTICS_API)).json();

      setData(data);
    };
    fetchData();
  }, []);

  return { historicalData: data || [] };
};
