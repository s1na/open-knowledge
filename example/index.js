'use strict'

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const OpenKnowledge = require('../dist/open-knowledge.cjs.js')

const ipfsOptions = {
  EXPERIMENTAL: {
    pubsub: true
  }
}

const ipfs = new IPFS(ipfsOptions)

ipfs.on('error', (e) => console.error(e))
ipfs.on('ready', async () => {
  const orbit = new OrbitDB(ipfs)
  const ok = new OpenKnowledge(orbit)
  await ok.init()
  await ok.add('myfile.rdf', 'test')
  console.log(await ok.get('myfile.rdf'))
})
