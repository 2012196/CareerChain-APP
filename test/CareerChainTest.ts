import { expect } from "chai"
import { ethers } from "hardhat"
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

describe("CareerChain", function () {
  async function deployContractFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners()
    const careerContract = await ethers.deployContract("CareerChain", [owner.address])

    return { careerContract, owner, addr1, addr2 }
  }

  it("Deploy contract", async function () {
    const { careerContract } = await loadFixture(deployContractFixture)
    expect(careerContract.getAddress()).exist
  })
})
