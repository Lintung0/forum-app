<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * List semua root categories beserta child-nya.
     * GET /api/v1/categories
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->with('children')
            ->withCount('posts')
            ->whereNull('parent_id') // Root categories saja
            ->orderBy('name')
            ->get();

        return $this->successResponse(
            CategoryResource::collection($categories),
            'Daftar kategori berhasil diambil.'
        );
    }

    /**
     * Detail satu kategori.
     * GET /api/v1/categories/{category}
     */
    public function show(Category $category): JsonResponse
    {
        $category->load('parent', 'children');
        $category->loadCount('posts');

        return $this->successResponse(
            new CategoryResource($category),
            'Detail kategori berhasil diambil.'
        );
    }

    // ────────────────────────────────────────────────────────
    // ADMIN METHODS
    // ────────────────────────────────────────────────────────

    /**
     * Buat kategori baru.
     * POST /api/v1/admin/categories
     */
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

        return $this->createdResponse(
            new CategoryResource($category),
            'Kategori berhasil dibuat.'
        );
    }

    /**
     * Update kategori.
     * PUT|PATCH /api/v1/admin/categories/{category}
     */
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

        return $this->successResponse(
            new CategoryResource($category),
            'Kategori berhasil diupdate.'
        );
    }

    /**
     * Hapus kategori.
     * DELETE /api/v1/admin/categories/{category}
     */
    public function destroy(Category $category): JsonResponse
    {
        if ($category->posts()->exists()) {
            return $this->errorResponse(
                'Kategori tidak bisa dihapus karena masih memiliki post.',
                null,
                422
            );
        }

        // Pindahkan sub-kategori ke root
        $category->children()->update(['parent_id' => null]);
        $category->delete();

        return $this->noContentResponse('Kategori berhasil dihapus.');
    }
}