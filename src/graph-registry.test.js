import GraphRegistry from './graph-registry'
import GraphRegistryContract from '../build/contracts/GraphRegistry.json'
import { web3, deployContract } from './test-utils'

let r

beforeAll(async () => {
  let contract = await deployContract(GraphRegistryContract)
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
