/* eslint-disable @typescript-eslint/no-var-requires */
/* 请求路径请询问管理员 */
const fs = require('fs')
const axios = require('axios')
const outputFilePath = './src/types/model.d.ts'

/* 获取类型 */
function getTypeof(sqlType) {
  let isNumber = /(tinyint)|(mediumint)|(int)|(bigint)/.test(sqlType)

  return isNumber ? 'number' : 'string'
}

/* 获取接口键名 */
function getInterfaceKey(key) {
  let endIndex
  let storageKey = ''
  let endString = ''
  const lastThreeString = key.slice(-4)
  switch (lastThreeString) {
    case `${lastThreeString.slice(0, 1)}ies`:
      endIndex = key.lastIndexOf('ies')
      endString = 'y'
      break
    case `${lastThreeString.slice(0, 1)}ses`:
    case `${lastThreeString.slice(0, 1)}xes`:
    case 'ches':
    case 'shes':
    case `${lastThreeString.slice(0, 1)}oes`:
      endIndex = key.lastIndexOf('es')
      break
    case `${lastThreeString.slice(0, 3)}s`:
    case `${lastThreeString.slice(0, 2)}s`:
    case `${lastThreeString.slice(0, 1)}s`:
      endIndex = key.lastIndexOf('s')
  }

  // if (/ies$/.test(key)) {
  //   endIndex = key.lastIndexOf('ies')
  //   endString = 'y'
  // } else if (/es$/.test(key)) {
  //   endIndex = key.lastIndexOf('es')
  //   endString = ''
  // } else if (/s$/.test(key)) {
  //   endIndex = key.lastIndexOf('s')
  //   endString = ''
  // }
  storageKey = key.slice(0, endIndex)
  storageKey = `${storageKey.slice(0, 1).toUpperCase()}${storageKey.slice(
    1
  )}${endString}`
  return storageKey
}

axios({
  url: 'http://192.168.1.124/api/admin/structure?key=51jhDeApP4uIRuPqUssVtQfZZoiIlg1K', // 请求路径
  method: 'get',
  // method: 'post',
  /* get */
  params: {},

  /* post */
  data: {},
  headers: {
    Authorization: 'Bearer 100577|fnpQtmpwtEvz3RgXNCqfzlkndYekwal8t24YzsJm'
  }
}).then((res) => {
  let { data } = res.data
  const record = data
  let descContentStr = ''
  for (const table in record) {
    descContentStr += `interface ${getInterfaceKey(table)}{\n`
    const fieldsOption = record[table]
    fieldsOption.forEach((filedOption, index) => {
      descContentStr += `${index ? '\n    ' : '    '}${
        filedOption.name
      }: ${getTypeof(filedOption.type)};`
    })
    descContentStr += `\n  }\n  `
  }

  let descStr = `
declare namespace Model {
  ${descContentStr}
}`

  fs.writeFileSync(outputFilePath, descStr)
})
