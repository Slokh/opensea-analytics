import { BigInt } from "@graphprotocol/graph-ts";
import { TokenAggregate } from "../generated/schema";
import { Fill } from "../generated/ZeroExExchange/ZeroExExchange";

const TAKER_ADDRESS = "0xf715beb51ec8f63317d66f491e37e7bb048fcc2d";
const WETH = "7ceb23fd6bc0add59e62ac25578270cff1b9f619";

export function handleFill(event: Fill): void {
  if (
    event.params.takerAddress.toHexString() === TAKER_ADDRESS &&
    event.params.takerAssetData.toHexString().endsWith(WETH)
  ) {
    let paymentToken = "0x" + WETH;
    let token = TokenAggregate.load(paymentToken);
    if (token == null) {
      token = new TokenAggregate(paymentToken);
      token.volume = BigInt.fromI32(0);
      token.transactions = 0;
    }

    token.volume = token.volume.plus(event.params.takerAssetFilledAmount);
    token.transactions = token.transactions + 1;
    token.save();
  }
}
