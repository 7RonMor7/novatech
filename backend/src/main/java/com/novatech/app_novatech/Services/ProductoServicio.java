package com.novatech.app_novatech.Services;

import com.novatech.app_novatech.Models.Categoria;
import com.novatech.app_novatech.Repositories.CategoriaRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.novatech.app_novatech.Models.Producto;
import com.novatech.app_novatech.Repositories.ProductoRepositorio;

import java.util.List;
import java.util.Optional;

@Service
public class ProductoServicio {
    @Autowired
    private ProductoRepositorio productoRepositorio;
    @Autowired
    private CategoriaRepositorio categoriaRepositorio;

    // Método para agregar o actualizar un producto
    public Producto saveProducto(Producto producto) {
        // 1. Obtenemos el ID de la categoría que viene en el JSON
        Long categoriaId = producto.getCategoria().getIdCategoria(); // Asumiendo que el getter es getIdCategoria()

        // 2. Buscamos si la categoría existe
        Categoria categoria = categoriaRepositorio.findById(categoriaId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Error: La categoría con ID " + categoriaId + " no existe en la base de datos."));

        // 3. Asignamos la categoría encontrada al producto (asegura la integridad)
        producto.setCategoria(categoria);

        // 4. Guardamos el producto
        return productoRepositorio.save(producto);
    }

    // Método para listar todos los productos
    public List<Producto> getAllProductos() {
        return productoRepositorio.findAll();
    }

    // Método para buscar un producto por ID
    public Optional<Producto> getProductoById(Long idProducto) {
        return productoRepositorio.findById(idProducto);
    }

    // Método para eliminar un producto por ID
    public void deleteById(Long idProducto) {
        productoRepositorio.deleteById(idProducto);
    }
}
