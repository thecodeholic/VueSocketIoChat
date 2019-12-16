<template>
  <div class="home">
    <Messenger />
  </div>
</template>

<script>

import Messenger from "../components/Messenger";
export default {
  name: 'home',
  components: {
    Messenger
  }
}
</script>

<style scoped lang="scss">
  .home {
    height: 100%;
  }
</style>
