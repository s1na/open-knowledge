'use strict'

import { Parser as SparqlParser } from 'sparqljs'

import GraphManager from './graph-manager'
import { abi as GraphAbi } from '../build/contracts/Graph.json'

export default class OpenKnowledge {
  constructor(ipfs, web3, registry) {
    this.ipfs = ipfs
    this.web3 = web3
    this.registry = registry
    this.graphManagers = {}
    this.emptyGraphCid = 'zdpuAmKRXTRNSgwSgXqPDP2FuxVeduNMtM113oGDeUDEoKuA1'
    this.emptyObjCid = 'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3'
    this.zeroAddr = '0x0000000000000000000000000000000000000000'
  }

  async init() {
    this.graphManagers.default = await this.getGraphManager('default')
  }

  async getGraphManager(name) {
    if (name in this.graphManagers) {
      return this.graphManagers[name]
    }

    let hex = this.web3.utils.asciiToHex(name)
    let addr = await this.registry.methods.graphs(hex).call()
    if (addr === this.zeroAddr) {
      return null
    }

    let contract = new this.web3.eth.Contract(GraphAbi, addr)
    let manager = new GraphManager(this.ipfs, this.web3, contract)
    this.graphManagers[name] = manager
    await manager.init()

    return manager
  }

  async newGraphManager(name) {
    let manager = await this.getGraphManager(name)
    if (manager !== null) {
      return manager
    }

    let coinbase = await this.web3.eth.getCoinbase()
    let hex = this.web3.utils.asciiToHex(name)
    let tx
    try {
      let gas = await this.registry.methods.newGraph(hex).estimateGas({ from: coinbase })
      tx = await this.registry.methods.newGraph(hex).send({ from: coinbase, gas })
    } catch (e) {
      console.log(e)
      return null
    }

    let addr = tx.events.NewGraph.returnValues.addr
    let contract = new this.web3.eth.Contract(GraphAbi, addr)
    manager = new GraphManager(this.ipfs, this.web3, contract)
    this.graphManagers[name] = manager
    await manager.init()

    return manager
  }

  async addTriples(triples, graph='default') {
    console.log(graph)
    let g = await this.getGraphManager(graph)
    if (g === null) {
      console.log('Graph', g, 'not found')
      return null
    }

    return g.addTriples(triples)
  }

  async execute(query) {
    let graph = 'default'
    let parser = new SparqlParser();
    let q = parser.parse(query)
    if ('from' in q) {
      if (q.from.default.length === 0) {
        throw new Error('Invalid from in query')
      }

      let def = q.from.default[0]
      if (!def.startsWith('openknowledge:')) {
        throw new Error('Only from clauses with openknowledge scheme are allowed')
      }

      graph = def.substr('openknowledge:'.length)
    }

    let g = await this.getGraphManager(graph)
    if (g === null) {
      console.log('Graph', g, 'not found')
      return null
    }

    return g.execute(query)
  }

  async getGraphs() {
    let res = {}
    let len = await this.registry.methods.getGraphsCount().call()

    for (let i = 0; i < len; i++) {
      let hex = await this.registry.methods.getGraphName(i).call()
      let name = this.web3.utils.hexToUtf8(hex)
      let g = await this.getGraphManager(name)
      res[name] = g
    }

    return res
  }
}
