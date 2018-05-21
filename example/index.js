'use strict'

//const IPFS = require('ipfs')
const ipfsAPI = require('ipfs-api')
const OpenKnowledge = require('../dist/open-knowledge.cjs.js')

const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

//const ipfs = new IPFS(ipfsOptions)
const ipfs = ipfsAPI('/ip4/0.0.0.0/tcp/5001')
const repo = 'zdpuAzjriaoFVgjznag9T9E8cANfTjZ4XiMWHXpSMEkjG2uqu'

const ok = new OpenKnowledge(ipfs, repo)
ok.init().then(async () => {
  await ok.store.addGraph('myGraph')
  await ok.addQuad('<http://en.wikipedia.org/wiki/Tony_Benn>', '<http://purl.org/dc/elements/1.1/title>', 'Tony Benn', 'myGraph')
})
