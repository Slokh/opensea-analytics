/* Taken from https://github.com/xenoliss/opensea-subgraph/blob/main/src/mapping.ts */
import { BigInt, Bytes } from "@graphprotocol/graph-ts";

/**
 * Replace bytes in an array with bytes in another array, guarded by a bitmask
 *
 * @param array The original array
 * @param replacement The replacement array
 * @param mask The mask specifying which bits can be changed in the original array
 * @returns The updated byte array
 */
export function _guardedArrayReplace(
  array: Bytes,
  replacement: Bytes,
  mask: Bytes
): string {
  array.reverse();
  replacement.reverse();
  mask.reverse();

  let bigIntgArray = BigInt.fromUnsignedBytes(array);
  let bigIntReplacement = BigInt.fromUnsignedBytes(replacement);
  let bigIntMask = BigInt.fromUnsignedBytes(mask);

  // array |= replacement & mask;
  bigIntReplacement = bigIntReplacement.bitAnd(bigIntMask);
  bigIntgArray = bigIntgArray.bitOr(bigIntReplacement);
  let callDataHexString = bigIntgArray.toHexString();
  return callDataHexString;
}

/**
 *
 * @param atomicizeCallData The ABI encoded atomicize method call used by OpenSea Smart library (WyvernAtomicizer)
 *                          to trigger bundle sales (looping over NFT and calling transferFrom for each)
 * @returns The list of associated full name NFT in the bundle
 */
export function _getCompleteNftIdFromCallData(
  atomicizeCallData: string
): string[] {
  const TRAILING_0x = 2;
  const METHOD_ID_LENGTH = 8;
  const UINT_256_LENGTH = 64;

  let indexStartNbToken = TRAILING_0x + METHOD_ID_LENGTH + UINT_256_LENGTH * 4;
  let indexStopNbToken = indexStartNbToken + UINT_256_LENGTH;
  let nbTokenStr = atomicizeCallData.substring(
    indexStartNbToken,
    indexStopNbToken
  );
  let nbToken = parseI32(nbTokenStr, 16);

  // Get the associated NFT contracts
  let nftContractsAddrsList: string[] = [];
  let offset = indexStopNbToken;
  for (let i = 0; i < nbToken; i++) {
    let addrs = atomicizeCallData.substring(offset, offset + UINT_256_LENGTH);
    nftContractsAddrsList.push(addrs);

    // Move forward in the call data
    offset += UINT_256_LENGTH;
  }

  /**
   * After reading the contract addresses involved in the bundle sale
   * there are 2 chunks of params of length nbToken * UINT_256_LENGTH.
   *
   * Those chunks are each preceded by a "chunk metadata" of length UINT_256_LENGTH
   * Finalluy a last "chunk metadata" is set of length UINT_256_LENGTH. (3 META_CHUNKS)
   *
   *
   * After that we are reading the abiencoded data representing the transferFrom calls
   */
  const LEFT_CHUNKS = 2;
  const NB_META_CHUNKS = 3;
  offset +=
    nbToken * UINT_256_LENGTH * LEFT_CHUNKS + NB_META_CHUNKS * UINT_256_LENGTH;

  // Get the NFT token IDs
  const TRANSFER_FROM_DATA_LENGTH = METHOD_ID_LENGTH + UINT_256_LENGTH * 3;
  let tokenIdsList: string[] = [];
  for (let i = 0; i < nbToken; i++) {
    let transferFromData = atomicizeCallData.substring(
      offset,
      offset + TRANSFER_FROM_DATA_LENGTH
    );
    let tokenIdstr = _getSingleTokenIdFromTransferFromCallData(
      transferFromData,
      false
    );
    tokenIdsList.push(tokenIdstr);

    // Move forward in the call data
    offset += TRANSFER_FROM_DATA_LENGTH;
  }

  // Build the complete Nfts Ids (NFT contract - Token ID)
  let completeNftIdsList: string[] = [];
  for (let i = 0; i < nftContractsAddrsList.length; i++) {
    let contractAddrsStr = nftContractsAddrsList[i];
    let tokenIdStr = tokenIdsList[i];

    completeNftIdsList.push(contractAddrsStr + "-" + tokenIdStr);
  }

  return completeNftIdsList;
}

export function _getSingleTokenIdFromTransferFromCallData(
  transferFromData: string,
  trailing0x: boolean
): string {
  let TRAILING_0x = trailing0x ? 2 : 0;
  const METHOD_ID_LENGTH = 8;
  const UINT_256_LENGTH = 64;

  let tokenIdHexStr: string = transferFromData.substring(
    TRAILING_0x + METHOD_ID_LENGTH + UINT_256_LENGTH * 2
  );
  let tokenId = parseI64(tokenIdHexStr, 16);
  let tokenIdStr: string = tokenId.toString();

  return tokenIdStr;
}

export function _getSingleTokenQuantityFromTransferFromCallData(
  transferFromData: string,
  trailing0x: boolean
): i32 {
  let TRAILING_0x = trailing0x ? 2 : 0;
  const METHOD_ID_LENGTH = 8;
  const UINT_256_LENGTH = 64;

  let startIndex = TRAILING_0x + METHOD_ID_LENGTH + UINT_256_LENGTH * 4;

  if (startIndex >= transferFromData.length) {
    return 1;
  }

  let tokenIdHexStr: string = transferFromData.substring(startIndex);
  let tokenId = parseI32(tokenIdHexStr, 16);

  return tokenId;
}
