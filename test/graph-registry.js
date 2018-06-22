const GraphRegistry = artifacts.require('GraphRegistry')

contract('GraphRegistry', async (accounts) => {
  it('should create default graph', async () => {
    let inst = await GraphRegistry.deployed()
    let defaultG = await inst.graphs.call('default')
    assert.notEqual(defaultG, '0x0000000000000000000000000000000000000000')
  })

  it('should create new graph', async () => {
    let inst = await GraphRegistry.deployed()
    let tx = await inst.newGraph('test', { from: accounts[0] })
    let addr = tx.logs[0].args.addr

    let res = await inst.graphs.call('test')
    assert.equal(addr, res)
  })

  it('shouldnt overwrite existing', async () => {
    let inst = await GraphRegistry.deployed()
    try {
      let tx = await inst.newGraph('test', { from: accounts[1] })
      assert.fail('Expected revert not received')
    } catch (e) {
      const revertFound = e.message.search('revert') >= 0
      assert(revertFound, `Expected "revert", got ${e} instead`)
    }
  })
})
