import { anvil } from "prool/instances";
import type { Client, HttpTransport, PublicActions, TestActions, TestClient, TestRpcSchema, WalletActions } from "viem";
import { http, createTestClient, publicActions, walletActions } from "viem";
import { mainnet } from "viem/chains";
import { test as vitest } from "vitest";
import { type DealActions, dealActions } from "../src/index.js";

export interface TestAccount {
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  type: "json-rpc";
}

const rpcUrl = process.env.MAINNET_RPC_URL || mainnet.rpcUrls.default.http[0];

let port = 8545;

export const test = vitest.extend<{
  client: Client<
    HttpTransport,
    typeof mainnet,
    TestAccount,
    TestRpcSchema<"anvil">,
    TestActions &
      PublicActions<HttpTransport, typeof mainnet, TestAccount> &
      WalletActions<typeof mainnet, TestAccount> &
      DealActions
  >;
}>({
  // biome-ignore lint/correctness/noEmptyPattern: <explanation>
  client: async ({}, use) => {
    const instance = await anvil({
      forkUrl: rpcUrl,
      forkBlockNumber: 20_884_340,
      timeout: 10_000,
    }).create({
      port: port++,
    });

    instance.on("message", console.log);

    const stop = await instance.start();

    await use(
      createTestClient({
        chain: mainnet,
        mode: "anvil",
        transport: http(`http://${instance.host}:${instance.port}`),
        account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      })
        .extend(dealActions)
        .extend(publicActions)
        .extend(walletActions),
    );

    await stop();
  },
});
