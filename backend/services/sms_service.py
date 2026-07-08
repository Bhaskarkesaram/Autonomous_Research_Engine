import os
import requests

from dotenv import load_dotenv


load_dotenv()


MSG91_AUTH_KEY = os.getenv(
    "MSG91_AUTH_KEY"
)

MSG91_TEMPLATE_ID = os.getenv(
    "MSG91_TEMPLATE_ID"
)



def send_sms_otp(
    phone: str,
    otp: str
):


    url = (
        "https://control.msg91.com"
        "/api/v5/otp"
    )


    headers = {

        "authkey":
        MSG91_AUTH_KEY,

        "Content-Type":
        "application/json"

    }



    payload = {

        "template_id":
        MSG91_TEMPLATE_ID,


        "mobile":
        f"91{phone}",


        "otp":
        otp

    }



    response = requests.post(

        url,

        json=payload,

        headers=headers

    )



    data = response.json()



    if response.status_code != 200:


        print(
            data
        )


        raise Exception(
            "OTP sending failed"
        )



    return data