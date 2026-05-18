package com.novatech.app_novatech.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPago;

    @NotNull(message = "La fecha de pago es obligatoria")
    private LocalDate fechaPago;

    @NotNull(message = "El método de pago es obligatorio")
    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;

    @NotNull(message = "El estado del pago es obligatorio")
    @Enumerated(EnumType.STRING)
    private EstadoPago estadoPago;

    // Relación 1:1 con Pedido
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "id_pedido",
            referencedColumnName = "idPedido",
            unique = true,
            nullable = false
    )
    @JsonIgnoreProperties({"pago","detalles","cliente"})
    //@JoinColumn(name = "id_pago", nullable = false)
    private Pedido pedido;


    // Enums tipados en lugar de NVARCHAR libre
    public enum MetodoPago {
        TARJETA_CREDITO,
        TARJETA_DEBITO,
        EFECTIVO
    }

    public enum EstadoPago {
        PENDIENTE,
        APROBADO,
        RECHAZADO,
        REEMBOLSADO
    }

    public Pago (){}

    public Pago(Long idPago, LocalDate fechaPago, MetodoPago metodoPago, EstadoPago estadoPago, Pedido pedido) {
        this.idPago = idPago;
        this.fechaPago = fechaPago;
        this.metodoPago = metodoPago;
        this.estadoPago = estadoPago;
        this.pedido = pedido;
    }

    public Long getIdPago() {
        return idPago;
    }

    public void setIdPago(Long idPago) {
        this.idPago = idPago;
    }

    public LocalDate getFechaPago() {
        return fechaPago;
    }

    public void setFechaPago(LocalDate fechaPago) {
        this.fechaPago = fechaPago;
    }

    public MetodoPago getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(MetodoPago metodoPago) {
        this.metodoPago = metodoPago;
    }

    public EstadoPago getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(EstadoPago estadoPago) {
        this.estadoPago = estadoPago;
    }

    public Pedido getPedido() {
        return pedido;
    }

    public void setPedido(Pedido pedido) {
        this.pedido = pedido;
    }
}
