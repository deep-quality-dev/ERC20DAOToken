import { ethers, run } from "hardhat";
import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { config } from "./config";

async function main() {
  const ERC20DAOTokenFactory = await ethers.getContractFactory(
    "ERC20DAOToken"
  );
  const erc20DAOToken = await ERC20DAOTokenFactory.deploy(
    config.name,
    config.symbol,
    config.decimals
  );

  await erc20DAOToken.deployed();

  console.log(
    `ERC20DAOToken was deployed to ${erc20DAOToken.address}`
  );

  try {
    console.log("\n>>>>>>>>>>>> Verification >>>>>>>>>>>>\n");

    console.log("Verifying: ", erc20DAOToken.address);
    await run("verify:verify", {
      address: erc20DAOToken.address,
      constructorArguments: [config.name, config.symbol, config.decimals],
    });
  } catch (error) {
    if (
      error instanceof NomicLabsHardhatPluginError &&
      error.message.includes("Reason: Already Verified")
    ) {
      console.log("Already verified, skipping...");
    } else {
      console.error(error);
    }
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
