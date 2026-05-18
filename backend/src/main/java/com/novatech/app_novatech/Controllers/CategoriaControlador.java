package com.novatech.app_novatech.Controllers;

import com.novatech.app_novatech.Models.Categoria;
import com.novatech.app_novatech.Services.CategoriaServicio;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/categorias")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoriaControlador {

    @Autowired
    private CategoriaServicio categoriaServicio;

    // ─── Crear categoría ───────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Categoria> crearCategoria(@Valid @RequestBody Categoria categoria) {
        categoriaServicio.saveCategoria(categoria);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(categoria);
    }

    // ─── Listar todas las categorías ──────────────────────────────────────
    @GetMapping
    public List<Categoria> listarCategorias() {
        return categoriaServicio.getAllCategorias();
    }

    // ─── Buscar categoría por ID ───────────────────────────────────────────
    @GetMapping("/{idcategoria}")
    public ResponseEntity<Categoria> obtenerCategoriaPorId(@PathVariable Long idcategoria) {
        return categoriaServicio.getCategoriaById(idcategoria)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Actualizar categoría ──────────────────────────────────────────────
    @PutMapping("/{idcategoria}")
    public ResponseEntity<Categoria> actualizarCategoriaPorId(@PathVariable Long idcategoria, @Valid @RequestBody Categoria categoriaActualizada) {

        return categoriaServicio.getCategoriaById(idcategoria)
                .map(found ->{
                    found.setNombre(categoriaActualizada.getNombre());
                    found.setDescripcion(categoriaActualizada.getDescripcion());
                    return ResponseEntity.ok(categoriaServicio.saveCategoria(found));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Eliminar categoría ────────────────────────────────────────────────
    @DeleteMapping("/{idcategoria}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long idcategoria) {
        categoriaServicio.deleteById(idcategoria);
        return ResponseEntity.noContent().build(); // 204 NOT CONTENT
    }
}
