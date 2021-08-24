import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Token } from "../generated/schema";
import { AtomicMatch_Call } from "../generated/WyvernExchange/WyvernExchange";

export function handleAtomicMatch_(call: AtomicMatch_Call): void {
  let callInputs = call.inputs;
  let addrs: Address[] = callInputs.addrs;
  let uints: BigInt[] = callInputs.uints;

  let price: BigInt = uints[4];
  let paymentToken = addrs[6].toHexString();

  let token = Token.load(paymentToken);
  if (token == null) {
    token = new Token(paymentToken);
    token.volume = BigInt.fromI32(0);
    token.quantity = 0;
  }

  token.volume = token.volume.plus(price);
  token.quantity = token.quantity + 1;
  token.save();
}
