# viem-deal

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

Easily deal arbitrary amounts of any ERC20 tokens to any account on any `setStorageAt`-compatible network, including in hardhat or anvil-based forks!

The storage slot of the mapping `balanceOf` is brute-forced and the given user's balance is manipulated via `setStorageAt`.

Storage slots are cached at `cache/viem-deal.json` to avoid brute-forcing slots every time.

## Installation

```bash
npm install viem-deal
```

```bash
yarn add viem-deal
```

## Usage

### Testing

```typescript
import { createTestClient, http } from 'viem';
import { foundry } from 'viem/chains';
import { dealActions } from 'viem-deal';

const client = createTestClient({
  mode: 'anvil',
  chain: foundry,
  transport: http(),
}).extend(dealActions);

// Deal 100 USDC to test address.
await client.deal({
  erc20: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  amount: parseUnits("100", 6),
});
```


[build-img]: https://github.com/rubilmax/viem-deal/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/rubilmax/viem-deal/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/viem-deal
[downloads-url]: https://www.npmtrends.com/viem-deal
[npm-img]: https://img.shields.io/npm/v/viem-deal
[npm-url]: https://www.npmjs.com/package/viem-deal
[issues-img]: https://img.shields.io/github/issues/rubilmax/viem-deal
[issues-url]: https://github.com/rubilmax/viem-deal/issues
[codecov-img]: https://codecov.io/gh/rubilmax/viem-deal/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/rubilmax/viem-deal
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
