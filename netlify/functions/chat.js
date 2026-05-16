const CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Content-Type':'application/json'};
exports.handler = async function(event){
if(event.httpMethod==='OPTIONS')return{statusCode:200,headers:CORS,body:''};
if(event.httpMethod!=='POST')return{statusCode:405,headers:CORS,body:'Method Not Allowed'};
let body;
try{body=JSON.parse(event.body);}catch{return{statusCode:400,headers:CORS,body:JSON.stringify({error:'Invalid JSON'})};}
const{system,messages}=body;
if(!messages||messages.length===0)return{statusCode:400,headers:CORS,body:JSON.stringify({error:'No messages'})};
const apiKey=process.env.GEMINI_API_KEY;
if(!apiKey)return{statusCode:500,headers:CORS,body:JSON.stringify({error:'API key missing'})};
const geminiMessages=messages.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:String(m.content)}]}));
const url=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AIzaSyB8WUZ-ErLR-bSGZ3UqQ_slDYF_vFAJTSY`;
try{
const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({system_instruction:{parts:[{text:system||'Wewe ni msaidizi wa elimu wa Lupanulla Tanzania.'}]},contents:geminiMessages,generationConfig:{maxOutputTokens:1000,temperature:0.7}})});
const data=await response.json();
if(!response.ok)return{statusCode:502,headers:CORS,body:JSON.stringify({content:[{type:'text',text:'Samahani, huduma ya AI ina tatizo. Jaribu tena. 🙏'}]})};
const reply=data?.candidates?.[0]?.content?.parts?.[0]?.text||'Samahani, sijapata jibu.';
return{statusCode:200,headers:CORS,body:JSON.stringify({content:[{type:'text',text:reply}]})};
}catch(err){return{statusCode:500,headers:CORS,body:JSON.stringify({content:[{type:'text',text:'Hitilafu ya mtandao. Jaribu tena. 🙏'}]})}}};
