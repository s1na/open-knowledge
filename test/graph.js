const GraphRegistry = artifacts.require('GraphRegistry')
const Graph = artifacts.require('Graph')

contract('Graph', async (accounts) => {
  let registry
  let defaultG

  before(async () => {
    registry = await GraphRegistry.deployed()
    await registry.initialize()
    let defaultAddr = await registry.graphs.call('default')
    defaultG = await Graph.at(defaultAddr)
  })

  it('should have msg.sender as owner', async () => {
    let owner = await defaultG.owner.call()
    assert.equal(owner, accounts[0])
  })

  it('should have default root', async () => {
    let root = await defaultG.root.call()
    assert.equal(root, '0x017112200d511ee9a3ab4e52e8e2bc40fd2669d9c44b89164107e9898cd9698c1506c5aa')
  })

  it('should have empty diff', async () => {
    let diff = await defaultG.diff.call()
    assert.equal(diff, '0x')
  })

  it('should set root correctly', async () => {
    let hex = '0x01711220c19a797fa1fd590cd2e5b42d1cf5f246e29b91684e2f87404b81dc345c7a56a0'
    await defaultG.setRoot(hex)
    let root = await defaultG.root.call()
    assert.equal(root, hex)
  })

  it('should check owner when setting root', async () => {
    let hex = '0x017112200d511ee9a3ab4e52e8e2bc40fd2669d9c44b89164107e9898cd9698c1506c5aa'
    try {
      await defaultG.setRoot(hex, { from: accounts[1] })
      assert.fail('Expected revert not received')
    } catch (e) {
      const revertFound = e.message.search('revert') >= 0
      assert(revertFound, `Expected "revert", got ${e} instead`)
    }
  })

  it('should be able to transfer ownership', async () => {
    await defaultG.transferOwnership(accounts[1])
    let o = await defaultG.owner()
    assert.equal(o, accounts[1])
  })
})
