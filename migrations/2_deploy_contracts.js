const OxidaneToken= artifacts.require("OxidaneToken");
const TokenSale= artifacts.require("TokenSale");
const Kyc= artifacts.require("Kyc");
const Waterexchange= artifacts.require("Waterexchange");
const Watersale=artifacts.require("Watersale");
module.exports = async function(deployer) {
  
  await deployer.deploy(OxidaneToken);
  const token = await OxidaneToken.deployed()


  await deployer.deploy(TokenSale,token.address);
  const tokensale = await TokenSale.deployed()

await token.transfer(tokensale.address,"1000000000000000000000000")
await deployer.deploy(Kyc);
const kyc=await Kyc.deployed();

await deployer.deploy(Waterexchange);
const waterexchange=await Waterexchange.deployed();

await deployer.deploy(Watersale, waterexchange.address,token.address);
const watersale=await Watersale.deployed();
};

