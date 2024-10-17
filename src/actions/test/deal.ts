import type { TestClientMode } from "node_modules/viem/_types/clients/createTestClient.js";
import {
  type AccessList,
  type Account,
  type Address,
  type BlockNumber,
  type BlockTag,
  type Chain,
  type ExactPartial,
  type GetStorageAtErrorType,
  type Hash,
  type PartialBy,
  type Quantity,
  type ReadContractErrorType,
  type SetStorageAtErrorType,
  type TestClient,
  type TransactionRequest,
  type Transport,
  encodeFunctionData,
  erc20Abi,
  numberToHex,
  parseAbi,
} from "viem";
import { parseAccount } from "viem/accounts";
import { readContract, setBalance, setStorageAt } from "viem/actions";

export type CreateAccessListRpcSchema = {
  Method: "eth_createAccessList";
  Parameters:
    | [transaction: ExactPartial<TransactionRequest>]
    | [transaction: ExactPartial<TransactionRequest>, block: BlockNumber | BlockTag | Hash];
  ReturnType: {
    accessList: AccessList;
    gasUsed: Quantity;
  };
};

export type RawDealParameters = {
  /* The address of the ERC20 token to deal. */
  erc20?: Address;
  /* The owner of the dealt tokens. */
  account: Account | Address;
  /* The amount of tokens to deal. */
  amount: bigint;
};

export type DealParameters<account extends Account | undefined = Account | undefined> = account extends Account
  ? PartialBy<RawDealParameters, "account">
  : RawDealParameters;

export type DealErrorType = GetStorageAtErrorType | SetStorageAtErrorType | ReadContractErrorType;

/**
 * Deals ERC20 tokens to an account, by overriding the storage of `balanceOf(account)`.
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
 *   account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
 *   amount: parseUnits("100", 6),
 * })
 */
export async function deal<chain extends Chain | undefined, account extends Account | undefined>(
  client: TestClient<TestClientMode, Transport, chain, account, false>,
  { erc20, account: account_ = client.account!, amount }: DealParameters<account>,
) {
  const account = parseAccount(account_);

  if (erc20 == null || erc20 === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE")
    return setBalance(client, { address: account.address, value: amount });

  const value = numberToHex(amount, { size: 32 });

  const { accessList } = await client.request<CreateAccessListRpcSchema>({
    method: "eth_createAccessList",
    params: [
      {
        to: erc20,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [account.address],
        }),
      },
    ],
  });

  for (const { address: address_, storageKeys } of accessList) {
    // Address needs to be lower-case to work with setStorageAt.
    const address = address_.toLowerCase() as Address;

    for (const slot of storageKeys) {
      try {
        const balance = await readContract(client, {
          abi: erc20Abi,
          address: erc20,
          functionName: "balanceOf",
          args: [account.address],
          stateOverride: [
            {
              address,
              stateDiff: [
                {
                  slot,
                  value,
                },
              ],
            },
          ],
        });

        if (balance === amount) return await setStorageAt(client, { address, index: slot, value });
      } catch {}
    }
  }

  throw Error(`Could not deal ERC20 tokens: cannot find valid "balanceOf" storage slot for "${erc20}"`);
}
