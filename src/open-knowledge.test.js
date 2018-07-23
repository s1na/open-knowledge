import OpenKnowledge from './open-knowledge'
import GraphRegistry from './graph-registry'
import GraphRegistryContract from '../build/contracts/GraphRegistry.json'
import ipfs from './ipfs-mem'
import { web3, deployContract } from './test-utils'

let ok

beforeAll(async () => {
  await ipfs.dag.init()

  let contract = await deployContract(GraphRegistryContract)
  let registry = new GraphRegistry(web3, contract)
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

test('should add triples for graph', async () => {
  let tx = await ok.addTriples([['s', 'p', 'o']], 'test')
  expect(tx === null).toBe(false)
})

test('should get triple pattern for graph', async () => {
  let res = await ok.getTriples(null, null, null, 'test')
  expect(res).toHaveLength(1)
  expect(res[0]).toEqual(['s', 'p', 'o'])
})

test('should allow getting triples for previous version', async () => {
  let res = await ok.getTriples(null, null, null, 'test:0')
  expect(res).toHaveLength(0)
})
