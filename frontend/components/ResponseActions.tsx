"use client";

import {
  Copy,
  RotateCcw,
  Share2,
  Check,
} from "lucide-react";

import { useState } from "react";
import { useStream } from "../hooks/useStream";
import ExportPDF from "./ExportPDF";


type Props = {
  content: string;
};


export default function ResponseActions({
  content,
}: Props) {

  const [copied, setCopied] =
    useState(false);


  const { sendQuery } =
    useStream();



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
  // REGENERATE
  // =======================

  const regenerateResponse = () => {

    if (!content.trim()) return;


    sendQuery(
      `Regenerate this answer:\n\n${content}`
    );

  };



  // =======================
  // SHARE
  // =======================

  const shareResponse = async () => {

    if (navigator.share) {

      await navigator.share({

        title:
          "Nexora AI Response",

        text:
          content,

      });

    }

  };




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

          ) : (

            <Copy size={16}/>

          )
        }


      </button>




      {/* REGENERATE */}

      <button

        onClick={regenerateResponse}

        title="Regenerate"

        className="
        hover:text-blue-400
        transition
        "

      >

        <RotateCcw size={16}/>

      </button>




      {/* EXPORT PDF */}

      <ExportPDF

        content={content}

      />




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