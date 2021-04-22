const random = require('random')
const axios = require('axios')

const max = 130

async function getCos() {
  try {
   let { data }= await axios("https://www.dmoe.cc/random.php?return=json")  
   const file = data.imgurl
   return [
      {
        type: 'image',
        data:{
		file	
        }
      }
    ]
  } catch (e) {
    console.error('[bizhi]', e)
    return [
      {
        type: 'text',
        data: {
          text: '壁纸走丢了'
        }
      }
    ]
  }
}

module.exports = {
  getCos
}
