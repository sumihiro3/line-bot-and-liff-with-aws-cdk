<template lang="pug">
  v-container(fluid)
    h2.headline.text-left.font-italic.pt-2
      | LIFF APIs
    v-divider
    v-row(justify="center")
      v-col(cols="12" xl="12" sm="4")
      div.pa-2
        v-btn.custom-transform-class.text-none(
          rounded
          color="primary"
          @click="openWindow"
        )
          | openWindow
      div.pa-2
        v-btn.custom-transform-class.text-none(
          rounded
          :disabled="isInClient === false"
          color="info"
          @click="sendMessage"
        )
          | sendMessage
      div.pa-2
        v-btn.custom-transform-class.text-none(
          rounded
          :disabled="isInClient === false || os != 'android'"
          color="success"
          @click="scanCode"
        )
          | scanCode
      div.pa-2
        v-btn.custom-transform-class.text-none(
          rounded
          color="primary"
          @click="shareTargetPicker"
        )
          | shareTargetPicker
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component
export default class LiffApis extends Vue {
  @Prop() readonly isInClient: boolean = false
  @Prop() readonly os: string = ''

  openWindow() {
    this.$emit('openWindow')
  }

  sendMessage() {
    this.$emit('sendMessage')
  }

  scanCode() {
    this.$emit('scanCode')
  }

  shareTargetPicker() {
    this.$emit('shareTargetPicker')
  }
}
</script>
