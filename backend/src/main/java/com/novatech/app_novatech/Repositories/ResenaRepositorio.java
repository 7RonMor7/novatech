package com.novatech.app_novatech.Repositories;

import com.novatech.app_novatech.Models.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ResenaRepositorio extends JpaRepository<Resena, Long> {

    List<Resena> findAllByOrderByFechaResenaDesc();

    // Verificar si un cliente ya dejó reseña (opcional: para evitar duplicados)
    boolean existsByClienteIdCliente(Long idCliente);

    // Promedio de calificaciones
    @Query("SELECT AVG(r.calificacion) FROM Resena r")
    Double calcularPromedioCalificaciones();

    // Contar reseñas por estrella (para la barra de distribución como en tu imagen)
    @Query("SELECT r.calificacion, COUNT(r) FROM Resena r GROUP BY r.calificacion ORDER BY r.calificacion DESC")
    List<Object[]> contarPorCalificacion();
}
