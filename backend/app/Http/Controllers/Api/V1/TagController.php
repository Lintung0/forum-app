<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TagController extends Controller
{
    use ApiResponse;

    
    public function index(Request $request): JsonResponse
    {
        $cacheKey = 'tags:' . md5($request->getQueryString() ?? '');

        $tags = Cache::remember($cacheKey, 300, function () use ($request) {
            return Tag::query()
                ->withCount('posts')
                ->when(
                    $request->filled('q'),
                    fn($q) => $q->where('name', 'like', '%' . $request->input('q') . '%')
                )
                ->orderByDesc('usage_count')
                ->paginate(min($request->input('per_page', 20), 100));
        });

        return $this->paginatedResponse(
            $tags->through(fn($tag) => new TagResource($tag)),
            'Daftar tag berhasil diambil.'
        );
    }

    
    public function show(Tag $tag): JsonResponse
    {
        return $this->successResponse(
            new TagResource($tag),
            'Detail tag berhasil diambil.'
        );
    }

    
    
    

    
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:50', 'unique:tags,name'],
            'slug'  => ['nullable', 'string', 'max:60', 'unique:tags,slug'],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        $validated['slug'] ??= Str::slug($validated['name']);

        $tag = Tag::create($validated);
        Cache::forget('tags:' . md5(''));

        return $this->createdResponse(
            new TagResource($tag),
            'Tag berhasil dibuat.'
        );
    }

    
    public function update(Request $request, Tag $tag): JsonResponse
    {
        $validated = $request->validate([
            'name'  => ['sometimes', 'string', 'max:50',
                Rule::unique('tags', 'name')->ignore($tag->id)],
            'slug'  => ['nullable', 'string', 'max:60',
                Rule::unique('tags', 'slug')->ignore($tag->id)],
            'color' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
        ]);

        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $tag->update($validated);

        Cache::forget('tags:' . md5(''));

        return $this->successResponse(
            new TagResource($tag),
            'Tag berhasil diupdate.'
        );
    }

    
    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        Cache::forget('tags:' . md5(''));

        return $this->noContentResponse('Tag berhasil dihapus.');
    }
}