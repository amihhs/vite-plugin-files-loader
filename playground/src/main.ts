import './style.css'
import DEMOS from 'virtual:files-loader' // =>  /demos/..
import BUTTON_DEMOS from 'virtual:files-loader/button' // => /demos/button/src/..
import BUTTON_BASIC_DEMOS from 'virtual:files-loader/button/basic' // => /demos/button/src/basic/..
import { resolveImportPaths, resolveImportFiles } from '../../src/index'
const app = document.getElementById('app')!

console.log(DEMOS, BUTTON_DEMOS, BUTTON_BASIC_DEMOS)



await resolveImportPaths(DEMOS)
await resolveImportFiles(BUTTON_DEMOS)
await resolveImportFiles(BUTTON_BASIC_DEMOS)


const settled = JSON.stringify(DEMOS, null, 2) 
+ '\n\n' + JSON.stringify(BUTTON_DEMOS, null, 2) 
+ '\n\n' + JSON.stringify(BUTTON_BASIC_DEMOS, null, 2) 


app.textContent = settled
