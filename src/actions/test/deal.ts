import type { TestClientMode } from "node_modules/viem/_types/clients/createTestClient.js";
import {
  type Account,
  type Address,
  type Chain,
  type GetStorageAtErrorType,
  type ReadContractErrorType,
  type SetStorageAtErrorType,
  type TestClient,
  type Transport,
  encodeAbiParameters,
  erc20Abi,
  keccak256,
  numberToHex,
} from "viem";
import { getStorageAt, readContract, setStorageAt } from "viem/actions";

let cache:
  | Record<
      Address,
      {
        type: StorageLayoutType;
        slot: number;
      }
    >
  | undefined;
let cachePath: string | undefined;

if (typeof process !== "undefined") {
  const { homedir } = await import("node:os");
  const { join } = await import("node:path");

  cachePath = join(homedir(), ".foundry", "cache", "viem-deal");

  try {
    const { readFileSync } = await import("node:fs");

    cache = JSON.parse(await readFileSync(cachePath, "utf-8"));
  } catch (error) {
    console.debug(`Could not load cache: ${error}, re-initializing.`);

    cache = {};
  }
}

export type StorageLayoutType = "solidity" | "vyper";

export type DealParameters = {
  /* The address of the ERC20 token to deal. */
  erc20: Address;
  /* The address of the recipient of the dealt tokens. */
  recipient: Address;
  /* The amount of tokens to deal. */
  amount: bigint;
  /* The storage slot of the `balanceOf` mapping, if known. */
  slot?: number;
  /* The type of storage layout used by the ERC20 token. */
  storageType?: StorageLayoutType;
  /* The maximum storage slot to brute-forcefully look for a `balanceOf` mapping. */
  maxSlot?: number;
};

export type DealErrorType = GetStorageAtErrorType | SetStorageAtErrorType | ReadContractErrorType;

export function getBalanceOfSlot(type: StorageLayoutType, slot: bigint, recipient: Address) {
  if (type === "vyper")
    return keccak256(encodeAbiParameters([{ type: "uint256" }, { type: "address" }], [slot, recipient]));

  return keccak256(encodeAbiParameters([{ type: "address" }, { type: "uint256" }], [recipient, slot]));
}

/**
 * Deals ERC20 tokens to a recipient, by overriding the storage of `balanceOf(recipient)`.
 *
 * - Docs: https://viem.sh/docs/actions/test/deal
 *
 * @param client - Client to use
 * @param parameters – {@link DealParameters}
 *
 * @example
 * import { createTestClient, http, parseUnits } from 'viem'
 * import { foundry } from 'viem/chains'
 * import { deal } from 'viem-deal'
 *
 * const client = createTestClient({
 *   mode: 'anvil',
 *   chain: foundry,
 *   transport: http(),
 * })
 * await deal(client, {
 *   erc20: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
 *   recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
 *   amount: parseUnits("100", 6),
 * })
 */
export async function deal<chain extends Chain | undefined, account extends Account | undefined>(
  client: TestClient<TestClientMode, Transport, chain, account, false>,
  { erc20, recipient, amount, slot, storageType, maxSlot = 256 }: DealParameters,
) {
  const trySlot = async ({
    type,
    slot,
  }: {
    type: StorageLayoutType;
    slot: number;
  }) => {
    const balanceOfSlot = getBalanceOfSlot(type, BigInt(slot), recipient);
    const storageBefore = await getStorageAt(client, { address: erc20, slot: balanceOfSlot });

    await setStorageAt(client, { address: erc20, index: balanceOfSlot, value: numberToHex(amount, { size: 32 }) });

    const balance = await readContract(client, {
      abi: erc20Abi,
      address: erc20,
      functionName: "balanceOf",
      args: [recipient],
    });

    if (balance === amount) return true;

    if (storageBefore != null)
      await setStorageAt(client, { address: erc20, index: balanceOfSlot, value: storageBefore });

    return false;
  };

  const cached = cache?.[erc20];
  if (cached != null && (await trySlot(cached))) return;

  const switchStorageType = storageType == null;

  slot ??= 0;
  storageType ??= "solidity";

  let success = await trySlot({ type: storageType, slot });

  while (!success && slot <= maxSlot) {
    if (switchStorageType) {
      if (storageType === "solidity") storageType = "vyper";
      else {
        ++slot;
        storageType = "solidity";
      }
    } else ++slot;

    success = await trySlot({ type: storageType, slot });
  }

  if (!success) throw Error(`Could not deal ERC20 tokens: cannot brute-force "balanceOf" storage slot at "${erc20}"`);

  if (cache != null && cachePath != null) {
    cache[erc20] = { type: storageType, slot };

    try {
      const { dirname } = await import("node:path");
      const { mkdirSync, writeFileSync } = await import("node:fs");

      await mkdirSync(dirname(cachePath), { recursive: true });

      await writeFileSync(cachePath, JSON.stringify(cache));
    } catch (error) {
      console.error(`Could not save cache: ${error}`);
    }
  }
}
