import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Account,
  Asset,
  AssetContract,
  TokenAggregate,
  Transfer,
} from "../generated/schema";
import { AtomicMatch_Call } from "../generated/WyvernExchange/WyvernExchange";
import { _updateStats } from "./stats";
import {
  _getSingleTokenIdFromTransferFromCallData,
  _getSingleTokenQuantityFromTransferFromCallData,
  _guardedArrayReplace,
} from "./util";

export const WYVERN_EXCHANGE_ADDRESS =
  "0x7be8076f4ea4a4ad08075c2508e481d6c946d12b";
export const WYVERN_ATOMICIZER_ADDRESS =
  "0xc99f70bfd82fb7c8f8191fdfbfb735606b15e5c5";

export function handleAtomicMatch_(call: AtomicMatch_Call): void {
  _handleLegacy(call);

  let addrs: Address[] = call.inputs.addrs;
  let saleAddress: string = addrs[11].toHexString();

  if (saleAddress == WYVERN_ATOMICIZER_ADDRESS) {
    // TODO: Implement Bundle Sells
  } else {
    _handleSingleSell(call);
  }
}

function _handleLegacy(call: AtomicMatch_Call): void {
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

export function _handleSingleSell(call: AtomicMatch_Call): void {
  let addrs: Address[] = call.inputs.addrs;
  let uints: BigInt[] = call.inputs.uints;

  let isNewAccount = false;
  let isNewAsset = false;

  let mergedCallDataStr = _guardedArrayReplace(
    call.inputs.calldataBuy,
    call.inputs.calldataSell,
    call.inputs.replacementPatternBuy
  );

  let from = addrs[8].toHexString();
  let fromAccount = Account.load(from);
  if (fromAccount == null) {
    isNewAccount = true;

    fromAccount = new Account(from);
    fromAccount.save();
  }

  let to = addrs[1].toHexString();
  let toAccount = Account.load(to);
  if (toAccount == null) {
    isNewAccount = true;

    toAccount = new Account(to);
    toAccount.save();
  }

  let assetContractAddress = addrs[11].toHexString();
  let assetContract = AssetContract.load(assetContractAddress);
  if (assetContract == null) {
    assetContract = new AssetContract(assetContractAddress);
    assetContract.save();
  }

  let tokenId = _getSingleTokenIdFromTransferFromCallData(
    mergedCallDataStr,
    true
  );
  let assetId = assetContractAddress + "-" + tokenId;
  let asset = Asset.load(assetId);
  if (asset == null) {
    isNewAsset = true;

    asset = new Asset(assetId);
    asset.assetContract = assetContractAddress;
    asset.tokenId = tokenId;
    asset.save();
  }

  let totalRoyaltyBps: BigInt = uints[0];
  let royaltyBps: BigInt = BigInt.fromI32(0);
  let feeBps: BigInt = BigInt.fromI32(0);

  if (totalRoyaltyBps.ge(BigInt.fromI32(250))) {
    feeBps = BigInt.fromI32(250);
    royaltyBps = totalRoyaltyBps.minus(feeBps);
  }

  let transfer = new Transfer(call.transaction.hash.toHexString());
  transfer.block = call.block.number;
  transfer.timestamp = call.block.timestamp.toI32();
  transfer.asset = assetId;
  transfer.assetContract = assetContractAddress;
  transfer.quantity = _getSingleTokenQuantityFromTransferFromCallData(
    mergedCallDataStr,
    true
  );
  transfer.from = from;
  transfer.to = to;
  transfer.paymentToken = addrs[6].toHexString();
  transfer.paymentQuantity = uints[4];
  transfer.royalty = uints[4].times(royaltyBps).div(BigInt.fromI32(10000));
  transfer.fee = uints[4].times(feeBps).div(BigInt.fromI32(10000));

  transfer.save();

  _updateStats(transfer, isNewAccount, isNewAsset);
}
