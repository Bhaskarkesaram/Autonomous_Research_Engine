"use client";

import jsPDF from "jspdf";


type Props = {
  content: string;
};


export default function ExportPDF({
  content,
}: Props) {


const exportPDF = () => {


const doc = new jsPDF();


const pageWidth =
doc.internal.pageSize.getWidth();


const margin = 15;


const textWidth =
pageWidth - margin * 2;


// ======================
// TITLE
// ======================

doc.setFontSize(18);

doc.text(
  "Nexora AI Research Report",
  margin,
  15
);


// ======================
// CONTENT
// ======================

doc.setFontSize(11);


const lines =
doc.splitTextToSize(
  content,
  textWidth
);


let y = 30;


lines.forEach(
(line:string)=>{


if(y > 280){

doc.addPage();

y = 20;

}


doc.text(
 line,
 margin,
 y
);


y += 7;


});


doc.save(
 "nexora-research.pdf"
);


};



return (

<button

onClick={exportPDF}

className="
hover:text-emerald-400
transition
"

>

Export PDF

</button>

);

}