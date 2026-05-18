-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3307
-- Tiempo de generación: 18-05-2026 a las 16:26:16
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ecommerce_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categoria`
--

CREATE TABLE `categoria` (
  `id_categoria` bigint(20) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categoria`
--

INSERT INTO `categoria` (`id_categoria`, `descripcion`, `nombre`) VALUES
(1, 'Periféricos y accesorios', 'Accesorios'),
(2, 'Computadores portátiles', 'Laptops'),
(4, 'Teléfonos inteligentes de última generación', 'Smartphones'),
(5, 'Dispositivos táctiles portátiles', 'Tablets');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cliente`
--

CREATE TABLE `cliente` (
  `id_cliente` bigint(20) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `fecha_registro` date NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cliente`
--

INSERT INTO `cliente` (`id_cliente`, `direccion`, `email`, `fecha_registro`, `nombre`, `telefono`) VALUES
(1, 'Carrera 94B', 'ronald@gmail.com', '2026-04-08', 'Ronald', '3017622774'),
(3, 'Avenida 80', 'ospina@gmail.com', '2026-04-08', 'Ospina', '3043297372'),
(8, 'Carrera 94 # 48A - 84', 'paulaptoli@gmail.com', '2026-05-07', 'Paula', '3004309450'),
(9, 'Carrera 94B', 'sebastian@gmail.com', '2026-05-13', 'Sebastian', '3115247501');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id_detalle` bigint(20) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `id_pedido` bigint(20) NOT NULL,
  `id_producto` bigint(20) NOT NULL
) ;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id_detalle`, `cantidad`, `precio_unitario`, `id_pedido`, `id_producto`) VALUES
(1, 3, 40000.00, 1, 1),
(4, 2, 80.00, 3, 2),
(5, 2, 50000.00, 6, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pago`
--

CREATE TABLE `pago` (
  `id_pago` bigint(20) NOT NULL,
  `estado_pago` enum('APROBADO','EN_REVISION','PENDIENTE','RECHAZADO','REEMBOLSADO') NOT NULL,
  `fecha_pago` date NOT NULL,
  `metodo_pago` enum('EFECTIVO','PSE','TARJETA_CREDITO','TARJETA_DEBITO','TRANSFERENCIA') NOT NULL,
  `id_pedido` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pago`
--

INSERT INTO `pago` (`id_pago`, `estado_pago`, `fecha_pago`, `metodo_pago`, `id_pedido`) VALUES
(1, 'REEMBOLSADO', '2026-04-15', 'TARJETA_DEBITO', 1),
(3, 'APROBADO', '2026-04-08', 'EFECTIVO', 3),
(5, 'APROBADO', '2026-05-09', 'TARJETA_CREDITO', 6),
(6, 'APROBADO', '2026-05-09', 'EFECTIVO', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido`
--

CREATE TABLE `pedido` (
  `id_pedido` bigint(20) NOT NULL,
  `estado` enum('CANCELADO','CONFIRMADO','ENTREGADO','ENVIADO','EN_PROCESO','PENDIENTE') NOT NULL,
  `fecha` date NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `id_cliente` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedido`
--

INSERT INTO `pedido` (`id_pedido`, `estado`, `fecha`, `total`, `id_cliente`) VALUES
(1, 'CANCELADO', '2026-04-08', 80000.00, 1),
(3, 'CONFIRMADO', '2026-04-15', 160.00, 1),
(4, 'ENTREGADO', '2026-04-28', 49999.84, 3),
(6, 'ENTREGADO', '2026-05-08', 99999.94, 8);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto`
--

CREATE TABLE `producto` (
  `id_producto` bigint(20) NOT NULL,
  `activo` bit(1) DEFAULT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `nombre` varchar(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `idcategoria` bigint(20) NOT NULL,
  `imagen_url` varchar(500) DEFAULT NULL
) ;

--
-- Volcado de datos para la tabla `producto`
--

INSERT INTO `producto` (`id_producto`, `activo`, `descripcion`, `nombre`, `precio`, `stock`, `idcategoria`, `imagen_url`) VALUES
(1, b'1', 'Memoria de procesamiento', 'RAM', 40000.00, 8, 1, 'https://compubit.com.co/wp-content/uploads/2023/04/Porque-es-importante-la-memoria-RAM-2-3-1024x535.jpg'),
(2, b'1', 'Mouse inalambrico', 'Mouse Logitech', 80.00, 18, 1, 'https://technologystore2006.com/wp-content/uploads/2022/08/MOULOGM90.webp'),
(4, b'1', 'Chip A17, 256GB, Titanio', 'iPhone 15 Pro', 6500000.00, 5, 4, 'https://www.clevercel.co/cdn/shop/files/2_7d4d46df-9916-4fd0-a1e9-70249f84aeea_1500x.jpg?v=1757092977'),
(5, b'1', 'Color gris, memoria 8GB', 'Macbook Pro 13\'', 8500000.00, 1, 2, 'https://mac-center.com/cdn/shop/files/MacBook_Pro_13_in_Space_Gray_PDP_Image_Position-1_MXLA_5395ce92-3d36-4483-a995-b6bb011179c0.jpg?v=1700304877'),
(6, b'1', 'Tecnología XBS, Resistencia a salpicaduras y al sudor.', 'Audífonos Inalámbricos', 50000.00, 10, 1, 'https://www.alkomprar.com/medias/5025232920815-001-750Wx750H?context=bWFzdGVyfGltYWdlc3wxMDA1OHxpbWFnZS93ZWJwfGFEQmpMMmcxWWk4eE5ETTBPVEl6TWpJd09UazFNQzgxTURJMU1qTXlPVEl3T0RFMVh6QXdNVjgzTlRCWGVEYzFNRWd8ZDU1Yjc2YjgxN2UyOGZiMDc4ZmFlM2I4NzNiM2QyODIyNTI1NzcxMTJiZDViNWM3NTgyNGY3OGMxODY0MjU0Yg'),
(7, b'1', 'Pantalla 11\", 256GB WiFi', 'iPad Air M2', 3800000.00, 31, 5, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4vm6ZstIdFHArjdSOoOuUaSKksHXnPoJxnQ&s'),
(8, b'1', 'AMD Ryzen 5, 8GB RAM, 256GB SSD', 'Laptop HP Pavilion', 2800000.00, 7, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMEFuSm4BytQ7PArNrIa-kNgzbjnrXsywirQ&s');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resena`
--

CREATE TABLE `resena` (
  `id_resena` bigint(20) NOT NULL,
  `calificacion` int(11) NOT NULL,
  `comentario` varchar(500) DEFAULT NULL,
  `fecha_resena` datetime(6) DEFAULT NULL,
  `id_cliente` bigint(20) NOT NULL
) ;

--
-- Volcado de datos para la tabla `resena`
--

INSERT INTO `resena` (`id_resena`, `calificacion`, `comentario`, `fecha_resena`, `id_cliente`) VALUES
(1, 5, 'Muy buen servicio, productos originales y con excelente calidad.', '2026-05-13 02:50:02.000000', 1),
(2, 4, '', '2026-05-13 03:02:24.000000', 3),
(3, 5, '', '2026-05-13 03:02:38.000000', 8);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `cliente`
--
ALTER TABLE `cliente`
  ADD PRIMARY KEY (`id_cliente`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id_detalle`),
  ADD KEY `FK7n9hdifr08joboojejveby1vr` (`id_pedido`),
  ADD KEY `FKjfm9pk0w2eag8tx8lu6pbego6` (`id_producto`);

--
-- Indices de la tabla `pago`
--
ALTER TABLE `pago`
  ADD PRIMARY KEY (`id_pago`),
  ADD UNIQUE KEY `UKsmd7sl0godm04hw83kdt6ebwf` (`id_pedido`);

--
-- Indices de la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD PRIMARY KEY (`id_pedido`),
  ADD KEY `FK9y4jnyp1hxqa386cnly0ay9uw` (`id_cliente`);

--
-- Indices de la tabla `producto`
--
ALTER TABLE `producto`
  ADD PRIMARY KEY (`id_producto`),
  ADD KEY `FKcrgmbh0y7pon20op3ty7d162w` (`idcategoria`);

--
-- Indices de la tabla `resena`
--
ALTER TABLE `resena`
  ADD PRIMARY KEY (`id_resena`),
  ADD KEY `FK2duqf25ts3b77rs608xav2i6s` (`id_cliente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id_categoria` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `cliente`
--
ALTER TABLE `cliente`
  MODIFY `id_cliente` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id_detalle` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pago`
--
ALTER TABLE `pago`
  MODIFY `id_pago` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `pedido`
--
ALTER TABLE `pedido`
  MODIFY `id_pedido` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `producto`
--
ALTER TABLE `producto`
  MODIFY `id_producto` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resena`
--
ALTER TABLE `resena`
  MODIFY `id_resena` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `FK7n9hdifr08joboojejveby1vr` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`),
  ADD CONSTRAINT `FKjfm9pk0w2eag8tx8lu6pbego6` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`);

--
-- Filtros para la tabla `pago`
--
ALTER TABLE `pago`
  ADD CONSTRAINT `FKpddca3nqitclyep51ognpka70` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`);

--
-- Filtros para la tabla `pedido`
--
ALTER TABLE `pedido`
  ADD CONSTRAINT `FK9y4jnyp1hxqa386cnly0ay9uw` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);

--
-- Filtros para la tabla `producto`
--
ALTER TABLE `producto`
  ADD CONSTRAINT `FKcrgmbh0y7pon20op3ty7d162w` FOREIGN KEY (`idcategoria`) REFERENCES `categoria` (`id_categoria`);

--
-- Filtros para la tabla `resena`
--
ALTER TABLE `resena`
  ADD CONSTRAINT `FK2duqf25ts3b77rs608xav2i6s` FOREIGN KEY (`id_cliente`) REFERENCES `cliente` (`id_cliente`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
