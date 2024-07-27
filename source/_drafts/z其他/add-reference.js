/* eslint-disable @typescript-eslint/no-var-requires */
// 根据后端 reference 接口，自动前端 ts 枚举值
const fs = require('fs')
const axios = require('axios')
const outputFilePath = './src/types/reference.d.ts'

async function getData() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        userStatuses: [
          {
            label: '状态1',
            value: 1,
          },
        ],
      })
    })
  })
}

function transforData(data, fn) {
  return fn(data)
}

function genarate() {}

function outputFile() {}

async function run() {
  let data = await getData()
  // data = transforData(data)
}

function x() {
  axios({
    url: 'https://yapi.gzhclw.com/mock/98/global/reference',
    method: 'get',
  }).then((res) => {
    let { data } = res.data
    let fileStr = ''
    let constantTypeStr = ''
    let constantKeyStr = ''
    let ConstantMapStr = 'type ConstantMap = {'
    let ConstantKeyMapStr = 'type ConstantKeyMap = {'
    Object.keys(data).forEach((key) => {
      if (data[key][0].key) {
        let constantItemStr = ''
        data[key].forEach((item) => {
          constantItemStr += `\r\n  | '${item.key}' // ${item.label}`
        })
        const referenceKey = key.replace(key[0], key[0].toUpperCase())
        constantKeyStr += `  type ${referenceKey}ConstantKey =${constantItemStr}\r\n`
        constantTypeStr += `  type ${referenceKey}ConstantMap = Record<${referenceKey}ConstantKey, ReferenceItem>\r\n\r\n`

        ConstantMapStr += `\r\n    ${key}: ${referenceKey}ConstantMap`
        ConstantKeyMapStr += `\r\n    ${key}: ${referenceKey}ConstantKey`
      }
    })

    ConstantMapStr += '\r\n  }'
    ConstantKeyMapStr += '\r\n  }'

    fileStr += `
  
  declare namespace Reference {
  
    /* refer 枚举值 */
    interface ReferenceItem {
  
      /* 中文标题 */
      label: string;
  
      /* 数据库标识值 */
      value: any;
  
      /* 常量名 */
      key?: string;
  
      /* 常量名 */
      children?: ReferenceItem[];
  
      /* 前端自行定制的属性，为了在应用中设置颜色 */
      color?: string;
    }
  
    /* 具体常量键 */
  ${constantKeyStr}
    /* 具体常量配置项 */
  ${constantTypeStr}
    /* 常量映射类型 */
    ${ConstantMapStr}
  
    /* 常量键映射类型 */
    ${ConstantKeyMapStr}
  
    /* reference 枚举键 */
    type ReferenceKey = keyof ConstantMap
  }
  
  `

    fs.writeFileSync(outputFilePath, fileStr)
  })
}
