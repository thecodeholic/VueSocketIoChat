<template>
  <div class="login">
    <b-card style="width: 400px; margin: 0 auto" title="Login for chat">
      <b-form>
        <b-form-group
                id="input-group-1"
                label="Email address:"
                label-for="input-1"
        >
          <b-form-input
                  id="input-1"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="Enter email"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-2" label="Your password" label-for="input-2">
          <b-form-input type="password"
                        id="input-2"
                        v-model="form.password"
                        required
                        placeholder="Enter password"
          ></b-form-input>
        </b-form-group>
        <p>
          <router-link :to="'/register'">Click here</router-link> to register and have a chat
        </p>

        <b-button type="submit" variant="primary" class="mr-2">Submit</b-button>
        <b-button type="reset" variant="danger">Reset</b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script>
  export default {
    name: "Login",
    data() {
      return {
        form: {}
      }
    }
  }
</script>

<style scoped>

</style>
