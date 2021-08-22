import { useEthers } from "@usedapp/core";
import type { NextPage } from "next";
import { OpenSeaProvider, useOpenSea } from "../context/opensea";

const Display = () => {
  const { blockNumber, totalVolume } = useOpenSea();

  return (
    <div>{`Volume: $${totalVolume
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} - ${blockNumber}`}</div>
  );
};

const Home: NextPage = () => {
  const { activateBrowserWallet, library } = useEthers();

  return (
    <div>
      <div>
        <button onClick={() => activateBrowserWallet()}>Connect</button>
      </div>
      {library && (
        <OpenSeaProvider provider={library}>
          <Display />
        </OpenSeaProvider>
      )}
    </div>
  );
};

export default Home;
