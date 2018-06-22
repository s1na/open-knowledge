<template>
  <div id="#catalog-page">
    <h2>Graphs</h2>
    <ul>
      <li v-for="item in res" :key="item">{{ item }}</li>
    </ul>
  </div>
</template>

<script>
import QueryRes from './QueryRes.vue'

let res = []
export default {
  props: [
    'ok',
  ],
  data: function() {
    return {
      res
    }
  },
  components: {
    QueryRes,
  },
  mounted: async function () {
    this.res = await this.ok.getGraphs()
    console.log(this.res)
  }
}
</script>
