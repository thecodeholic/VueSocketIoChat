<template>
  <div class="messenger">
    <Contacts @selectContact="selectContact"
              @selectRoom="selectRoom"
              :contacts="allUsers"
              :rooms="rooms"/>
    <Messages @updateLatestMessage="updateLatestMessage"
              :contacts="contacts"
              :selected-contact="selectedContact"
              :messages="selectedContactMessages"/>
  </div>
</template>

<script>
  import Contacts from "./Contacts";
  import Messages from "./Messages";
  import httpClient from "../http.service";
  import auth from "../auth.service";
  import eventBus from "../event-bus";

  export default {
    name: 'Messenger',
    components: {Messages, Contacts},
    data() {
      return {
        contacts: [],
        rooms: [],
        connectedUsers: [],
        selectedContact: null,
        selectedContactMessages: []
      }
    },

    computed: {
      allUsers() {
        const newUsers = [];
        for (let user of this.contacts) {
          user.messages = user.messages || [];
          user.latestMessage = user.latestMessage || {};
          user.online = false;
          const contact = this.connectedUsers.find(c => c.id === user.id);
          if (contact) {
            user.online = true;
          }
          newUsers.push(user);
        }
        console.log(newUsers);
        return newUsers.sort((u1) => {
          if (u1.online) {
            return -1;
          }
        });
      }
    },
    sockets: {
      USER_LIST(contacts) {
        const currentUser = auth.getUser();
        this.connectedUsers = contacts.filter(u => u.id !== currentUser.id);
      },
      NEW_ROOM(newRoom) {
        console.log(newRoom);
        this.rooms.push(newRoom);
        if (newRoom.userId === auth.getUser().id) {
          eventBus.$emit('newRoomCreated', newRoom);
        }
      }
    },
    methods: {
      async selectContact(contact) {
        this.selectedContact = contact;
        const {data, status} = await httpClient.get('/messages/' + contact.id);
        if (status === 200) {
          this.selectedContactMessages = data;
        }
      },
      async selectRoom(room){
        this.selectedContact = room;
        const {data, status} = await httpClient.get('/messages-by-room/' + room.id);
        if (status === 200) {
          this.selectedContactMessages = data;
        }
      },
      updateLatestMessage({contact, message}){
        const user = this.contacts.find(u => u.id === contact.id)
        user.latestMessage = message;
        if (!this.selectedContact || user.id !== this.selectedContact.id) {
          user.hasUnreadMessage = true;
        }
        this.contacts = [...this.contacts];
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
      try {
        const {data, status} = await httpClient.getRooms();
        if (status === 200) {
          this.rooms = data;
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
