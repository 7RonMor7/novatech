package com.novatech.app_novatech.Services;

import com.novatech.app_novatech.Models.*;
import com.novatech.app_novatech.Repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class ResenaServicio {

    @Autowired private ResenaRepositorio resenaRepositorio;
    @Autowired private ClienteRepositorio clienteRepositorio;
    @Autowired private PagoRepositorio pagoRepositorio;

    public Resena crearResena(Long idCliente, Integer calificacion, String comentario) {

        // Validación de rango de calificación
        if (calificacion < 1 || calificacion > 5) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "La calificación debe estar entre 1 y 5");
        }

        Cliente cliente = clienteRepositorio.findById(idCliente)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Cliente no encontrado con id: " + idCliente));

        // ✅ Verificar que tiene al menos un pago APROBADO
        boolean tienePagoAprobado = pagoRepositorio
                .existsByPedidoClienteIdClienteAndEstadoPago(
                        idCliente, Pago.EstadoPago.APROBADO);

        if (!tienePagoAprobado) {
            throw new IllegalArgumentException(
                "Solo clientes con pagos aprobados pueden dejar reseñas");
        }

        Resena resena = new Resena();
        resena.setCliente(cliente);
        resena.setCalificacion(calificacion);
        resena.setComentario(comentario);

        return resenaRepositorio.save(resena);
    }

    public List<Resena> obtenerTodas() {
        return resenaRepositorio.findAllByOrderByFechaResenaDesc();
    }

    public Map<String, Object> obtenerResumen() {
        Double promedio = resenaRepositorio.calcularPromedioCalificaciones();
        long total = resenaRepositorio.count();
        List<Object[]> distribucion = resenaRepositorio.contarPorCalificacion();

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("promedio", promedio != null ? Math.round(promedio * 10.0) / 10.0 : 0);
        resumen.put("total", total);
        resumen.put("distribucion", distribucion);
        return resumen;
    }
}
