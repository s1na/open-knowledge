import ipfs from './ipfs-mem'

beforeAll(async () => {
  await ipfs.dag.init()
})

test('it should instantiate', () => {
  expect(ipfs).toHaveProperty('dag')
  expect(ipfs.dag).toHaveProperty('get')
  expect(ipfs.dag).toHaveProperty('put')
  expect(ipfs.dag.ipld).toBeDefined()
})

test('should put and get object', async () => {
  let cid = await ipfs.dag.put({ test: true })
  let res = await ipfs.dag.get(cid)
  expect(res.value).toEqual({ test: true })
})
