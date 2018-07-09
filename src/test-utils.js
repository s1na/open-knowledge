import fs from 'fs'
import { promisify } from 'util'

import Ganache from 'ganache-core'
import Web3 from 'web3'

const readFile = promisify(fs.readFile)

export async function deployContract (Contract) {
  const provider = Ganache.provider({})
  const web3 = new Web3(provider)
  let accounts = await web3.eth.getAccounts()

  let instance = new web3.eth.Contract(Contract.abi)
  let gas = await instance.deploy({ data: Contract.bytecode }).estimateGas({ from: accounts[0] })
  let contract = await instance.deploy({ data: Contract.bytecode }).send({ from: accounts[0], gas })

  if (typeof contract.methods.initialize === 'function') {
    gas = await contract.methods.initialize().estimateGas({ from: accounts[0] })
    await contract.methods.initialize().send({ from: accounts[0], gas })
  }

  return { web3, accounts, contract }
}

export async function publishFile (ok, path, g, n = 10) {
  let doc = await readFile(path, 'utf8')
  let triples = await ok.parse(doc, n)
  if (n > 0) {
    triples = triples.slice(0, n)
  }

  await ok.addTriples(triples, g)
}
