import './style.css'
import DEMOS from 'virtual:files-loader' // =>  /demos/..
import BUTTON_DEMOS from 'virtual:files-loader/button' // => /demos/button/src/..
import BUTTON_BASIC_DEMOS from 'virtual:files-loader/button/basic' // => /demos/button/src/basic/..

const app = document.getElementById('app')!

const settled = JSON.stringify(DEMOS, null, 2) 
+ '\n' + JSON.stringify(BUTTON_DEMOS, null, 2) 
+ '\n' + JSON.stringify(BUTTON_BASIC_DEMOS, null, 2) 

app.textContent = settled
