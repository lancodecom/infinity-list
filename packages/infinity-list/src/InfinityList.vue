<template>
    <div ref="scrollRef" class="infinity-list" :style="itemWrapperStyle" @scroll="() => onScroll()">
        <div v-if="mode === 'general'" class="infinity-list-general">
            <slot />
        </div>
        <div v-else-if="mode === 'infinity'" class="infinity-list-infinity">
            <div ref="itemWrapperRef" class="infinity-item-wrapper" :style="{ height: `${listHeight}px` }">
                <div v-for="(item, index) in listView" class="infinity-item" :key="index"
                    :style="{ transform: 'translate(0,' + item.top + 'px)' }">
                    <slot v-if="item.data && item.loaded && item.height" name="item" v-bind="item.data" />
                    <slot v-else-if="loadingType === 'placeholder' && mode === 'infinity'" name="placeholder" />
                </div>
            </div>

            <div class="infinity-list-pool">
                <div class="infinity-item invisible" :ref="(el) => getItemRef(el as HTMLElement, item.id)"
                    v-for="(item) in listViewPool" :key="item.id">
                    <slot name="item" v-bind="item.data" />
                </div>
                <div ref="placeholderRef" class="infinity-item invisible">
                    <slot name="placeholder"></slot>
                </div>
            </div>

            <div class="infinity-list-loading" v-if="mode === 'infinity' && loadingType === 'spinner'">
                <slot name="spinner">
                    <div class="infinity-list-loading-content">
                        <Loading :size="23" />
                    </div>
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { ItemRef, Item } from './types'
import { isNumber } from './util'
import Loading from './Loading.vue'

const EVENT_RESIZE = 'resize'

// 在vue3.3（2023-05-04尚未正式发布）中，可以直接使用外部的类型在defineProps中
interface Props {
    // 距离底部还有多少px时，发出加载更多事件
    threshold?: number,
    // 通过fetchApi参数加载更多的每次返回的数量
    size: number,
    // 是否展示没有更多的底部提示插槽
    showNoMore?: boolean,
    // 加载数据的方法
    fetchApi: () => Promise<unknown>,
    // 滚动条高度，优先于max-height
    height?: number | string,
    maxHeight?: number | string,
    // infinity-无限滚动模式，general-普通模式，通过slot传入内容
    mode?: string,
    // 加载更多的展示方式(仅mode=infinity有效)，placeholder-占位元素，spinner-底部loading
    loadingType?: string
}

const props = withDefaults(defineProps<Props>(), {
    threshold: 100,
    showNoMore: false,
    infinite: false,
    mode: 'infinity',
    loadingType: 'loading'
})

// 列表的总高度，用于占位，撑开滚动条
const listHeight = ref(0)
// item的外部盒子元素
const itemWrapperRef = ref<HTMLElement | null>(null)
// 外层scroll滚动条的实例       
const scrollRef = ref<HTMLElement | null>(null)
// 内部维护的列表
const allList = ref<Item[]>([])
// 是否目前为没有更多的状态
const noMore = ref(false)
const itemRefs = ref<ItemRef[]>([])
// 是否正在请求中
const loading = ref(false)
// 列表中从第几个元素开始，为可视窗口的第一项
const startIndex = ref(0)
const endIndex = ref(0)
// 执行fetchApi加载更多的次数
const fetchCount = ref(0)
const items = ref<Item[]>([])
const placeholderRef = ref<HTMLElement | null>(null)

const emits = defineEmits(['scroll'])
defineExpose({ reset, setScrollTop })

onMounted(() => {
    window.addEventListener(EVENT_RESIZE, onResize)
    load()
})

onUnmounted(() => {
    // 组件卸载，移除监听
    window.removeEventListener(EVENT_RESIZE, onResize)
})

// 真实渲染列表的数据，计算的依据是可视窗口前多加载一屏
const listView = computed(() => {
    return items.value.slice(Math.max(0, startIndex.value - props.size), Math.min(items.value.length, endIndex.value + props.size))
})

// 占位元素，在可视窗口之外，用于获取尺寸
const listViewPool = computed(() => {
    const notReadyItem = items.value.filter(item => {
        // 如果元素处于占位状态(意味着接口返回了数据，但是尚未渲染的状态）则返回
        return item && !item.placeholder && !item.height
    })
    return notReadyItem
})

// 占位元素的高度
const placeholderHeight = computed(() => {
    return placeholderRef.value?.offsetHeight ?? 0
})

// 滚动条包装元素的样式
const itemWrapperStyle = computed(() => {
    const style: { height?: string, 'max-height'?: string } = {}
    if (props.mode === 'general') {
        if (props.height) {
            style.height = isNumber(props.height) ? `${props.height}px` : props.height as string
        }
        if (props.maxHeight) {
            style['max-height'] = isNumber(props.maxHeight) ? `${props.maxHeight}px` : props.maxHeight as string
        }
        if (!props.height && !props.maxHeight) {
            style.height = '100%'
        }
    }

    return style
})

// item ref绑定函数触发
const getItemRef = (el: HTMLElement, id: string) => {
    // 判断是否已存在，不存在则插入，存在则变更，因为ref绑定函数，会在变更，卸载等时机都执行
    const index = itemRefs.value.findIndex(item => item.id === id)
    if (index > -1) {
        itemRefs.value[index].el = el
    } else {
        itemRefs.value.push({ id, el })
    }
}

// 去接口加载列表
function load() {
    if (props.mode === 'infinity') {
        // 本次加载在整理list中的开始和结束位置
        const start = items.value.length
        items.value.length += props.size
        const end = items.value.length
        // 只有loading模式为占位模式时，才进行元素预加载
        // props.loadingType === 'placeholder' && loadItems(start, end)
        loadItems(start, end)
        fetchItems()
    } else {
        fetchItems()
    }
}

// 加载更多的方法
function fetchItems() {
    loading.value = true
    props.fetchApi().then((res: any) => {
        if (!Array.isArray(res)) {
            return console.error('FetchApi data is invalid')
        }
        loading.value = false
        if (res.length < props.size) {
            noMore.value = true
            stopScroll(fetchCount.value)
        }
        setList(fetchCount.value, res)
        const start = fetchCount.value * props.size,
            end = start + props.size
        // 在loadItems中，用promise.all在元素渲染后，计算节点相关信息
        loadItems(start, end)
        fetchCount.value++
    })
}

// 设置items数组，在请求中，请求结束等场景，分别用于获取占位元素，真实元素在渲染后的真实尺寸
function loadItems(start: number, end: number) {
    const promiseQueue = []
    for (let i = start; i < end; i++) {
        const item = items.value[i]
        if (item?.loaded) {
            continue
        }
        const data = allList.value[i]
        items.value[i] = {
            data: data,
            height: 0,
            top: -10000,
            // 是否展示占位
            placeholder: !data,
            loaded: !!data,
            id: uuidv4()
        }
        // nextTick()方法返回promise
        promiseQueue.push(nextTick().then(() => {
            updateItemHeight(items.value[i].id)
        }))
    }
    // 下一个tick周期（加载更多，添加内容到列表并渲染的后）触发all方法
    Promise.all(promiseQueue).then(() => {
        updateItemTop()
        updateStartIndex()
    })
}

/**
 * 更新指定位置元素的高度
 * @param id item对应的id
 */
function updateItemHeight(id: string) {
    const current = items.value.find(item => item.id === id)
    const dom = itemRefs.value.find(item => item.id === id)
    if (dom?.el && current) {
        current.height = dom.el.offsetHeight
    } else if (current && props.loadingType === 'placeholder') {
        current.height = placeholderHeight.value
    }
}

/**
 * 更新列表各个元素的top和列表的总height值
 */
function updateItemTop() {
    let height = 0,
        last = null,
        current = null

    for (let i = 0; i < items.value.length; i++) {
        last = items.value[i - 1]
        current = items.value[i]
        if (!current) {
            height += 0
        } else {
            // 每个元素的top值，上一个元素的top及其高度的和，也即上一个元素的底部边沿到顶部的距离
            current.top = last ? last.top + last.height : 0
            height += current.height
        }
    }

    listHeight.value = height
}

/**
 * 获取列表中属于可视窗口的第一个元素
 */
function updateStartIndex() {
    let startSeted = false
    // 可视窗口的最后一个默认为0，底部逻辑进行设置
    endIndex.value = 0
    const scrollTop = scrollRef.value!.scrollTop
    for (let i = 0; i < items.value.length; i++) {
        const item = items.value[i]
        // 如果不存在item则为列表的最后一个的下一个（为undefined）
        // 或者某个的top大于scrollTop时，取其上一个
        if (!startSeted && (!item || item.top > scrollTop)) {
            // 进行Math.max，防止出现-1的问题
            startIndex.value = Math.max(0, i - 1)
            startSeted = true
        } else if (item.top > scrollTop + scrollRef.value!.offsetHeight) {
            endIndex.value = Math.max(0, i - 1)
            break
        }
    }
    // 如果找不到一个元素的top大于scrollTop + viewHeight.value，取最后一个
    if (endIndex.value === 0) {
        endIndex.value = items.value.length - 1
    }
}

/**
 * fetchApi返回的数据加载到allList变量中，统一托管
 * @param index 第几次加载fetchApi
 * @param res fetchApi返回的数据，Array格式
 */
function setList(index: number, res: any) {
    const baseIndex = index * props.size
    for (let i = 0; i < res.length; i++) {
        allList.value[baseIndex + i] = res[i]
    }
}

/**
 * fetchApi没有更多数据时，进行各项数据的状态处理
 * @param index 第几次之行fetchApi加载数据
 */
function stopScroll(index: number) {
    noMore.value = false
    // 拷贝items数组
    removePlaceholder([...items.value], index)
    updateItemTop()
    updateStartIndex()
}

/**
 * 请求结束后，移除多余的占位元素
 * @param clone items列表的克隆
 * @param index 第几次fetchApi
 */
function removePlaceholder(clone: Item[], index: number) {
    let cursor = null
    const start = index * props.size
    const end = (index + 1) * props.size
    // 查找第一个placeholder=true的元素，并丢弃起后面的元素，因为在加载某次不满一页时
    // 需要移除多余的占位元素
    for (cursor = start; cursor < end; cursor++) {
        if (clone[cursor].placeholder) {
            break
        }
    }
    items.value = clone.slice(0, cursor)
}

/**
 * 重置各项数据，供外部调用
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reset() {
    items.value = []
    allList.value = []
    listHeight.value = 0
    startIndex.value = 0
    endIndex.value = 0
    noMore.value = false
    loading.value = false
    fetchCount.value = 0
    scrollRef.value!.scrollTop = 0
    load()
}

/**
 * 列表滚动触发
 */
function onScroll() {
    emits('scroll', { scrollTop: scrollRef.value!.scrollTop })
    if (!loading.value && !noMore.value && listHeight.value - scrollRef.value!.scrollTop - scrollRef.value!.offsetHeight < props.threshold) {
        load()
    }
    updateStartIndex()
}

/**
 * 窗口尺寸发生变化
 */
function onResize() {
    items.value.forEach(item => {
        item.loaded = false
    })
    loadItems(0, items.value.length)
}

function setScrollTop(scrollTop: number) {
    scrollRef.value!.scrollTop = scrollTop
}
</script>

<style scoped>
.infinity-list {
    width: 100%;
    height: 100%;
    overflow: auto;
    position: relative;
    margin: 0;
    padding: 0;
    border: none;
    -webkit-overflow-scrolling: touch;
}

.infinity-list::-webkit-scrollbar {
    width: 6px
}

.infinity-list::-webkit-scrollbar:horizontal {
    height: 6px
}

.infinity-list::-webkit-scrollbar-track {
    border-radius: 10px
}

.infinity-list::-webkit-scrollbar-thumb {
    background-color: #0003;
    border-radius: 10px;
    transition: all .2s ease-in-out
}

.infinity-list::-webkit-scrollbar-thumb:hover {
    cursor: pointer;
    background-color: #0000004d
}

.infinity-item {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
}

.nomore {
    display: flex;
    justify-content: center;
    align-items: center;
}

.invisible {
    top: -10000px;
    visibility: hidden
}

.infinity-list-loading {
    overflow: hidden;
}

.infinity-list-loading-content {
    margin: 10px auto;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>