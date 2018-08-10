'use strict'

import Graph from './graph'
import GraphContract from '../build/contracts/Graph.json'

export default class Registry {
  constructor (web3, tcr) {
    this.web3 = web3
    this.tcr = tcr
  }

  async init () {
    await this.tcr.init()
  }

  async newGraph (name) {
    let contract = new this.web3.eth.Contract(GraphContract.abi)
    let gas = await contract.deploy({ data: GraphContract.bytecode }).estimateGas({ from: this.web3.eth.defaultAccount })
    contract = await contract.deploy({ data: GraphContract.bytecode }).send({ from: this.web3.eth.defaultAccount, gas })
    const graph = new Graph(this.web3, contract)
    await graph.initialize(this.web3.eth.defaultAccount, name)
    return graph
  }

  async apply (graph, amount) {
    const id = await graph.id()
    const hash = this.web3.utils.sha3(id)
    const listing = await this.tcr.apply(hash, amount, graph.contract.options.address, { from: this.web3.eth.defaultAccount })
    return listing
  }

  async getListing (graph) {
    const id = await graph.id()
    const hash = this.web3.utils.sha3(id)
    const listing = await this.tcr.getListing(hash)
    return listing
  }

  async getGraph (name) {
    const hash = this.web3.utils.sha3(name)
    const listing = await this.tcr.getListing(hash)
    if (!listing || !listing.whitelisted) {
      throw new Error('Listing is not in the registry')
    }

    const addr = listing.data
    const graph = this.getGraphFromAddr(addr)
    const graphId = await graph.id()
    if (graphId !== name) {
      throw new Error('The listing data has a different id')
    }

    return graph
  }

  getGraphFromAddr (addr) {
    let contract = new this.web3.eth.Contract(GraphContract.abi, addr)
    const graph = new Graph(this.web3, contract)
    return graph
  }
}
