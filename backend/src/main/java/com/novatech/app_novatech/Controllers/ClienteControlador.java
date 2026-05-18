package com.novatech.app_novatech.Controllers;

import com.novatech.app_novatech.Models.Cliente;
import com.novatech.app_novatech.Services.ClienteServicio;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/clientes")
@CrossOrigin(origins = "http://localhost:5173")
public class ClienteControlador {

    @Autowired
    private ClienteServicio clienteServicio;

    // ─── Crear cliente ─────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> crearCliente(@Valid @RequestBody Cliente cliente) {
        // 1. Validar si el email ya está registrado
        if (clienteServicio.existePorEmail(cliente.getEmail())) {
            // Retorna un error 400 Bad Request con un mensaje descriptivo
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Error: El email '" + cliente.getEmail() + "' ya se encuentra registrado en el sistema."));
        }

        // 2. Si no existe, guardar el cliente con normalidad
        Cliente nuevoCliente = clienteServicio.saveCliente(cliente);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(nuevoCliente);
    }

    // ─── Listar todos los clientes ─────────────────────────────────────────
    @GetMapping
    public List<Cliente> listarClientes() {
        return clienteServicio.getAllClientes();
    }

    // ─── Buscar cliente por ID ─────────────────────────────────────────────
    @GetMapping("/{idcliente}")
    public ResponseEntity<Cliente> obtenerClientePorId(@PathVariable Long idcliente) {
        return clienteServicio.getClienteById(idcliente)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Actualizar cliente ────────────────────────────────────────────────
    @PutMapping("/{idcliente}")
    public ResponseEntity<Cliente> actualizarCliente(@PathVariable Long idcliente, @Valid @RequestBody Cliente clienteActualizado) {

        return clienteServicio.getClienteById(idcliente)
                .map(found ->{
                    found.setNombre(clienteActualizado.getNombre());
                    found.setEmail(clienteActualizado.getEmail());
                    found.setFechaRegistro(clienteActualizado.getFechaRegistro());
                    found.setTelefono(clienteActualizado.getTelefono());
                    found.setDireccion(clienteActualizado.getDireccion());
                    return ResponseEntity.ok(clienteServicio.saveCliente(found));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Eliminar cliente ──────────────────────────────────────────────────
    @DeleteMapping("/{idcliente}")
    public ResponseEntity<Void> eliminarCliente(@PathVariable Long idcliente) {
        clienteServicio.deleteById(idcliente);
        return ResponseEntity.noContent().build(); // 204 NOT CONTENT
    }
}
