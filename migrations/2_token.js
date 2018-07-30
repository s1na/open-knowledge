/* global artifacts */

const OKT = artifacts.require('./OpenKnowledgeToken.sol')

module.exports = (deployer) => {
  return deployer.deploy(OKT)
}
