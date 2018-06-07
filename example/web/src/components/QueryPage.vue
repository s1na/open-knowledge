<template>
  <div id="#query-page">
    <el-row type="flex" justify="center">
      <el-col :span="16">
        <Query v-on:query-submit="onQuerySubmit" />
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
import Query from './Query.vue'
import QueryRes from './QueryRes.vue'

let res = []
export default {
  props: [
    'ok',
  ],
  data: function() {
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
    QueryRes,
  },
  methods: {
    onQuerySubmit: async function (form) {
      this.res = await this.ok.execute(form.query, form.graph)
    }
  }
}
</script>
