"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { useRouter } from "next/navigation";
const Login = ({ className }: { className?: string }) => {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const handleSignIn = async (provider: string) => {
    try {
      if (provider === "google") {
        setGoogleLoading(true);
      }
      console.log("hello thon");
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://api.learnwithkru.com";
      console.log(process.env.NEXT_PUBLIC_API_URL);
      const url = `${apiUrl}/v1/auth/${provider}`;

      await router.push(url);
    } catch (error) {
      if (provider === "google") {
        setGoogleLoading(false);
      } else if (provider === "facebook") {
        setFacebookLoading(false);
      }

      router.push("/login");
      console.error("Signin failed:", error);
      // You can add further user-friendly error handling here
    }
  };

  const handleSignInWithGoogle = async () => {
    await handleSignIn("google");
  };

  const handleSignInWithFacebook = async () => {
    await handleSignIn("facebook");
  };

  return (
    <div
      className={` w-full h-[100vh] flex justify-center items-center ${className}`}
    >
      <div className="w-[900px] h-[600px] flex justify-between items-center">
        {/* form */}
        <div className="w-full flex items-center justify-center">
          <div className="">
            <h1 className="text-3xl tracking-wide font-bold pb-5">
              Login with Kru
            </h1>
            <h1 className="text-xs text-gray-500 tracking-wide pb-5 underline">
              {" "}
              Don&apos;t have an account?{" "}
              <Link
                href={"/signup"}
                className="text-[#7B2CBF] hover:text-[gray]"
              >
                {" "}
                Sign up
              </Link>
            </h1>

            <div className="grid gap-3">
              <button
                onClick={handleSignInWithGoogle}
                className="flex items-center justify-evenly w-[300px] h-[50px]  bg-[#f3f3f3] rounded-md hover:bg-[#d2d0d0]"
              >
                <svg
                  width="25"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_2202_1265)">
                    <path
                      d="M12.4998 9.81836V14.4656H18.9579C18.6743 15.9602 17.8233 17.2257 16.547 18.0766L20.4415 21.0984C22.7106 19.0039 24.0197 15.9276 24.0197 12.273C24.0197 11.4221 23.9433 10.6039 23.8015 9.81849L12.4998 9.81836Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.77461 14.2842L4.89625 14.9566L1.78711 17.3783C3.76165 21.2947 7.80862 24.0002 12.4995 24.0002C15.7394 24.0002 18.4557 22.9311 20.4412 21.0984L16.5467 18.0765C15.4776 18.7965 14.114 19.2329 12.4995 19.2329C9.37951 19.2329 6.72868 17.1275 5.77952 14.2911L5.77461 14.2842Z"
                      fill="#34A853"
                    />
                    <path
                      d="M1.78718 6.62158C0.969042 8.23606 0.5 10.0579 0.5 11.9997C0.5 13.9415 0.969042 15.7633 1.78718 17.3778C1.78718 17.3886 5.77997 14.2796 5.77997 14.2796C5.53998 13.5596 5.39812 12.796 5.39812 11.9996C5.39812 11.2031 5.53998 10.4395 5.77997 9.71951L1.78718 6.62158Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.4997 4.77818C14.267 4.77818 15.8379 5.38907 17.0925 6.56727L20.5288 3.13095C18.4452 1.18917 15.7398 0 12.4997 0C7.80887 0 3.76165 2.69454 1.78711 6.62183L5.77978 9.72001C6.72882 6.88362 9.37976 4.77818 12.4997 4.77818Z"
                      fill="#EA4335"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_2202_1265">
                      <rect
                        width="24"
                        height="24"
                        fill="white"
                        transform="translate(0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>
                <div className="text-sm text-slate-950 mr-[20px] ">
                  {" "}
                  <p className="text-sm text-slate-950  ">
                    {googleLoading
                      ? "Signing in..."
                      : "continue in with Google"}
                  </p>
                </div>
              </button>
              <button
                onClick={handleSignInWithFacebook}
                className="flex items-center justify-evenly    w-[300px] h-[50px]   bg-[#f3f3f3] rounded-md  hover:bg-[#d2d0d0]"
              >
                <svg
                  width="25"
                  height="24"
                  viewBox="0 0 25 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M24.5 12C24.5 5.37264 19.1274 0 12.5 0C5.87264 0 0.5 5.37264 0.5 12C0.5 17.6275 4.37456 22.3498 9.60128 23.6467V15.6672H7.12688V12H9.60128V10.4198C9.60128 6.33552 11.4498 4.4424 15.4597 4.4424C16.22 4.4424 17.5318 4.59168 18.0685 4.74048V8.06448C17.7853 8.03472 17.2933 8.01984 16.6822 8.01984C14.7147 8.01984 13.9544 8.76528 13.9544 10.703V12H17.8741L17.2006 15.6672H13.9544V23.9122C19.8963 23.1946 24.5005 18.1354 24.5005 12H24.5Z"
                    fill="#0866FF"
                  />
                </svg>
                <div className="text-sm text-slate-950 ">
                  <p className="text-sm text-slate-950  ">
                    {facebookLoading
                      ? "Signing in..."
                      : "continue in with Facebook"}
                  </p>
                </div>
              </button>
              <div className="flex items-center justify-start">
                <div className="border-t border-black w-[125px] "></div>
                <div className="mx-4 text-black">or</div>
                <div className="border-t border-black w-[125px] "></div>
              </div>
            </div>
            <div className="grid gap-3">{/* <FormLogin /> */}</div>
          </div>
        </div>
        {/* image */}
        <div className="hidden items-center justify-center sm:hidden md:flex lg:flex xl:flex">
          <Image
            alt="login page"
            src={"/Benner/login.jpg"}
            width={1200}
            height={1200}
          ></Image>
        </div>
      </div>
    </div>
  );
};

export default Login;
