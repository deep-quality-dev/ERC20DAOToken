import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";

import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TokenERC20DAOToken } from "../typechain-types";

const increaseTime = async (seconds: number) => {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
};

describe("TokenERC20DAOToken", function () {
  let deployer: SignerWithAddress,
    userA: SignerWithAddress,
    userB: SignerWithAddress,
    userC: SignerWithAddress,
    userD: SignerWithAddress,
    userE: SignerWithAddress;

  const tokenName = "DAO",
    tokenSymbol = "DAO";
  let tokenERC20DAOToken: TokenERC20DAOToken;
  let decimals = 18,
    BIG_UNIT: BigNumber;

  beforeEach(async () => {
    [deployer, userA, userB, userC, userD, userE] = await ethers.getSigners();

    const TokenERC20DAOTokenFactory = await ethers.getContractFactory(
      "TokenERC20DAOToken"
    );
    tokenERC20DAOToken = await TokenERC20DAOTokenFactory.deploy(
      tokenName,
      tokenSymbol,
      18
    );
    await tokenERC20DAOToken.deployed();

    decimals = await tokenERC20DAOToken.decimals();
    BIG_UNIT = ethers.BigNumber.from(10).pow(decimals);

    await tokenERC20DAOToken.mint(userA.address, BIG_UNIT.mul(100000));
  });

  describe("Pausable", () => {
    it("Should transfer if not paused", async () => {
      const amount = BIG_UNIT.mul(1000);
      await tokenERC20DAOToken.connect(userA).transfer(userB.address, amount);

      const balanceOfB = await tokenERC20DAOToken.balanceOf(userB.address);
      expect(balanceOfB).to.be.equal(amount);
    });

    it("Should not transfer if paused", async () => {
      await tokenERC20DAOToken.connect(deployer).pause();

      await expect(
        tokenERC20DAOToken
          .connect(userA)
          .transfer(userB.address, BIG_UNIT.mul(1000))
      ).to.be.revertedWith("Pausable: paused");
    });
  });

  describe("TrasnferBulk", () => {
    it("Should transfer to multiple recipients", async () => {
      const amount = BIG_UNIT.mul(100);

      await tokenERC20DAOToken
        .connect(userA)
        .transferBulk(
          [userB.address, userC.address, userD.address, userE.address],
          amount
        );

      for (const user of [userB, userC, userD, userE]) {
        const balanceOf = await tokenERC20DAOToken.balanceOf(user.address);
        expect(balanceOf).to.be.equal(amount);
      }
    });
  });

  describe("Snapshot", () => {
    it("Only allow to get snapshot for owner or authorized user", async () => {
      await tokenERC20DAOToken.connect(deployer).snapshot();

      const snapshotId = await tokenERC20DAOToken.getCurrentSnapshotId();
      console.log("snapshotId", snapshotId);

      await expect(
        tokenERC20DAOToken.connect(userA).snapshot()
      ).to.be.revertedWith("Not authorized to snapshot");

      await tokenERC20DAOToken
        .connect(deployer)
        .authorizeSnapshotter(userA.address);

      await expect(tokenERC20DAOToken.connect(userA).snapshot()).to.be.not
        .reverted;

      const snapshotIdA = await tokenERC20DAOToken.getCurrentSnapshotId();
      console.log("snapshotIdA", snapshotIdA);

      expect(snapshotIdA).to.be.equal(snapshotId.add(1));
    });

    it("Should get balance at snapshot", async () => {
      const expectedSnapshot = [];
      await tokenERC20DAOToken
        .connect(userA)
        .transfer(userB.address, BIG_UNIT.mul(1000));

      let balanceOfA = await tokenERC20DAOToken.balanceOf(userA.address);
      let balanceOfB = await tokenERC20DAOToken.balanceOf(userB.address);

      await tokenERC20DAOToken.connect(deployer).snapshot();
      let snapshotId = await tokenERC20DAOToken.getCurrentSnapshotId();

      expectedSnapshot.push({
        snapshotId,
        balanceOfA,
        balanceOfB,
      });

      await increaseTime(3000);

      await tokenERC20DAOToken
        .connect(userA)
        .transfer(userB.address, BIG_UNIT.mul(1000));

      balanceOfA = await tokenERC20DAOToken.balanceOf(userA.address);
      balanceOfB = await tokenERC20DAOToken.balanceOf(userB.address);

      await tokenERC20DAOToken.connect(deployer).snapshot();
      snapshotId = await tokenERC20DAOToken.getCurrentSnapshotId();

      expectedSnapshot.push({
        snapshotId,
        balanceOfA,
        balanceOfB,
      });

      for (const expected of expectedSnapshot) {
        const balanceOfAAt = await tokenERC20DAOToken.balanceOfAt(
          userA.address,
          expected.snapshotId
        );
        const balanceOfBAt = await tokenERC20DAOToken.balanceOfAt(
          userB.address,
          expected.snapshotId
        );

        expect(expected.balanceOfA).to.be.equal(balanceOfAAt);
        expect(expected.balanceOfB).to.be.equal(balanceOfBAt);
      }
    });
  });
});
