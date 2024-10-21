<template>
  <QuestionAnswer />
</template>

<script>
import QuestionAnswer from './components/QuestionAnswer.vue'

export default {
  name: 'App',
  components: {
    QuestionAnswer
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: -8px;
}
</style>
