import { BigInt } from "@graphprotocol/graph-ts";
import { Asset } from "../generated/schema";
import { OrdersMatched } from "../generated/WyvernExchange/WyvernExchange";

export function handleOrdersMatched(event: OrdersMatched): void {
  let bytes = event.transaction.input.toHexString();

  let method = bytes.slice(0, 10);
  if (method == "0xab834bab") {
    let token = bytes
      .slice(10)
      .slice(6 * 64, 7 * 64)
      .slice(24)
      .toString();

    let asset = Asset.load(token);
    if (asset == null) {
      asset = new Asset(token);
      asset.volume = BigInt.fromI32(0);
    }

    asset.volume = asset.volume.plus(event.params.price);
    asset.save();
  }
}
