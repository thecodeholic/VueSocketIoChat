<template>
  <b-tabs v-model="tabIndex" pills justified class="contacts">
    <b-tab title="Contacts" class="tab-contacts" active>
      <b-media @click="selectContact(contact)" class="contact" v-for="(contact, index) in contacts" :key="index"
               :class="{'selected': contact === selectedContact}">
        <template v-slot:aside>
          <b-img rounded="circle" blank blank-color="#ccc" width="48" alt="placeholder"></b-img>
        </template>

        <h5 class="mt-0">{{contact.name}}</h5>
        <p class="mb-0">
          {{contact.latestMessage.message}}
        </p>
        <span class="indicator-status" :class="{'online': contact.online}"></span>
        <span v-b-tooltip="'Unread Messages'" class="unread-message" v-if="contact.hasUnreadMessage"></span>
      </b-media>
    </b-tab>
    <b-tab title="Groups Chats" class="tab-groups">
      <b-media @click="selectRoom(room)" class="contact" v-for="(room, index) in rooms" :key="index"
               :class="{'selected': room === selectedRoom}">
        <template v-slot:aside>
          <b-img rounded="circle" blank blank-color="#ccc" width="64" alt="placeholder"/>
        </template>

        <h5 class="mt-0">{{room.users.length}} users</h5>
        <p class="mb-0">
            <span v-for="(user, index) in room.users" class="badge badge-secondary mr-2"
                  :key="index">{{user.name}}</span>
          <!--            {{contact.email}}-->
          <!--            {{contact.latestMessage.message}}-->
        </p>
        <span v-b-tooltip="'Unread Messages'" class="unread-message" v-if="room.hasUnreadMessage"></span>
      </b-media>
    </b-tab>
  </b-tabs>
</template>

<script>
  import eventBus from "../event-bus";

  export default {
    name: "Contacts",
    props: {
      contacts: Array,
      rooms: Array,
    },
    data() {
      return {
        tabIndex: 0,
        selectedContact: null,
        selectedRoom: null,
      }
    },
    methods: {
      selectContact(contact) {
        this.$emit('selectContact', contact);
        this.selectedContact = contact;
        this.selectedContact.hasUnreadMessage = false;
      },
      selectRoom(room) {
        this.$emit('selectRoom', room);
        this.selectedRoom = room;
        this.selectedRoom.hasUnreadMessage = false;
      }
    },
    mounted() {
      eventBus.$on('newRoomCreated', newRoom => {
        this.tabIndex = 1;
        this.selectRoom(newRoom);
      });
    }
  }
</script>

<style lang="scss">

  .contacts {
    width: 360px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #ebebeb;

    .tab-content {
      overflow-y: auto;
    }

    .tab-pane {
      outline: 0;
    }

    .tab-contacts {
      overflow-y: auto;
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
  }
</style>
