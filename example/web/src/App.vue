<template>
  <div id="app">
    <el-row type="flex" justify="center">
      <el-col :span="8">
        <h1>Open Knowledge</h1>
      </el-col>
    </el-row>

    <el-row type="flex" justify="center">
      <el-col :span="16">
        <Query v-model="query" />
      </el-col>
    </el-row>

    <el-row type="flex" justify="center">
      <el-col :span="16">
        <QueryRes :items="res" />
      </el-col>
    </el-row>
  </div>
</template>

<script>

import Query from './components/Query.vue'
import QueryRes from './components/QueryRes.vue'

import ipfsAPI from 'ipfs-api'
import Web3 from 'web3'

import OpenKnowledge from '../../../dist/open-knowledge.esm.js'
import GraphRegistry from '../../../build/contracts/GraphRegistry.json'

const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))

const GRAddr = GraphRegistry.networks['4447'].address
const GRAbi = GraphRegistry.abi
const graphRegistry = new web3.eth.Contract(GRAbi, GRAddr)
const ok = new OpenKnowledge(ipfs, graphRegistry)

let res = []
export default {
  name: 'App',
  data: function () {
    return {
      query: {
        graph: 'default',
        query: ''
      },
      res
    }
  },
  components: {
    Query,
    QueryRes
  },
  mounted: function() {
    ok.init().then(async () => {
      console.log('ok started')

      console.log('Query finished: ', res)
    })
  },
  watch: {
    query: function() {
      this.execute(this.query)
    }
  },
  methods: {
    execute: async function(q) {
      this.res = await ok.execute(q.query, q.graph)
    }
  }
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
