import './style.css'


document.querySelector('#app').innerHTML = `
  <div class="text-red-500 text-3xl font-meidum">
   Bonjour tout le monde
   <button class="btn btn-primary">Clicker moi</button>
  </div>
`

setupCounter(document.querySelector('#counter'))
