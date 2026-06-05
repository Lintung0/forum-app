<?php

namespace App\Http\Requests\Bookmark;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreBookmarkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'post_id' => ['required', 'uuid', 'exists:posts,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'post_id.required' => 'Post ID wajib diisi.',
            'post_id.uuid'     => 'Post ID harus berformat UUID yang valid.',
            'post_id.exists'   => 'Post dengan ID tersebut tidak ditemukan.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Data tidak valid.',
                'data'    => null,
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}