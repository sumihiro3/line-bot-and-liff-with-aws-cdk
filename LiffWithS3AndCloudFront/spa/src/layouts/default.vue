<template lang="pug">
  v-app
    v-app-bar(fixed app color="success")
      v-toolbar-title.white--text.font-weight-black(v-text="title")
      v-spacer
    v-content
      v-container
        nuxt
    v-footer(:fixed="fixed" app)
      span
        | &copy; {{ new Date().getFullYear() }}
</template>

<script>
export default {
  data() {
    return {
      fixed: false,
      title: 'LIFF v2 Sample'
    }
  }
}
</script>
