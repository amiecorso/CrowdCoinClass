const path = require("path");
const solc = require("solc");
const fs = require("fs-extra"); // community made module

// delete entire build folder
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath); // one of the extra methods in fs-extra

// read 'Campaign.sol' from the 'contracts' folder
const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf8");

// compile both contracts with solidity compiler
const output = solc.compile(source, 1).contracts;

// write output to the 'build' directory
fs.ensureDirSync(buildPath);

for (let contract in output) {
  // iterate over keys in object
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    output[contract]
  );
}
