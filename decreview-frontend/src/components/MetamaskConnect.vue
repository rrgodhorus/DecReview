<template>
    <div>
        <button style="color: white;" v-if="!walletAddress" @click="connectWallet">Connect MetaMask Wallet</button>
        <div v-if="walletAddress">
            <h3>Connected Wallet Address:</h3>
            <p>{{ walletAddress }}</p>
        </div>
        <p v-if="error" class="error">{{ error }}</p>
    </div>
</template>

<script>
import { ethers } from "ethers";

export default {
    data() {
        return {
            error: null,
            walletAddress: null
        };
    },
    methods: {
        async connectWallet() {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }],
                    });
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();

                    // Get the wallet address
                    const address = await signer.getAddress();
                    this.walletAddress = address;
                    this.$emit("update-address", address);
                } catch (error) {
                    console.error(error);
                    this.error = "Failed to connect to MetaMask.";
                }
            } else {
                this.error = "MetaMask is not installed.";
            }
        },
    },

};
</script>

<style scoped>
.error {
    color: red;
}
</style>