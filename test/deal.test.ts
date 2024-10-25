import { http, createTestClient, erc20Abi, parseEther, parseUnits } from "viem";
import { describe, expect } from "vitest";
import { dealActions } from "../src/dealActions";
import { testAccount } from "./fixtures";
import { test } from "./setup";

const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const aave = "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9";
const crv = "0xd533a949740bb3306d119cc777fa900ba034cd52";
const cbEth = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const maDai = "0x36F8d0D0573ae92326827C4a82Fe4CE4C244cAb6";
const usd0 = "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0";
const stEth = "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84";

describe("deal", () => {
  test("should deal USDC", async ({ client }) => {
    const expected = parseUnits("100", 6);

    expect(
      await client.readContract({
        abi: erc20Abi,
        address: usdc,
        functionName: "balanceOf",
        args: [client.account.address],
      }),
    ).not.toEqual(expected);

    await client.deal({
      erc20: usdc,
      amount: expected,
    });

    const balance = await client.readContract({
      abi: erc20Abi,
      address: usdc,
      functionName: "balanceOf",
      args: [client.account.address],
    });

    expect(balance).toEqual(expected);
  });

  test("should deal USDC without account", async ({ client }) => {
    const expected = parseUnits("100", 6);

    expect(
      await client.readContract({
        abi: erc20Abi,
        address: usdc,
        functionName: "balanceOf",
        args: [client.account.address],
      }),
    ).not.toEqual(expected);

    await createTestClient({
      mode: "anvil",
      chain: client.chain,
      transport: http(client.transport.url, client.transport),
    })
      .extend(dealActions)
      .deal({
        erc20: usdc,
        account: client.account,
        amount: expected,
      });

    const balance = await client.readContract({
      abi: erc20Abi,
      address: usdc,
      functionName: "balanceOf",
      args: [client.account.address],
    });

    expect(balance).toEqual(expected);
  });

  test("should deal AAVE", async ({ client }) => {
    const expected = parseUnits("100", 18);
    const account = testAccount(1);

    expect(
      await client.readContract({
        abi: erc20Abi,
        address: aave,
        functionName: "balanceOf",
        args: [account.address],
      }),
    ).not.toEqual(expected);

    await client.deal({
      erc20: aave,
      account,
      amount: expected,
    });

    const balance = await client.readContract({
      abi: erc20Abi,
      address: aave,
      functionName: "balanceOf",
      args: [account.address],
    });

    expect(balance).toEqual(expected);
  });

  test("should deal CRV (vyper)", async ({ client }) => {
    const expected = parseUnits("100", 18);

    expect(
      await client.readContract({
        abi: erc20Abi,
        address: crv,
        functionName: "balanceOf",
        args: [client.account.address],
      }),
    ).not.toEqual(expected);

    await client.deal({
      erc20: crv,
      account: client.account.address,
      amount: expected,
    });

    const balance = await client.readContract({
      abi: erc20Abi,
      address: crv,
      functionName: "balanceOf",
      args: [client.account.address],
    });

    expect(balance).toEqual(expected);
  });

  test("should deal cbETH (solidity)", async ({ client }) => {
    const expected = parseEther("100");

    expect(
      await client.readContract({
        abi: erc20Abi,
        address: cbEth,
        functionName: "balanceOf",
        args: [client.account.address],
      }),
    ).not.toEqual(expected);

    await client.deal({
      erc20: cbEth,
      account: client.account.address,
      amount: expected,
    });

    const balance = await client.readContract({
      abi: erc20Abi,
      address: cbEth,
      functionName: "balanceOf",
      args: [client.account.address],
    });

    expect(balance).toEqual(expected);
  });

  test("should deal maDAI", async ({ client }) => {
    const expected = parseUnits("100", 18);

    expect(
      await client.readContract({
        abi: erc20Abi,
        address: maDai,
        functionName: "balanceOf",
        args: [client.account.address],
      }),
    ).not.toEqual(expected);

    await client.deal({
      erc20: maDai,
      account: client.account.address,
      amount: expected,
    });

    const balance = await client.readContract({
      abi: erc20Abi,
      address: maDai,
      functionName: "balanceOf",
      args: [client.account.address],
    });

    expect(balance).toEqual(expected);
  });

  test("should deal USD0", async ({ client }) => {
    const expected = parseUnits("1000", 18);

    expect(
      await client.readContract({
        abi: erc20Abi,
        address: usd0,
        functionName: "balanceOf",
        args: [client.account.address],
      }),
    ).not.toEqual(expected);

    await client.deal({
      erc20: usd0,
      account: client.account.address,
      amount: expected,
    });

    const balance = await client.readContract({
      abi: erc20Abi,
      address: usd0,
      functionName: "balanceOf",
      args: [client.account.address],
    });

    expect(balance).toEqual(expected);
  });

  test.skip("should not deal stETH", async ({ client }) => {
    await expect(
      client.deal({
        erc20: stEth,
        account: client.account.address,
        // From 0-5, test fails because the algorithm overwrites another storage slot of stETH (the one that stores the value of shares),
        // which makes it work... with unexpected side effects!!
        amount: 5n,
      }),
    ).rejects.toThrow(`Could not deal ERC20 tokens: cannot find valid "balanceOf" storage slot for "${stEth}"`);
  });
});
