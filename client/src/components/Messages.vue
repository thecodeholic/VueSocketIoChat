<template>
  <div class="messages-wrapper">
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
          ></b-form-textarea>
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
        unreadMessages: false,
        shouldBeScrollDown: true,
        newMessage: '',
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
        console.log("Sending");
        this.$socket.emit('SEND_MESSAGE', {
          token: auth.getToken(),
          message: this.newMessage,
          userId: this.selectedContact.id
        });
        this.messages.push({
          message: this.newMessage,
          sender: 'me'
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
      onKeyUp(ev){
        if (ev.key === 'Enter' && !ev.shiftKey){
          this.sendMessage(ev);
        }
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
        if (contact.id === this.selectedContact.id) {
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
