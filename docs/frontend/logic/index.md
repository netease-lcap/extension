---
outline: deep
---

# 扩展系统逻辑

## 目录结构

```
- logics
  ---- index.ts      # index.ts export 函数
```

## 编写逻辑

```typescript
import '@nasl/types';

/**
 * @NaslLogic
 * @title 过滤列表
 * @desc 过滤列表中的 null 数据
 * @param list 列表
 * @returns 列表
 */
export function filterNull<T>(list: nasl.collection.List<T>): nasl.collection.List<T> {
  return list.filter(n => !!n);
}

/**
 * @NaslLogic
 * @title 并发执行异步任务
 * @description 并发执行异步任务
 * @param count 并发支持任务数量
 * @param task  并发任务列表
 */
export async function asyncExecuteTask(count: nasl.core.Integer, ...taskList: nasl.collection.List<() => nasl.core.Any>): Promise<nasl.collection.List<nasl.core.Any>> {
  const asyncTaskCount = count || 5;
  let waitExecuteTasks = [...taskList];
  const results: nasl.collection.List<nasl.core.Any> = [];
  while (waitExecuteTasks.length > 0) {
    let executeTasks;
    if (taskList.length > asyncTaskCount) {
      executeTasks = waitExecuteTasks.slice(0, asyncTaskCount);
    } else {
      executeTasks = waitExecuteTasks;
    }

    results.push(...(await Promise.all(executeTasks.map((fn) => Promise.resolve(fn())))));
    waitExecuteTasks = waitExecuteTasks.slice(executeTasks.length);
  }

  return results;
}
```

## 逻辑编写规范
需要使用 nasl 提供的类型来进行定义

* 使用 `JSDoc` `@NaslLogic` 注释来标识是需要接入平台的函数，其他注解来描述该逻辑
  * `@type` 绑定端 `pc` `h5` `both`
  * `@title` 逻辑标题
  * `@description` 逻辑描述
  * `@typeParam` 类型描述
  * `@param` 参数描述，（设置了参数名称会根据名称匹配，默认根据参数index 匹配）
  * `@returns` 返回值描述

## 支持可变参数
开发依赖库逻辑支持使用可变参数，调用逻辑时可灵活添加入参。环境要求：IDE版本为3.8及以上版本，node >= 18，lcap 版本 > 0.4.x。

代码示例：

该方法的入参使用可变参数String… str，可接收若干个String类型的参数，返回参数拼接结果。

```typescript
/**
 * @NaslLogic
 * @title 字符串拼接
 * @desc 可变参数示例-拼接字符串返回String
 * @param str 字符串
 * @returns 字符串拼接结果
 */
export function concatenateStrings(...args: nasl.collection.List<nasl.core.String>): nasl.core.String {
  return args.join("");
}
```

效果演示：

在平台IDE中使用该依赖库逻辑时，可点击【添加可变参数】按钮，追加一个输入参数。

![](/images/logic1.gif)

返回结果示例：ABC

![](/images/logic2.png)

## 支持泛型
开发依赖库逻辑支持逻辑的入参和返回值使用泛型，可以更灵活地编写通用代码。环境要求：IDE版本为3.8及以上版本，node >= 18，lcap 版本 > 0.4.x。

代码示例：

入参中使用泛型类型，返回值也使用该类型。当入参为List时，在平台IDE中调用该逻辑时可选择数据类型为List。

```typescript
/**
 * @NaslLogic
 * @title 过滤列表
 * @desc 泛型示例-过滤列表中的 null 数据
 * @param list 列表
 * @returns 列表
 */
export function filterNull<T>(list: nasl.collection.List<T>): nasl.collection.List<T>{
  return list.filter(n => !!n);
}
```

效果演示：

![](/images/logic3.png)

注意事项：

* 泛型可以和高阶函数、可变参数混合使用。

## 支持高阶函数
开发依赖库逻辑支持高阶函数，编写声明为逻辑的方法时，允许使用其他函数作为入参，在平台IDE中使用该依赖库逻辑时，可将其他逻辑作为依赖库逻辑的入参。环境要求：IDE版本为3.8及以上版本，node >= 18，lcap 版本 > 0.4.x。

代码示例：

```typescript
/**
 * @NaslLogic
 * @title 并发执行异步任务
 * @description 高阶函数示例-并发执行异步任务
 * @param count 一次并发支持任务数量
 * @param task  并发任务列表
 */
export async function asyncExecuteTask<T(count: nasl.core.Integer, ...taskList: nasl.collection.List<() => Promise<T>>): Promise<nasl.collection.List<T>> {
  const asyncTaskCount = count || 5;
  let waitExecuteTasks = [...taskList];
  const results: nasl.collection.List<T>= [];
  while (waitExecuteTasks.length > 0) {
    let executeTasks;
    if (taskList.length > asyncTaskCount) {
      executeTasks = waitExecuteTasks.slice(0, asyncTaskCount);
    } else {
      executeTasks = waitExecuteTasks;
    }

    results.push(...(await Promise.all(executeTasks.map((fn) => Promise.resolve(fn())))));
    waitExecuteTasks = waitExecuteTasks.slice(executeTasks.length);
  }

  return results;
}
```
效果演示：

![](/images/logic4.png)

可添加子逻辑作为入参。

子逻辑是定义在逻辑内部的逻辑，需要将逻辑作为入参时可快捷创建子逻辑并进行修改。子逻辑可以使用父逻辑中的局部变量。

![](/images/logic5.png)

注意事项：

* 高阶函数可以和可变参数、泛型混合使用。
