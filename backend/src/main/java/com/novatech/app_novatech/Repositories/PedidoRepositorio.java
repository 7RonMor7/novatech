package com.novatech.app_novatech.Repositories;

import com.novatech.app_novatech.Models.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PedidoRepositorio extends JpaRepository<Pedido, Long> {

    // ─── Búsquedas por cliente ─────────────────────────────────────────────
    List<Pedido> findByCliente_IdCliente(Long idCliente);

    boolean existsByCliente_IdCliente(Long idCliente);

    // ─── Búsquedas por estado ──────────────────────────────────────────────
    List<Pedido> findByEstado(Pedido.EstadoPedido estado);

    // ─── Búsquedas por fecha ───────────────────────────────────────────────
    List<Pedido> findByFecha(LocalDate fecha);

    List<Pedido> findByFechaBetween(LocalDate inicio, LocalDate fin);

    // ─── Búsquedas combinadas ──────────────────────────────────────────────
    List<Pedido> findByCliente_IdClienteAndEstado(Long idCliente, Pedido.EstadoPedido estado);

    List<Pedido> findByFechaBetweenAndEstado(LocalDate inicio,
                                             LocalDate fin,
                                             Pedido.EstadoPedido estado);

    // ─── Consultas personalizadas JPQL ────────────────────────────────────
    @Query("""
            SELECT p FROM Pedido p
            WHERE p.cliente.idCliente = :idCliente
            AND p.estado = :estado
            ORDER BY p.fecha DESC
            """)
    List<Pedido> findByClienteAndEstado(@Param("idCliente") Long idCliente,
                                        @Param("estado") Pedido.EstadoPedido estado);

    @Query("""
            SELECT p FROM Pedido p
            WHERE p.total BETWEEN :minTotal AND :maxTotal
            ORDER BY p.total DESC
            """)
    List<Pedido> findByRangoTotal(@Param("minTotal") BigDecimal minTotal,
                                  @Param("maxTotal") BigDecimal maxTotal);

    @Query("""
            SELECT p FROM Pedido p
            WHERE p.fecha BETWEEN :inicio AND :fin
            ORDER BY p.fecha DESC
            """)
    List<Pedido> findByRangoFechasOrdenado(@Param("inicio") LocalDate inicio,
                                           @Param("fin") LocalDate fin);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.estado = :estado")
    Long contarPorEstado(@Param("estado") Pedido.EstadoPedido estado);

    @Query("SELECT SUM(p.total) FROM Pedido p WHERE p.estado = :estado")
    BigDecimal sumarTotalPorEstado(@Param("estado") Pedido.EstadoPedido estado);

    @Query("""
            SELECT p FROM Pedido p
            WHERE p.cliente.idCliente = :idCliente
            ORDER BY p.fecha DESC
            """)
    List<Pedido> findByClienteOrdenado(@Param("idCliente") Long idCliente);
}
