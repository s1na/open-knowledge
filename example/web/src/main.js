import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App.vue'
import QueryPage from './components/QueryPage.vue'
import PublishPage from './components/PublishPage.vue'
import GraphPage from './components/GraphPage.vue'
import CatalogPage from './components/CatalogPage.vue'

import ipfsAPI from 'ipfs-api'
import Web3 from 'web3'

import { OpenKnowledge, GraphRegistry } from '../../../dist/open-knowledge.esm.js'
import GraphRegistryContract from '../../../build/contracts/GraphRegistry.json'

const ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

/* if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider)
} else {
  console.log('No MetaMask, connecting to local provider')
} */

const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'))
const GRAddr = GraphRegistryContract.networks['dev'].address
const GRAbi = GraphRegistryContract.abi
const contract = new web3.eth.Contract(GRAbi, GRAddr)
const registry = new GraphRegistry(web3, contract)
const ok = new OpenKnowledge(ipfs, registry)

ok.init().then(async () => {
  Vue.config.productionTip = false
  Vue.use(VueRouter)
  Vue.use(ElementUI)

  const routes = [
    { path: '/query', component: QueryPage, props: { ok } },
    { path: '/publish', component: PublishPage, props: { ok } },
    { path: '/graph', component: GraphPage, props: { ok } },
    { path: '/catalog', component: CatalogPage, props: { ok } },
    { path: '/', component: QueryPage, props: { ok } }
  ]

  const router = new VueRouter({
    routes
  })

  new Vue({
    render: h => h(App),
    router
  }).$mount('#app')
})
