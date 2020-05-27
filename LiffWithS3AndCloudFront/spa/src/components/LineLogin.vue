<template lang="pug">
  v-container
    v-flex(mb-8 xs12)
      p.subheading.font-weight-regular
        | Please sign in by LINE Login.
      div
        v-btn(
          large
          color="success"
          @click="doLogin"
        )
          | Sign in
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class LineLogin extends Vue {
  doLogin() {
    this.$emit('doLogin')
  }
}
</script>
