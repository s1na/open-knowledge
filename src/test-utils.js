import fs from 'fs'
import { promisify } from 'util'

import Ganache from 'ganache-core'
import Web3 from 'web3'

const readFile = promisify(fs.readFile)

const provider = Ganache.provider({ gasLimit: 8000000 })
export const web3 = new Web3(provider)

export async function deployContract (Contract, args, initArgs) {
  let accounts = await web3.eth.getAccounts()
  let instance = new web3.eth.Contract(Contract.abi)
  let gas = await instance.deploy({ data: Contract.bytecode }).estimateGas({ from: accounts[0], arguments: args })
  let contract = await instance.deploy({ data: Contract.bytecode }).send({ from: accounts[0], gas, arguments: args })

  if (typeof contract.methods.initialize === 'function') {
    if (initArgs) {
      gas = await contract.methods.initialize(...initArgs).estimateGas({ from: accounts[0] })
      await contract.methods.initialize(...initArgs).send({ from: accounts[0], gas })
    } else {
      gas = await contract.methods.initialize().estimateGas({ from: accounts[0] })
      await contract.methods.initialize().send({ from: accounts[0], gas })
    }
  }

  return contract
}

export async function publishFile (ok, path, g, skip = 0, limit = 10) {
  let doc = await readFile(path, 'utf8')
  let triples = await ok.parse(doc)
  triples = triples.slice(skip, limit)

  await ok.addTriples(triples, g)
}

export function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
