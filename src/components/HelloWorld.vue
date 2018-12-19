
<template>
  <div class="test">
    <p>测试对象组联动校验</p>
    <div v-td-validate.isNotEmpty="{ruleType: 'test', ns: 'test', trigger: 'blur', global: 'testObj', isGroup: true}" style="">
      <div style="">
        <el-input type='number' label="参数一" v-model="testObj.param1" class="valid-field-param1" :validValue="testObj.param1" placeholder="参数一"></el-input>
      </div>
      <div style="">
        <el-input type='number' label="参数二" v-model="testObj.param2" class="valid-field-param2" :validValue="testObj.param2" placeholder="参数二"></el-input>
      </div>
      <div style="">
        <el-input type='number' label="参数三" v-model="testObj.param3" class="valid-field-param3" :validValue="testObj.param3" placeholder="参数三"></el-input>
      </div>
      <div style="">
        <el-input type='number' label="参数四" v-model="testObj.param4" class="valid-field-param4" :validValue="testObj.param4" placeholder="参数四"></el-input>
      </div>
    </div>
    <p>测试单个元素校验</p>
    <el-input type='number' v-model="testObj.param1" :validValue="testObj.param1" v-td-validate="{trigger: 'blur', ns: 'xx', ruleType: 'test.param1'}"></el-input>
    <el-input type='number' v-model="test" :validValue='test' v-td-validate="{trigger: 'blur', ns: 'xxx', ruleType: 'Integer'}"></el-input>
    <p>测试数组对象联动校验</p>
    <el-table :data="tableData" v-td-validate="{isGroup: true, global: 'tableData', ns: 'testArr', ruleType: 'testArr', trigger: 'blur'}">
      <el-table-column prop="param1" label="参数一">
        <template slot-scope="scope">
          <el-input v-model.number.trim="scope.row.param1" placeholder="请输入" type="number"
                    class="valid-field-param1" :validValue="scope.row.param1"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="param2" label="参数二">
        <template slot-scope="scope">
          <el-input v-model.number.trim="scope.row.param2" placeholder="请输入" type="number"
                  class="valid-field-param1" :validValue="scope.row.param2"></el-input>
        </template>
      </el-table-column>
      <el-table-column prop="param3" label="参数三">
        <template slot-scope="scope">
          <el-input v-model.number.trim="scope.row.param3" placeholder="请输入" type="number"
                  class="valid-field-param1" :validValue="scope.row.param3"></el-input>
        </template>
      </el-table-column>
    </el-table>
    <p>测试select类型的校验</p>
    <h4>普通select选择器</h4>
    <el-select v-model="value" placeholder="请选择" :validValue="value" v-td-validate="{ns: 'select', ruleType: 'selectTest', trigger: 'change'}" clearable>
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
  </div>
</template>
<script>
export default {
  name: 'helloWorld',
	data () {
		return {
      testObj: {
        param1: '',
        param2: '',
        param3: '',
        param4: ''
      },
      test: '',
      tableData: [{
        param1: '',
        param2: '',
        param3: ''
      }, {
        param1: '',
        param2: '',
        param3: ''
      }],
      options: [{
        value: '选项1',
        label: '黄金糕'
      }, {
        value: '选项2',
        label: '双皮奶'
      }, {
        value: '选项3',
        label: '蚵仔煎'
      }, {
        value: '选项4',
        label: '龙须面'
      }, {
        value: '',
        label: '北京烤鸭'
      }],
      value: ''
		}
	},
	methods: {}
}
</script>
<style scoped>
.test{
  position: relative;
}
</style>