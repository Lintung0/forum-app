<?php

namespace App\Http\Requests\Vote;

use Illuminate\Foundation\Http\FormRequest;
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
}