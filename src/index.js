'use strict'

import Web3 from 'web3'

import GraphManager from './graph-manager'
import { abi as GMAbi } from '../build/contracts/GraphManager.json'

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))

export default class OpenKnowledge {
  constructor(ipfs, registry) {
    this.ipfs = ipfs
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

    let hex = web3.utils.asciiToHex(name)
    let addr = await this.registry.methods.contracts(hex).call()
    if (addr === this.zeroAddr) {
      return null
    }

    let contract = new web3.eth.Contract(GMAbi, addr)
    let manager = new GraphManager(this.ipfs, contract)
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

  async execute(query, graph='default') {
    let g = await this.getGraphManager(graph)
    if (g === null) {
      console.log('Graph', g, 'not found')
      return null
    }

    return g.execute(query)
  }
}
