<?php

namespace App\Http\Requests\Comment;

use App\Models\Comment;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body'      => ['required', 'string'],
            'parent_id' => [
                'nullable',
                'uuid',
                'exists:comments,id',
                
                function (string $attribute, mixed $value, \Closure $fail) {
                    if ($value === null) return;

                    $postId        = $this->route('post')?->id;
                    $parentComment = Comment::find($value);

                    if (! $parentComment) {
                        $fail('Komentar induk tidak ditemukan.');
                        return;
                    }

                    if ($parentComment->post_id !== $postId) {
                        $fail('Reply harus berada di post yang sama.');
                        return;
                    }

                    
                    if ($parentComment->parent_id !== null) {
                        $fail('Tidak bisa reply dari reply. Hanya boleh 1 level nested.');
                    }
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'body.required'    => 'Isi komentar wajib diisi.',
            'body.min'         => 'Komentar minimal 5 karakter.',
            'body.max'         => 'Komentar maksimal 10.000 karakter.',
            'parent_id.exists' => 'Komentar yang dituju tidak ditemukan.',
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