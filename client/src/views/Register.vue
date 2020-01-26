<template>
  <div class="register">
    <b-card style="width: 400px; margin: 0 auto" title="Signup for chat">
      <b-form @submit="registerUser">
        <b-form-group
                id="input-group-1"
                label="Email address:"
                label-for="input-1"
                description="We'll never share your email with anyone else."
        >
          <b-form-input
                  id="input-1"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="Enter email"
          ></b-form-input>
        </b-form-group>

        <b-form-group id="input-group-2" label="Your Name:" label-for="input-2">
          <b-form-input
                  id="input-2"
                  v-model="form.name"
                  required
                  placeholder="Enter name"
          ></b-form-input>
        </b-form-group>


        <b-form-group label="Your password">
          <b-form-input type="password"
                        v-model="form.password"
                        required
                        placeholder="Enter password"
          ></b-form-input>
        </b-form-group>

        <p>
          Already user?? <router-link :to="'/login'">Click here</router-link> to login
        </p>

        <b-button type="submit" variant="primary" class="mr-2" >Submit</b-button>
        <b-button type="reset" variant="danger">Reset</b-button>
      </b-form>
    </b-card>
  </div>
</template>

<script>
  import axios from 'axios';
  import auth from "../Chat/auth.service";

  export default {
    name: "Register",
    data() {
      return {
        form: {}
      }
    },
    methods: {
      async registerUser($event){
        $event.preventDefault();
        const {data, status} = await auth.register(this.form);
        if (status === 200){
          auth.setUser(data);
          this.$router.push('/');
        }
      }
    }
  }
</script>

<style scoped>

</style>
