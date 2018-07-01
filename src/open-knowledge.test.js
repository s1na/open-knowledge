import OpenKnowledge from './open-knowledge'

test('instantiates an object', () => {
  let ok = new OpenKnowledge(null, null)
  expect(ok.ipfs).toBeNull()
})
