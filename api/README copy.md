# inverse-api

A set of lambdas for https://inverse.finance

#### Functions
- `tvl`: Total Value Locked in Inverse Products, also has breakdown by product
- `delegates`: Delegates, their voting history, their delegators, their voting power
- `proposals`: Proposal data, proposal voter data
- `markets`: Anchor markets APY, Liquidity, Assets
- `vaults`: Vault APYs
- `staking`: Staking APYs

#### Development

Add your `INFURA_ID` to `serverless.ts`

Run `serverless invoke local -f {func}`
