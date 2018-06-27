<template>
  <div id="graphPage">
    <el-row type="flex" justify="center">
      <el-col :span="16">
        <el-form ref="graphForm" :model="form" label-width="120px">
          <el-form-item label="Name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">Create</el-button>
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
        name: '',
      }
    }
  },
  methods: {
    onSubmit: async function () {
      await this.ok.newGraphManager(this.form.name)
    },
  }
}
</script>
