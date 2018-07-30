const Graph = artifacts.require('Graph')
const Web3 = require('web3')
const web3 = new Web3()

contract('Graph', async (accounts) => {
  let defaultG

  before(async () => {
    defaultG = await Graph.new()
    await defaultG.initialize(accounts[0], 'default')
  })

  it('should have msg.sender as owner', async () => {
    let owner = await defaultG.owner.call()
    assert.equal(owner, accounts[0])
  })

  it('should have default id', async () => {
    let hex = await defaultG.id.call()
    let id = web3.utils.hexToUtf8(hex)
    assert.equal(id, 'default')
  })

  it('should have default root', async () => {
    let root = await defaultG.root.call()
    assert.equal(root, '0x017112200d511ee9a3ab4e52e8e2bc40fd2669d9c44b89164107e9898cd9698c1506c5aa')
  })

  it('should have empty diff', async () => {
    let diff = await defaultG.diff.call()
    assert.equal(diff, '0x')
  })

  it('should have version 0', async () => {
    let version = await defaultG.version.call()
    assert.equal(version, 0)
  })

  it('should set root correctly', async () => {
    let hex = '0x01711220c19a797fa1fd590cd2e5b42d1cf5f246e29b91684e2f87404b81dc345c7a56a0'
    let tx = await defaultG.setRoot(hex)
    assert.isNotNull()
    assert.nestedInclude(tx, { 'logs[0].args.root': hex })

    let root = await defaultG.root.call()
    assert.equal(root, hex)

    let version = await defaultG.version.call()
    assert.equal(version, 1)
  })

  it('should set diff', async () => {
    let hex = '0x0171122066f042697de42d72f8585d2138ecaa903c4913d57ab15653a049e7a0835fca1c'
    let tx = await defaultG.setDiff(hex)
    assert.isNotNull()
    assert.nestedInclude(tx, { 'logs[0].args.diff': hex })

    let diff = await defaultG.diff.call()
    assert.equal(diff, hex)
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

  it('should check owner when setting diff', async () => {
    let hex = '0x0171122066f042697de42d72f8585d2138ecaa903c4913d57ab15653a049e7a0835fca1c'
    try {
      await defaultG.setDiff(hex, { from: accounts[1] })
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
