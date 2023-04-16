import bot from './assets/bot.svg';
import user from './assets/user.svg';
const synth = window.speechSynthesis;

 const form = document.querySelector('form');
 const chatContainer = document.querySelector('#chat_container');

 let loadInterval;

 function loader(element){
  element.textContent ="";
  loadInterval = setInterval(() => {
    element.textContent += '.';

    if( element.textContent === '....'){
        element.textContent = '';
    }
  },300)
 }
 function typeText(element,text){
  let index = 0;

  let interval = setInterval(()=>{
    if(index<text.length){
      element.innerHTML += text.charAt(index); 
      index++;
    }
      else{
        clearInterval(interval);
      }
  },63)
 }
function generateUniqueID(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`
}
function chatStripe(isAi,value,uniqueId){
  return(
    `
    <div class = "wrapper ${isAi && 'ai'} bg-white">
    <div class = "chat mx-auto grid max-w-7xl grid-cols-1 items-center ">
    <div class = "profile">
    <img src = "${isAi ? bot : user}" alt ="${isAi ? 'bot':'user'}"/>
    </div>
    <div class = " mt-6 text-lg leading-8 text-gray-600 message" id = ${uniqueId}> ${value} </div>
    </div>
    </div>
    `
  )
}
let voices = [];
function bolo(kt){
  voices = synth.getVoices();
  const utterThis = new SpeechSynthesisUtterance(kt);

  utterThis.voice = voices[0];
    utterThis.pitch = 1;
    utterThis.rate = 1;
    synth.speak(utterThis);
}
let handleSubmit = async (e) => {
  console.log("trying");
  e.preventDefault();

  const data = new FormData(form);
  const imp = "explain "+ data.get('prompt') + " using a story";
  chatContainer.innerHTML += chatStripe(false,data.get('prompt'));

  form.reset();

  const uniqueId = generateUniqueID();
  chatContainer.innerHTML += chatStripe(true," ",uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  const response = await fetch('http://localhost:5000',{
    method:'POST',
    headers :{
      'Content-Type': 'application/json'
    },
    body:JSON.stringify({
      prompt:imp
    })
  })
  clearInterval(loadInterval);
  messageDiv.innerHTML = ``;

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();
    console.log({parseData});
    bolo(parseData);
    typeText(messageDiv,parseData);
  } else{
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }

}

form.addEventListener('submit',handleSubmit);
form.addEventListener('keyup',(e)=>{
  if(e.keyCode === 13){
    handleSubmit(e);
  }
})