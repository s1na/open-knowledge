'use strict'

import { Parser as SparqlParser } from 'sparqljs'

import GraphManager from './graph-manager'
import { abi as GMAbi } from '../build/contracts/GraphManager.json'

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
    let addr = await this.registry.methods.contracts(hex).call()
    if (addr === this.zeroAddr) {
      return null
    }

    let contract = new this.web3.eth.Contract(GMAbi, addr)
    let manager = new GraphManager(this.ipfs, this.web3, contract)
    this.graphManagers[name] = manager
    await manager.init()

    return manager
  }

  async newGraphManager(name) {
    let manager = this.getGraphManager(name)
    if (manager !== null) {
      return manager
    }

    let coinbase = await this.web3.eth.getCoinbase()
    let hex = this.web3.utils.asciiToHex(name)
    let tx
    try {
      tx = await this.registry.methods.newGraphManager(hex).send({ from: coinbase })
    } catch (e) {
      console.log(e)
      return null
    }

    let addr = tx.events.NewGraphManager.returnValues.addr
    let contract = new this.web3.eth.Contract(GMAbi, addr)
    manager = new GraphManager(this.ipfs, this.web3, contract)
    this.graphManagers[name] = manager
    await manager.init()

    return manager
  }

  async addTriples(triples, graph='default') {
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
}
