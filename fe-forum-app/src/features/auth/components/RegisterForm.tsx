'use client'

import { Formik, Form, ErrorMessage } from 'formik'
import { registerValidation } from '../Auth.validation'
import { registerApi } from '../Auth.api'
import { RegisterType } from '../Auth.type'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button' // ✅ Gunakan komponen Button custom agar konsisten

const initialValues: RegisterType = {
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

export default function RegisterForm() {
  const router = useRouter()

  const handleSubmit = async (
    values: RegisterType,
    { 
      setSubmitting, 
      setStatus 
    }: { 
      setSubmitting: (isSubmitting: boolean) => void; 
      setStatus: (status: string) => void 
    }
  ) => {
    try {
      await registerApi(values)
      router.push('/login')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus(err.message)
      } else {
        setStatus('Registrasi gagal')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registerValidation}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, status, getFieldProps }) => (
        <Form className="flex flex-col gap-4 mt-2">
          {status && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-lg px-4 py-2.5 text-red-500 text-sm">
              {status}
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300">Nama</label>
            <Input
              {...getFieldProps('name')}
              placeholder="Masukkan Nama"
              className="bg-white/10 border-blue-400/40 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
            <ErrorMessage name="name" component="span" className="text-orange-500 text-xs" />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300">Email</label>
            <Input
              {...getFieldProps('email')}
              type="email"
              placeholder="Masukkan Email"
              className="bg-white/10 border-blue-400/40 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
            <ErrorMessage name="email" component="span" className="text-orange-500 text-xs" />
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
            <ErrorMessage name="password" component="span" className="text-orange-500 text-xs" />
          </div>

          {/* Konfirmasi Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-gray-300">Konfirmasi Password</label>
            <Input
              {...getFieldProps('password_confirmation')}
              type="password"
              placeholder="Ulangi Password"
              className="bg-white/10 border-blue-400/40 text-white placeholder:text-gray-400 focus:border-orange-500"
            />
            <ErrorMessage name="password_confirmation" component="span" className="text-orange-500 text-xs" />
          </div>

          {/* Button custom dengan shadow bawaan kamu */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white text-lg font-semibold py-3 rounded-xl mt-2 transition-all w-full border-2 border-white/50"
            style={{ boxShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 0 30px rgba(255, 255, 255, 0.1)' }}
          >
            {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
          </Button>

          <p className="text-center text-sm text-gray-400 mt-1">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-orange-500 text-sm font-medium hover:underline">
              Masuk Sekarang
            </Link>
          </p>
        </Form>
      )}
    </Formik>
  )
}