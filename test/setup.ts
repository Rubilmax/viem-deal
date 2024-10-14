import type { Client, HDAccount, HttpTransport, PublicActions, TestActions, TestRpcSchema, WalletActions } from "viem";
import { http, createTestClient, publicActions, walletActions } from "viem";
import { mainnet } from "viem/chains";
import { test as vitest } from "vitest";
import { type DealActions, dealActions } from "../src/index.js";
import { spawnAnvil } from "./anvil.js";
import { testAccount } from "./fixtures.js";

// Vitest needs to serialize BigInts to JSON, so we need to add a toJSON method to BigInt.prototype.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  namespace NodeJS {
    interface Process {
      __tinypool_state__: {
        isChildProcess: boolean;
        isTinypoolWorker: boolean;
        workerData: null;
        workerId: number;
      };
    }
  }
}

export const test = vitest.extend<{
  client: Client<
    HttpTransport,
    typeof mainnet,
    HDAccount,
    TestRpcSchema<"anvil">,
    TestActions &
      DealActions<HDAccount> &
      PublicActions<HttpTransport, typeof mainnet, HDAccount> &
      WalletActions<typeof mainnet, HDAccount>
  >;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: required by vitest at runtime
  client: async ({}, use) => {
    const { rpcUrl, stop } = await spawnAnvil({
      forkUrl: process.env.MAINNET_RPC_URL || mainnet.rpcUrls.default.http[0],
      forkBlockNumber: 20_884_340,
    });

    await use(
      createTestClient({
        chain: mainnet,
        mode: "anvil",
        account: testAccount(),
        transport: http(rpcUrl),
      })
        .extend(dealActions)
        .extend(publicActions)
        .extend(walletActions),
    );

    await stop();
  },
});
