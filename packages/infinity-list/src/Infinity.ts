import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
const EVENT_RESIZE = 'resize'

/**
 * 占位相关
 */
export const usePlaceholder = () => {
    const placeholderRef = ref<HTMLElement | null>(null)

    const placeholderHeight = computed(() => {
        return placeholderRef.value?.offsetHeight ?? 0
    })

    return { placeholderHeight, placeholderRef }
}

export const useResize = (cb: () => void, load: () => void) => {
    onMounted(() => {
        window.addEventListener(EVENT_RESIZE, cb)
        load()
    })

    onUnmounted(() => {
        window.removeEventListener(EVENT_RESIZE, cb)
    })
}