<template>
    <div class="view-wrapper">
        <InfinityList :size="20" :fetch-api="fetchApi" mode="infinity" loading-type="placeholder">
            <template #item="{ name }">
                <div class="item">第{{ name }}条数据</div>
            </template>
            <template #placeholder>
                <div class="placeholder"></div>
            </template>
        </InfinityList>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import InfinityList from '@lankuyun/infinity-list'
// import '../../dist/style.css'

const index = ref(0)

function fetchApi() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(Array.from({ length: 20 }).map(() => ({ name: index.value++ })))
        }, 1000);
    })
}
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