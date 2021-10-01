// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Asset extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Asset entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Asset entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Asset", id.toString(), this);
  }

  static load(id: string): Asset | null {
    return store.get("Asset", id) as Asset | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get assetContract(): string {
    let value = this.get("assetContract");
    return value.toString();
  }

  set assetContract(value: string) {
    this.set("assetContract", Value.fromString(value));
  }

  get tokenId(): string {
    let value = this.get("tokenId");
    return value.toString();
  }

  set tokenId(value: string) {
    this.set("tokenId", Value.fromString(value));
  }

  get transfers(): Array<string> {
    let value = this.get("transfers");
    return value.toStringArray();
  }

  set transfers(value: Array<string>) {
    this.set("transfers", Value.fromStringArray(value));
  }
}

export class AssetContract extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save AssetContract entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save AssetContract entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("AssetContract", id.toString(), this);
  }

  static load(id: string): AssetContract | null {
    return store.get("AssetContract", id) as AssetContract | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get transfers(): Array<string> {
    let value = this.get("transfers");
    return value.toStringArray();
  }

  set transfers(value: Array<string>) {
    this.set("transfers", Value.fromStringArray(value));
  }
}

export class Account extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Account entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Account entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Account", id.toString(), this);
  }

  static load(id: string): Account | null {
    return store.get("Account", id) as Account | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get buys(): Array<string> {
    let value = this.get("buys");
    return value.toStringArray();
  }

  set buys(value: Array<string>) {
    this.set("buys", Value.fromStringArray(value));
  }

  get sells(): Array<string> {
    let value = this.get("sells");
    return value.toStringArray();
  }

  set sells(value: Array<string>) {
    this.set("sells", Value.fromStringArray(value));
  }
}

export class Transfer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Transfer entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Transfer entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Transfer", id.toString(), this);
  }

  static load(id: string): Transfer | null {
    return store.get("Transfer", id) as Transfer | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get block(): BigInt {
    let value = this.get("block");
    return value.toBigInt();
  }

  set block(value: BigInt) {
    this.set("block", Value.fromBigInt(value));
  }

  get timestamp(): i32 {
    let value = this.get("timestamp");
    return value.toI32();
  }

  set timestamp(value: i32) {
    this.set("timestamp", Value.fromI32(value));
  }

  get asset(): string {
    let value = this.get("asset");
    return value.toString();
  }

  set asset(value: string) {
    this.set("asset", Value.fromString(value));
  }

  get assetContract(): string {
    let value = this.get("assetContract");
    return value.toString();
  }

  set assetContract(value: string) {
    this.set("assetContract", Value.fromString(value));
  }

  get quantity(): i32 {
    let value = this.get("quantity");
    return value.toI32();
  }

  set quantity(value: i32) {
    this.set("quantity", Value.fromI32(value));
  }

  get from(): string {
    let value = this.get("from");
    return value.toString();
  }

  set from(value: string) {
    this.set("from", Value.fromString(value));
  }

  get to(): string {
    let value = this.get("to");
    return value.toString();
  }

  set to(value: string) {
    this.set("to", Value.fromString(value));
  }

  get paymentToken(): string {
    let value = this.get("paymentToken");
    return value.toString();
  }

  set paymentToken(value: string) {
    this.set("paymentToken", Value.fromString(value));
  }

  get paymentQuantity(): BigInt {
    let value = this.get("paymentQuantity");
    return value.toBigInt();
  }

  set paymentQuantity(value: BigInt) {
    this.set("paymentQuantity", Value.fromBigInt(value));
  }

  get royalty(): BigInt {
    let value = this.get("royalty");
    return value.toBigInt();
  }

  set royalty(value: BigInt) {
    this.set("royalty", Value.fromBigInt(value));
  }

  get fee(): BigInt {
    let value = this.get("fee");
    return value.toBigInt();
  }

  set fee(value: BigInt) {
    this.set("fee", Value.fromBigInt(value));
  }
}

export class PaymentToken extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PaymentToken entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PaymentToken entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PaymentToken", id.toString(), this);
  }

  static load(id: string): PaymentToken | null {
    return store.get("PaymentToken", id) as PaymentToken | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get dataGroup(): string {
    let value = this.get("dataGroup");
    return value.toString();
  }

  set dataGroup(value: string) {
    this.set("dataGroup", Value.fromString(value));
  }

  get timestamp(): i32 {
    let value = this.get("timestamp");
    return value.toI32();
  }

  set timestamp(value: i32) {
    this.set("timestamp", Value.fromI32(value));
  }

  get address(): string {
    let value = this.get("address");
    return value.toString();
  }

  set address(value: string) {
    this.set("address", Value.fromString(value));
  }

  get volume(): BigInt {
    let value = this.get("volume");
    return value.toBigInt();
  }

  set volume(value: BigInt) {
    this.set("volume", Value.fromBigInt(value));
  }

  get royalties(): BigInt {
    let value = this.get("royalties");
    return value.toBigInt();
  }

  set royalties(value: BigInt) {
    this.set("royalties", Value.fromBigInt(value));
  }

  get fees(): BigInt {
    let value = this.get("fees");
    return value.toBigInt();
  }

  set fees(value: BigInt) {
    this.set("fees", Value.fromBigInt(value));
  }

  get transfers(): i32 {
    let value = this.get("transfers");
    return value.toI32();
  }

  set transfers(value: i32) {
    this.set("transfers", Value.fromI32(value));
  }

  get newAssets(): i32 {
    let value = this.get("newAssets");
    return value.toI32();
  }

  set newAssets(value: i32) {
    this.set("newAssets", Value.fromI32(value));
  }

  get newAccounts(): i32 {
    let value = this.get("newAccounts");
    return value.toI32();
  }

  set newAccounts(value: i32) {
    this.set("newAccounts", Value.fromI32(value));
  }
}

export class AggregateData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save AggregateData entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save AggregateData entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("AggregateData", id.toString(), this);
  }

  static load(id: string): AggregateData | null {
    return store.get("AggregateData", id) as AggregateData | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): i32 {
    let value = this.get("timestamp");
    return value.toI32();
  }

  set timestamp(value: i32) {
    this.set("timestamp", Value.fromI32(value));
  }

  get paymentTokens(): Array<string> {
    let value = this.get("paymentTokens");
    return value.toStringArray();
  }

  set paymentTokens(value: Array<string>) {
    this.set("paymentTokens", Value.fromStringArray(value));
  }
}

export class HourlyAggregateData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save HourlyAggregateData entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save HourlyAggregateData entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("HourlyAggregateData", id.toString(), this);
  }

  static load(id: string): HourlyAggregateData | null {
    return store.get("HourlyAggregateData", id) as HourlyAggregateData | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): i32 {
    let value = this.get("timestamp");
    return value.toI32();
  }

  set timestamp(value: i32) {
    this.set("timestamp", Value.fromI32(value));
  }

  get paymentTokens(): Array<string> {
    let value = this.get("paymentTokens");
    return value.toStringArray();
  }

  set paymentTokens(value: Array<string>) {
    this.set("paymentTokens", Value.fromStringArray(value));
  }
}

export class DailyAggregateData extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save DailyAggregateData entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save DailyAggregateData entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("DailyAggregateData", id.toString(), this);
  }

  static load(id: string): DailyAggregateData | null {
    return store.get("DailyAggregateData", id) as DailyAggregateData | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get timestamp(): i32 {
    let value = this.get("timestamp");
    return value.toI32();
  }

  set timestamp(value: i32) {
    this.set("timestamp", Value.fromI32(value));
  }

  get paymentTokens(): Array<string> {
    let value = this.get("paymentTokens");
    return value.toStringArray();
  }

  set paymentTokens(value: Array<string>) {
    this.set("paymentTokens", Value.fromStringArray(value));
  }
}

export class TokenAggregate extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save TokenAggregate entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save TokenAggregate entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("TokenAggregate", id.toString(), this);
  }

  static load(id: string): TokenAggregate | null {
    return store.get("TokenAggregate", id) as TokenAggregate | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get volume(): BigInt {
    let value = this.get("volume");
    return value.toBigInt();
  }

  set volume(value: BigInt) {
    this.set("volume", Value.fromBigInt(value));
  }

  get transactions(): i32 {
    let value = this.get("transactions");
    return value.toI32();
  }

  set transactions(value: i32) {
    this.set("transactions", Value.fromI32(value));
  }
}
