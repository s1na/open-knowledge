<template>
  <el-form ref="form" :model="form" label-width="120px">
    <el-form-item  label="Query">
      <el-input type="textarea" v-model="form.query" style="height: 200px" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">Search</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
let query = `PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX dbo: <http://dbpedia.org/ontology/>
SELECT *
FROM <openknowledge:default>
{
  <http://dbpedia.org/resource/Lucky_Starr_and_the_Big_Sun_of_Mercury> <http://dbpedia.org/ontology/author> ?o.
  ?s <http://dbpedia.org/ontology/influenced> ?o
} LIMIT 15
`
export default {
  name: 'Query',
  data() {
    return {
      form: {
        query
      }
    }
  },
  methods: {
    onSubmit(event) {
      this.$emit('query-submit', this.form.query)
    }
  }
}
</script>

<style>
.el-form-item textarea {
  height: 200px;
}
</style>
