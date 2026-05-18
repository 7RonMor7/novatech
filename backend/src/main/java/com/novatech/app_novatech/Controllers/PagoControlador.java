package com.novatech.app_novatech.Controllers;

import com.novatech.app_novatech.Models.Categoria;
import com.novatech.app_novatech.Models.Pago;
import com.novatech.app_novatech.Models.Pedido;
import com.novatech.app_novatech.Services.PagoServicio;
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
@RequestMapping("/pagos")
@CrossOrigin(origins = "http://localhost:5173")
public class PagoControlador {

    @Autowired
    private PagoServicio pagoServicio;
    @Autowired
    private PedidoServicio pedidoServicio;

    // ─── Crear pago ───────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<?> crearPago(@Valid @RequestBody Pago pago) {
        try {
            // Intenta guardar el pago validando las reglas de negocio
            Pago nuevoPago = pagoServicio.savePago(pago);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(nuevoPago);

        } catch (IllegalArgumentException e) {
            // Si el pedido no existe o ya tiene un pago, devuelve error 400 o 404
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Listar todos los pagos ──────────────────────────────────────
    @GetMapping
    public List<Pago> listarPagos() {
        return pagoServicio.getAllPagos();
    }

    // ─── Buscar pago por ID ───────────────────────────────────────────
    @GetMapping("/{idpago}")
    public ResponseEntity<Pago> obtenerPagoPorId(@PathVariable Long idpago) {
        return pagoServicio.getPagoById(idpago)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Actualizar pago ──────────────────────────────────────────────
    @PutMapping("/{idpago}")
    public ResponseEntity<?> actualizarPagoPorId(
            @PathVariable Long idpago,
            @Valid @RequestBody Pago pagoActualizado) {

        return pagoServicio.getPagoById(idpago).map(pagoExistente -> {

            pagoExistente.setFechaPago(pagoActualizado.getFechaPago());
            pagoExistente.setMetodoPago(pagoActualizado.getMetodoPago());
            pagoExistente.setEstadoPago(pagoActualizado.getEstadoPago());

            if (pagoActualizado.getPedido() != null
                    && pagoActualizado.getPedido().getIdPedido() != null) {
                Pedido pedido = pedidoServicio
                        .getPedidoById(pagoActualizado.getPedido().getIdPedido())
                        .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
                pagoExistente.setPedido(pedido);
            }

            // ✅ Usar updatePago en lugar de savePago
            return ResponseEntity.ok(pagoServicio.updatePago(pagoExistente));

        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── Eliminar pago ────────────────────────────────────────────────
    @DeleteMapping("/{idpago}")
    public ResponseEntity<Void> eliminarPago(@PathVariable Long idpago) {
        pagoServicio.deleteById(idpago);
        return ResponseEntity.noContent().build(); // 204 NOT CONTENT
    }
    /*
    // ─── Registrar pago para un pedido ────────────────────────────────────
    @PostMapping("/pedido/{idPedido}")
    public ResponseEntity<?> registrarPago(
            @PathVariable Long idPedido,
            @RequestParam Pago.MetodoPago metodoPago) {
        try {
            Pago nuevo = pagoServicio.registrarPago(idPedido, metodoPago);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── Listar todos los pagos ────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Pago>> listarPagos() {
        List<Pago> pagos = pagoServicio.obtenerTodos();
        return ResponseEntity.ok(pagos);
    }

    // ─── Buscar pago por ID ────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPagoPorId(@PathVariable Long id) {
        try {
            Pago pago = pagoServicio.obtenerPorId(id);
            return ResponseEntity.ok(pago);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── Buscar pago por ID de pedido ──────────────────────────────────────
    @GetMapping("/pedido/{idPedido}")
    public ResponseEntity<?> obtenerPagoPorIdPedido(@PathVariable Long idPedido) {
        try {
            Pago pago = pagoServicio.obtenerPorIdPedido(idPedido);
            return ResponseEntity.ok(pago);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ─── Buscar pagos por estado ───────────────────────────────────────────
    @GetMapping("/estado/{estadoPago}")
    public ResponseEntity<List<Pago>> obtenerPagosPorEstado(
            @PathVariable Pago.EstadoPago estadoPago) {
        List<Pago> pagos = pagoServicio.obtenerPorEstado(estadoPago);
        return ResponseEntity.ok(pagos);
    }

    // ─── Buscar pagos por rango de fechas ──────────────────────────────────
    @GetMapping("/fechas")
    public ResponseEntity<?> obtenerPagosPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        try {
            List<Pago> pagos = pagoServicio.obtenerPorRangoFechas(inicio, fin);
            return ResponseEntity.ok(pagos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── Aprobar pago ──────────────────────────────────────────────────────
    @PatchMapping("/{id}/aprobar")
    public ResponseEntity<?> aprobarPago(@PathVariable Long id) {
        try {
            Pago aprobado = pagoServicio.aprobarPago(id);
            return ResponseEntity.ok(aprobado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── Rechazar pago ─────────────────────────────────────────────────────
    @PatchMapping("/{id}/rechazar")
    public ResponseEntity<?> rechazarPago(@PathVariable Long id) {
        try {
            Pago rechazado = pagoServicio.rechazarPago(id);
            return ResponseEntity.ok(rechazado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ─── Reembolsar pago ───────────────────────────────────────────────────
    @PatchMapping("/{id}/reembolsar")
    public ResponseEntity<?> reembolsarPago(@PathVariable Long id) {
        try {
            Pago reembolsado = pagoServicio.reembolsarPago(id);
            return ResponseEntity.ok(reembolsado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

     */
}
