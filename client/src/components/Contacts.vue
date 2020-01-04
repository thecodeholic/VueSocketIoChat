<template>
  <div class="contacts">
    <b-media @click="selectContact(contact)" class="contact" v-for="(contact, index) in contacts" :key="index"
             :class="{'selected': contact === selectedContact}">
      <template v-slot:aside>
        <b-img rounded="circle" blank blank-color="#ccc" width="64" alt="placeholder"></b-img>
      </template>

      <h5 class="mt-0">{{contact.name}}</h5>
      <p class="mb-0">
        {{contact.latestMessage.message}}
      </p>
      <span class="indicator-status" :class="{'online': contact.online}"></span>
      <span v-b-tooltip="'Unread Messages'" class="unread-message" v-if="contact.hasUnreadMessage"></span>
    </b-media>
  </div>
</template>

<script>
  export default {
    name: "Contacts",
    props: {
      contacts: Array
    },
    data() {
      return {
        selectedContact: null,
      }
    },
    methods: {
      selectContact(contact) {
        this.$emit('selectContact', contact)
        this.selectedContact = contact;
        this.selectedContact.hasUnreadMessage = false;
      }
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

    &.selected {
      background-color: #e3eaea;
    }

    &:hover {
      background-color: #eaeaea;
    }
  }

  .indicator-status {
    position: absolute;
    left: 16px;
    top: 10px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: #6b6b6b;
    border: 2px solid white;

    &.online {
      background-color: #00cb78;
    }
  }

  .unread-message {
    position: absolute;
    right: 10px;
    top: 16px;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    background-color: #ffba2a;
  }
</style>
