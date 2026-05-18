package com.novatech.app_novatech.Repositories;

import com.novatech.app_novatech.Models.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepositorio extends JpaRepository<Cliente, Long> {
    // Método para validar si existe un cliente con ese email
    boolean existsByEmail(String email);

    // Opcional: Por si en el futuro necesitas obtener el cliente completo por su email
    Optional<Cliente> findByEmail(String email);
}
