<template>
  <div class="messenger">
    <Contacts :contacts="contacts"/>
    <Messages/>
  </div>
</template>

<script>
  import Contacts from "./Contacts";
  import Messages from "./Messages";

  export default {
    name: 'Messenger',
    components: {Messages, Contacts},
    data(){
      return {
        contacts: []
      }
    },
    sockets: {
      connect(){
        console.log("Connection was made");
      },
      USER_CONNECTED(contact){
        console.log(contact);
        this.contacts.push(contact);
      },
      USER_DISCONNECTED(socketId){
        this.contacts = this.contacts.filter(contact => contact.socketId !== socketId)
      },
      USER_LIST(contacts) {
        this.contacts = Object.values(contacts);
      }
    }
  }
</script>

<style>

</style>
