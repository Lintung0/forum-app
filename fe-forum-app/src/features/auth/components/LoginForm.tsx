'use client'

import { Formik, Form, ErrorMessage } from 'formik'
import { loginValidation } from '../Auth.validation'
import { LoginType } from '../Auth.type'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Cookies from 'js-cookie'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { useLogin } from '../hooks/useLogin'

const initialValues: LoginType = {
  email: '',
  password: '',
}

export default function LoginForm() {
  const router = useRouter()
  const { mutate } = useLogin()

  const handleSubmit = (
    values: LoginType,
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (isSubmitting: boolean) => void
      setStatus: (status: string) => void
    }
  ) => {
    mutate(values, {
      onSuccess: (res: { data: { token: string } }) => {
        Cookies.set('token', res.data.token)
        router.push('/me')
      },
      onError: (err: unknown) => {
        if (err instanceof Error) {
          setStatus(err.message)
        } else {
          setStatus('Login gagal')
        }
      },
      onSettled: () => {
        setSubmitting(false)
      },
    })
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginValidation}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, status, getFieldProps }) => (
        <Form className="flex flex-col gap-4 mt-2">
          {status && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg px-4 py-2.5 text-red-500 text-sm">
              {status}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300">Email</label>
            <Input
              {...getFieldProps('email')}
              type="email"
              placeholder="Masukkan Email"
              className="bg-white/10 border-blue-400/40 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
            <ErrorMessage
              name="email"
              component="span"
              className="text-orange-500 text-xs"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300">Password</label>
            <Input
              {...getFieldProps('password')}
              type="password"
              placeholder="Masukkan Password"
              className="bg-white/10 border-blue-400/40 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
            <ErrorMessage
              name="password"
              component="span"
              className="text-orange-500 text-xs"
            />
          </div>

          {/* Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white text-lg font-semibold py-3 rounded-xl mt-2 transition-all w-full border-2 border-white/50"
          >
            {isSubmitting ? 'Masuk...' : 'Login'}
          </Button>

          {/* Register link */}
          <p className="text-center text-sm text-gray-400 mt-1">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="text-orange-500 text-sm font-medium hover:underline"
            >
              Daftar Sekarang
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  )
}