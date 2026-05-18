package com.novatech.app_novatech.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.novatech.app_novatech.StockInsuficienteException;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
public class Producto {

    // ── Constantes de negocio ────────────────────────────────────────────────
    public static final int STOCK_MINIMO = 4;
    public static final int STOCK_MAXIMO = 30;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    @NotBlank(message = "El nombre del producto es obligatorio")
    private String nombre;

    @Size(max = 300, message = "La descripción no puede superar los 300 caracteres")
    private String descripcion;

    // NUEVO CAMPO: imagenUrl
    @Size(max = 500, message = "La URL de la imagen es demasiado larga")
    private String imagenUrl;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "Formato inválido: máximo 8 enteros y 2 decimales")
    private BigDecimal precio;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 4, message = "El stock mínimo permitido es 4 unidades")
    @Max(value = 30, message = "El stock máximo permitido es 30 unidades")
    private Integer stock;

    private Boolean activo;

    // Relación con Categoria (muchos productos → una categoría)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "idcategoria"
    )
    @JsonIgnoreProperties({"productos"})
    private Categoria categoria;

    // Relación con DetallePedido (un producto → muchos detalles)
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<DetallePedido> detalles;

    // ── Métodos de negocio ───────────────────────────────────────────────────

    /**
     * Verifica si el stock actual está por encima del mínimo permitido,
     * considerando la cantidad que se desea descontar.
     * El pedido solo se puede realizar si (stock - cantidad) >= STOCK_MINIMO.
     */
    public boolean hayStockDisponible(int cantidadSolicitada) {
        return (this.stock - cantidadSolicitada) >= STOCK_MINIMO;
    }

    /**
     * Retorna las unidades realmente disponibles para venta,
     * es decir el stock por encima del mínimo de reserva.
     */
    public int getStockDisponibleParaVenta() {
        int disponible = this.stock - STOCK_MINIMO;
        return Math.max(disponible, 0);
    }

    /**
     * Verifica si agregar cierta cantidad supera el stock máximo permitido.
     * Útil al registrar entradas de inventario.
     */
    public boolean superaStockMaximo(int cantidadAAgregar) {
        return (this.stock + cantidadAAgregar) > STOCK_MAXIMO;
    }

    /**
     * Reduce el stock tras confirmar un detalle de pedido.
     * Lanza excepción si la operación dejaría el stock por debajo del mínimo.
     *
     * @return mensaje informativo con el stock restante tras la operación
     */
    public String reducirStock(int cantidad) {
        if (!hayStockDisponible(cantidad)) {
            int disponibleParaVenta = getStockDisponibleParaVenta();
            throw new StockInsuficienteException(
                    String.format(
                            "No es posible agregar %d unidad(es) de '%s'. " +
                                    "Stock disponible para venta: %d (se reservan %d unidades mínimas). " +
                                    "Stock actual: %d.",
                            cantidad, this.nombre, disponibleParaVenta, STOCK_MINIMO, this.stock
                    )
            );
        }
        this.stock -= cantidad;
        int stockRestante = this.stock - STOCK_MINIMO;
        return String.format(
                "Pedido registrado correctamente. Stock disponible restante de '%s': %d unidad(es).",
                this.nombre, stockRestante
        );
    }

    /**
     * Incrementa el stock (ej. al recibir mercancía).
     * Lanza excepción si se superaría el stock máximo.
     */
    public void agregarStock(int cantidad) {
        if (superaStockMaximo(cantidad)) {
            throw new IllegalArgumentException(
                    String.format(
                            "No se pueden agregar %d unidad(es). El stock resultante (%d) superaría " +
                                    "el máximo permitido de %d.",
                            cantidad, this.stock + cantidad, STOCK_MAXIMO
                    )
            );
        }
        this.stock += cantidad;
    }

    /**
     * Indica si el producto está en nivel crítico de stock
     * (en o por debajo del mínimo).
     */
    public boolean estaEnStockCritico() {
        return this.stock <= STOCK_MINIMO;
    }

    public Producto() {}

    public Producto(Long idProducto, String nombre, String descripcion, String imagenUrl, BigDecimal precio, Integer stock, Boolean activo, Categoria categoria, List<DetallePedido> detalles) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.imagenUrl = imagenUrl;
        this.precio = precio;
        this.stock = stock;
        this.activo = activo;
        this.categoria = categoria;
        this.detalles = detalles;
    }

    public Long getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Long idProducto) {
        this.idProducto = idProducto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getImagenUrl() {return imagenUrl;}

    public void setImagenUrl(String imagenUrl) {this.imagenUrl = imagenUrl;}

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }

    public List<DetallePedido> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetallePedido> detalles) {
        this.detalles = detalles;
    }
}
