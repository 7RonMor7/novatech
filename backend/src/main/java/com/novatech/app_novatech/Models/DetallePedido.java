package com.novatech.app_novatech.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

@Entity
public class DetallePedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalle;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;

    @NotNull(message = "El precio unitario es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "Formato inválido: máximo 8 enteros y 2 decimales")
    private BigDecimal precioUnitario;

    // Relación con Pedido (muchos detalles → un pedido)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_pedido")
    @JsonIgnoreProperties({"detalles","pago","cliente"})
    private Pedido pedido;

    // Relación con Producto (muchos detalles → un producto)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_producto")
    @JsonIgnoreProperties({"detalles","categoria"})
    private Producto producto;

    // ── Métodos de negocio ───────────────────────────────────────────────────

    /**
     * Calcula el subtotal de este detalle.
     */
    public BigDecimal calcularSubtotal() {
        return precioUnitario.multiply(BigDecimal.valueOf(cantidad));
    }

    /**
     * Aplica la reducción de stock en el producto asociado y retorna
     * el mensaje informativo que debe mostrarse al usuario en pantalla.
     *
     * Flujo típico desde el Service:
     *   1. Construir el DetallePedido con producto y cantidad.
     *   2. Llamar confirmarYReducirStock().
     *   3. Mostrar el mensaje retornado al frontend.
     *   4. Persistir el detalle.
     *
     * Arroja el  StockInsuficienteException si la cantidad solicitada
     *         dejaría el stock por debajo del mínimo permitido.
     */
    public String confirmarYReducirStock() {
        if (this.producto == null) {
            throw new IllegalStateException("El detalle no tiene un producto asignado.");
        }
        // reducirStock() ya valida el mínimo y retorna el mensaje con el stock restante
        return this.producto.reducirStock(this.cantidad);
    }

    public DetallePedido() {}

    public DetallePedido(Long idDetalle, Integer cantidad, BigDecimal precioUnitario, Pedido pedido, Producto producto) {
        this.idDetalle = idDetalle;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.pedido = pedido;
        this.producto = producto;
    }

    public Long getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(Long idDetalle) {
        this.idDetalle = idDetalle;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }
}
