## Vue3 Infinity-list

这是一个适用于 Vue3 的无限滚动组件，内置了普通滚动(`general`)和(`infinity`)两种滚动模式:

- `infinity`无限滚动模式下，对列表中的 DOM 数量进行控制和优化，即使是海量数据的渲染列表，也会拥有优秀的性能。
- `general`普通滚动模式下，与普通的滚动组件无异，通过`slot`传入内容即可获得滚动效果。

### 特色

- 列表虚拟化
- 可从`Api`加载数据
- 有占位和`loading`两种加载状态
- 支持`Typescript`

### 快速安装

您可以通过`pnpm`，`npm`或者其他包管理工具进行安装，我们更建议您使用`pnpm`。

```javascript
// pnpm
pnpm i @lankuyun/infinity-list -S

// 或者npm
npm i @lankuyun/infinity-list -S
```

### 基础使用

#### 1. 无限滚动模式

您需要设置`mode`为`infinity`，同时提供必填的`fetchApi`参数和`size`(该参数为`fetchApi`每次返回的条数)，`fetchApi`参数为一个方法，必须返回一个`Promise`，否则内部将无法加载数据。

此模式下，您还可以配置一个名为`placeholder`的`slot`，同时设置`loading-type`为`placeholder`，内部在加载下一页数据等待中时，展示这些默认的占位元素。`loading-type`默认为`spinner`，表现为加载中时，底部展示一个加载中的`loading`状态。

内部加载数据后，通过名为`item`的`slot`进行抛出，列表的数据在`#item="data"`中，您也可以用解构的写法如`#item="{ name, id, value: val, num = 10 }"`。

```html
<template>
  <div class="view-wrapper">
    <InfinityList
      :size="20"
      :fetch-api="fetchApi"
      mode="infinity"
      loading-type="placeholder"
    >
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
  import { ref } from "vue";
  import InfinityList from "@lankuyun/infinity-list";

  const index = ref(0);

  function fetchApi() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          Array.from({ length: 20 }).map(() => ({ name: index.value++ }))
        );
      }, 1000);
    });
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
```

#### 2. 普通滚动

此模式下，您无需提供`fetchApi`参数，组件仅充当普通的滚动容器，把内容直接通过默认的`slot`传入即可。

```html
<template>
  <div class="view-wrapper">
    <InfinityList mode="general">
      <div class="item" v-for="item in 30" :key="item">
        <div class="item">第{{ item }}条数据</div>
      </div>
    </InfinityList>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from "vue";
  import InfinityList from "@lankuyun/infinity-list";
</script>

<style lang="scss" scoped>
  .view-wrapper {
    height: 600px;
    width: 400px;
    border: 1px solid #999;
  }

  .item {
    text-align: left;
    font-size: 16px;
    height: 50px;
  }
</style>
```

### Props

以下为组件参数列表：

| 参数        | 说明                                                               | 类型             | 默认值   | 可选值      |
| ----------- | ------------------------------------------------------------------ | ---------------- | -------- | ----------- |
| mode        | 滚动类型，general-普通滚动，infinity-无限滚动                      | String           | infinity | greeral     |
| threshold   | 距离底部多少距离加载下一页，mode=infinity 时有效，单位 px          | Number           | 100      | -           |
| size        | fetchApi 每次加载的数量，mode=infinity 时必填                      | Number           | -        | -           |
| fetchApi    | 加载数据的方法，必须返回 Promise，见上方说明，mode=infinity 时必填 | Function         | -        | -           |
| height      | 滚动区域高度，优先级大于`maxHeight`                                | String \| Number | -        | -           |
| maxHeight   | 滚动区域最大高度，内容超出此高度组件才会滚动                       | String \| Number | -        | -           |
| loadingType | 下一页数据加载中的底部状态，见上方说明，仅 mode=infinity 有效      | String           | spinner  | placeholder |

### Slots

以下为组件内部的插槽：

| 名称        | 说明                                                                            |
| ----------- | ------------------------------------------------------------------------------- |
| item        | 列表项的作用域插槽，通过此插槽可拿到列表项的数据，见上方说明                    |
| spinner     | loading-type 为 spinner 时，可通过此插槽自定义 loaidng 内容                     |
| placeholder | loading-type 为 placeholder 时，通过此插槽自定义加载中的占位元素，见上方示例 ｜ |

### Methods

以下为组件内部暴露的方法：

| 名称         | 说明                   | 类型                          |
| ------------ | ---------------------- | ----------------------------- |
| setScrollTop | 设置滚动条到顶部的距离 | ( scrollTop: number ) => void |
| reset        | 重置组件内部各项状态   | ( ) => void                   |

### Events

以下为组件发出的事件：

| 名称   | 说明                             | 类型                              |
| ------ | -------------------------------- | --------------------------------- |
| scroll | 当触发滚动事件时，返回滚动的距离 | ( { scrollTop: number } ) => void |

### 关于我们

该组件由[蓝库云](https://www.lancode.cn)发布，蓝库云可通过可视化表单和流程，即能灵活、快速、高效地搭建符合业务所需的企业级应用，让非技术人员也能搭建个性化的 CRM、ERP、OA、项目管理、进销存等系统。是企业数字化转型的得力工具，助力企业降本增效。
