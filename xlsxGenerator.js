var xlsx = require('xlsx');

var HEADERS = ['时间', '交易对', '方向', '价格' , '数量', '成交额', '手续费'];
module.exports = function (trads){
    const headers = HEADERS
        .map((v, i) => Object.assign({}, { v: v, position: String.fromCharCode(65 + i) + 1 }))
        .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});
    const data = trads
        .map((v, i) => HEADERS.map((k, j) => Object.assign({}, { v: v[k], position: String.fromCharCode(65 + j) + (i + 2) })))
        .reduce((prev, next) => prev.concat(next))
        .reduce((prev, next) => Object.assign({}, prev, { [next.position]: { v: next.v } }), {});
    
        const output = Object.assign({}, headers, data);
    // 获取所有单元格的位置
    const outputPos = Object.keys(output);
    // 计算出范围
    const ref = outputPos[0] + ':' + outputPos[outputPos.length - 1];

    const workbook = {
        SheetNames: ['result'],
        Sheets: {
            'result': Object.assign({}, output, { '!ref': ref })
        }
    };
    xlsx.writeFile(workbook, 'output.xlsx')
}