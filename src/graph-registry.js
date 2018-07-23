'use strict'

import Graph from './graph'
import { abi as GraphAbi } from '../build/contracts/Graph.json'

export default class GraphRegistry {
  constructor (web3, contract) {
    this.web3 = web3
    this.contract = contract
    this.zeroAddr = '0x0000000000000000000000000000000000000000'
  }

  async getGraphsCount () {
    let c = await this.contract.methods.getGraphsCount().call()
    return parseInt(c)
  }

  async getGraphName (i) {
    let hex = await this.contract.methods.getGraphName(i).call()
    let name = this.web3.utils.hexToUtf8(hex)
    return name
  }

  async getGraphs () {
    let res = []
    let len = await this.getGraphsCount()

    for (let i = 0; i < len; i++) {
      let name = await this.getGraphName(i)
      res.push(name)
    }

    return res
  }

  async getGraph (name, version = null) {
    let hex = this.web3.utils.utf8ToHex(name)
    let addr = await this.contract.methods.graphs(hex).call()
    if (addr === this.zeroAddr) {
      return null
    }

    let contract = new this.web3.eth.Contract(GraphAbi, addr)
    let g = new Graph(this.web3, contract, version)
    return g
  }

  async newGraph (name) {
    let coinbase = await this.web3.eth.getCoinbase()
    let hex = this.web3.utils.utf8ToHex(name)
    let tx
    try {
      let gas = await this.contract.methods.newGraph(hex).estimateGas({ from: coinbase })
      tx = await this.contract.methods.newGraph(hex).send({ from: coinbase, gas })
    } catch (e) {
      console.log(e)
      return null
    }

    let addr = tx.events.NewGraph.returnValues.addr
    let contract = new this.web3.eth.Contract(GraphAbi, addr)
    let g = new Graph(this.web3, contract)
    return g
  }
}
