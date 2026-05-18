package com.novatech.app_novatech.Models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPedido;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "El total es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El total debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "Formato inválido: máximo 8 enteros y 2 decimales")
    private BigDecimal total;

    @NotNull(message = "El estado es obligatorio")
    @Enumerated(EnumType.STRING)
    private EstadoPedido estado;

    // Relación con Cliente (muchos pedidos → un cliente)
    @ManyToOne
    @JoinColumn(name = "id_cliente", nullable = false)
    //@JsonBackReference("cliente-pedidos")
    @JsonIgnoreProperties({"pedidos"})
    private Cliente cliente;

    // Relación con DetallePedido (un pedido → muchos detalles)
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL)
    //@JsonManagedReference("pedido-detalles")
    @JsonIgnoreProperties({"pedido"})
    private List<DetallePedido> detalles;

    // Relación con Pago (un pedido → un pago)
    // En Pedido, Pago es el lado dueño
    @OneToOne(mappedBy = "pedido", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"pedido"})
    private Pago pago;

    //Enum de estados del pedido
    public enum EstadoPedido {
        PENDIENTE,
        CONFIRMADO,
        ENTREGADO,
        CANCELADO
    }

    public Pedido() {}

    public Pedido(Long idPedido, LocalDate fecha, BigDecimal total, EstadoPedido estado, Cliente cliente, List<DetallePedido> detalles, Pago pago) {
        this.idPedido = idPedido;
        this.fecha = fecha;
        this.total = total;
        this.estado = estado;
        this.cliente = cliente;
        this.detalles = detalles;
        this.pago = pago;
    }

    public Long getIdPedido() {
        return idPedido;
    }

    public void setIdPedido(Long idPedido) {
        this.idPedido = idPedido;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public EstadoPedido getEstado() {
        return estado;
    }

    public void setEstado(EstadoPedido estado) {
        this.estado = estado;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public List<DetallePedido> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetallePedido> detalles) {
        this.detalles = detalles;
    }

    public Pago getPago() {
        return pago;
    }

    public void setPago(Pago pago) {
        this.pago = pago;
    }
}
