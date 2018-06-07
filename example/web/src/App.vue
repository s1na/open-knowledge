<template>
  <div id="app">
    <NavBar />
    <br />
    <router-view></router-view>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'

export default {
  name: 'App',
  data: function () {
    return {
      ok: null,
    }
  },
  components: {
    NavBar,
  },
/*  watch: {
    query: function() {
      this.execute(this.query)
    }
  },
  methods: {
    execute: async function(q) {
      this.res = await ok.execute(q.query, q.graph)
    }
  }*/
}
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
