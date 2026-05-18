package com.novatech.app_novatech.Repositories;


import com.novatech.app_novatech.Models.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagoRepositorio extends JpaRepository<Pago, Long> {

    // Navega: Pago → pedido → cliente → idCliente
    boolean existsByPedidoClienteIdClienteAndEstadoPago(
            Long idCliente, Pago.EstadoPago estadoPago);

    // ─── Búsquedas por pedido ──────────────────────────────────────────────
    Optional<Pago> findByPedido_IdPedido(Long idPedido);

    boolean existsByPedido_IdPedido(Long idPedido);

    // ─── Búsquedas por estado ──────────────────────────────────────────────
    List<Pago> findByEstadoPago(Pago.EstadoPago estadoPago);

    // ─── Búsquedas por método de pago ─────────────────────────────────────
    List<Pago> findByMetodoPago(Pago.MetodoPago metodoPago);

    // ─── Búsquedas por fecha ───────────────────────────────────────────────
    List<Pago> findByFechaPago(LocalDate fechaPago);

    List<Pago> findByFechaPagoBetween(LocalDate inicio, LocalDate fin);

    // ─── Búsquedas combinadas ──────────────────────────────────────────────
    List<Pago> findByEstadoPagoAndMetodoPago(Pago.EstadoPago estadoPago, Pago.MetodoPago metodoPago);

    List<Pago> findByFechaPagoBetweenAndEstadoPago(LocalDate inicio,
                                                   LocalDate fin,
                                                   Pago.EstadoPago estadoPago);

    // ─── Consultas personalizadas JPQL ────────────────────────────────────
    @Query("SELECT p FROM Pago p WHERE p.pedido.cliente.idCliente = :idCliente")
    List<Pago> findByIdCliente(@Param("idCliente") Long idCliente);

    @Query("""
            SELECT p FROM Pago p
            WHERE p.fechaPago BETWEEN :inicio AND :fin
            AND p.estadoPago = :estado
            ORDER BY p.fechaPago DESC
            """)
    List<Pago> findByRangoFechasYEstado(@Param("inicio") LocalDate inicio,
                                        @Param("fin") LocalDate fin,
                                        @Param("estado") Pago.EstadoPago estado);

    @Query("SELECT COUNT(p) FROM Pago p WHERE p.estadoPago = :estadoPago")
    Long contarPorEstado(@Param("estadoPago") Pago.EstadoPago estadoPago);
}
