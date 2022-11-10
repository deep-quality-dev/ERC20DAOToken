import { ethers, run } from 'hardhat';
import { NomicLabsHardhatPluginError } from 'hardhat/plugins';
import { config } from './config';

async function main() {

  const TokenERC20DAOTokenFactory = await ethers.getContractFactory(
    'TokenERC20DAOToken'
  );
  const tokenERC20DAOToken = await TokenERC20DAOTokenFactory.deploy(
    config.name,
    config.symbol,
    config.decimals
  );

  await tokenERC20DAOToken.deployed();

  console.log(
    `TokenERC20DAOToken was deployed to ${tokenERC20DAOToken.address}`
  );

  try {
    console.log('\n>>>>>>>>>>>> Verification >>>>>>>>>>>>\n');

    console.log('Verifying: ', tokenERC20DAOToken.address);
    await run('verify:verify', {
      address: tokenERC20DAOToken.address,
      constructorArguments: [config.name, config.symbol, config.decimals],
    });
  } catch (error) {
    if (
      error instanceof NomicLabsHardhatPluginError &&
      error.message.includes('Reason: Already Verified')
    ) {
      console.log('Already verified, skipping...');
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
