package com.novatech.app_novatech.Controllers;

import com.novatech.app_novatech.Models.DetallePedido;
import com.novatech.app_novatech.Models.Pedido;
import com.novatech.app_novatech.Services.PedidoServicio;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/pedidos")
//@CrossOrigin(origins = "http://localhost:5173")
public class PedidoControlador {
    @Autowired
    private PedidoServicio pedidoServicio;

    // ─── Crear pedido ───────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> crearPedido(@Valid @RequestBody Pedido pedido) {
        try {
            // Intentar guardar el pedido
            Pedido nuevoPedido = pedidoServicio.savePedido(pedido);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(nuevoPedido);

        } catch (IllegalArgumentException e) {
            // Capturar el error si el cliente no existe
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Listar todas los pedidos ──────────────────────────────────────
    @GetMapping
    public List<Pedido> listarPedidos() {
        return pedidoServicio.getAllPedidos();
    }

    // ─── Buscar pedido por ID ───────────────────────────────────────────
    @GetMapping("/{idpedido}")
    public ResponseEntity<Pedido> obtenerPedidoPorId(@PathVariable Long idpedido) {
        return pedidoServicio.getPedidoById(idpedido)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Actualizar pedido ──────────────────────────────────────────────
    @PutMapping("/{idpedido}")
    public ResponseEntity<?> actualizarPedidoPorId(@PathVariable Long idpedido, @Valid @RequestBody Pedido pedidoActualizado) {

        try {
            return pedidoServicio.getPedidoById(idpedido)
                    .map(found -> {
                        found.setFecha(pedidoActualizado.getFecha());
                        found.setTotal(pedidoActualizado.getTotal());
                        found.setEstado(pedidoActualizado.getEstado());
                        // Actualizar cliente si viene en el body
                        if (pedidoActualizado.getCliente() != null) {
                            found.setCliente(pedidoActualizado.getCliente());
                        }
                        return ResponseEntity.ok(pedidoServicio.savePedido(found));
                    })
                    .orElse(ResponseEntity.notFound().build());

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
        /*return pedidoServicio.getPedidoById(idpedido)
                .map(found ->{
                    found.setFecha(pedidoActualizado.getFecha());
                    found.setTotal(pedidoActualizado.getTotal());
                    found.setEstado(pedidoActualizado.getEstado());
                    return ResponseEntity.ok(pedidoServicio.savePedido(found));
                })
                .orElse(ResponseEntity.notFound().build());*/
    }

    // ─── Eliminar pedido ────────────────────────────────────────────────
    @DeleteMapping("/{idpedido}")
    public ResponseEntity<?> eliminarPedido(@PathVariable Long idpedido) {
        try {
            pedidoServicio.deleteById(idpedido);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

}

