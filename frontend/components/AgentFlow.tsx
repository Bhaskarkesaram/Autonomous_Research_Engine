"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
} from "reactflow";

import "reactflow/dist/style.css";

import {
  Brain,
  Search,
  BarChart3,
  FileText,
} from "lucide-react";

import { useStore } from "../store/useStore";
import { useMemo } from "react";


// ==========================
// NODES
// ==========================

const getNodes = (thinking: string) => {


const active = (text: string) =>

  thinking
    .toLowerCase()
    .includes(
      text.toLowerCase()
    );



const nodeStyle = (
  name:string
) => ({

background:
active(name)
? "#052e16"
: "#18181b",


color:
"white",


border:
active(name)
? "2px solid #22c55e"
: "1px solid #3f3f46",


boxShadow:
active(name)
? "0 0 25px #22c55e66"
: "none",


borderRadius:
"16px",


width:
180,


padding:
12,


transition:
"all 0.3s ease",

});




return [

{
id:"1",

position:{
x:50,
y:120,
},


data:{

label:(

<div className="text-center">

<Brain

size={24}

className="
mx-auto
mb-2
text-violet-400
"

/>


<div className="font-semibold">

Nexora Planner

</div>


<div className="text-xs text-zinc-400">

Task Understanding

</div>


</div>

),

},


style:
nodeStyle(
"Planning"
),

},




{
id:"2",

position:{
x:320,
y:40,
},


data:{

label:(

<div className="text-center">

<Search

size={24}

className="
mx-auto
mb-2
text-blue-400
"

/>


<div className="font-semibold">

Source Agent

</div>


<div className="text-xs text-zinc-400">

Web Intelligence

</div>


</div>

),

},


style:
nodeStyle(
"Searching"
),


},




{
id:"3",

position:{
x:320,
y:220,
},


data:{

label:(

<div className="text-center">

<BarChart3

size={24}

className="
mx-auto
mb-2
text-emerald-400
"

/>


<div className="font-semibold">

Reasoning Agent

</div>


<div className="text-xs text-zinc-400">

Cognitive Analysis

</div>


</div>

),

},


style:
nodeStyle(
"Validating"
),

},





{
id:"4",

position:{
x:620,
y:120,
},


data:{

label:(

<div className="text-center">


<FileText

size={24}

className="
mx-auto
mb-2
text-orange-400
"

/>


<div className="font-semibold">

Report Agent

</div>


<div className="text-xs text-zinc-400">

Research Report

</div>


</div>

),

},



style:
nodeStyle(
"Generating"
),


},


];


};




// ==========================
// EDGES
// ==========================

const getEdges = (
thinking:string
)=>{


const running =
thinking.length > 0;



return [

{
id:"e1-2",
source:"1",
target:"2",
animated:running,
},


{
id:"e1-3",
source:"1",
target:"3",
animated:running,
},


{
id:"e2-4",
source:"2",
target:"4",
animated:running,
},


{
id:"e3-4",
source:"3",
target:"4",
animated:running,
},


];


};






// ==========================
// COMPONENT
// ==========================

export default function AgentFlow(){



const {
thinking
} =
useStore();




const nodes =
useMemo(

()=>getNodes(
thinking
),

[
thinking
]

);




const edges =
useMemo(

()=>getEdges(
thinking
),

[
thinking
]

);





return(

<div

className="
h-[450px]
rounded-3xl
overflow-hidden
border
border-white/10
bg-zinc-950
shadow-2xl
"

>



<div
className="
px-5
py-4
border-b
border-white/10
"
>


<h2 className="font-semibold text-white">

Nexora AI Workflow

</h2>



<p className="text-sm text-zinc-500">

Autonomous multi-agent reasoning pipeline

</p>


</div>





<ReactFlow

nodes={nodes}

edges={edges}

fitView

>


<MiniMap />


<Controls />


<Background />


</ReactFlow>




</div>

);


}