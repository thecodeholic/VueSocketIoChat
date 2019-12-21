<template>
  <div class="messenger">
    <Contacts :contacts="contacts"/>
    <Messages/>
  </div>
</template>

<script>
  import Contacts from "./Contacts";
  import Messages from "./Messages";
  import auth from "../auth.service";

  export default {
    name: 'Messenger',
    components: {Messages, Contacts},
    data() {
      return {
        contacts: []
      }
    },
    sockets: {
      USER_LIST(contacts) {
        console.log(contacts);
        const currentUser = auth.getUser();
        this.contacts = contacts.filter(u => u.id !== currentUser.id);
      }
    },
  }
</script>

<style scoped lang="scss">
  .messenger {
    display: flex;
    background-color: white;
    height: 100%;
    border: 1px solid #ebebeb;
  }
</style>
