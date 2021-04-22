const axios = require('axios')
const new_pattern =  /CQ/i
async function getMsg(msg,nickname) {
  try {
    var key = "266e43887a7dd0fb955427e9939fbba0"  //填写你的天行机器人的key
    var url = 'http://api.tianapi.com/txapi/robot/index?key='+key+'&question='+encodeURIComponent(msg)+'&priv=1'
    var answer = "" 
    if(!new_pattern.test(msg)){
   	const { data } = await axios(url)
    	answer = data.newslist[0].reply
    	if(answer==='您是我的Master--'){
    		answer += nickname
    	}    	    
    return [
      {
        type: 'text',
        data: {
          text: answer
        }
      }
    ]
  }
  else{
     const file = "https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201902%2F05%2F20190205174907_X38JA.thumb.700_0.jpeg&refer=http%3A%2F%2Fb-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1621659470&t=9c184013bfcf88accefa3a19ae99f183"
     return[
	 {
	    type:'image',
            data:{
	        file
	    }
       }
     ]
  }	  
  } catch (e) {
    console.error('[chat]', e)
    return [
      {
        type: 'text',
        data: {
          text: '出了点小问题,重试一下呢？'
        }
      }
    ]
  }
}

module.exports = {
  getMsg
}
