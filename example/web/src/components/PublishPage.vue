<template>
  <div id="publishPage">
    <el-row type="flex" justify="center">
      <el-col :span="16">
        <el-form ref="publishForm" :model="form" label-width="120px">
          <el-form-item label="Graph">
            <el-input v-model="form.graph" />
          </el-form-item>
          <el-form-item  label="File">
            <el-input type="textarea" v-model="form.doc" style="height: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">Publish</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: [
    'ok'
  ],
  data: function () {
    return {
      form: {
        graph: 'default',
        doc: '',
      }
    }
  },
  methods: {
    onSubmit: async function () {
      let triples = await this.ok.parse(this.form.doc)
      await this.ok.addTriples(triples, this.form.graph)
    },
  }
}
</script>
