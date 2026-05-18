package com.novatech.app_novatech.Models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Entity
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idResena;

    @Min(1) @Max(5)
    @NotNull(message = "La calificación es obligatoria")
    private Integer calificacion;

    @Size(max = 500, message = "El comentario no puede superar 500 caracteres")
    private String comentario;

    @Column(name = "fecha_resena")
    private LocalDateTime fechaResena = LocalDateTime.now();

    // Relación con Cliente (muchas reseñas → un cliente)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente", nullable = false)
    @JsonIgnoreProperties({"pedidos", "resenas"})
    private Cliente cliente;

    public Resena() {}

    public Resena(Long idResena, Integer calificacion, String comentario, LocalDateTime fechaResena, Cliente cliente) {
        this.idResena = idResena;
        this.calificacion = calificacion;
        this.comentario = comentario;
        this.fechaResena = fechaResena;
        this.cliente = cliente;
    }

    public Long getIdResena() { return idResena; }
    public void setIdResena(Long idResena) { this.idResena = idResena; }

    public Integer getCalificacion() { return calificacion; }
    public void setCalificacion(Integer calificacion) { this.calificacion = calificacion; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public LocalDateTime getFechaResena() { return fechaResena; }
    public void setFechaResena(LocalDateTime fechaResena) { this.fechaResena = fechaResena; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
}
