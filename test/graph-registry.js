const GraphRegistry = artifacts.require('GraphRegistry')

contract('GraphRegistry', async (accounts) => {
  it('should create default graph manager', async () => {
    let inst = await GraphRegistry.deployed()
    let defaultGM = await inst.contracts.call('default')
    assert.notEqual(defaultGM, '0x0000000000000000000000000000000000000000')
  })

  it('should create new graph manager', async () => {
    let inst = await GraphRegistry.deployed()
    let tx = await inst.newGraphManager('test', { from: accounts[0] })
    let addr = tx.logs[0].args.addr

    let res = await inst.contracts.call('test')
    assert.equal(addr, res)
  })

  it('shouldnt overwrite existing', async () => {
    let inst = await GraphRegistry.deployed()
    try {
      let tx = await inst.newGraphManager('test', { from: accounts[1] })
      assert.fail('Expected revert not received')
    } catch (e) {
      const revertFound = e.message.search('revert') >= 0
      assert(revertFound, `Expected "revert", got ${e} instead`)
    }
  })
})
