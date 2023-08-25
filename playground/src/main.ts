import './style.css'
import DEMOS from 'virtual:files-loader'

const app = document.getElementById('app')!

const settled = DEMOS

app.textContent = JSON.stringify(settled, null, 2)
