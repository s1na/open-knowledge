<template>
  <el-menu :default-active="activeIndex" mode="horizontal" :router="true">
    <el-menu-item index="/query">Query</el-menu-item>
    <el-menu-item index="/publish">Publish</el-menu-item>
  </el-menu>
</template>

<script>
export default {
  data: function () {
    return {
      activeIndex: '/query'
    }
  },
}
</script>
