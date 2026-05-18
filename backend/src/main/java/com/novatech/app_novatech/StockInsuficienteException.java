package com.novatech.app_novatech;

/**
 * Excepción de negocio lanzada cuando un producto no tiene
 * stock disponible suficiente para cubrir un detalle de pedido,
 * respetando el umbral de stock mínimo configurado.
 */

public class StockInsuficienteException extends RuntimeException {

    public StockInsuficienteException(String mensaje) {
        super(mensaje);
    }

    public StockInsuficienteException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
