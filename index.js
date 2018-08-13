/**
 * 火币单币种交易记录导出
 * 请在火币创建新的 access key 并修改下方注释处变量值
 * 执行 
 * $ npm install
 * $ node index.js
 * 最终输出为 output.xlsx
 */

var ccxt = require('ccxt');
var R = require('ramda');
var moment = require('moment');
var xlsxExport = require('./xlsxGenerator')

var ACCESS_KEY = ''; //  火币 ACCESS_KEY
var SECRET_KEY= ''; // 火币 SECRET_KEY
var SYMBOL = ''; // 要查询的币种，如 EOS
var START_DATE = '2017-01-01'; // 起始查询时间
var END_DATE = '2018-08-13';  // 结束查询时间

var exchangeId = 'huobipro'
, exchangeClass = ccxt[exchangeId]
, exchange = new ccxt.huobipro({
    'apiKey': ACCESS_KEY,
    'secret': SECRET_KEY,
});
  
exchange
.loadMarkets()
.then(function(res) {
   return Object.keys(res)
})
.then(function(res){
    return res.filter(function(i){
        return i.split('/')[0] === SYMBOL;
    })
})
.then(function(pairs){
    return Promise.all(pairs.map(function(pair){
        if (exchange.has['fetchMyTrades']) {
            return exchange.fetchMyTrades(pair, 0, null, {
                symbol: pair.replace('/', '').toLowerCase(),
                'start-date': START_DATE,
                'end-date': END_DATE
            });
        }
    }))
})
.then(function(trads){
   return R.flatten(trads).sort(function(a, b){
       return b.timestamp - a.timestamp
   })
})
.then(function(trads){
    var res = trads.map(function(i){
        return {
            '时间': moment(i.timestamp).format('YYYY-MM-DD'),
            '交易对': i.symbol,
            '方向': i.side === 'sell' ? '卖出'  : '买入',
            '价格': i.price,
            '数量': i.amount,
            '成交额': i.price * i.amount,
            '手续费': i.fee.cost + ' ' + i.fee.currency
        }
    })
    xlsxExport(res);
})
.catch(function(err){
    console.log(err)
})

