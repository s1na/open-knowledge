import Store from './store'
import ipfs from './ipfs-mem'

const root = 'zdpuAmKRXTRNSgwSgXqPDP2FuxVeduNMtM113oGDeUDEoKuA1'

beforeAll(async () => { await ipfs.dag.init() })

test('should instantiate', async () => {
  let s = new Store(ipfs, root)
  expect(s.dag).toBeDefined()
})

test('should be empty initially', async () => {
  let s = new Store(ipfs, root)
  let res = await s.getTriples(null, null, null)
  expect(res).toHaveLength(0)
})

test('should add triples', async () => {
  let s = new Store(ipfs, root)
  let cid = await s.addTriples([['s', 'p', 'o']])
  expect(typeof cid).toBe('string')

  s.setRoot(cid)

  let res = await s.getTriples(null, null, null)
  expect(res).toHaveLength(1)
  expect(res[0]).toEqual(['s', 'p', 'o'])
})
