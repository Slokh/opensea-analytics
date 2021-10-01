import { BigInt } from "@graphprotocol/graph-ts";
import {
  AggregateData,
  DailyAggregateData,
  HourlyAggregateData,
  PaymentToken,
  Transfer,
} from "../generated/schema";

const DELIMITER = "::";
const DATA = "opensea";
const TOTAL_DATA_GROUP = "total";
const HOURLY_DATA_GROUP = "hourly";
const DAILY_DATA_GROUP = "daily";

export function _updateStats(
  transfer: Transfer,
  isNewAccount: boolean,
  isNewAsset: boolean
): void {
  let aggregateDataId = DATA + DELIMITER + TOTAL_DATA_GROUP + DELIMITER + "0";
  let aggregateData = AggregateData.load(aggregateDataId);
  if (aggregateData == null) {
    aggregateData = new AggregateData(aggregateDataId);
    aggregateData.timestamp = 0;
    aggregateData.save();
  }

  _updatePaymentToken(
    aggregateDataId + DELIMITER + transfer.paymentToken,
    aggregateDataId,
    0,
    transfer,
    isNewAccount,
    isNewAsset
  );

  let hourSeconds = 3600;
  let hourIndex = transfer.timestamp / hourSeconds;
  let hourlyTimestamp = hourIndex * hourSeconds;
  let hourlyAggregateDataId =
    DATA +
    DELIMITER +
    HOURLY_DATA_GROUP +
    DELIMITER +
    hourlyTimestamp.toString();
  let hourlyAggregateData = HourlyAggregateData.load(hourlyAggregateDataId);
  if (hourlyAggregateData == null) {
    hourlyAggregateData = new HourlyAggregateData(hourlyAggregateDataId);
    hourlyAggregateData.timestamp = hourlyTimestamp;
    hourlyAggregateData.save();
  }

  _updatePaymentToken(
    hourlyAggregateDataId + DELIMITER + transfer.paymentToken,
    hourlyAggregateDataId,
    hourlyTimestamp,
    transfer,
    isNewAccount,
    isNewAsset
  );

  let daySeconds = hourSeconds * 24;
  let dayIndex = transfer.timestamp / daySeconds;
  let dailyTimestamp = dayIndex * daySeconds;
  let dailyAggregateDataId =
    DATA + DELIMITER + DAILY_DATA_GROUP + DELIMITER + dailyTimestamp.toString();
  let dailyAggregateData = DailyAggregateData.load(dailyAggregateDataId);
  if (dailyAggregateData == null) {
    dailyAggregateData = new DailyAggregateData(dailyAggregateDataId);
    dailyAggregateData.timestamp = dailyTimestamp;
    dailyAggregateData.save();
  }

  _updatePaymentToken(
    dailyAggregateDataId + DELIMITER + transfer.paymentToken,
    dailyAggregateDataId,
    dailyTimestamp,
    transfer,
    isNewAccount,
    isNewAsset
  );
}

function _updatePaymentToken(
  paymentTokenId: string,
  dataGroupId: string,
  timestamp: i32,
  transfer: Transfer,
  isNewAccount: boolean,
  isNewAsset: boolean
): void {
  let paymentToken = PaymentToken.load(paymentTokenId);
  if (paymentToken == null) {
    paymentToken = new PaymentToken(paymentTokenId);
    paymentToken.dataGroup = dataGroupId;
    paymentToken.timestamp = timestamp;
    paymentToken.address = transfer.paymentToken;
    paymentToken.timestamp = timestamp;
    paymentToken.volume = BigInt.fromI32(0);
    paymentToken.royalties = BigInt.fromI32(0);
    paymentToken.fees = BigInt.fromI32(0);
    paymentToken.transfers = 0;
    paymentToken.newAssets = 0;
    paymentToken.newAccounts = 0;
  }

  paymentToken.volume = paymentToken.volume.plus(transfer.paymentQuantity);
  paymentToken.royalties = paymentToken.royalties.plus(transfer.royalty);
  paymentToken.fees = paymentToken.fees.plus(transfer.fee);
  paymentToken.transfers = paymentToken.transfers + 1;

  if (isNewAsset) {
    paymentToken.newAssets = paymentToken.newAssets + 1;
  }

  if (isNewAccount) {
    paymentToken.newAccounts = paymentToken.newAccounts + 1;
  }

  paymentToken.save();
}
