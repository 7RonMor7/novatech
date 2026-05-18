package com.novatech.app_novatech.Services;

import com.novatech.app_novatech.Models.DetallePedido;
import com.novatech.app_novatech.Models.Pedido;
import com.novatech.app_novatech.Models.Producto;
import com.novatech.app_novatech.Repositories.DetallePedidoRepositorio;
import com.novatech.app_novatech.Repositories.PedidoRepositorio;
import com.novatech.app_novatech.Repositories.ProductoRepositorio;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DetallePedidoServicio {

    // Inyectar los repositorios de DetallePedido, Pedido y Producto
    @Autowired
    private DetallePedidoRepositorio detallePedidoRepositorio;
    @Autowired
    private PedidoRepositorio pedidoRepositorio;
    @Autowired
    private ProductoRepositorio productoRepositorio;

    @Transactional
    // Metodo para agregar un detalle pedido
    public Map<String, Object> saveDetallePedido(DetallePedido detallePedido){
        Long pedidoId = detallePedido.getPedido().getIdPedido();
        Long productoId = detallePedido.getProducto().getIdProducto();

        Pedido pedido = pedidoRepositorio.findById(pedidoId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Error: El pedido con ID " + pedidoId + " no existe en la base de datos."));

        Producto producto = productoRepositorio.findById(productoId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Error: El producto con ID " + productoId + " no existe en la base de datos."));

        // Reduce el stock respetando el mínimo; lanza StockInsuficienteException si no alcanza,
        // y retorna el mensaje informativo con el stock restante disponible para el usuario.
        String mensajeStock = producto.reducirStock(detallePedido.getCantidad());
        productoRepositorio.save(producto);

        detallePedido.setPedido(pedido);
        detallePedido.setProducto(producto);

        DetallePedido nuevoDetalle = detallePedidoRepositorio.save(detallePedido);

        // Retornamos el detalle + el mensaje de stock para que el controlador lo exponga al frontend
        return Map.of(
                "detalle", nuevoDetalle,
                "mensaje", mensajeStock
        );
    }

    // Metodo para actualizar un detalle pedido
    @Transactional
    public Map<String, Object> updateDetallePedido(DetallePedido detalleExistente, Integer cantidadAnterior) {
        // Cargar producto fresco por ID, no desde el objeto lazy
        Long productoId = detalleExistente.getProducto().getIdProducto();

        Producto producto = productoRepositorio.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Error: El producto con ID " + productoId + " no existe."));

        // Devolvemos la cantidad anterior al stock antes de aplicar la nueva
        producto.setStock(producto.getStock() + cantidadAnterior);

        // Reduce con la nueva cantidad, respetando el mínimo
        String mensajeStock = producto.reducirStock(detalleExistente.getCantidad());
        productoRepositorio.save(producto);

        DetallePedido detalleActualizado = detallePedidoRepositorio.save(detalleExistente);

        return Map.of(
                "detalle", detalleActualizado,
                "mensaje", mensajeStock
        );
    }

    // Metodo para listar todos los detalles pedido
    public List<DetallePedido> getAllDetallesPedidos(){
        return detallePedidoRepositorio.findAll();
    }

    //Buscar un detalle pedido por id
    public Optional<DetallePedido> getDetallePedidoById(Long iddetallePedido){
        return detallePedidoRepositorio.findById(iddetallePedido);
    }

    //Eliminar un detalle pedido por id
    @Transactional
    public void deleteLoanByid(Long iddetallePedido) {
        DetallePedido detalle = detallePedidoRepositorio.findById(iddetallePedido)
                .orElseThrow(() ->
                        new IllegalArgumentException("Error: El detalle con ID " + iddetallePedido + " no existe."));

        // Cargar producto fresco por ID
        Long productoId = detalle.getProducto().getIdProducto();
        Producto producto = productoRepositorio.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Error: El producto con ID " + productoId + " no existe."));


        // Al eliminar el detalle devolvemos las unidades al stock,
        // pero sin superar el máximo definido en Producto.STOCK_MAXIMO.
        producto.agregarStock(detalle.getCantidad());
        productoRepositorio.save(producto);

        detallePedidoRepositorio.deleteById(iddetallePedido);
    }
}
