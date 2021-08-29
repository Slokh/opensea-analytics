import { Address, BigInt } from "@graphprotocol/graph-ts";
import { TokenAggregate } from "../generated/schema";
import { AtomicMatch_Call } from "../generated/WyvernExchange/WyvernExchange";

export function handleAtomicMatch_(call: AtomicMatch_Call): void {
  let callInputs = call.inputs;
  let addrs: Address[] = callInputs.addrs;
  let uints: BigInt[] = callInputs.uints;

  let paymentToken = addrs[6].toHexString();

  let token = TokenAggregate.load(paymentToken);
  if (token == null) {
    token = new TokenAggregate(paymentToken);
    token.volume = BigInt.fromI32(0);
    token.transactions = 0;
  }

  token.volume = token.volume.plus(uints[4]);
  token.transactions = token.transactions + 1;
  token.save();
}
