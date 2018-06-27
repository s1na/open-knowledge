<template>
  <div id="#catalog-page">
    <el-row type="flex" justify="center">
      <el-col :span="16">
        <h2>Graphs</h2>
        <template>
          <el-tabs v-model="activeGraph" @tab-click="handleClick">
            <el-tab-pane v-for="(g, name) in graphs" :key="name" :label="name" :name="name">
              <QueryRes :items="triples" />
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import QueryRes from './QueryRes.vue'

let graphs = {}
let triples = []
export default {
  props: [
    'ok',
  ],
  data: function() {
    return {
      activeGraph: 'default',
      graphs,
      triples
    }
  },
  components: {
    QueryRes,
  },
  mounted: async function () {
    this.graphs = await this.ok.getGraphs()
    if ('default' in this.graphs) {
      this.handleClick({ name: 'default' })
    }
  },
  methods: {
    handleClick: async function (tab, event) {
      let g = this.graphs[tab.name]
      let triples = await g.store.getTriples(null, null, null)
      this.triples = triples.map((t) => ({ '?s': t[0], '?p': t[1], '?o': t[2] }))
    }
  }
}
</script>
