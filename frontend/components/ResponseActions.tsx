"use client";

import {
  Copy,
  RotateCcw,
  Download,
  Share2,
  Check,
} from "lucide-react";

import { useState } from "react";


type Props = {
  content: string;
};


export default function ResponseActions({
  content,
}: Props) {


const [copied, setCopied] =
useState(false);


// =======================
// COPY
// =======================

const copyResponse = async () => {

await navigator.clipboard.writeText(
  content
);

setCopied(true);


setTimeout(
 () => setCopied(false),
 1500
);

};


// =======================
// SHARE
// =======================

const shareResponse = async () => {

if (navigator.share) {

await navigator.share({
 text: content,
});

}

};


// =======================
// UI
// =======================

return (

<div
className="
flex
items-center
gap-3
mt-4
text-zinc-500
"
>


{/* COPY */}

<button

onClick={copyResponse}

title="Copy"

className="
hover:text-white
transition
"

>

{
copied ? (

<Check
size={16}
className="text-green-400"
/>

)

:

(

<Copy size={16}/>

)

}

</button>



{/* REGENERATE */}

<button

title="Regenerate"

className="
hover:text-white
transition
"

>

<RotateCcw size={16}/>

</button>



{/* EXPORT */}

<button

title="Export"

className="
hover:text-white
transition
"

>

<Download size={16}/>

</button>



{/* SHARE */}

<button

onClick={shareResponse}

title="Share"

className="
hover:text-white
transition
"

>

<Share2 size={16}/>

</button>



</div>

);

}