package com.novatech.app_novatech.Controllers;

import com.novatech.app_novatech.Models.Resena;
import com.novatech.app_novatech.Services.ResenaServicio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resenas")
@CrossOrigin(origins = "http://localhost:5173")
public class ResenaControlador {

    @Autowired private ResenaServicio resenaServicio;

    @PostMapping
    public ResponseEntity<Resena> crear(@RequestBody Map<String, Object> body) {
        Long idCliente     = Long.valueOf(body.get("idCliente").toString());
        Integer calificacion = Integer.valueOf(body.get("calificacion").toString());
        String comentario  = body.get("comentario") != null
                ? body.get("comentario").toString()
                : null;

        return ResponseEntity.ok(
                resenaServicio.crearResena(idCliente, calificacion, comentario)
        );
    }

    @GetMapping
    public ResponseEntity<List<Resena>> obtenerTodas() {
        return ResponseEntity.ok(resenaServicio.obtenerTodas());
    }

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> resumen() {
        return ResponseEntity.ok(resenaServicio.obtenerResumen());
    }
}
