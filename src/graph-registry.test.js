import Ganache from 'ganache-core'
import Web3 from 'web3'

import GraphRegistry from './graph-registry'
import GraphRegistryContract from '../build/contracts/GraphRegistry.json'

const provider = Ganache.provider({})
const web3 = new Web3(provider)
let contract
let accounts
let r

beforeAll(async () => {
  accounts = await web3.eth.getAccounts()
  let abi = GraphRegistryContract.abi
  let bytecode = GraphRegistryContract.bytecode
  let graphRegistryContract = new web3.eth.Contract(abi)
  let gas = await graphRegistryContract.deploy({ data: bytecode }).estimateGas({ from: accounts[0] })
  contract = await graphRegistryContract.deploy({ data: bytecode }).send({ from: accounts[0], gas })
  r = new GraphRegistry(web3, contract)
})

test('should instantiate', () => {
  expect(typeof r).toBe('object')
  expect(r.contract).toBeDefined()
})

test('should have default graph initially', async () => {
  let c = await r.getGraphsCount()
  expect(c).toBe(1)

  let n = await r.getGraphName(0)
  expect(n).toBe('default')

  let graphs = await r.getGraphs()
  expect(graphs).toHaveLength(1)
  expect(graphs[0]).toBe('default')
})

test('should return graph contract', async () => {
  let g = await r.getGraph('default')
  expect(typeof g).toBe('object')
  expect(g).toHaveProperty('contract')
})

test('should add new graph', async () => {
  let g = await r.newGraph('test')
  expect(typeof g).toBe('object')
  expect(g).toHaveProperty('contract')

  let graphs = await r.getGraphs()
  expect(graphs).toHaveLength(2)
  expect(graphs[1]).toBe('test')
})
