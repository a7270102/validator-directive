# 项目基于vue-cli 3.0生成的hello world模板修改而来.......
## 项目启动
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
# 主要内容：v-td-validate指令的实现
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
### 应用规范
1. 单个使用
```
<el-input class="ey-input-small" placeholder="如:100" v-model.number.trim="skuSize.length" :validValue="skuSize.length" type="number" v-td-validate="{trigger: 'blur', ns: 'skuSizelength', ruleType: 'PositiveFloat'}"></el-input>
<el-input class="ey-input-small" placeholder="如:100" v-model.number.trim="skuSize.length" :validValue="skuSize.length" type="number" v-td-validate.positive="{trigger: 'blur', ns: 'skuSizelength'}"></el-input>
<el-input class="ey-input-small" placeholder="如:100" v-model.number.trim="skuSize.length" :validValue="skuSize.length" type="number" v-td-validate.positive="{ns: 'skuSizelength'}"></el-input>
```
注意： 
      1. validValue:  用存放需要校验的值， 这里直接使用的自定义的属性做的绑定，标准的做法是使用HTML规范： dateset，即自定义属性data-*的方式；考虑是应用在vue组件中，:attribute=“” 提供了动态变化的能力，暂时这样使用
      2. 使用ruleType可以直接应用在validate.js或是rule.js中预定义好的规则，rule.js支持手动添加，且支持嵌套路径，如a.b.c这样的字符串

2. 对象应用：将多个校验纳入一个对象组中，这里指令绑定在多个校验的共同父组件上。以可增删动态变化的数组对象为例。
```
<el-table :data="boxBarcode" v-td-validate="{ruleType: 'goods.boxBarCode', isGroup: true, ns: 'boxBarcode', change: boxBarcode.length}">
 <el-table-column prop="property" label="条码属性" width="120">
 <template slot-scope="scope">
 <span>国际条码</span>
 </template>
 </el-table-column>
 <el-table-column prop="barcode" label="条码" width="200">
 <template slot-scope="scope">
 <!--<el-input placeholder="请输入8或13位条码" v-model.trim="scope.row.barcode" @change="inputSkuBarcode(scope.row,scope.$index,'box')" @blur="valiNum"></el-input>-->
 <el-input placeholder="请输入8或13位条码" v-model.trim="scope.row.barcode" class="valid-field-barcode" :validValue="scope.row.barcode"></el-input>
 </template>
 </el-table-column>
 <el-table-column prop="packingSize" label="装箱数量" width="110" >
 <template slot-scope="scope">
 <!--<el-input placeholder="如:4" class="ey-input-small" v-model.number.trim="scope.row.packingSize" type="number" @change="inputPackingSize" @focus="focusBoxBarcode(scope.$index)" @blur="valiNum"></el-input>-->
 <el-input placeholder="如:4" class="ey-input-small valid-field-packingSize" v-model.number.trim="scope.row.packingSize" type="number" :validValue="scope.row.packingSize"></el-input>
 </template>
 </el-table-column>
</el-table>
```
注意： 
   1. 对象应用时，v-td-validate绑定在其共同的父元素上，如scope.row.barcode 和 scope.row.packingSize对应的input；
   2. 当前对象是一个数组，具有新增，删除记录的操作，指令在初始时，只能执行一次，因此需要有一个对操作敏感的绑定值来触发重新绑定的动作：在指令的声明周期中，update钩子中，存在了value和oldValue，可以用来对比，发现变化，从而做绑定逻辑，因此需要一个敏感的绑定参数，这里选择了数组对boxBarcode.lengt做为change的值；

3. 对象绑定，需要有设置isGroup标识，同时在需要校验的子元素上需要添加对应的class类，用于定位校验元素，class规则为：valid-field-xxx,  xxx为与规则对应的属性，如：valid-field-barcode 即将应用 'goods.boxBarCode'命名下的barcode规则：
```
goods: {
 boxBarCode: {
   barcode: [{
     regExp: /\d{8}|\d{13}$/,
     errorMsg: '国际条码长度是18位或者13位',
     trigger: 'blur'
   }],
   packingSize: [{
     errorMsg: '必须为正数',
     trigger: 'blur',
     validate: (val) => {
        val = Number(val)
        return val > 0
     }
   }]
 }
}
```
### 联动校验
以某个页面test.vue为例，校验关联供应商中  ‘每个业务城市必须要有一个主供应商’

test.vue：
1.只需要在table表格里加上
```
v-td-validate="{trigger: 'blur',ruleType: 'goods.purchasePrice', isGroup: true, global: 'supplierList', ns: 'purchasePrice', change: supplierLengthChange}"
```
其中ruleType指向的是你的校验规则
其中global指向的是你需要校验的值（对象或数组）对应的键
其中change指向的是某个在你的表格变化时同时改变的值，用于触发输出重新绑定
```
<el-table :data="supplierList"
    v-td-validate="{trigger: 'blur',ruleType: 'goods.purchasePrice', isGroup: true, global: 'supplierList', ns: 'purchasePrice', change: supplierLengthChange}">
</el-table>
```
2.在rule.js中写联动校验的匹配规则
联动校验的规则写在UNION中validate: (val, global) 中 global获取的是页面中绑定的值（对象或数组）
```
purchasePrice: {
    UNION: [{
        errorMsg: '每个业务城市必须要有一个主供应商',
        trigger: 'change',
        validate: (val, global) => {
                let distorctCity = {}
                global.forEach((item) => {
                        if (!distorctCity[item.distorctCity]) {
                                distorctCity[item.distorctCity] = item.isPrimarySupplier
                        }
                })
                return !Object.values(distorctCity).some(val => !val)
        }
}]
```
### 更新日志
```
/**
 * version 0.0.1： 只支持单个输入的校验，支持修饰符的使用
 * 后续版本： 支持表单组的校验
 * 后续版本： 支持校验后，回调处理；支持逻辑相关的校验，支持联动校验（在对象组中的校验）
 * version: 0.0.2：支持对象组的校验；
 * 思路： 对象组传使用bing.value.isGroup来标识是对象组校验；
 * 此时： 规则n : 校验器函数1; 校验器函数n: 校验器1： 校验器1： 1校验器对象
 * rules: validate validate: validateFunc validateFunc: validator
 * rule: [regExp, errorMsg, validator, trigger]
 * ruleType: ruleConfig: {property1: rules, property2: rules} 做加工生成 [....new Validate(rules, value)], 再去validateFunc中做匹配逻辑
 * version: 0.0.3 : 支持联动逻辑
 * 思路：1. 对象组传递的bind.value中传递一个当前对象组对象过来，存放在 bind.value.global
 * 2. 规则的validate校验中增加global,允许联动global中的其他字段来做校验；
 * 3. 实现原理：通过在各个子元素校验时，发送一个union的事件，而父元素监听一个union事件来响应；本质是将联动的规则放入了父元素中去响应。要求配置的rules中存放一个UNION的规则对象
 */
 ```
