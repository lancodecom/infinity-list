export interface ItemRef {
    // 元素的ref
    el: HTMLElement,
    // 在列表中的id
    id: string
}

export interface Item {
    // 元素的高度
    height: number,
    top: number,
    // 列表元素的内容
    data: any,
    // 是否已被夹在完成
    loaded: boolean,
    // 是否展示占位
    placeholder: boolean,
    id: string
}