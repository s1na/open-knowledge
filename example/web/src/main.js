import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import QueryPage from './components/QueryPage.vue'
import PublishPage from './components/PublishPage.vue'

import ipfsAPI from 'ipfs-api'
import Web3 from 'web3'

import OpenKnowledge from '../../../dist/open-knowledge.esm.js'
import GraphRegistry from '../../../build/contracts/GraphRegistry.json'

const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))

const GRAddr = GraphRegistry.networks['4447'].address
const GRAbi = GraphRegistry.abi
const graphRegistry = new web3.eth.Contract(GRAbi, GRAddr)
const ok = new OpenKnowledge(ipfs, web3, graphRegistry)

ok.init().then(async () => {
  Vue.config.productionTip = false
  Vue.use(VueRouter)
  Vue.use(ElementUI)

  const routes = [
    { path: '/query', component: QueryPage, props: { ok } },
    { path: '/publish', component: PublishPage, props: { ok } },
    { path: '/', component: QueryPage, props: { ok } },
  ]

  const router = new VueRouter({
    routes
  })

  new Vue({
    render: h => h(App),
    router
  }).$mount('#app')
})
