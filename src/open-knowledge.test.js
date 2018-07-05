import Ganache from 'ganache-core'
import Web3 from 'web3'

import OpenKnowledge from './open-knowledge'
import GraphRegistry from './graph-registry'
import GraphRegistryContract from '../build/contracts/GraphRegistry.json'
import ipfs from './ipfs-mem'

let registry
let ok

beforeAll(async () => {
  await ipfs.dag.init()

  const provider = Ganache.provider({})
  const web3 = new Web3(provider)
  let accounts = await web3.eth.getAccounts()
  let graphRegistryContract = new web3.eth.Contract(GraphRegistryContract.abi)
  let gas = await graphRegistryContract.deploy({ data: GraphRegistryContract.bytecode }).estimateGas({ from: accounts[0] })
  let contract = await graphRegistryContract.deploy({ data: GraphRegistryContract.bytecode }).send({ from: accounts[0], gas })
  gas = await contract.methods.initialize().estimateGas({ from: accounts[0] })
  await contract.methods.initialize().send({ from: accounts[0], gas })
  registry = new GraphRegistry(web3, contract)
  ok = new OpenKnowledge(ipfs, registry)
  await ok.init()
})

test('should instantiate', async () => {
  expect(typeof ok).toBe('object')
})

test('should have default graph manager', async () => {
  let m = await ok.getGraphManager('default')
  expect(typeof m).toBe('object')

  let managers = await ok.getGraphs()
  expect(managers).toHaveProperty('default')
  expect(managers.default).toHaveProperty('graph')
})

test('should add new graph manager', async () => {
  let m = await ok.newGraphManager('test')
  expect(typeof m).toBe('object')
  expect(m).toHaveProperty('graph')

  let managers = await ok.getGraphs()
  expect(managers).toHaveProperty('test')
})
