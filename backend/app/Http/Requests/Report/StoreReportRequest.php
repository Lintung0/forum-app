<?php

namespace App\Http\Requests\Report;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_id'   => ['required', 'uuid'],
            'target_type' => ['required', Rule::in(['post', 'comment', 'user'])],
            'reason'      => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'target_id.required'   => 'Target ID wajib diisi.',
            'target_id.uuid'       => 'Target ID harus berupa UUID.',
            'target_type.required' => 'Tipe target wajib diisi.',
            'target_type.in'       => 'Tipe target harus post, comment, atau user.',
            'reason.required'      => 'Alasan pelaporan wajib diisi.',
            'reason.max'           => 'Alasan maksimal 100 karakter.',
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
