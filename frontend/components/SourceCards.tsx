"use client";

import {
  ExternalLink,
  Globe,
} from "lucide-react";


type Props = {
  sources: string[];
};


export default function SourceCards(
  {
    sources,
  }: Props
) {

  if (
    !sources ||
    sources.length === 0
  ) {
    return null;
  }


  return (

    <div
      className="
      mt-5
      grid
      grid-cols-1
      md:grid-cols-2
      gap-3
      "
    >

      {
        sources.map(
          (
            source,
            index
          ) => (

          <a

            key={index}

            href={source}

            target="_blank"

            rel="noopener noreferrer"

            className="
            group
            rounded-xl

            bg-white/5

            border
            border-white/10

            p-4

            hover:bg-white/10

            transition
            "

          >


            <div
              className="
              flex
              items-center
              justify-between
              mb-3
              "
            >

              <div
                className="
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-white
                "
              >

                <Globe
                  size={16}
                  className="
                  text-emerald-400
                  "
                />

                Source {index + 1}

              </div>


              <ExternalLink
                size={14}

                className="
                text-zinc-500
                group-hover:text-white
                "
              />


            </div>


            <p
              className="
              text-xs
              text-zinc-400
              truncate
              "
            >

              {
                source
              }

            </p>


          </a>

        ))
      }

    </div>

  );
}