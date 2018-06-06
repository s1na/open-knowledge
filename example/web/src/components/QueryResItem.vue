<template>
  <li>{{ text }}</li>
</template>

<script>
export default {
  name: 'QueryResItem',
  props: [
    'item'
  ],
  computed: {
    text: function() {
      return `<${this.item['?s']}>`
    }
  }
}
</script>
