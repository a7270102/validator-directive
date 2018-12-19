# 项目基于vue-cli 3.0生成的hello world模板修改而来.......
## 主要内容：v-td-validate指令的实现
## 项目说明
一.背景
  在eywa的前端项目中存在诸多的输入格式校验的需求，常见的校验大致分为两类：
    1. 输入格式校验： 长度限制，特殊字符限制，正整数，非空限制等等
    2. 业务联动校验：A和B存在输入联动校验等，比如输入A必须小于等于输入B，或是输入A不能等于输入B；
 常用的校验提示方式为：
   1. 以tip的方式出提示语，显示在输入区域（常指可输入的域，如input输入框，textarea等）的左右，在项目中比较常见的就是表单的校验，目前使用element-ui的Form组件，就是这类的典型
   2. 以alert的方式弹出提示语，直接显示一个弹出框（模态框）的方式，比如element-ui中的message,messageBox就是这类的方式
这两类均有其适用场合：对于tip方式，常规的格式校验，比较适用于这类场合；对于alert适用于提交页面时，最后的校验提示这类场合；
对比两者可以发现：以tip的方式呈现校验信息是比较合理，且交互感更清晰，更舒适的方式；alert方式会给人一种程序出现错误或异常的错觉，感观不佳；
二.实现思路：
  1. 校验的基本要素： rule规则、validate校验器、validator校验器对象； 三者关系为：n:1  n:1;即1个校验器可以有多条rules，一个校验器对象可以有多个validate
      rule: {regExp: RegExp, errorMsg: String, validate: Function}
      validate: Validate: {rules: [rule,......], validValue: 'value' , valid: Function }
      validator: {el,vm,modifiers,bindInstance,bindingValue,validResult,validMsg,trigger, check, getRulesConfig}
  2. 初始化工作：解析bind,获取绑定值(bind.value)--→ 创建校验器对象(createValidator)---→ 绑定事件(initEvents)
  3. 校验工作有校验器valiate完成，校验的优先级为：rule中的validator > 内联规则 > 自定义的规则 > 默认规则
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
