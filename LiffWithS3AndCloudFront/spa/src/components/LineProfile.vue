<template lang="pug">
  v-container
    v-flex(mb-8 xs12)
      p.subheading.font-weight-regular
        | Welcome! 
        | {{ profile.displayName }}
      div
        v-avatar(
          color="teal"
          size="128"
        )
          img(
            :src="profile.pictureUrl"
          )
      div.mt-8
        v-btn(
          v-show="isInClient === false"
          large
          color="warning"
          @click="doLogout"
        )
          | Logout
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { Profile } from '@line/bot-sdk'

@Component
export default class LineProfile extends Vue {
  @Prop({ type: Object, required: true }) readonly profile!: Profile
  @Prop() readonly isInClient: boolean = false

  doLogout() {
    this.$emit('doLogout')
  }
}
</script>
