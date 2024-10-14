import type { TestClientMode } from "node_modules/viem/_types/clients/createTestClient.js";
import type { Account, Chain, TestClient, Transport } from "viem";
import { type DealParameters, deal } from "./actions/test/deal.js";

export type DealActions = {
  /**
   * Deals ERC20 tokens to a recipient, by overriding the storage of `balanceOf(recipient)`.
   *
   * @param args - {@link DealParameters}
   *
   * @example
   * import { createTestClient, http } from 'viem'
   * import { foundry } from 'viem/chains'
   * import { dealActions } from 'viem-deal'
   *
   * const client = createTestClient({
   *   mode: 'anvil',
   *   chain: foundry,
   *   transport: http(),
   * }).extend(dealActions)
   * await client.deal({
   *   erc20: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
   *   recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
   *   amount: parseUnits("100", 6),
   * })
   */
  deal: (args: DealParameters) => Promise<void>;
};

export function dealActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(client: TestClient<TestClientMode, Transport, chain, account, false>): DealActions {
  return {
    deal: (args) => deal(client, args),
  };
}
