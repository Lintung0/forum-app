<?php

namespace App\Http\Requests\Post;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'min:10', 'max:300'],
            'body'        => ['sometimes', 'string', 'min:20'],
            'category_id' => ['sometimes', 'uuid', 'exists:categories,id'],
            'tags'        => ['nullable', 'array', 'max:5'],
            'tags.*'      => ['uuid', 'exists:tags,id'],
            'reason'      => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.min'          => 'Judul post minimal 10 karakter.',
            'title.max'          => 'Judul post maksimal 300 karakter.',
            'body.min'           => 'Isi post minimal 20 karakter.',
            'category_id.exists' => 'Kategori tidak ditemukan.',
            'tags.max'           => 'Maksimal 5 tag per post.',
            'tags.*.exists'      => 'Salah satu tag tidak ditemukan.',
            'reason.max'         => 'Alasan edit maksimal 255 karakter.',
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