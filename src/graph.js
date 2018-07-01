'use strict'

import CID from 'cids'

export default class Graph {
  constructor (web3, contract) {
    this.web3 = web3
    this.contract = contract
  }

  async owner () {
    let o = await this.contract.methods.owner().call()
    return o.toLowerCase()
  }

  async isOwner () {
    let o = await this.owner()
    let coinbase = await this.web3.eth.getCoinbase()
    return o === coinbase.toLowerCase()
  }

  async root () {
    let hex = await this.contract.methods.root().call()
    return this._hexToCID(hex)
  }

  async setRoot (cid) {
    let coinbase = await this.web3.eth.getCoinbase()
    let owner = await this.owner()
    if (coinbase.toLowerCase() !== owner.toLowerCase()) {
      console.log('Coinbase account does not own Graph contract')
      return null
    }

    let hex = this._cidToHex(cid)
    let tx
    try {
      tx = await this.contract.methods.setRoot(hex).send({ from: coinbase })
    } catch (e) {
      console.log(e)
      return null
    }

    return tx
  }

  onRootUpdated (cb) {
    this.rootUpdatedSub = this.contract.events.RootUpdated()
    this.rootUpdatedSub.on('data', (ev) => {
      cb(this._hexToCID(ev.returnValues.root))
    })
  }

  _hexToCID (h) {
    let c = new CID('f' + h.slice(2))
    return c.toBaseEncodedString()
  }

  _cidToHex (s) {
    let c = new CID(s)
    let h = c.toBaseEncodedString('base16')
    return '0x' + h.slice(1)
  }
}
