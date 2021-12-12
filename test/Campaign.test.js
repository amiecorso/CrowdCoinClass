const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods
    .createCampaign("100")
    .send({ from: accounts[0], gas: "1000000" });

  const [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a factory and a campaign", () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(manager, accounts[0]);
  });

  it("allows people to contribute money and marks them as approvers", async () => {
    const contributor = accounts[1];
    await campaign.methods
      .contribute()
      .send({ from: contributor, gas: "1000000", value: "200" });
    assert.equal(await campaign.methods.approvers(contributor).call(), true);
  });

  it("requires a minimum contribution amount", async () => {
    try {
      await campaign.methods
        .contribute()
        .send({ from: accounts[1], value: "99" });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("allows a manager to make a payment request", async () => {
    await campaign.methods
      .createRequest("Test payment request", "100", accounts[1])
      .send({ from: accounts[0], gas: "1000000" });
    const request = await campaign.methods.requests(0).call();
    assert.equal("Test payment request", request.description);
  });

  it("processes requests", async () => {
    // get starting balance of accounts[1] (which will receive the payout of request)
    let startingBalance = await web3.eth.getBalance(accounts[1]);
    startingBalance = web3.utils.fromWei(startingBalance, "ether");
    startingBalance = parseFloat(startingBalance);

    // get a contributor
    await campaign.methods.contribute().send({
      from: accounts[0],
      gas: "1000000",
      value: web3.utils.toWei("10", "ether"),
    });

    // create request
    await campaign.methods
      .createRequest(
        "Test payment request",
        web3.utils.toWei("5", "ether"),
        accounts[1]
      )
      .send({ from: accounts[0], gas: "1000000" });

    // approve the request
    await campaign.methods
      .approveRequest(0)
      .send({ from: accounts[0], gas: "1000000" });

    // finalize the request
    await campaign.methods
      .finalizeRequest(0)
      .send({ from: accounts[0], gas: "1000000" });

    const request = await campaign.methods.requests(0).call();

    assert.equal(true, request.complete);

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, "ether");
    balance = parseFloat(balance);

    assert(balance > startingBalance);
  });

  // More test ideas:
  // finalize a test without it being fully approved
});
