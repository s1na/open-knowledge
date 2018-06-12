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
import N3 from 'n3'

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
      let triples = []
      let n = 10
      const parser = N3.Parser()
      let res = parser.parse(this.form.doc, async (err, quad, prefixes) => {
        if (err) {
          throw new Error(err)
        }

        if (quad === null) {
          console.log('Finished parsing quads, attemping batch insert')
          if (n >= 0) {
            triples = triples.slice(0, 5)
          }
          let tx = await this.ok.addTriples(triples, this.form.graph)
          console.log('TX:', tx)

          return
        }

        triples.push([quad.subject.value, quad.predicate.value, quad.object.value])
      })
    },
  }
}
</script>
