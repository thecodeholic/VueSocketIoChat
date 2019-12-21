<template>
  <div class="contacts">
    <b-media class="contact" v-for="(contact, index) in contacts" :key="index">
      <template v-slot:aside>
        <b-img rounded="circle" blank blank-color="#ccc" width="64" alt="placeholder"></b-img>
      </template>

      <h5 class="mt-0">{{contact.name}}</h5>
      <p class="mb-0">
        Fusce condimentum nunc...
      </p>
      <span class="indicator-status" :class="{'online': contact.online}"></span>
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
    overflow: auto;
    border-right: 1px solid #ebebeb;
  }

  .contact {
    position: relative;
    padding: 10px 15px;
    cursor: pointer;

    &:hover {
      background-color: #eaeaea;
    }
  }

  .indicator-status{
    position: absolute;
    left: 16px;
    top: 10px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #6b6b6b;
    border: 2px solid white;
    &.online{
      background-color: #00cb78;
    }
  }
</style>
