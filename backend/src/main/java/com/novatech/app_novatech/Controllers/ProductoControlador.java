package com.novatech.app_novatech.Controllers;

import com.novatech.app_novatech.Models.Producto;
import com.novatech.app_novatech.Services.ProductoServicio;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/productos")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductoControlador {

    @Autowired
    private ProductoServicio productoServicio;

    // ─── Crear producto ────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> crearProducto(@Valid @RequestBody Producto producto) {
        try {
            // Intenta guardar el producto
            Producto nuevoProducto = productoServicio.saveProducto(producto);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(nuevoProducto);

        } catch (IllegalArgumentException e) {
            // Captura el error si la categoría no existe y envía el mensaje al cliente
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND) // o HttpStatus.BAD_REQUEST
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Listar todos los productos ────────────────────────────────────────
    @GetMapping
    public List<Producto> listarProductos() {
        return productoServicio.getAllProductos();
    }

    // ─── Buscar producto por ID ────────────────────────────────────────────
    @GetMapping("/{idproducto}")
    public ResponseEntity<Producto> obtenerProductoPorId(@PathVariable Long idproducto) {
        return productoServicio.getProductoById(idproducto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Actualizar producto ───────────────────────────────────────────────
    @PutMapping("/{idproducto}")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long idproducto, @Valid @RequestBody Producto productoActualizado) {

        return productoServicio.getProductoById(idproducto)
                .map (found ->{
                    found.setNombre(productoActualizado.getNombre());
                    found.setDescripcion(productoActualizado.getDescripcion());
                    found.setImagenUrl(productoActualizado.getImagenUrl());
                    found.setPrecio(productoActualizado.getPrecio());
                    found.setStock(productoActualizado.getStock());
                    found.setActivo(productoActualizado.getActivo());
                    found.setCategoria(productoActualizado.getCategoria());
                    return ResponseEntity.ok((Object) productoServicio.saveProducto(found));
                })
                .orElse (ResponseEntity.notFound() .build() );
    }

    // ─── Eliminar producto ─────────────────────────────────────────────────
    @DeleteMapping("/{idproducto}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long idproducto) {
        productoServicio.deleteById(idproducto);
        return ResponseEntity.noContent().build();
    }

    // ─── Handler global de validaciones ─────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        Map<String, String> errores = new java.util.HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            errores.put(campo, error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(errores);
    }
}

