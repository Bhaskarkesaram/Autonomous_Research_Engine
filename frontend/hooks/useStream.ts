"use client";

import { useRef } from "react";
import { useStore } from "../store/useStore";


export const useStream = () => {


const {
  appendStream,
  addLog,
  incrementQueries,
} = useStore();


const eventRef =
useRef<EventSource | null>(null);


const bufferRef =
useRef<string>("");


const fullResponse =
useRef<string>("");


const flushInterval =
useRef<ReturnType<typeof setInterval> | null>(
  null
);



/* =========================
   FLUSH BUFFER
========================= */

const startFlush = () => {

if (flushInterval.current)
  return;


flushInterval.current =
setInterval(() => {

if (!bufferRef.current)
  return;


appendStream(
 bufferRef.current
);


bufferRef.current = "";


},40);

};



const stopFlush = () => {

if (
 flushInterval.current
){

clearInterval(
 flushInterval.current
);

flushInterval.current=null;

}

};



/* =========================
   CONNECT SSE
========================= */

const connect = () => {


if(eventRef.current)
 return;


addLog(
 "🔌 Connecting SSE..."
);


const token =
localStorage.getItem(
"token"
);


if(!token){

addLog(
"❌ Login required",
"error"
);

return;

}


const es =
new EventSource(
`http://localhost:8000/stream?token=${token}`
);


eventRef.current = es;


startFlush();


// OPEN

es.onopen = () => {


addLog(
 "✅ Research session started",
 "success"
);


useStore
.getState()
.setThinking(
"🔍 Researching..."
);


};



// MESSAGE

es.onmessage =
(event:MessageEvent)=>{


try{


const data =
JSON.parse(
 event.data
);



// =======================
// THINKING STATUS
// =======================


if(
 data.type === "thinking"
){

useStore
.getState()
.setThinking(
 data.content
);

}



// =======================
// SOURCES
// =======================


if(
 data.type === "sources"
){

useStore
.getState()
.setSources(
 data.sources || []
);

}




// =======================
// STREAM TOKEN
// =======================


if(data.token){


const current =
fullResponse.current.length;



if(current > 200){

useStore
.getState()
.setThinking(
"🧠 Analyzing..."
);

}



if(current > 800){

useStore
.getState()
.setThinking(
"📝 Summarizing..."
);

}



bufferRef.current +=
data.token;


fullResponse.current +=
data.token;


}




// =======================
// DONE
// =======================


if(data.done){


if(
 bufferRef.current
){

appendStream(
 bufferRef.current
);

bufferRef.current="";

}



const finalText =
fullResponse
.current
.trim();



if(finalText){

useStore
.getState()
.replaceLastMessage(
 finalText
);

}



useStore
.getState()
.setThinking("");



addLog(
"✅ Research Complete",
"success"
);



fullResponse.current="";


es.close();


eventRef.current=null;


stopFlush();


}


}

catch(error){


addLog(
error instanceof Error
?
`❌ ${error.message}`
:
"❌ Parse error",
"error"
);


}


};



// ERROR

es.onerror = ()=>{


useStore
.getState()
.setThinking("");



addLog(
"❌ Stream Error",
"error"
);



es.close();


eventRef.current=null;


stopFlush();


};


};





/* =========================
   SEND QUERY
========================= */


const sendQuery =
async(
 query:string,
 files:File[]=[]
)=>{


try{


addLog(
"📤 Sending query..."
);


incrementQueries();



addLog(
"📤 Query submitted",
"info"
);



// RESET


useStore
.getState()
.setThinking("");



useStore
.getState()
.clearStream();


// RESET SOURCES

useStore
.getState()
.setSources([]);



useStore
.getState()
.addMessageToCurrent({

id:
crypto.randomUUID(),

role:"ai",

content:
"🧠 Thinking..."

});



useStore
.getState()
.setThinking(
"🔍 Researching..."
);



// FORM DATA


const formData =
new FormData();



formData.append(
"query",
query
);



files.forEach(
(file)=>{


formData.append(
"files",
file
);


});




// API CALL


const token =
localStorage.getItem(
"token"
);


if(!token){

throw new Error(
"Please login first"
);

}



const response =
await fetch(

"http://localhost:8000/query",

{

method:"POST",


headers:{

Authorization:
`Bearer ${token}`,

},


body:
formData,

}

);


if(
!response.ok
){

throw new Error(
"Backend rejected request"
);

}



connect();



}

catch(error){


useStore
.getState()
.setThinking("");



addLog(

error instanceof Error

?

`❌ ${error.message}`

:

"❌ Failed to send query",

"error"

);


}


};




return {

sendQuery

};


};