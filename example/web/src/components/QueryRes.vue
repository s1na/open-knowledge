<template>
  <el-table :data="items" stripe>
    <el-table-column prop="?s" label="Subject" />
    <el-table-column prop="?p" label="Predicate" />
    <el-table-column prop="?o" label="Object" />
  </el-table>
</template>

<script>
import QueryResItem from './QueryResItem.vue'

export default {
  name: 'QueryRes',
  props: [
    'items' 
  ],
  components: {
    QueryResItem
  }
}
</script>
