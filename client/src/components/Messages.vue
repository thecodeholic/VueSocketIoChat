<template>
  <div class="messages-wrapper">
    <div v-if="selectedContact" class="contact-details p-2 shadow-sm">
      <b-media>
        <template v-slot:aside>
          <b-img rounded="circle" blank blank-color="#ccc" width="48" alt="placeholder" />
        </template>

        <h5>{{selectedContact.name}}</h5>
      </b-media>

      <b-button id="start-group-chat" pill variant="outline-secondary">+</b-button>

      <b-popover :show.sync="showPopover" custom-class="contacts-popover" ref="popover" target="start-group-chat">
        <template v-slot:title>
          Select Contacts
          <div class="mt-2">
            <b-button size="sm" class="mr-2" @click="showPopover = false">Close</b-button>
            <b-button size="sm" variant="primary" @click="startChat">Start Chat</b-button>
          </div>
        </template>

        <div class="contacts">
          <b-media @click="toggleContactSelection(contact)" class="contact mb-2" v-for="(contact, index) in contacts"
                   :key="index"
                   :class="{'selected': selectedContacts[contact.id]}">
            <template v-slot:aside>
              <b-img rounded="circle" blank blank-color="#ccc" width="40" alt="placeholder"/>
            </template>

            <h5 class="mt-0">{{contact.name}}</h5>
            <p class="mb-0">
              {{contact.latestMessage.message}}
            </p>
            <span class="indicator-status" :class="{'online': contact.online}"/>
            <span v-b-tooltip="'Unread Messages'" class="unread-message" v-if="contact.hasUnreadMessage"/>
          </b-media>
        </div>
      </b-popover>
    </div>
    <div class="messages-ctr">
      <div class="messages" ref="messages" @scroll="scrollChange">
        <b-media class="message" v-for="(message, index) in messages" :key="index"
                 :class="{'sender-me': message.sender === 'me'}">
          <template v-slot:aside v-if="message.sender !== 'me'">
            <b-img rounded="circle" blank blank-color="#ccc" width="64" alt="placeholder"></b-img>
          </template>

          <h5 class="name" v-if="message.sender !== 'me'">John Smith</h5>
          <p class="text">
            {{message.message}}
            <span class="time">2 min.</span>
          </p>
        </b-media>
      </div>
      <button @click="scrollDown" class="unread-messages" v-if="unreadMessages">
        Unread messages
      </button>
    </div>
    <div class="input-area">
      <b-form @submit="sendMessage">
        <b-input-group>
          <b-form-textarea
                  @keyup="onKeyUp"
                  id="textarea"
                  placeholder="Enter your message..."
                  rows="3"
                  v-model="newMessage"
                  no-resize
          />
          <b-input-group-append>
            <b-button :disabled="!selectedContact" type="submit" variant="primary">Send</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form>
    </div>
  </div>
</template>

<script>
  import auth from "../auth.service";

  export default {
    name: "Messages",
    props: {
      selectedContact: Object,
      contacts: Array,
      messages: Array
    },
    data() {
      return {
        showPopover: false,
        unreadMessages: false,
        shouldBeScrollDown: true,
        newMessage: '',
        selectedContacts: {}
        // selectedContactMessages: []
      }
    },
    // watch: {
    //   selectedContact() {
    //     this.selectedContactMessages = this.selectedContact.messages;
    //   }
    // },
    methods: {
      sendMessage($event) {
        $event.preventDefault();
        if (!this.newMessage.trim()) {
          return;
        }
        console.log("Sending");
        this.$socket.emit('SEND_MESSAGE', {
          token: auth.getToken(),
          message: this.newMessage,
          [this.selectedContact.email ? 'userId' : 'roomId']: this.selectedContact.id
        });
        this.messages.push({
          message: this.newMessage,
          sender: 'me'
        });
        this.$emit('updateLatestMessage', {
          contact: this.selectedContact,
          message: {
            message: this.newMessage
          }
        });
        this.newMessage = '';
      },
      isScrollAtTheBottom() {
        const messages = this.$refs.messages;
        return messages.offsetHeight + messages.scrollTop === messages.scrollHeight;
      },
      scrollChange() {
        if (this.isScrollAtTheBottom()) {
          this.unreadMessages = false;
        }
      },
      scrollDown() {
        const messages = this.$refs.messages;
        messages.scrollTop = 10000000;
      },
      onKeyUp(ev) {
        if (ev.key === 'Enter' && !ev.shiftKey) {
          this.sendMessage(ev);
        }
      },
      toggleContactSelection(contact) {
        console.log(contact, this.selectedContacts);
        if (this.selectedContacts[contact.id]) {
          delete this.selectedContacts[contact.id];
          this.selectedContacts = {...this.selectedContacts};
        } else {
          this.selectedContacts = {
            ...this.selectedContacts,
            [contact.id]: contact
          };
        }
      },
      startChat() {
        console.log("Start chat with these contact", this.selectedContacts);
        this.$socket.emit('ADD_INTO_ROOM', {
          token: auth.getToken(),
          [this.selectedContact.email ? 'userId' : 'roomId']: this.selectedContact.id,
          userIds: Object.keys(this.selectedContacts)
        });
        this.showPopover = false;
        this.selectedContacts = {};
      }
    },
    sockets: {
      ON_MESSAGE_RECEIVE(message) {
        console.log(message);
        this.$emit('messageReceived', message);
        const contact = this.contacts.find(c => c.id === message.userId);
        this.shouldBeScrollDown = this.isScrollAtTheBottom();
        if (!this.shouldBeScrollDown) {
          this.unreadMessages = true;
        }
        this.$emit('updateLatestMessage', {contact, message});
        if (this.selectedContact && contact.id === this.selectedContact.id) {
          this.messages.push(message);
        }
        // this.selectedContactMessages.push(message)
      }
    },
    updated() {
      if (this.shouldBeScrollDown) {
        this.scrollDown()
      }
    }
  }
</script>

<style lang="scss" scoped>
  .messages-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .contact-details {
    position: relative;

    #start-group-chat {
      position: absolute;
      right: 15px;
      top: 15px;
    }
  }


  .contacts-popover {
    width: 240px;
    max-height: 320px;
    outline: 0;
    display: flex;
    flex-direction: column;

    .contacts {
      overflow: auto;
      flex: 1;
    }

    .contact {
      padding: 0.5rem 1rem;

      &.selected {
        background-color: #0b82ff;
        color: white;
      }
    }
  }

  .messages-ctr {
    flex: 1;
    overflow: auto;
    position: relative;
  }

  .messages {
    height: 100%;
    overflow: auto;
    padding: 20px;
  }

  .unread-messages {
    position: absolute;
    bottom: 10px;
    left: 50%;
    width: 160px;
    text-align: center;
    margin-left: -80px;
    background-color: #ffffff;
    color: #007bff;
    padding: 5px 10px;
    border-radius: 20px;
    border: 2px solid #007bff;
    outline: 0;
    transition: all 0.3s;

    &:hover {
      color: white;
      background-color: #007bff;
    }
  }

  .input-area {
    padding: 20px;
    border-top: 1px solid #ebebeb;
  }

  .message {
    word-break: break-all;

    .text {
      margin-right: 15%;
      background-color: #0b82ff;
      color: white;
      padding: 5px 10px;
      border-radius: 6px;
      display: inline-block;
    }

    .time {
      display: block;
      font-size: 75%;
      font-style: italic;
    }

    &.sender-me {
      .text {
        margin-right: 0;
        margin-left: 15%;
        background-color: #8a8a8a;
      }

      .media-body {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
</style>
