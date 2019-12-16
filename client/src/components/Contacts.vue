<template>
  <div class="contacts">
    <b-media class="contact" v-for="(contact, index) in contacts" :key="index">
        <template v-slot:aside>
          <b-img rounded="circle" blank blank-color="#ccc" width="64" alt="placeholder"></b-img>
        </template>

        <h5 class="mt-0">John Smith</h5>
        <p class="mb-0">
          Fusce condimentum nunc...
        </p>
      </b-media>
  </div>
</template>

<script>
  export default {
    name: "Contacts",
    props: {
      contacts: Array
    }
  }
</script>

<style scoped lang="scss">
  .contacts {
    width: 360px;
    border-right: 1px solid #ebebeb;
  }
  .contact{
    padding: 10px 15px;
    cursor: pointer;
    &:hover{
      background-color: #eaeaea;
    }
  }
</style>
