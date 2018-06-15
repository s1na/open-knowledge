import OpenKnowledge from './index'

test('instantiates an object', () => {
  let ok = new OpenKnowledge(null, null, null)
  expect(ok.ipfs).toBeNull();
})
