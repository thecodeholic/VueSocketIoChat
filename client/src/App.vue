<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
  html, body, #app {
    height: 100%;
  }

  body {
    padding: 60px;
    background-color: #f6f6f6;
  }

  .contacts-popover .popover-body{
    overflow: auto;
    padding: 0;
  }
</style>
