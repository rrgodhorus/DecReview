<script setup>
import DecReview from './components/DecReview.vue';
import MetaMaskConnect from './components/MetamaskConnect.Vue';

</script>

<template>
  <div>
    <img src="/decreview.jpeg" class="logo"  alt="Decentralised Reviews Logo" />
  </div>
  <MetaMaskConnect @update-address="handleUpdateAddress"/>
  <DecReview v-if="walletAddress" :wallet-address="walletAddress"/>
</template>

<script>
export default {
  data() {
    return {
      walletAddress: null,
    };
  },
  methods: {
    handleUpdateAddress(value) {
      this.walletAddress = value;
    }
  }
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 10px;
}</style>

<style scoped>
.logo {
  height: 20em;
  padding: 0.5em;
  will-change: filter;
  transition: filter 300ms;
}

</style>
