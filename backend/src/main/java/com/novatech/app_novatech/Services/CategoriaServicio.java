package com.novatech.app_novatech.Services;

import com.novatech.app_novatech.Models.Categoria;
import com.novatech.app_novatech.Repositories.CategoriaRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriaServicio {
    // Inyectamos el repositorio de Categoria (CategoriaRepositorio)
    @Autowired
    private CategoriaRepositorio categoriaRepositorio;

    // Metodo para agregar una categoria
    public Categoria saveCategoria(Categoria categoria) { return categoriaRepositorio.save(categoria); }

    // Metodo para listar todas las categorias
    public List<Categoria> getAllCategorias() { return categoriaRepositorio.findAll(); }

    // Metodo para buscar una categoria por ID
    public Optional<Categoria> getCategoriaById(Long idcategoria) { return categoriaRepositorio.findById(idcategoria); }

    // Metodo para eliminar un libro por ID
    public void deleteById(Long idcategoria) {
        categoriaRepositorio.deleteById(idcategoria);
    }
}
