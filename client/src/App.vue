<template>
  <div id="app">
    <Messenger/>
  </div>
</template>

<script>

  import Messenger from "./components/Messenger";

  export default {
    name: 'app',
    components: {
      Messenger
    }
  }
</script>

<style lang="scss">
  html, body, #app {
    height: 100%;
  }

  body {
    padding: 60px;
    background-color: #f6f6f6;
  }
</style>
