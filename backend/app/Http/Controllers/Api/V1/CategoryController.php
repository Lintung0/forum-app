<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    use ApiResponse;

    
    public function index(): JsonResponse
    {
        $categories = Cache::remember('categories:all', 600, function () {
            return Category::query()
                ->with('children')
                ->withCount('posts')
                ->whereNull('parent_id')
                ->orderBy('name')
                ->get();
        });

        return $this->successResponse(
            CategoryResource::collection($categories),
            'Daftar kategori berhasil diambil.'
        );
    }

    
    public function show(Category $category): JsonResponse
    {
        $category->load('parent', 'children');
        $category->loadCount('posts');

        return $this->successResponse(
            new CategoryResource($category),
            'Detail kategori berhasil diambil.'
        );
    }

    
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Category::query()
            ->withCount('posts')
            ->orderBy('name');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        $categories = $query->paginate($request->input('limit', 10));

        return $this->successResponse(
            CategoryResource::collection($categories),
            'Daftar kategori berhasil diambil untuk admin.'
        );
    }

    
    
    

    
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:100', 'unique:categories,name'],
            'slug'        => ['nullable', 'string', 'max:120', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'parent_id'   => ['nullable', 'uuid', 'exists:categories,id'],
        ]);

        $validated['slug'] ??= Str::slug($validated['name']);

        $category = Category::create($validated);
        $category->load('parent');

        Cache::forget('categories:all');

        return $this->createdResponse(
            new CategoryResource($category),
            'Kategori berhasil dibuat.'
        );
    }

    
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'string', 'max:100',
                Rule::unique('categories', 'name')->ignore($category->id)],
            'slug'        => ['nullable', 'string', 'max:120',
                Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => ['nullable', 'string'],
            'parent_id'   => [
                'nullable', 'uuid', 'exists:categories,id',
                function ($attribute, $value, $fail) use ($category) {
                    if ($value === $category->id) {
                        $fail('Kategori tidak bisa menjadi parent dirinya sendiri.');
                    }
                },
            ],
        ]);

        if (isset($validated['name']) && ! isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        $category->load('parent', 'children');

        Cache::forget('categories:all');

        return $this->successResponse(
            new CategoryResource($category),
            'Kategori berhasil diupdate.'
        );
    }

    
    public function destroy(Category $category): JsonResponse
    {
        if ($category->posts()->exists()) {
            return $this->errorResponse(
                'Kategori tidak bisa dihapus karena masih memiliki post.',
                null,
                422
            );
        }

        $category->children()->update(['parent_id' => null]);
        $category->delete();

        Cache::forget('categories:all');

        return $this->noContentResponse('Kategori berhasil dihapus.');
    }
}