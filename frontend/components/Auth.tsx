"use client";

import { useState } from "react";
import { useStore } from "../store/useStore";

import {
  LogIn,
  LogOut,
  User,
  Loader2,
  UserPlus,
  ShieldCheck,
} from "lucide-react";


export default function Auth() {

const {
 user,
 login,
 logout,
} = useStore();


const [name,setName] =
useState("");

const [email,setEmail] =
useState("");

const [phone,setPhone] =
useState("");

const [password,setPassword] =
useState("");

const [otp,setOtp] =
useState("");


const [loading,setLoading] =
useState(false);


const [isRegister,setIsRegister] =
useState(false);


const [otpSent,setOtpSent] =
useState(false);



// =====================
// SEND OTP
// =====================

const sendOTP = async()=>{


try{

setLoading(true);


const res =
await fetch(
"http://localhost:8000/send-otp",
{

method:"POST",

headers:{
"Content-Type":"application/json",
},

body:
JSON.stringify({

name,
email,
phone,
password,

}),

}

);


if(!res.ok)
throw new Error();



setOtpSent(true);

alert(
"OTP sent successfully"
);


}

catch{

alert(
"OTP failed"
);

}

finally{

setLoading(false);

}


};




// =====================
// VERIFY OTP
// =====================


const verifyOTP =
async()=>{


try{

setLoading(true);


const res =
await fetch(
"http://localhost:8000/verify-register",
{

method:"POST",

headers:{
"Content-Type":
"application/json",
},

body:
JSON.stringify({

email,
otp,

}),

}

);


if(!res.ok)
throw new Error();


const data =
await res.json();



localStorage.setItem(
"token",
data.token
);



login(
data.email
);


}

catch{


alert(
"Invalid OTP"
);


}

finally{

setLoading(false);

}

};




// =====================
// LOGIN
// =====================

const handleLogin =
async()=>{


try{

setLoading(true);


const res =
await fetch(
"http://localhost:8000/login",
{

method:"POST",

headers:{
"Content-Type":
"application/json",
},


body:
JSON.stringify({

identifier:
email,

password,

}),

}

);


if(!res.ok)
throw new Error();


const data =
await res.json();


localStorage.setItem(
"token",
data.token
);


login(
data.email
);


}

catch{

alert(
"Login failed"
);

}

finally{

setLoading(false);

}


};



// =====================
// LOGOUT
// =====================


const handleLogout=()=>{

localStorage.removeItem(
"token"
);

logout();

};




// USER LOGGED IN

if(user){

return(

<div className="flex items-center gap-3">

<div className="flex items-center gap-2 text-sm">

<User size={16}/>

{user}

</div>


<button
onClick={handleLogout}
className="text-red-400"
>

<LogOut size={18}/>

</button>

</div>

);

}




return(

<div className="flex items-center gap-2">


{isRegister && !otpSent && (

<>

<input
placeholder="Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="bg-white/10 px-3 py-2 rounded"
/>


<input
placeholder="Phone"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
className="bg-white/10 px-3 py-2 rounded"
/>

</>

)}



<input

placeholder={
isRegister
?
"Email"
:
"Email or Phone"
}

value={email}

onChange={(e)=>
setEmail(e.target.value)
}

className="
bg-white/10
px-3
py-2
rounded
"

/>




{!otpSent && (

<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>
setPassword(e.target.value)
}

className="
bg-white/10
px-3
py-2
rounded
"

/>

)}



{otpSent && (

<input

placeholder="OTP"

value={otp}

onChange={(e)=>
setOtp(e.target.value)
}

className="
bg-white/10
px-3
py-2
rounded
"

/>

)}




<button

disabled={loading}

onClick={

isRegister

?

otpSent
?
verifyOTP
:
sendOTP

:

handleLogin

}

className="
bg-blue-600
px-4
py-2
rounded
flex
gap-2
"

>


{

loading

?

<Loader2
className="animate-spin"
size={16}/>

:

otpSent

?

<ShieldCheck size={16}/>

:

isRegister

?

<UserPlus size={16}/>

:

<LogIn size={16}/>

}


{
isRegister

?

otpSent
?
"Verify"
:
"Register"

:

"Login"

}


</button>




<button

onClick={()=>{
setIsRegister(!isRegister);
setOtpSent(false);
}}

className="text-xs text-zinc-400"

>

{
isRegister
?
"Have account?"
:
"Create account"
}

</button>


</div>

);

}