/**
 * 版本： v0.0.1__beta
 * 校验指令：
 * 思路解析：
 * 1. 校验的基本元素： rule规则  validate校验器   validator校验器对象； 关系为： n:1 n:1
 *    rule: {regExp: 'xxx‘, errorMsg: 'xxx', validate, trigger: ''} : {正则， 错误提示，校验器, 触发方式}
 *    validate: 校验器： 主要负责一系列rule的校验工作，最终产出{result, errorMsg}
 *    validator: 校验器对象
 * 2. 规则分为：内联规则，自定义规则，默认规则, 修饰符规则
 *    内联规则：为指令绑定对象bind.value中传递过来的规则,为[]形式
 *    自定义规则：为用户自定义的规则，配置在指定的规则文件内
 *    默认规则：也为通用规则，收集的一些通用的文本校验规则
 *    修饰符规则：为绑定的修饰符带来的补充规则：目前支持positive, notEmpty；
 * 3. 最终会将检验器对象附在绑定的vm实例上，以供判断时使用;vm为当前绑定组件所在的父组件；一个vm存在一个validateObj对象，该对象存放了vm上所有validator对象的信息
 * 4. TODO： 增加校验输出，增加联动的校验，增加对自定义validate的支持，增加对对象组的支持,增加回调
 * 5. 对象组(Array, Object)校验实例数据： ruleType = 'testObj', testObj: {a, b},规则定义在rules中；
 *    初始化：获取绑定值，解析绑定值，创建校验器对象，挂在校验器对象，更新校验结果
 * 6. 使用方法： 分为单独使用/对象组使用(类似form表单); 示例：
 *    对象组：
 *    <div v-td-validate="{rules: {a: [{}]}, b: [{}]}, ruleType: 'test'">
 *      <el-input class="valid-field-a" :validValue="obj.a" v-model="obj.a"></el-input>
 *      <el-input class="valid-field-b" :validValue="obj.b" v-model="obj.b"></el-input>
 *    </div>
 */
// 外接配置规则
// import configRules from './rules'

// 预定义默认选项
const specialEvents = ['focus', 'blur', 'input', 'change']
const unionEvent = 'union'
const modifierStr = 'positive,notEmpty'
// 默认的规则：规则分为默认规则，传入规则，业务规则三类
const configRules = {
  test: {
    param1: [{
      errorMsg: '必须为正数',
      validate: (val) => {
        val = Number(val)
        return val > 0
      }
    }],
    param2: [{
      errorMsg: '必须为正数',
      validate: (val) => {
        val = Number(val)
        return val > 0
      }
    }],
    param3: [{
      errorMsg: '必须为正数',
      validate: (val) => {
        val = Number(val)
        return val > 0
      }
    }],
    param4: [{
      errorMsg: '必须为正数',
      validate: (val) => {
        val = Number(val)
        return val > 0
      }
    }],
    UNION: [{
      errorMsg: '参数一不能大于参数二',
      validate: (val, global) => {
        return global.param1 <= global.param2
      }
    }]
  },
  testArr: {
    param1: [{
      errorMsg: '必须为正数',
      validate: (val) => {
        val = Number(val)
        return val > 0
      }
    }],
    param2: [{
      errorMsg: '必须为正数',
      validate: (val) => {
        val = Number(val)
        return val > 0
      }
    }],
    param3: [{
      errorMsg: '必须为正数',
      validate: (val) => {
        val = Number(val)
        return val > 0
      }
    }],
    param4: [{
      errorMsg: '必须为正数',
      validate: (val) => {
        val = Number(val)
        return val > 0
      }
    }],
    UNION: [{
      errorMsg: '参数一已存在',
      validate: (val, global) => {
        let value = global[0].param1
        let result = global.some((item, index) => {
          if (index === 0) return false
          return item.param1 === value
        }) || false
        if (!value) result = false
        return !result
      }
    }, {
      errorMsg: '参数一不能大于参数二',
      validate: (val, global) => {
        let result = global.some(item => {
          return item.param1 > item.param2
        })
        return !result
      }
    }]
  },
  selectTest: [{
    errorMsg: '不能为空',
    validate: (val) => {
      console.log('我能触发')
      return val && val !== ''
    }
  }]
}
const defaultRuleMap = {
  // 手机号
  Phone: [{
    regExp: /^1[3|4|5|7|8]\d{9}$/g,
    errorMsg: '手机号码格式错误'
  }],
  Mail: [{
    regExp: /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/g,
    errorMsg: '邮箱格式错误'
  }],
  BankCardNum: [{
    regExp: /^\d{10, 19}$/g,
    errorMsg: '银行账号格式错误'
  }],
  Integer: [{
    regExp: /^[1-9]\d*$/g,
    errorMsg: '只能输入正整数'
  }],
  Payment: [{
    regExp: /^[1-9]\d?$|^1[01]\d$|^120$/g,
    errorMsg: '付款天数只能在1-120天之间'
  }],
  BarCode: [{
    regExp: /^69\d{6}|\d{11}$/g,
    errorMsg: '国际条码长度是8位或者13位'
  }],
  PositiveFloat: [{
    regExp: /^[1-9]\d*\.?\d*|0\.\d+$/g,
    errorMsg: '只能输入正数'
  }],
  AreaCode: [{
    regExp: /\d{3}$/g, // 固定电话区号
    errorMsg: '固定电话区号格式错误'
  }],
  TelePhone: [{
    regExp: /\d{8}|\d{4}-\{7,8}$/g,
    errorMsg: '固定电话格式错误'
  }],
  // 价格
  price: [{
    regExp: /^([1-9]\d{0,9}(\.\d{1,2})?)$/,
    errorMsg: '价格必须为正数,第一个数字不能为0，小数不超过2位',
    trigger: 'blur'
  }]
}
const modifierRules = {
  notEmpty: {
    errorMsg: '不能为空',
    validate: (val) => {
      val = val.toString()
      return !!(val && val.trim())
    }
  },
  positive: {
    errorMsg: '请输入正数',
    validate: (val) => {
      val = Number(val)
      return val > 0
    }
  }
}
/******************辅助方法********************/
const emitEvent = function (el, eventName) {
  let event = document.createEvent('HTMLEvents')
  event.initEvent(eventName, true, true)
  el.dispatchEvent(event)
}

const isEmptyObject = function (obj) {
  //  null undefined 返回true
  if (obj === undefined) {
    return true
  }
  if (!obj) {
    return false
  }
  for (var n in obj) {
    return false
  }
  return true
}

const isEmptyString = function (str) {
  return !str || !str.trim()
}

/**
 * 校验器对象；提供对规则的校验方法
 * @param val
 * @param rules
 * @param globalObj 对象组对象 ，用于规则联动时使用；
 * @constructor
 */
const Validate = function (val, rules, globalObj) {
  this.validValue = val
  this.rules = rules
  this.globalObj = globalObj
  this.valid = function () {
      let result = true
      let errorMessage = ''
      let matched = false
      // 当有一个报错后，中断请求，不再校验后面的
      this.rules.some(rule => {
        let {errorMsg, regExp, validate} = rule
        // 最后校验required
        if (validate && typeof validate === 'function') {
          matched = validate(this.validValue, this.globalObj)
        } else if (regExp) {
          matched = regExp.test(this.validValue)
        }
        // 判断是否匹配上
        if (!matched) {
          result = false
          errorMessage = errorMsg
          return true
        }
      })
      return {result: result, errorMsg: errorMessage}
  }
  this.toString = function () {
    return '[Function Validate]: this is a Validate Function'
  }
}

/**
 * 检查传入的参数是否合理
 * 校验：rules/ruleType
 * @param options
 */
const check = function (bindingValue, modifiers) {
  let {rules, ruleType, ns, isGroup} = bindingValue
  if (!rules && !ruleType && !isEmptyObject(modifiers)) {
    throw new Error('请传递rules,或者传递ruleType值,或填写修饰符')
  }
  if (isEmptyString(ns)) {
    throw new Error('请指定校验器的命名空间')
  }
  if (!isEmptyObject(rules)) {
    if (!isGroup && !rules.self) {
      throw new Error('单独使用时，rules请传递self来绑定规则，形式如：{self: [{....rule}]}')
    }
  }
  if (ruleType) {
    let ruleList = getRulesByType(ruleType)
    if (isEmptyObject(ruleList)) {
      throw new Error('无法找到匹配的规则，请确定相应规则存在')
    }
  }
  return true
}

/**
 * dom操作： 插入提示信息到指定的el之后
 * @param newEl 新节点
 * @param targetEl 目标节点
 */
const insertAfter = function (newEl, targetEl) {
  let parentEl = targetEl.parentNode
  if (parentEl.lastChild === targetEl) {
    parentEl.appendChild(newEl)
  } else {
    parentEl.insertBefore(newEl, targetEl.nextSibling)
  }
}

/**
 * 获取定位信息: 这里的逻辑需要按需补充,因为需要校验的元素的定位信息受外部影响
 * @param ele
 * @param position
 * @returns {*}
 */
const getBoundRect = function (ele, position, parent) {
  let offset = 0
  let {left, top, height} = ele.getBoundingClientRect()
  let {left: parentLeft} = parent.getBoundingClientRect()
  if (ele.tagName === 'BODY') {
    return {
      left,
      top: top + height,
      position: 'absolute'
    }
  }
  if (position === 'fixed') {
    return {
      left: 0,
      top: height,
      position: 'absolute'
    }
  }
  if (position === 'static') {
    return {
      left: (left - parentLeft) / 2,
      top: offset + height,
      position: 'absolute'
    }
  }
  if (position === 'relative') {
    return {
      left: 0,
      top: 0,
      position: 'relative'
    }
  }
  if (position === 'absolute') {
    // let parent = ele.parentNode
    // return getBoundRect(parent)
    return {
      left: 0,
      top: height,
      position: 'absolute'
    }
  }
  return {
    left: 0,
    top: height,
    position: 'absolute'
  }
}

/**
 * 获取提示元素的定位:这里需要考虑父元素的定位方式，动态调整定位位置
 * @param el: 当前校验元素
 */
const getTipLocation = function (el) {
  // TODO location
  let parent = el.parentNode
  let getStyle = window.getComputedStyle
  let position = getStyle ? getStyle(parent, null).position : parent.currentStyle.position
  return getBoundRect(el, position, parent)
}

/**
 * 修改输入框边框颜色，或是移除颜色
 * @param el
 * @param flag
 */
const displayElTip = function (el, flag) {
  let inputChildren = el.querySelectorAll('input.el-input__inner')
  for (let child of inputChildren) {
    flag ? child.classList.add('validate-error') : child.classList.remove('validate-error')
  }
}

/**
 * dom 操作： 将提示信息附在el之后;添加定位逻辑，确保提示信息出现的准确
 * @param el
 * @param message
 */
const dispatchTip = function (el, message) {
  let tip = document.createElement('DIV')
  tip.classList.add('validate-error-tip')
  let {left, top, position} = getTipLocation(el)
  tip.style.left = left + 'px'
  tip.style.top = top + 'px'
  tip.style.position = position
  tip.innerText = message
  // 改变外边框的颜色
  displayElTip(el, true)
  insertAfter(tip, el)
}

/**
 * dom 操作： 将提示信息分离el
 * @param el
 */
const unpatchTip = function (el) {
  // 恢复外边框
  displayElTip(el, false)
  let tip = el.nextSibling
  if (tip && tip.nodeType === 1 && tip.classList.contains('validate-error-tip')) {
    tip.parentNode.removeChild(tip)
  }
}

/**
 * 根据ruleType获取相应的规则对象
 * @param ruleType
 * @returns : 对象组： {x: [{rule}], y: [{rule}]}; 单独使用： {self: [{rule}]}
 */
const getRulesByType = function (ruleType) {
  let rules = {}
  let nest = ruleType.split('.')
  // ruleType有嵌套，则去从configRules中去查找对象
  if (nest.length > 1) {
    let obj = configRules
    for (let o of nest) {
      obj = obj[o]
    }
    rules = obj
  } else {
    let ruleList = configRules[ruleType] ? configRules[ruleType] : defaultRuleMap[ruleType] ? defaultRuleMap[ruleType] : []
      rules = ruleList
  }
  // 对于返回为数组的情况，将其装载为对象
  if (Object.prototype.toString.call(rules) === '[object Array]') {
    rules = {self: rules}
  }
  return rules
}

/**
 * 获取规则配置信息
 * @param rules  来源于bindValue的内联规则对象{a:[rule]}
 * @param ruleType
 * @param modifier
 * @returns {*}
 */
const getRulesConfig = function (rules, ruleType, modifier) {
  let config = (rules && !isEmptyObject(rules)) ? rules : getRulesByType(ruleType)
  // 最后将modifier给混入进去
  let modifierList = []
  if (!isEmptyObject(modifier)) {
    modifierStr.split(',').map(flag => {
      if (modifier[flag]) {
        modifierList.push(modifierRules[flag])
      }
    })
    // 将修饰符规则混入到每一个属性的规则中去
    if (!isEmptyObject(config)) {
      for (let o in config) {
        if (Object.prototype.toString.call(config[o]) === '[object Array]') {
          config[o] = config[o].concat(modifierList)
        }
      }
    } else {
      config['self'] = [].concat(modifierList)
    }
  }
  return config
}

/**
 * 绑定事件: 暂时不考虑trigger中带有多个事件名的情况，不考虑同一对象的多个规则使用各自的trigger方式，若有，则默认全部监听
 * 绑定前，先做一次解绑
 */

const bindEvent = function (vm, el, rules, trigger, validate, ns) {
  let events = []
  let eventsMap = []
  for (let rule of rules) {
    let localTrigger = rule.trigger
    if (events.indexOf(localTrigger) === -1) {
      events.push(localTrigger)
    }
  }
  if (trigger && events.indexOf(trigger) === -1) {
    events.push(trigger)
  }
  // 清理数组中的undefined，'', null 元素
  events = events.filter(event => {
    return !!event
  })
  // 做绑定处理:对于特殊事件则绑定到ele旗下的input元素上去，否则就不绑定
  for (let event of events) {
    if (specialEvents.indexOf(event) > -1) {
      let input = el.querySelector('input')
      if (input) {
        input.addEventListener(event, validate)
        eventsMap.push({el: input, event: event, func: validate})
      }
    } else {
      el.addEventListener(event, validate)
      eventsMap.push({el: el, event: event, func: validate})
    }
  }
  // 存储事件集，方便后续销毁
  vm.bindingEventObj[ns] = vm.bindingEventObj[ns] || []
  vm.bindingEventObj[ns] = vm.bindingEventObj[ns].concat(eventsMap)
}

/**
 * 解除事件绑定
 * @param vm
 * @param ns
 */
const unbindEvents = function (vm, ns) {
  let eventMaps = vm.bindingEventObj[ns] || []
  for (let eventObj of eventMaps) {
    let {el, event, func} = eventObj
    el.removeEventListener(event, func)
  }
}

/**
 * 初始化事件
 * @param el
 * @param vm
 * @param bindingValue
 * @param modifier
 * @param ns
 * 优化： 防止重复绑定，需要将之前绑定的给清空掉
 */
const initEvents = function (el, vm, bindingValue, modifier, ns) {
    let rootEl = el
    let validator = vm.validateObj[ns]
    unbindEvents(vm, ns)
    let {rules, ruleType, isGroup, trigger, global} = bindingValue
    // 返回一个rule对象{xx: {rules: [{}]}}
    let rulesConfig = getRulesConfig(rules, ruleType, modifier)
    if (isGroup) {
      // 绑定联动规则到根节点
      if (rulesConfig.UNION) {
        let unionFn = createUnionValidate(vm, el, rulesConfig.UNION, ns, global)
        bindEvent(vm, el, rulesConfig.UNION, unionEvent, unionFn, ns)
        validator.validates.push(unionFn)
      }
      // hook: 判断element-table的fixed存在与否
      if (el.classList.contains('el-table')) {
        let fixedEle = el.querySelector('.el-table__fixed-body-wrapper')
        if (fixedEle) {
          rootEl = el.querySelector('.el-table__body-wrapper')
        }
      }
      let validEles = rootEl.querySelectorAll('[class*="valid-field"]')
      for (let ele of validEles) {
        let classList = ele.classList
        for (let o in rulesConfig) {
          if (o === unionEvent) continue
          let flagClass = 'valid-field-' + o
          if (classList.contains(flagClass)) {
            let ruleList = rulesConfig[o]
            let validateFunc = createValidate(vm, ele, ruleList, ns, global, isGroup)
            bindEvent(vm, ele, ruleList, trigger, validateFunc, ns)
            validator.validates.push(validateFunc)
          }
        }
      }
    } else {
      let ruleList = rulesConfig['self']
      let validateFunc = createValidate(vm, el, ruleList, ns)
      bindEvent(vm, el, ruleList, trigger, validateFunc, ns)
      validator.validates.push(validateFunc)
    }
}
/**
 * 获取元素上绑定的validValue属性值；该值不一定会绑定在当前的el上，也可以在el的任意子节点上;查看$attrs，$inheritAttrs定义
 * @param el
 */
const getValidValue = function (el) {
  let value = el.value
  if (el.tagName !== 'INPUT') {
    value = el.getAttribute('validValue')
  }
  if (value) {
    console.log(value)
    return value
  } else {
    for (let child of el.children) {
      return getValidValue(child)
    }
  }
}

/**
 * 创建联动校验器
 * @param vm
 * @param el
 * @param rules
 * @param ns
 * @param global 联动值对应的字符串
 * @param globalObj 联动值
 * @returns {function(*)}
 */
const createUnionValidate = function (vm, el, rules, ns, global) {
  let validateFunc = _ => {
    let parentNs = vm.validateObj[ns] || {}
    let parentNode = el.parentNode
    if (!parentNode || parentNode.nodeType !== 1) {
      return
    }
    let globalObj = vm[global]
    let value = null
    // 清楚已有校验框
    unpatchTip(el)
    // 做校验
    let validator = new Validate(value, rules, globalObj)
    let {result, errorMsg} = validator.valid()
    if (!result) {
      dispatchTip(el, errorMsg)
      // 更新validator的result和massage
      parentNs.validResult = result
      parentNs.validMsg = errorMsg
    }
    // 更新validator结果
    updateValidatorResult(parentNs)
  }
  return validateFunc
}

const updateValidatorResult = function (validator) {
  // 判断validator下是否还有错误提示存在，若没有，则更新validator的结果
  let rootEl = validator.el
  let tips = rootEl.querySelectorAll('div.validate-error-tip')
  let unionTip = rootEl.nextSibling
  let flag = unionTip && unionTip.nodeType === 1 && unionTip.classList.contains('validate-error-tip')
  if (!tips.length && !flag) {
    validator.validResult = true
    validator.validMsg = ''
  }
}

/**
 * 创建过滤器：绑定事件
 * @param vm
 * @param el
 * @param rules
 * @param ns
 */
const createValidate = function (vm, el, rules, ns, globalObj, isGroup) {
  let validateFunc = _ => {
    let parentNs = vm.validateObj[ns] || {}
    let parentNode = el.parentNode
    if (!parentNode || parentNode.nodeType !== 1) {
      return
    }
    let value = getValidValue(el)
    // 清楚已有校验框
    unpatchTip(el)
    // 做校验
    let validator = new Validate(value, rules, globalObj)
    let {result, errorMsg} = validator.valid()
    if (!result) {
      dispatchTip(el, errorMsg)
      // 更新validator的result和massage
      parentNs.validResult = result
      parentNs.validMsg = errorMsg
    }
    // 发送联动校验
    if (isGroup) {
      emitEvent(el, 'union')
    }
    // 更新validator结果
    updateValidatorResult(parentNs)
  }
  return validateFunc
}

const createValidator = function (vm, el, bindingValue, modifiers, ns) {
  let validator = {
    el: el,
    vm: vm,
    modifiers: modifiers,
    bindInstance: null,
    bindingValue: bindingValue,
    validates: [],
    validResult: true,
    validMsg: '',
    trigger: bindingValue.trigger,
    check: check,
    getRulesConfig: getRulesConfig
  }
  return validator
}

const TdValidate = {
  install: function (Vue) {
    if (Vue.prototype.$isServer) return
    // 默认配置
    const defaultValue = {
      rules: {},
      ruleType: '',
      trigger: '',
      value: ''
    }
    // 全局的校验器对象
    let validator = {}
    // 组件的父组件实例
    let vm = null
    // 初始化方法
    let initDirective = (el, binding, vnode) => {
      // vm取vnode中的值，防止外部的vm被覆盖掉
      let vm = vnode.context
      // 校验bindValue
      const bindingValue = Object.assign({}, defaultValue, binding.value)
      // 获取命名空间
      let ns = bindingValue.ns
      // 获取修饰符
      const modifiers = binding.modifiers
      // 获取绑定组件索引即绑定属性: {上下文中的索引，当前组件绑定的属性，是否是对象组}
      // 校验绑定值对象是否具备完整的属性
      check(bindingValue, modifiers)
      // 初始化构造器对象
      validator = createValidator(vm, el, bindingValue, modifiers, ns)
      validator.validates = []
      // 绑定实例
      vm.validateObj = vm.validateObj || {}
      vm.validateObj[ns] = validator
      // 存储事件
      vm.bindingEventObj = vm.bindingEventObj || {}
      // 绑定事件
      initEvents(el, vm, bindingValue, modifiers, ns)
    }
    // 注册指令
    Vue.directive('td-validate', {
      // 只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
      bind: function (el, binding, vnode) {
        // 存储上下文，即父组件实例
        vm = vnode.context
        // 初始化绑顶
        // 等待加载
        let delayFn = vm => {
          let a = setTimeout(_ => {
            if (vm._isMounted) {
              initDirective(el, binding, vnode)
              clearTimeout(a)
            } else {
              delayFn(vm)
            }
          }, 100)
        }
        // 延迟绑定
        delayFn(vm)
      },
      // 被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)
      inserted: function (el, binding, vnode) {
        // 这里初始化校验器的绑定实例
        validator.bindInstance = el
      },
      // 所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前
      update: function (el, binding, vnode, oldVnode) {},
      // 指令所在组件的 VNode 及其子 VNode 全部更新后调用。
      componentUpdated: function (el, binding, vnode, oldVnode) {
        let {value, oldValue} = binding
        if (value.change !== undefined && value.change !== oldValue.change) {
          vm.$nextTick(_ => {
            initDirective(el, binding, vnode)
          })
        }
      },
      // 只调用一次，指令与元素解绑时调用
      unbind: function (el, binding, vnode) {
        // 做事件解绑
        let ns = binding.value.ns
        unbindEvents(vm, ns)
      }
    })
  }
}
export default TdValidate
/**
 * version 0.0.1： 只支持单个输入的校验，支持修饰符的使用
 * 后续版本： 支持表单组的校验
 * 后续版本： 支持校验后，回调处理；支持逻辑相关的校验，支持联动校验（在对象组中的校验）
 * version: 0.0.2：支持对象组的校验；
 * 思路： 对象组传使用bing.value.isGroup来标识是对象组校验；
 * 此时： 规则n : 校验器函数1;   校验器函数n: 校验器1：   校验器1： 1校验器对象
 *       rules: validate      validate: validateFunc     validateFunc: validator
 *       rule: [regExp, errorMsg, validator, trigger]
 *       ruleType: ruleConfig: {property1: rules, property2: rules} 做加工生成 [....new Validate(rules, value)], 再去validateFunc中做匹配逻辑
 * version: 0.0.3 : 支持联动逻辑
 * 思路：1. 对象组传递的bind.value中传递一个当前对象组对象过来，存放在 bind.value.global
 *      2. 规则的validate校验中增加global,允许联动global中的其他字段来做校验；
 *      3. 实现原理：通过在各个子元素校验时，发送一个union的事件，而父元素监听一个union事件来响应；本质是将联动的规则放入了父元素中去响应。要求配置的rules中存放一个UNION的规则对象
 */
