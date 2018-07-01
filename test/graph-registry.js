const GraphRegistry = artifacts.require('GraphRegistry')
const Web3 = require('web3')
const web3 = new Web3()

contract('GraphRegistry', async (accounts) => {
  let inst

  before(async () => {
    inst = await GraphRegistry.deployed()
  })

  it('should have msg.sender as owner', async () => {
    let o = await inst.owner()
    assert.equal(o, accounts[0])
  })

  it('should contain one graph', async () => {
    let c = await inst.getGraphsCount()
    assert.equal(c, 1)
  })

  it('should create default graph', async () => {
    let defaultG = await inst.graphs.call('default')
    assert.notEqual(defaultG, '0x0000000000000000000000000000000000000000')
  })

  it('should have default graph in index 0', async () => {
    let hex = await inst.getGraphName(0)
    let name = web3.utils.hexToUtf8(hex)
    assert.equal(name, 'default')
  })

  it('should create new graph', async () => {
    let tx = await inst.newGraph('test', { from: accounts[0] })
    let addr = tx.logs[0].args.addr

    let res = await inst.graphs.call('test')
    assert.equal(addr, res)

    let c = await inst.getGraphsCount()
    assert.equal(c, 2)

    let hex = await inst.getGraphName(1)
    let name = web3.utils.hexToUtf8(hex)
    assert.equal(name, 'test')
  })

  it('shouldnt overwrite existing', async () => {
    try {
      let tx = await inst.newGraph('test', { from: accounts[1] })
      assert.fail('Expected revert not received')
    } catch (e) {
      const revertFound = e.message.search('revert') >= 0
      assert(revertFound, `Expected "revert", got ${e} instead`)
    }
  })

  it('should be able to transfer ownership', async () => {
    let tx = await inst.transferOwnership(accounts[1])
    let o = await inst.owner()
    assert.equal(o, accounts[1])
  })
})
