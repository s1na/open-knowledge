'use strict'

import GraphManager from './graph-manager'

export default class OpenKnowledge {
  constructor(ipfs, defaultContract) {
    this.ipfs = ipfs
    this.defaultGM = new GraphManager(ipfs, defaultContract)
    this.emptyGraphCid = 'zdpuAmKRXTRNSgwSgXqPDP2FuxVeduNMtM113oGDeUDEoKuA1'
    this.emptyObjCid = 'zdpuAyTBnYSugBZhqJuLsNpzjmAjSmxDqBbtAqXMtsvxiN2v3'
  }

  async init() {
    await this.defaultGM.init()
  }

  execute(q) {
    return this.defaultGM.execute(q)
  }
}
