"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import { login, LoginPayload } from "../services/authServices"



export const useLogin = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),


  })
}