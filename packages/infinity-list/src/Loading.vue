<template>
    <div class="loading">
        <span class="loading-spinners" :style="style">
            <i class="loading-spinner" v-for="item in balde"></i>
        </span>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { isNumber } from './util'

interface Props {
    balde?: number,
    size?: number | string
}

const props = withDefaults(defineProps<Props>(), {
    balde: 12,
    size: '1em'
})

const style = computed(() => {
    const value = isNumber(props.size) ? `${props.size}px` : props.size
    return {
        width: value,
        height: value
    }
})
</script>

<style scoped>
.loading {
    font-size: 16px;
}

.loading-spinners {
    position: relative;
    display: block;
    width: 1em;
    height: 1em
}

.loading-spinner {
    position: absolute;
    left: 44.5%;
    top: 37%;
    width: 2px;
    height: 25%;
    border-radius: 50%/20%;
    opacity: .25;
    background-color: currentColor;
    -webkit-animation: spinner-fade 1s linear infinite;
    animation: spinner-fade 1s linear infinite
}

.loading-spinner:first-child {
    -webkit-animation-delay: 0s;
    animation-delay: 0s;
    -webkit-transform: rotate(-150deg) translateY(-150%);
    transform: rotate(-150deg) translateY(-150%)
}

.loading-spinner:nth-child(2) {
    -webkit-animation-delay: .083333333333333s;
    animation-delay: .083333333333333s;
    -webkit-transform: rotate(-120deg) translateY(-150%);
    transform: rotate(-120deg) translateY(-150%)
}

.loading-spinner:nth-child(3) {
    -webkit-animation-delay: .166666666666667s;
    animation-delay: .166666666666667s;
    -webkit-transform: rotate(-90deg) translateY(-150%);
    transform: rotate(-90deg) translateY(-150%)
}

.loading-spinner:nth-child(4) {
    -webkit-animation-delay: .25s;
    animation-delay: .25s;
    -webkit-transform: rotate(-60deg) translateY(-150%);
    transform: rotate(-60deg) translateY(-150%)
}

.loading-spinner:nth-child(5) {
    -webkit-animation-delay: .333333333333333s;
    animation-delay: .333333333333333s;
    -webkit-transform: rotate(-30deg) translateY(-150%);
    transform: rotate(-30deg) translateY(-150%)
}

.loading-spinner:nth-child(6) {
    -webkit-animation-delay: .416666666666667s;
    animation-delay: .416666666666667s;
    -webkit-transform: rotate(0deg) translateY(-150%);
    transform: rotate(0deg) translateY(-150%)
}

.loading-spinner:nth-child(7) {
    -webkit-animation-delay: .5s;
    animation-delay: .5s;
    -webkit-transform: rotate(30deg) translateY(-150%);
    transform: rotate(30deg) translateY(-150%)
}

.loading-spinner:nth-child(8) {
    -webkit-animation-delay: .583333333333333s;
    animation-delay: .583333333333333s;
    -webkit-transform: rotate(60deg) translateY(-150%);
    transform: rotate(60deg) translateY(-150%)
}

.loading-spinner:nth-child(9) {
    -webkit-animation-delay: .666666666666667s;
    animation-delay: .666666666666667s;
    -webkit-transform: rotate(90deg) translateY(-150%);
    transform: rotate(90deg) translateY(-150%)
}

.loading-spinner:nth-child(10) {
    -webkit-animation-delay: .75s;
    animation-delay: .75s;
    -webkit-transform: rotate(120deg) translateY(-150%);
    transform: rotate(120deg) translateY(-150%)
}

.loading-spinner:nth-child(11) {
    -webkit-animation-delay: .833333333333333s;
    animation-delay: .833333333333333s;
    -webkit-transform: rotate(150deg) translateY(-150%);
    transform: rotate(150deg) translateY(-150%)
}

.loading-spinner:nth-child(12) {
    -webkit-animation-delay: .916666666666667s;
    animation-delay: .916666666666667s;
    -webkit-transform: rotate(180deg) translateY(-150%);
    transform: rotate(180deg) translateY(-150%)
}

@-webkit-keyframes spinner-fade {
    0% {
        opacity: .85
    }

    50% {
        opacity: .25
    }

    to {
        opacity: .25
    }
}

@keyframes spinner-fade {
    0% {
        opacity: .85
    }

    50% {
        opacity: .25
    }

    to {
        opacity: .25
    }
}
</style>