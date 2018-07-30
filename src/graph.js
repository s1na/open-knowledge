'use strict'

import CID from 'cids'
import _ from 'lodash'

export default class Graph {
  constructor (web3, contract, version = null) {
    this.web3 = web3
    this.contract = contract
    this.v = version
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

  async id () {
    let hex = await this.contract.methods.id().call()
    let id = this.web3.utils.hexToUtf8(hex)
    return id
  }

  async setId (id) {
    let coinbase = await this.web3.eth.getCoinbase()
    let owner = await this.owner()
    if (coinbase.toLowerCase() !== owner.toLowerCase()) {
      console.log('Coinbase account does not own Graph contract')
      return null
    }

    let hex = this.web3.utils.utf8ToHex(id)
    let tx
    try {
      tx = await this.contract.methods.setId(hex).send({ from: coinbase })
    } catch (e) {
      console.log(e)
      return null
    }

    return tx
  }

  async root () {
    if (this.v !== null) {
      let roots = await this.getPastRoots(this.v)
      if (roots.length !== 1) {
        throw new Error('Couldn\'t find root for corresponding version of graph')
      }

      return roots[0]
    }

    let hex = await this.contract.methods.root().call()
    return this._hexToCID(hex)
  }

  async setRoot (cid) {
    if (this.v !== null) {
      throw new Error('Updating root of previous versions is not allowed')
    }

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

  async getPastRoots (version = null) {
    let searchParams = { fromBlock: 0, toBlock: 'latest' }
    if (version !== null && Number.isInteger(version)) {
      searchParams.filter = { version: [version] }
    }

    let events = await this.contract.getPastEvents('RootUpdated', searchParams)
    let roots = _.map(events, (e) => this._hexToCID(e.returnValues.root))
    return roots
  }

  async diff () {
    let hex = await this.contract.methods.diff().call()
    return this._hexToCID(hex)
  }

  async setDiff (cid) {
    if (this.v !== null) {
      throw new Error('Updating diff of previous versions is not allowed')
    }

    let coinbase = await this.web3.eth.getCoinbase()
    let owner = await this.owner()
    if (coinbase.toLowerCase() !== owner.toLowerCase()) {
      console.log('Coinbase account does not own Graph contract')
      return null
    }

    let hex = this._cidToHex(cid)
    let tx
    try {
      tx = await this.contract.methods.setDiff(hex).send({ from: coinbase })
    } catch (e) {
      console.log(e)
      return null
    }

    return tx
  }

  async getPastDiffs () {
    let events = await this.contract.getPastEvents('DiffUpdated', { fromBlock: 0, toBlock: 'latest' })
    let diffs = _.map(events, (e) => this._hexToCID(e.returnValues.diff))
    return diffs
  }

  async version () {
    if (this.v !== null) {
      return this.v
    }

    let v = await this.contract.methods.version().call()
    return parseInt(v)
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
