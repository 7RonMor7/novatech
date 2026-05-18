package com.novatech.app_novatech.Controllers;

import com.novatech.app_novatech.Models.DetallePedido;
import com.novatech.app_novatech.Services.DetallePedidoServicio;
import com.novatech.app_novatech.StockInsuficienteException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/detalles")
@CrossOrigin(origins = "http://localhost:5173")
public class DetallePedidoControlador {

    @Autowired
    private DetallePedidoServicio detallePedidoServicio;

    // ─── Crear detalle de pedido ───────────────────────────────────────────
    // El body debe incluir pedido.idPedido y producto.idProducto
    //
    // Respuesta 201 CREATED (éxito):
    // {
    //   "detalle": { ...DetallePedido... },
    //   "mensaje": "Pedido registrado correctamente. Stock disponible restante de 'Camiseta': 9 unidad(es)."
    // }
    //
    // Respuesta 409 CONFLICT (stock insuficiente):
    // { "error": "No es posible agregar 10 unidad(es) de 'Camiseta'. Stock disponible para venta: 3 ..." }
    //
    // Respuesta 404 NOT FOUND (pedido o producto inexistente):
    // { "error": "Error: El pedido con ID 5 no existe en la base de datos." }
    @PostMapping
    public ResponseEntity<?> crearDetallePedido(@Valid @RequestBody DetallePedido detallePedido) {
        try {
            Map<String, Object> resultado = detallePedidoServicio.saveDetallePedido(detallePedido);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(resultado);

        } catch (StockInsuficienteException e) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", e.getMessage()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ─── Listar todos los detalles de pedido ───────────────────────────────
    @GetMapping
    public List<DetallePedido> listarDetallesPedido() {
        return detallePedidoServicio.getAllDetallesPedidos();
    }

    // ─── Buscar detalle de pedido por ID ───────────────────────────────────
    @GetMapping("/{iddetalle}")
    public ResponseEntity<DetallePedido> obtenerDetallePorId(@PathVariable Long iddetalle) {
        return detallePedidoServicio.getDetallePedidoById(iddetalle)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Actualizar detalle pedido ──────────────────────────────────────────────
    // Respuesta 200 OK (éxito):
    // {
    //   "detalle": { ...DetallePedido actualizado... },
    //   "mensaje": "Pedido registrado correctamente. Stock disponible restante de 'Camiseta': 7 unidad(es)."
    // }
    @PutMapping("/{iddetalle}")
    public ResponseEntity<?> actualizarDetallePedidoPorId(@PathVariable Long iddetalle, @Valid @RequestBody DetallePedido detallePedidoActualizado) {

        return detallePedidoServicio.getDetallePedidoById(iddetalle)
                .map(found ->{
                    Integer cantidadAnteriror = found.getCantidad();
                    found.setCantidad(detallePedidoActualizado.getCantidad());
                    found.setPrecioUnitario(detallePedidoActualizado.getPrecioUnitario());
                    try {
                        Map<String, Object> resultado =
                                detallePedidoServicio.updateDetallePedido(found, cantidadAnteriror);
                        return ResponseEntity.ok(resultado);

                    } catch (StockInsuficienteException e) {
                        return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .<Object>body(Map.of("error", e.getMessage()));

                    } catch (IllegalArgumentException e) {
                        return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .<Object>body(Map.of("error", e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── Eliminar detalle de pedido ────────────────────────────────────────
    @DeleteMapping("/{iddetalle}")
    public ResponseEntity<?> eliminarDetalle(@PathVariable Long iddetalle) {
        try {
            detallePedidoServicio.deleteLoanByid(iddetalle);
            return ResponseEntity.noContent().build();

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
