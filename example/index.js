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
const repo = 'zdpuApoUQhCwU7R6gwDbjTcj9m5okvAotH631MtLWTVsTfieW'

const ok = new OpenKnowledge(ipfs, repo)
ok.init().then(async () => {
  await ok.store.addGraph('default')
  await ok.addQuad('http://en.wikipedia.org/wiki/Tony_Benn', 'http://purl.org/dc/elements/1.1/title', 'Tony Benn', 'default')
  await ok.addQuad('http://dbpedia.org/resource/Isaac_Asimov', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.org/Person', 'default')
  await ok.addQuad('http://dbpedia.org/resource/Isaac_Asimov', 'http://www.w3.org/2000/01/rdf-schema#label', 'Isaac Asimov', 'default')
  console.log(await ok.store.getQuads(null, null, 'Isaac Asimov', 'default'))
})
