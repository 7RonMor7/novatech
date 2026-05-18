package com.novatech.app_novatech.Services;

import com.novatech.app_novatech.Models.*;
import com.novatech.app_novatech.Repositories.CategoriaRepositorio;
import com.novatech.app_novatech.Repositories.PagoRepositorio;
import com.novatech.app_novatech.Repositories.PedidoRepositorio;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PagoServicio {
    // Inyectar los repositorios de Pago y Pedido
    @Autowired
    private PagoRepositorio pagoRepositorio;
    @Autowired
    private PedidoRepositorio pedidoRepositorio;

    @Transactional
    // Metodo para agregar un pago
    public Pago savePago(Pago pago){
        Long pedidoId = pago.getPedido().getIdPedido();

        Pedido pedido = pedidoRepositorio.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Error: El pedido con ID " + pedidoId + " no existe."));

        // Validar 1:1 solo en creación
        Optional<Pago> pagoExistente = pagoRepositorio.findByPedido_IdPedido(pedidoId);
        if (pagoExistente.isPresent()) {
            throw new IllegalArgumentException(
                    "Error: El pedido con ID " + pedidoId + " ya tiene un pago registrado.");
        }

        pago.setPedido(pedido);
        // 🔑 Si el pago se aprueba, el pedido pasa a ENTREGADO
        if (pago.getEstadoPago() == Pago.EstadoPago.APROBADO) {
            pedido.setEstado(Pedido.EstadoPedido.CONFIRMADO);
            pedidoRepositorio.save(pedido);
        }
        return pagoRepositorio.save(pago);
    }

    @Transactional
    // ✅ NUEVO — solo para UPDATE (no valida duplicado)
    public Pago updatePago(Pago pago) {
        Long pedidoId = pago.getPedido().getIdPedido();

        Pedido pedido = pedidoRepositorio.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Error: El pedido con ID " + pedidoId + " no existe."));

        pago.setPedido(pedido);
        // 🔑 Si el pago se aprueba, el pedido pasa a ENTREGADO
        if (pago.getEstadoPago() == Pago.EstadoPago.APROBADO) {
            pedido.setEstado(Pedido.EstadoPedido.ENTREGADO);
            pedidoRepositorio.save(pedido);
        }
        return pagoRepositorio.save(pago);
    }

    // Metodo para listar todos los pagos
    public List<Pago> getAllPagos() { return pagoRepositorio.findAll(); }

    // Metodo para buscar un pago por ID
    public Optional<Pago> getPagoById(Long idpago) { return pagoRepositorio.findById(idpago); }

    // Metodo para eliminar un pago por ID
    public void deleteById(Long idpago) {
        pagoRepositorio.deleteById(idpago);
    }


    /*
    // Metodo para agregar un pago
    @Transactional
    public Pago registrarPago(Long idPedido, Pago.MetodoPago metodoPago) {

        // Verificar que el pedido existe
        Pedido pedido = pedidoRepositorio.findById(idPedido)
                .orElseThrow(() -> new RuntimeException(
                        "EL pedido con id: " + idPedido + " no existe"));


        // Verificar que el pedido no tenga ya un pago registrado
        if (pagoRepositorio.existsByPedido_IdPedido(idPedido)) {
            throw new RuntimeException(
                    "El pedido ID " + idPedido + " ya tiene un pago registrado");
        }

        // Verificar que el pedido esté en estado válido para pagar
        if (pedido.getEstado() == Pedido.EstadoPedido.CANCELADO) {
            throw new RuntimeException(
                    "No se puede registrar un pago sobre un pedido cancelado");
        }

        // Crear y guardar el pago
        Pago pago = new Pago();
        pago.setPedido(pedido);
        pago.setFechaPago(LocalDate.now());
        pago.setMetodoPago(metodoPago);
        pago.setEstadoPago(Pago.EstadoPago.PENDIENTE);

        pagoRepositorio.save(pago);

        Pago pagoGuardado = pagoRepositorio.save(pago);

        // Actualizar estado del pedido a CONFIRMADO
        pedido.setEstado(Pedido.EstadoPedido.CONFIRMADO);
        pedidoRepositorio.save(pedido);

        return pagoGuardado;
    }

    // Metodo para aprobar un pago
    @Transactional
    public Pago aprobarPago(Long idPago) {
        Pago pago = obtenerPorId(idPago);

        if (pago.getEstadoPago() != Pago.EstadoPago.PENDIENTE) {
            throw new RuntimeException(
                    "Solo se pueden aprobar pagos en estado PENDIENTE");
        }

        pago.setEstadoPago(Pago.EstadoPago.APROBADO);

        // Actualizar estado del pedido a EN_PROCESO
        Pedido pedido = pago.getPedido();
        pedido.setEstado(Pedido.EstadoPedido.EN_PROCESO);
        pedidoRepositorio.save(pedido);

        return pagoRepositorio.save(pago);
    }

    // Metodo para rechazar un pago
    @Transactional
    public Pago rechazarPago(Long idPago) {
        Pago pago = obtenerPorId(idPago);

        if (pago.getEstadoPago() != Pago.EstadoPago.PENDIENTE) {
            throw new RuntimeException(
                    "Solo se pueden rechazar pagos en estado PENDIENTE");
        }

        pago.setEstadoPago(Pago.EstadoPago.RECHAZADO);

        // Revertir el pedido a PENDIENTE
        Pedido pedido = pago.getPedido();
        pedido.setEstado(Pedido.EstadoPedido.PENDIENTE);
        pedidoRepositorio.save(pedido);

        return pagoRepositorio.save(pago);
    }

    // Metodo para reembolsar un pago
    @Transactional
    public Pago reembolsarPago(Long idPago) {
        Pago pago = obtenerPorId(idPago);

        if (pago.getEstadoPago() != Pago.EstadoPago.APROBADO) {
            throw new RuntimeException(
                    "Solo se pueden reembolsar pagos en estado APROBADO");
        }

        pago.setEstadoPago(Pago.EstadoPago.REEMBOLSADO);

        // Cancelar el pedido asociado
        Pedido pedido = pago.getPedido();
        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        pedidoRepositorio.save(pedido);

        return pagoRepositorio.save(pago);
    }

    // Metodos para consultar los pagos

    public Pago obtenerPorId(Long idPago) {
        return pagoRepositorio.findById(idPago)
                .orElseThrow(() -> new RuntimeException(
                        "Pago con Id: " + idPago +" no encontrado."));
    }

    public Pago obtenerPorIdPedido(Long idPedido) {
        return pagoRepositorio.findByPedido_IdPedido(idPedido)
                .orElseThrow(() -> new RuntimeException(
                        "No existe pago para el pedido con ID: " + idPedido));
    }

    public List<Pago> obtenerTodos() {
        return pagoRepositorio.findAll();
    }

    public List<Pago> obtenerPorEstado(Pago.EstadoPago estadoPago) {
        return pagoRepositorio.findByEstadoPago(estadoPago);
    }

    public List<Pago> obtenerPorRangoFechas(LocalDate inicio, LocalDate fin) {
        if (inicio.isAfter(fin)) {
            throw new RuntimeException(
                    "La fecha de inicio no puede ser posterior a la fecha fin");
        }
        return pagoRepositorio.findByFechaPagoBetween(inicio, fin);
    }
    */

}
