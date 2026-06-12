<?php

namespace App\Http\Requests\Post;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StorePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Auth dihandle middleware auth:sanctum
    }

    public function rules(): array
    {
        return [
            'title'       => ['required', 'string', 'min:10', 'max:300'],
            'body'        => ['required', 'string', 'min:20'],
            'category_id' => ['required', 'uuid', 'exists:categories,id'],
            'tags'        => ['nullable', 'array', 'max:5'],
            'tags.*'      => ['uuid', 'exists:tags,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'       => 'Judul post wajib diisi.',
            'title.min'            => 'Judul post minimal 10 karakter.',
            'title.max'            => 'Judul post maksimal 300 karakter.',
            'body.required'        => 'Isi post wajib diisi.',
            'body.min'             => 'Isi post minimal 20 karakter.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists'   => 'Kategori tidak ditemukan.',
            'tags.max'             => 'Maksimal 5 tag per post.',
            'tags.*.exists'        => 'Salah satu tag tidak ditemukan.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Data yang diberikan tidak valid.',
            'data'    => null,
            'errors'  => $validator->errors(),
        ], 422));
    }
}