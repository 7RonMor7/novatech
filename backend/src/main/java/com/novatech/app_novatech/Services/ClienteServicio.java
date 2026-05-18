package com.novatech.app_novatech.Services;

import com.novatech.app_novatech.Models.Cliente;
import com.novatech.app_novatech.Repositories.ClienteRepositorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClienteServicio {
    // Inyectar el repositorio de Cliente
    @Autowired
    private ClienteRepositorio clienteRepositorio;

    // Metodo para agregar un cliente
    public Cliente saveCliente(Cliente cliente) { return clienteRepositorio.save(cliente); }

    //Metodo para listar todos los clientes
    public List<Cliente> getAllClientes(){
        return clienteRepositorio.findAll();
    }

    //Metodo para buscar un cliente por id
    public Optional<Cliente> getClienteById(Long idcliente){
        return clienteRepositorio.findById(idcliente);
    }

    //Metodo para eliminar un cliente por id
    public void deleteById(Long idcliente) {
        clienteRepositorio.deleteById(idcliente);
    }

    // NUEVO MÉTODO: Verificar si el email existe
    public boolean existePorEmail(String email) {
        return clienteRepositorio.existsByEmail(email);
    }
}
