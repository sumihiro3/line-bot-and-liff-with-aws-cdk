<template lang="pug">
  v-layout(
    column
    justify-center
    align-center
  )
    //- SnackBar to show API result
    v-snackbar(
      v-model="showSnackBar"
      :timeout="snackBarTimeout"
      :color="snackBarColor"
    )
      | {{ snackBarText }}
    v-flex(
      xs12
      sm8
      md6
    )
      div.text-center
        v-img.my-10(
          src='LINE_APP.png'
          contain
          height="200"
        )
        client-only
          //- show user profile when user logged in
          line-profile(
            v-if="profile != null"
            :profile="profile"
            :isInClient="isInClient"
            @doLogout="doLogout"
          )
          //- show LINE login button when user not logged in
          line-login(
            v-else
            @doLogin="doLogin"
          )
          //- show buttons for execute LIFF APIs
          liff-apis(
            v-if="profile != null"
            :isInClient="isInClient"
            :os="os"
            @openWindow="openWindow"
            @sendMessage="sendMessage"
            @scanCode="scanCode"
            @shareTargetPicker="shareTargetPicker"
          )
          //- show LIFF status
          liff-status(
            v-if="liffInitialized"
            :key="componentKey"
          )
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import { Profile } from '@line/bot-sdk'
import {
  initLiff,
  isLineLoggedIn,
  isInClient,
  getOS,
  getLineProfile,
  liffLogin,
  liffLogout,
  openWindow,
  sendMessage,
  scanCode,
  shareTargetPicker
} from '~/plugins/liff'

@Component({
  components: {
    LiffStatus: () => import('@/components/LiffStatus.vue'),
    LineProfile: () => import('@/components/LineProfile.vue'),
    LineLogin: () => import('@/components/LineLogin.vue'),
    LiffApis: () => import('@/components/LiffApis.vue')
  }
})
export default class Index extends Vue {
  profile: Profile | null = null
  liffInitialized: boolean = false
  isInClient: boolean = false
  os: string = ''
  componentKey: number = 0
  snackBarText: string = ''
  snackBarColor: string = 'primary'
  snackBarTimeout: number = 3000
  showSnackBar: boolean = false
  async asyncData(): Promise<void> {
    await console.log('LIFF_ID', process.env.LIFF_ID)
    await console.log('BASE_URL', process.env.BASE_URL)
  }

  async mounted() {
    if (this.liffInitialized === false) {
      await this.initializeLiff()
    }
    this.isInClient = isInClient()
    this.os = getOS()
    if (this.liffInitialized === true && this.loggedIn() === true) {
      this.profile = await getLineProfile()
    }
  }

  async initializeLiff() {
    const pageLiffId = process.env.LIFF_ID || ''
    this.liffInitialized = await initLiff(pageLiffId)
  }

  async doLogin() {
    // const redirectUrl = `${process.env.BASE_URL}?hogehoge=fugafuga`
    // console.info('LINE Login redirectUrl:', redirectUrl)
    await liffLogin()
    this.profile = await getLineProfile()
    this.componentKey += 1
    this.openSnackBar('Login success!!')
  }

  async doLogout() {
    await liffLogout()
    this.profile = null
    this.componentKey += 1
    this.openSnackBar('Logout success!!')
  }

  loggedIn(): boolean {
    return isLineLoggedIn()
  }

  async getProfile(): Promise<Profile> {
    return await getLineProfile()
  }

  openWindow() {
    openWindow('https://line.me')
  }

  sendMessage() {
    sendMessage()
    this.openSnackBar('Message sent!')
  }

  async scanCode() {
    const result = await scanCode()
    console.log('Scanned!', result)
    if (result != null) {
      this.openSnackBar(`Scanned text is "${result}"`)
    }
  }

  async shareTargetPicker() {
    const result: boolean = await shareTargetPicker()
    if (result === true) {
      this.openSnackBar('ShareTargetPicker launched!')
    } else {
      this.openSnackBar('ShareTargetPicker launch failed...', true)
    }
  }

  openSnackBar(text: string, warning: boolean = false) {
    this.snackBarText = text
    this.snackBarColor = 'primary'
    if (warning === true) {
      this.snackBarColor = 'warning'
    }
    this.showSnackBar = true
  }
}
</script>

<style lang="stylus">
.bg_red
  background-color #FF0000
</style>
