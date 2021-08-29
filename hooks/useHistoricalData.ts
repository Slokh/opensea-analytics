import { addDays, eachDayOfInterval } from "date-fns";
import { useEffect, useState } from "react";

const ANALYTICS_API =
  "https://vt8v9g7f6h.execute-api.us-east-1.amazonaws.com/dev/analytics";

export const useHistoricalData = (timestamps: number[]) => {
  const [data, setData] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await (
        await fetch(`${ANALYTICS_API}?timestamps=${timestamps.join(",")}`)
      ).json();

      setData(data);
    };
    fetchData();
  }, [timestamps]);

  return { historicalData: data || [] };
};
