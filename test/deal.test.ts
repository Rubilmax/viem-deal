import { erc20Abi, parseUnits } from "viem";
import { describe, expect } from "vitest";
import { test } from "./setup.js";

const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const aave = "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9";
const crv = "0xd533a949740bb3306d119cc777fa900ba034cd52";
const cbEth = "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704";
const maDai = "0x36F8d0D0573ae92326827C4a82Fe4CE4C244cAb6";

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
      recipient: client.account.address,
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

    expect(
      await client.readContract({
        abi: erc20Abi,
        address: aave,
        functionName: "balanceOf",
        args: [client.account.address],
      }),
    ).not.toEqual(expected);

    await client.deal({
      erc20: aave,
      recipient: client.account.address,
      amount: expected,
    });

    const balance = await client.readContract({
      abi: erc20Abi,
      address: aave,
      functionName: "balanceOf",
      args: [client.account.address],
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
      recipient: client.account.address,
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
    const expected = parseUnits("100", 18);

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
      recipient: client.account.address,
      amount: expected,
      storageType: "solidity",
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
      recipient: client.account.address,
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

  test("should not deal USD0", async ({ client }) => {
    await expect(
      client.deal({
        erc20: "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0",
        recipient: client.account.address,
        amount: 1n,
        maxSlot: 10,
      }),
    ).rejects.toThrow(
      `Could not deal ERC20 tokens: cannot brute-force "balanceOf" storage slot at "0x35D8949372D46B7a3D5A56006AE77B215fc69bC0"`,
    );
  });
});
