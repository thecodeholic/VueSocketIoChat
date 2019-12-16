<template>
  <div class="messages-wrapper">
    <div class="messages">
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
    <div class="input-area">
      <b-input-group>
        <b-form-textarea
                id="textarea"
                placeholder="Enter your message..."
                rows="3"
                no-resize
        ></b-form-textarea>
        <b-input-group-append>
          <b-button variant="primary">Send</b-button>
        </b-input-group-append>
      </b-input-group>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Messages",
    data() {
      return {
        messages: [
          {
            sender: 'me',
            message: 'Hi how are you?',
            time: '2019-12-16 09:16:00'
          },
          {
            sender: 1,
            name: 'James',
            message: 'Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? ',
            time: '2019-12-16 09:16:10'
          },
          {
            sender: 'me',
            message: 'Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? Hi how are you? ',
            time: '2019-12-16 09:16:00'
          },
          {
            sender: 1,
            name: 'James',
            message: 'I am fine',
            time: '2019-12-16 09:16:10'
          },
          {
            sender: 'me',
            message: 'Hi how are you?',
            time: '2019-12-16 09:16:00'
          },
          {
            sender: 1,
            name: 'James',
            message: 'I am fine',
            time: '2019-12-16 09:16:10'
          },
          {
            sender: 'me',
            message: 'Hi how are you?',
            time: '2019-12-16 09:16:00'
          },
          {
            sender: 1,
            name: 'James',
            message: 'I am fine',
            time: '2019-12-16 09:16:10'
          },
          {
            sender: 'me',
            message: 'Hi how are you?',
            time: '2019-12-16 09:16:00'
          },
          {
            sender: 1,
            name: 'James',
            message: 'I am fine',
            time: '2019-12-16 09:16:10'
          },
          {
            sender: 'me',
            message: 'Hi how are you?',
            time: '2019-12-16 09:16:00'
          },
          {
            sender: 1,
            name: 'James',
            message: 'I am fine',
            time: '2019-12-16 09:16:10'
          },
        ]
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

  .messages {
    overflow: auto;
    padding: 20px;
  }

  .input-area {
    padding: 20px;
    border-top: 1px solid #ebebeb;
  }

  .message {
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
