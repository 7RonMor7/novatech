package com.novatech.app_novatech.Services;


import com.novatech.app_novatech.Models.Cliente;
import com.novatech.app_novatech.Models.DetallePedido;
import com.novatech.app_novatech.Models.Pedido;
import com.novatech.app_novatech.Models.Producto;
import com.novatech.app_novatech.Repositories.ClienteRepositorio;
import com.novatech.app_novatech.Repositories.DetallePedidoRepositorio;
import com.novatech.app_novatech.Repositories.PedidoRepositorio;
import com.novatech.app_novatech.Repositories.ProductoRepositorio;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class PedidoServicio {
    @Autowired
    private PedidoRepositorio pedidoRepositorio;
    @Autowired
    private ClienteRepositorio clienteRepositorio;

    // Método para agregar o actualizar un pedido
    public Pedido savePedido(Pedido pedido) {
        // 1. Obtener el ID del cliente desde el objeto pedido
        Long clienteId = pedido.getCliente().getIdCliente();

        // 2. Validar si el cliente existe en la base de datos
        Cliente cliente = clienteRepositorio.findById(clienteId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Error: El cliente con ID " + clienteId + " no existe. No se puede crear el pedido."));

        // 3. Asignar el cliente encontrado al pedido para asegurar la relación correcta
        pedido.setCliente(cliente);

        // 4. Guardar el pedido
        return pedidoRepositorio.save(pedido);
    }

    // Método para listar todos los pedidos
    public List<Pedido> getAllPedidos() {
        return pedidoRepositorio.findAll();
    }

    // Método para buscar un pedido por ID
    public Optional<Pedido> getPedidoById(Long idpedido) {
        return pedidoRepositorio.findById(idpedido);
    }

    // Método para eliminar un pedido por ID
    public void deleteById(Long idpedido) {
        if (!pedidoRepositorio.existsById(idpedido)) {
            throw new IllegalArgumentException(
                    "No existe un pedido con ID: " + idpedido);
        }
        pedidoRepositorio.deleteById(idpedido);
    }


    /*
    private final PedidoRepositorio pedidoRepositorio;
    private final ClienteRepositorio clienteRepositorio;
    private final ProductoRepositorio productoRepositorio;
    private final DetallePedidoRepositorio detallePedidoRepositorio;

    // ─── Crear pedido ──────────────────────────────────────────────────────
    @Transactional
    public Pedido crearPedido(Long idCliente, List<DetallePedido> detalles) {

        // Verificar que el cliente existe
        Cliente cliente = clienteRepositorio.findById(idCliente)
                .orElseThrow(() -> new RuntimeException(
                        "Cliente no encontrado con ID: " + idCliente));

        // Verificar stock y calcular total
        BigDecimal total = BigDecimal.ZERO;

        for (DetallePedido detalle : detalles) {
            Producto producto = productoRepositorio.findById(
                            detalle.getProducto().getIdProducto())
                    .orElseThrow(() -> new RuntimeException(
                            "Producto no encontrado con ID: "
                                    + detalle.getProducto().getIdProducto()));

            // Validar stock disponible
            if (!producto.hayStock(detalle.getCantidad())) {
                throw new RuntimeException(
                        "Stock insuficiente para el producto: " + producto.getNombre()
                                + ". Disponible: " + producto.getStock()
                                + ", solicitado: " + detalle.getCantidad());
            }

            // Asignar precio actual del producto al detalle
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setProducto(producto);

            // Reducir stock del producto
            producto.reducirStock(detalle.getCantidad());
            productoRepositorio.save(producto);

            // Acumular total
            total = total.add(detalle.calcularSubtotal());
        }

        // Construir y guardar el pedido
        Pedido pedido = new Pedido();
        pedido.setFecha(LocalDate.now());
        pedido.setTotal(total);
        pedido.setEstado(Pedido.EstadoPedido.PENDIENTE);
        pedido.setCliente(cliente);
        pedido.setDetalles(detalles);

        pedidoRepositorio.save(pedido);

        Pedido pedidoGuardado = pedidoRepositorio.save(pedido);

        // Asociar detalles al pedido y guardarlos
        detalles.forEach(detalle -> detalle.setPedido(pedidoGuardado));
        detallePedidoRepositorio.saveAll(detalles);

        pedidoGuardado.setDetalles(detalles);
        return pedidoGuardado;
    }

    // ─── Actualizar estado ─────────────────────────────────────────────────
    @Transactional
    public Pedido actualizarEstado(Long idPedido, Pedido.EstadoPedido nuevoEstado) {
        Pedido pedido = obtenerPorId(idPedido);

        validarTransicionEstado(pedido.getEstado(), nuevoEstado);

        pedido.setEstado(nuevoEstado);
        return pedidoRepositorio.save(pedido);
    }

    // ─── Cancelar pedido ───────────────────────────────────────────────────
    @Transactional
    public Pedido cancelarPedido(Long idPedido) {
        Pedido pedido = obtenerPorId(idPedido);

        if (pedido.getEstado() == Pedido.EstadoPedido.ENTREGADO) {
            throw new RuntimeException(
                    "No se puede cancelar un pedido ya entregado");
        }

        if (pedido.getEstado() == Pedido.EstadoPedido.CANCELADO) {
            throw new RuntimeException("El pedido ya está cancelado");
        }

        // Devolver stock de cada producto
        for (DetallePedido detalle : pedido.getDetalles()) {
            Producto producto = detalle.getProducto();
            producto.setStock(producto.getStock() + detalle.getCantidad());
            productoRepositorio.save(producto);
        }

        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        return pedidoRepositorio.save(pedido);
    }

    // ─── Consultas ─────────────────────────────────────────────────────────
    public Pedido obtenerPorId(Long idPedido) {
        return pedidoRepositorio.findById(idPedido)
                .orElseThrow(() -> new RuntimeException(
                        "Pedido no encontrado con ID: " + idPedido));
    }

    public List<Pedido> obtenerTodos() {
        return pedidoRepositorio.findAll();
    }

    public List<Pedido> obtenerPorCliente(Long idCliente) {
        return pedidoRepositorio.findByCliente_IdCliente(idCliente);
    }

    public List<Pedido> obtenerPorEstado(Pedido.EstadoPedido estado) {
        return pedidoRepositorio.findByEstado(estado);
    }

    public List<Pedido> obtenerPorRangoFechas(LocalDate inicio, LocalDate fin) {
        if (inicio.isAfter(fin)) {
            throw new RuntimeException(
                    "La fecha de inicio no puede ser posterior a la fecha fin");
        }
        return pedidoRepositorio.findByFechaBetween(inicio, fin);
    }

    public List<Pedido> obtenerPorClienteYEstado(Long idCliente, Pedido.EstadoPedido estado) {
        return pedidoRepositorio.findByClienteAndEstado(idCliente, estado);
    }

    // ─── Validación de transiciones de estado ──────────────────────────────
    private void validarTransicionEstado(Pedido.EstadoPedido actual, Pedido.EstadoPedido nuevo) {
        boolean transicionValida = switch (actual) {
            case PENDIENTE   -> nuevo == Pedido.EstadoPedido.CONFIRMADO
                    || nuevo == Pedido.EstadoPedido.CANCELADO;
            case CONFIRMADO  -> nuevo == Pedido.EstadoPedido.EN_PROCESO
                    || nuevo == Pedido.EstadoPedido.CANCELADO;
            case EN_PROCESO  -> nuevo == Pedido.EstadoPedido.ENVIADO;
            case ENVIADO     -> nuevo == Pedido.EstadoPedido.ENTREGADO;
            case ENTREGADO,
                 CANCELADO   -> false;
        };

        if (!transicionValida) {
            throw new RuntimeException(
                    "Transición de estado inválida: " + actual + " → " + nuevo);
        }
    }

     */
}
