/* global artifacts */

const DLL = artifacts.require('dll/DLL.sol')
const AttributeStore = artifacts.require('attrstore/AttributeStore.sol')
const RegistryFactory = artifacts.require('tcr/RegistryFactory.sol')
const ParameterizerFactory = artifacts.require('tcr/ParameterizerFactory.sol')
const OKT = artifacts.require('./OpenKnowledgeToken.sol')

module.exports = (deployer) => {
  // link libraries
  deployer.link(DLL, RegistryFactory)
  deployer.link(AttributeStore, RegistryFactory)

  return deployer.deploy(RegistryFactory, ParameterizerFactory.address).then(function (instance) {
    let params = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
    return instance.newRegistryBYOToken(OKT.address, params, 'OpenKnowledge').then(function (tx) {
      console.log(tx.logs[0].args)
    })
  })
}
