<template>
  <div class="messenger">
    <Contacts @selectContact="selectContact" :contacts="allUsers"/>
    <Messages :contacts="contacts" :selected-contact="selectedContact"/>
  </div>
</template>

<script>
  import Contacts from "./Contacts";
  import Messages from "./Messages";
  import httpClient from "../http.service";
  import auth from "../auth.service";

  export default {
    name: 'Messenger',
    components: {Messages, Contacts},
    data() {
      return {
        contacts: [],
        connectedUsers: [],
        selectedContact: null,
      }
    },

    computed: {
      allUsers() {
        const newUsers = [];
        for (let user of this.contacts) {
          user.messages = user.messages || [];
          user.online = false;
          const contact = this.connectedUsers.find(c => c.id === user.id);
          if (contact) {
            user.online = true;
          }
          newUsers.push(user);
        }
        console.log(newUsers);
        return newUsers.sort((u1) => {
          if (u1.online){
            return -1;
          }
        });
      }
    },
    sockets: {
      USER_LIST(contacts) {
        const currentUser = auth.getUser();
        this.connectedUsers = contacts.filter(u => u.id !== currentUser.id);
      }
    },
    methods: {
      selectContact(contact){
        this.selectedContact = contact;
      }
    },
    async mounted() {
      try {
        const {data, status} = await httpClient.getUsers();
        if (status === 200) {
          this.contacts = data;
        }
      } catch (e) {
        console.error(e);
      }
    }
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
