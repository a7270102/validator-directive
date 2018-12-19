# 项目基于vue-cli 3.0生成的hello world模板修改而来.......
## 主要内容：v-td-validate指令的实现
## 项目说明
### 背景
  在eywa的前端项目中存在诸多的输入格式校验的需求，常见的校验大致分为两类：
    1. 输入格式校验： 长度限制，特殊字符限制，正整数，非空限制等等
    2. 业务联动校验：A和B存在输入联动校验等，比如输入A必须小于等于输入B，或是输入A不能等于输入B；
 常用的校验提示方式为：
   1. 以tip的方式出提示语，显示在输入区域（常指可输入的域，如input输入框，textarea等）的左右，在项目中比较常见的就是表单的校验，目前使用element-ui的Form组件，就是这类的典型
   2. 以alert的方式弹出提示语，直接显示一个弹出框（模态框）的方式，比如element-ui中的message,messageBox就是这类的方式
这两类均有其适用场合：对于tip方式，常规的格式校验，比较适用于这类场合；对于alert适用于提交页面时，最后的校验提示这类场合；
对比两者可以发现：以tip的方式呈现校验信息是比较合理，且交互感更清晰，更舒适的方式；alert方式会给人一种程序出现错误或异常的错觉，感观不佳；

### 实现思路
  1. 校验的基本要素： rule规则、validate校验器、validator校验器对象； 三者关系为：n:1  n:1;即1个校验器可以有多条rules，一个校验器对象可以有多个validate
      rule: {regExp: RegExp, errorMsg: String, validate: Function}
      validate: Validate: {rules: [rule,......], validValue: 'value' , valid: Function }
      validator: {el,vm,modifiers,bindInstance,bindingValue,validResult,validMsg,trigger, check, getRulesConfig}
  2. 初始化工作：解析bind,获取绑定值(bind.value)--→ 创建校验器对象(createValidator)---→ 绑定事件(initEvents)
  3. 校验工作有校验器valiate完成，校验的优先级为：rule中的validator > 内联规则 > 自定义的规则 > 默认规则
### 使用规范
1. 规则对象Rule:
```
  rule: {
    regExp, // 非必选，正则表达式对象
    errorMsg, // 必选，错误提示
    validate, // 非必选， 自定义校验函数
    trigger, // 非必选， 触发方式，如blur,focus,change等等
 }
```
2. 绑定值对象： v-td-validate="${obj}"
绑定对象在指令中获取方式为：bind.value
```
 obj: {
    ns: 'nameSpace', // 必选，作用：校验器会挂载在当前页面实例vm.validObj[ns]上
    rules: {a: [...rule], b: [...rule], self: [...rule]}, // 非必选，格式为：{a:[{rule}], b:[{rule}]} ,单独使用时：{self: [{rule}]}
    ruleType: 'preRule', // 非必选，用于通过自定义规则名去应用对应的规则，遵循规则优先级
    trigger: 'blur', // 非必选，相对全局的触发方式，存在时，会被应用到当前绑定下的所有校验对象上，会合并rule中的trigger，一并在事件中初始化绑定
    isGroup: true/false, // 非必选，用来标识时对象校验还是单个校验，当为对象校验时必选
    change: '' // 非必选，当对象有动态操作引起dom变更时需要设定一个变化敏感的值；若数组对象校验时，新增，或是删除元素后，引起dom发生变化，这里就可以选定chang = Array.length
 }
```
3. 修饰符对象: v-td-validate.positive.notEmpty="${bind}"
```
 bind.modifier: {
    'positive': true, // 表明指令应用时有positive的修饰符：v-td-validate.positive="{}",会去应用修饰符rules
    'notEmpty': true, // v-td-validate.notEmpty="{}"
 }
```
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
