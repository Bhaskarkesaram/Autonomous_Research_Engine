"use client";

import { useStore } from "../store/useStore";

import {
  History,
  Clock3,
  Sparkles,
  MessageSquare,
} from "lucide-react";


export default function HistoryPanel() {


const {
  conversations,
  setCurrentChat,
} = useStore();



return (

<div
className="
rounded-2xl
border
border-white/10
bg-zinc-900/70
backdrop-blur-xl
overflow-hidden
"
>


{/* HEADER */}

<div
className="
px-4
py-3
border-b
border-white/10
"
>


<div
className="
flex
items-center
gap-2
"
>


<History
size={18}
className="
text-blue-400
"
/>


<h3 className="font-semibold">

Research History

</h3>


</div>



<p
className="
text-xs
text-zinc-500
mt-1
"
>

Previous Nexora sessions

</p>


</div>





{/* HISTORY */}

<div
className="
max-h-[400px]
overflow-y-auto
p-3
space-y-3
"
>


{

conversations.length===0

?

(

<div
className="
flex
flex-col
items-center
justify-center
py-10
text-zinc-500
"
>


<Sparkles size={24}/>


<p className="mt-2 text-sm">

No research history yet

</p>


</div>


)


:

(

conversations.map(

(chat)=>(


<button

key={chat.id}


onClick={()=>{

setCurrentChat(
chat.id
);

}}


className="
w-full
text-left
p-3
rounded-xl
bg-white/5
border
border-white/5
hover:bg-white/10
transition
"

>



<div
className="
flex
items-start
gap-3
"
>



<MessageSquare

size={15}

className="
mt-1
text-emerald-400
shrink-0
"

/>




<div>


<div
className="
text-sm
text-zinc-200
line-clamp-2
"
>


{
chat.messages?.[0]?.content
||
"Untitled Research"
}


</div>




<div
className="
flex
items-center
gap-1
mt-2
text-xs
text-zinc-500
"
>


<Clock3 size={12}/>


{
chat.messages.length
}

{" messages"}



</div>



</div>



</div>



</button>


)

)

)}


</div>


</div>


);


}