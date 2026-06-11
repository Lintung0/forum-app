import * as Yup from 'yup'

export const registerValidation = Yup.object({
  name: Yup.string()
    .min(3, 'Nama minimal 3 karakter')
    .required('Nama wajib diisi'),
  email: Yup.string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),
  password: Yup.string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password wajib diisi'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password')], 'Password tidak cocok')
    .required('Konfirmasi password wajib diisi'),
})

export const loginValidation = Yup.object({
  email: Yup.string()
    .email('Format email tidak valid')
    .required('Email wajib diisi'),
  password: Yup.string()
    .min(6, 'Password minimal 6 karakter')
    .required('Password wajib diisi'),
})