# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.4.6](https://github.com/antwika/store/compare/v0.4.5...v0.4.6) (2022-08-23)


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.23 ([0088787](https://github.com/antwika/store/commit/0088787bf4f63b4f0eebd01af44941bdf561257f))
* **deps:** update dependency @antwika/lock to ^0.0.10 ([0999292](https://github.com/antwika/store/commit/099929214a2c016250a53edc01767307926ab171))

## [0.4.5](https://github.com/antwika/store/compare/v0.4.4...v0.4.5) (2022-08-16)


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.22 ([312600d](https://github.com/antwika/store/commit/312600d4c39571dbde0f0bd56a622b7b6f1c1164))
* **deps:** update dependency @antwika/lock to ^0.0.9 ([985edd6](https://github.com/antwika/store/commit/985edd6b620999c4dd591203893bfc4526638713))

## [0.4.4](https://github.com/antwika/store/compare/v0.4.3...v0.4.4) (2022-08-09)


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.21 ([04e7e03](https://github.com/antwika/store/commit/04e7e0309d9f90698ed12aace61a5bed02b882f2))
* **deps:** update dependency @antwika/lock to ^0.0.8 ([8b9f8eb](https://github.com/antwika/store/commit/8b9f8eb0109a97eccd17b4be52a9758a8efbe7b7))

## [0.4.3](https://github.com/antwika/store/compare/v0.4.2...v0.4.3) (2022-08-02)


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.20 ([5e30014](https://github.com/antwika/store/commit/5e300147999dfed6adeaf1a88ba318ca8b310cd5))
* **deps:** update dependency @antwika/lock to ^0.0.7 ([36bec79](https://github.com/antwika/store/commit/36bec79739b86aeb63d7d106882be0a65d51a2ee))

## [0.4.2](https://github.com/antwika/store/compare/v0.4.1...v0.4.2) (2022-07-26)

## [0.4.1](https://github.com/antwika/store/compare/v0.4.0...v0.4.1) (2022-07-25)


### Features

* **deps:** use @antwika/lock module ([0c4628d](https://github.com/antwika/store/commit/0c4628d358da1f9cd51260c8fe563cbadcbbe9c6))
* leverage TicketLock for keeping track of locks/tickets ([2f3e23e](https://github.com/antwika/store/commit/2f3e23ef3ed15c3b8980c3e51a30f9c85843a783))
* LockablePartitionStore ([f9a1af3](https://github.com/antwika/store/commit/f9a1af3e1d549b0fb4e61be4dcad78e4d36eb5e2))
* LockableStore ([53e0520](https://github.com/antwika/store/commit/53e05201986dfb701a370c116625802b95e85be0))


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.19 ([92388ed](https://github.com/antwika/store/commit/92388ed457c167e6d5f0b4afc22fc0d01946a358))
* remove duplication ([13c0cd5](https://github.com/antwika/store/commit/13c0cd563b83b36671cf1da072327893d401316c))

## [0.4.0](https://github.com/antwika/store/compare/v0.3.1...v0.4.0) (2022-07-19)


### ⚠ BREAKING CHANGES

* removed deprecated utility function "ensureHex".
* removed deprecated type "Data" from module "IStore".
* removed deprecated function "create" from interface "IStore".

### Features

* removed deprecated function "create" from interface "IStore". ([2e005ec](https://github.com/antwika/store/commit/2e005ecee0ef221c8800d45fd733d14ecb85e78b))
* removed deprecated type "Data" from module "IStore". ([1b031bb](https://github.com/antwika/store/commit/1b031bb3cf53dede3454a009bb29731c0e945c8b))
* removed deprecated utility function "ensureHex". ([310fdf6](https://github.com/antwika/store/commit/310fdf6ab4f772c2770c1f5e9c636d049ff8abaa))


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.18 ([35ad312](https://github.com/antwika/store/commit/35ad3124d726d3bb1537e9d876f8ed8adf340c5e))

## [0.3.1](https://github.com/antwika/store/compare/v0.3.0...v0.3.1) (2022-07-12)


### Bug Fixes

* add missing MongoDbConnection type ([76ab928](https://github.com/antwika/store/commit/76ab928e431fa97649d320e3ff71629ad4bde02e))

## [0.3.0](https://github.com/antwika/store/compare/v0.2.1...v0.3.0) (2022-07-12)


### ⚠ BREAKING CHANGES

* MongoDbStore now internally maps to "_id"(ObjectId), the store also try to convert non-hex into hex with length 24.

### Features

* **deps:** use @antwika/standard-version ([66914a0](https://github.com/antwika/store/commit/66914a0049b8f18975d9439019d76e55e1f4c694))
* MongoDbStore now internally maps to "_id"(ObjectId), the store also try to convert non-hex into hex with length 24. ([7de45d4](https://github.com/antwika/store/commit/7de45d4eff40c38c5f6ca5de39b1ae8d93d9a131))
* new store type: IPartitionStore. ([52ddd6f](https://github.com/antwika/store/commit/52ddd6fcd32ad14435d6a259d22d8e9dd0ed27b9))
* release every Tuesday at 12:15 UTC ([0c71acf](https://github.com/antwika/store/commit/0c71acf31046397dfb4d1f4ecf8dc2d6b3f4eff8))
* script for typedoc generation ([0b8b425](https://github.com/antwika/store/commit/0b8b42541a4a0c47a7a8e79c531a9261870319db))


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.13 ([0993f2d](https://github.com/antwika/store/commit/0993f2d47fd667c0f4baca931e958962d1afce24))
* **deps:** update dependency @antwika/common to v0.0.16 ([39c34fe](https://github.com/antwika/store/commit/39c34fe184f3d513d367d2dd85e5a767bab2e3a9))
* **deps:** update dependency @antwika/common to v0.0.17 ([c239712](https://github.com/antwika/store/commit/c23971234778d1e46b9ec712aaad4f71701f7102))

### [0.2.1](https://github.com/antwika/store/compare/v0.2.0...v0.2.1) (2022-06-26)


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.12 ([8aa774a](https://github.com/antwika/store/commit/8aa774af85603af9df55385ed8ac6b0693507853))

## [0.2.0](https://github.com/antwika/store/compare/v0.0.4...v0.2.0) (2022-06-11)


### ⚠ BREAKING CHANGES

* protocol must now be specified when instantiating a MongoDbStore

### Features

* protocol must now be specified when instantiating a MongoDbStore ([f22e5c4](https://github.com/antwika/store/commit/f22e5c43a3671811431aa7cd72d44661cfb30d4e))


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.11 ([67d0f71](https://github.com/antwika/store/commit/67d0f71b7740f6df4abefc07860839643f1385a6))

## [0.1.0](https://github.com/antwika/store/compare/v0.0.4...v0.1.0) (2022-06-06)


### ⚠ BREAKING CHANGES

* protocol must now be specified when instantiating a MongoDbStore

### Features

* protocol must now be specified when instantiating a MongoDbStore ([f22e5c4](https://github.com/antwika/store/commit/f22e5c43a3671811431aa7cd72d44661cfb30d4e))

### [0.0.4](https://github.com/antwika/store/compare/v0.0.3...v0.0.4) (2022-06-05)


### Bug Fixes

* export MemoryStore ([ff3be19](https://github.com/antwika/store/commit/ff3be19eb76a0508c0960ebbc67990faab0137e4))

### [0.0.3](https://github.com/antwika/store/compare/v0.0.2...v0.0.3) (2022-06-05)


### Features

* MemoryStore ([f9c4a44](https://github.com/antwika/store/commit/f9c4a44cb6d08ebf183739812f0e24eaafe53fc9))

### [0.0.2](https://github.com/antwika/store/compare/v0.0.1...v0.0.2) (2022-06-05)


### Features

* add connect method to IStore interface ([e97c832](https://github.com/antwika/store/commit/e97c83242780d03398f6755618773532013c5573))


### Bug Fixes

* **deps:** update dependency @antwika/common to v0.0.9 ([ae7f7e8](https://github.com/antwika/store/commit/ae7f7e895be81259d4d837c980d5e3b4a8c72025))

### 0.0.1 (2022-05-29)


### Features

* initial commit ([3a1327e](https://github.com/antwika/store/commit/3a1327e3ad8188f367d954f1a933f0d6fe8c403c))


### Bug Fixes

* use in-memory mongodb database for tests ([be23f56](https://github.com/antwika/store/commit/be23f56e4e56c39cbe44cae6bedcfbc04df9b41d))
