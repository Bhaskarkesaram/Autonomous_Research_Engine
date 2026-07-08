"use client";

import { useStore } from "../store/useStore";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock3,
  Trash2,
} from "lucide-react";


export default function LogsPanel() {

  const { logs } = useStore();


  const getIcon = (
    type: string
  ) => {

    switch (type) {

      case "error":
        return (
          <AlertTriangle
            size={14}
            className="text-red-400"
          />
        );


      case "warn":
        return (
          <AlertTriangle
            size={14}
            className="text-yellow-400"
          />
        );


      case "success":
        return (
          <CheckCircle2
            size={14}
            className="text-emerald-400"
          />
        );


      default:
        return (
          <Info
            size={14}
            className="text-blue-400"
          />
        );

    }

  };



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
        flex
        items-center
        justify-between
        "
      >


        <div>


          <div
            className="
            flex
            items-center
            gap-2
            "
          >

            <Activity
              size={18}
              className="text-emerald-400"
            />


            <h3 className="font-semibold">

              Nexora Activity

            </h3>


          </div>



          <p
            className="
            text-xs
            text-zinc-500
            mt-1
            "
          >

            Live agent execution trace

          </p>


        </div>


      </div>





      {/* LOGS */}

      <div
        className="
        max-h-[300px]
        overflow-y-auto
        p-3
        space-y-2
        "
      >


        {
          logs.length === 0 ? (


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


              <Activity size={24}/>


              <p className="mt-2 text-sm">

                Waiting for activity...

              </p>


            </div>


          ) : (


            logs.map((log)=>(


              <div

                key={log.id}

                className="
                flex
                items-start
                justify-between
                gap-3
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
                  gap-3
                  "
                >


                  {getIcon(log.type)}



                  <div>


                    <div
                      className="
                      text-sm
                      text-zinc-200
                      "
                    >

                      {log.message}

                    </div>



                    <div
                      className="
                      text-xs
                      text-zinc-500
                      mt-1
                      "
                    >

                      {log.type.toUpperCase()}

                    </div>


                  </div>


                </div>




                <div
                  className="
                  flex
                  items-center
                  gap-1
                  text-xs
                  text-zinc-500
                  shrink-0
                  "
                >

                  <Clock3 size={12}/>


                  {
                    new Date(
                      log.time
                    )
                    .toLocaleTimeString()
                  }


                </div>



              </div>


            ))

          )
        }


      </div>


    </div>

  );

}