<?php

namespace App\Http\Requests\Vote;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class VoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'target_id' => [
                'required',
                'uuid',
            ],

            'target_type' => [
                'required',
                Rule::in([
                    'post',
                    'comment',
                ]),
            ],

            'vote_type' => [
                'required',
                Rule::in([
                    'upvote',
                    'downvote',
                ]),
            ],
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Data yang diberikan tidak valid.',
            'data'    => null,
            'errors'  => $validator->errors(),
        ], 422));
    }
}