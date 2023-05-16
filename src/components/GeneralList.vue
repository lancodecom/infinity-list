<template>
    <div class="view-wrapper">
        <InfinityList :size="20" :fetch-api="fetchApi" mode="general">
            <div class="item" v-for="item in 30" :key="index">
                <div class="item">第{{ item }}条数据</div>
            </div>
        </InfinityList>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import InfinityList from '../../dist/infinity-list.es.js';
// import '../../dist/style.css'
</script>

<style lang="scss" scoped>
.view-wrapper {
    height: 600px;
    width: 400px;
    border: 1px solid #999;
}

.placeholder {
    height: 50px;
    background-color: rgb(240, 240, 240);
    margin-top: 12px;
}

.item {
    text-align: left;
    font-size: 16px;
    height: 50px;
}
</style>