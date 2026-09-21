-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: kronosv2
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alertas`
--

DROP TABLE IF EXISTS `alertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alertas` (
  `idalertas` int(11) NOT NULL AUTO_INCREMENT,
  `Estado` varchar(45) DEFAULT NULL,
  `inventario_codInventario` int(11) NOT NULL,
  PRIMARY KEY (`idalertas`),
  KEY `fk_alerta_inventario` (`inventario_codInventario`),
  CONSTRAINT `fk_alerta_inventario` FOREIGN KEY (`inventario_codInventario`) REFERENCES `inventarios` (`codInventario`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas`
--

LOCK TABLES `alertas` WRITE;
/*!40000 ALTER TABLE `alertas` DISABLE KEYS */;
INSERT INTO `alertas` VALUES (1,'Crítico',41),(2,'Normal',18),(3,'Bajo',10),(4,'Crítico',32),(5,'Normal',13),(6,'Bajo',22),(7,'Bajo',6),(8,'Normal',29),(9,'Bajo',2),(10,'Normal',1),(11,'Normal',35),(12,'Normal',16),(13,'Normal',25),(14,'Normal',8),(15,'Normal',38),(16,'Bajo',20),(17,'Bajo',31),(18,'Bajo',11),(19,'Bajo',43),(20,'Normal',3),(21,'Bajo',40),(22,'Bajo',27),(23,'Normal',47),(24,'Normal',45),(25,'Normal',15),(26,'Normal',34),(27,'Bajo',50),(28,'Normal',5),(29,'Normal',23),(30,'Bajo',36),(31,'Normal',17),(32,'Normal',46),(33,'Normal',30),(34,'Normal',39),(35,'Normal',7),(36,'Normal',49),(37,'Normal',26),(38,'Normal',44),(39,'Normal',14),(40,'Normal',48),(41,'Crítico',21),(42,'Normal',37),(43,'Normal',9),(44,'Bajo',19),(45,'Normal',28),(46,'Bajo',12),(47,'Bajo',42),(48,'Normal',24),(49,'Normal',33),(50,'Normal',4);
/*!40000 ALTER TABLE `alertas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `idCategoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombreCategoria` varchar(45) NOT NULL,
  PRIMARY KEY (`idCategoria`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Herramientas manuales'),(2,'Herramientas electricas'),(3,'Herramientas de medicion'),(4,'Herramientas de corte'),(5,'Taladros'),(6,'Esmeriles'),(7,'Martillos'),(8,'Alicates'),(9,'Llaves'),(10,'Destornilladores'),(11,'Brocas'),(12,'Discos de corte'),(13,'Discos de pulido'),(14,'Tornilleria'),(15,'Tuercas'),(16,'Arandelas'),(17,'Perfiles metalicos'),(18,'Tubos metalicos'),(19,'Tubos PVC'),(20,'Accesorios de plomeria'),(21,'Material electrico'),(22,'Cables electricos'),(23,'Interruptores'),(24,'Tomacorrientes'),(25,'Bombillos'),(26,'Pinturas'),(27,'Esmaltes'),(28,'Impermeabilizantes'),(29,'Pegantes'),(30,'Siliconas'),(31,'Abrasivos'),(32,'Elementos de seguridad'),(33,'Guantes'),(34,'Cascos'),(35,'Gafas de seguridad'),(36,'Botas de seguridad'),(37,'Protectores auditivos'),(38,'Materiales de construccion'),(39,'Cemento'),(40,'Arena'),(41,'Grava'),(42,'Ladrillos'),(43,'Bloques'),(44,'Tejas'),(45,'Mallas metalicas'),(46,'Alambres'),(47,'Madera'),(48,'Accesorios metalicos'),(49,'Equipos de soldadura'),(50,'Accesorios de soldadura');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clientes` (
  `idCliente` int(11) NOT NULL AUTO_INCREMENT,
  `carritoActivo` tinyint(1) DEFAULT NULL,
  `usuario_identificacion` int(11) NOT NULL,
  PRIMARY KEY (`idCliente`),
  KEY `fk_cliente_usuario` (`usuario_identificacion`),
  CONSTRAINT `fk_cliente_usuario` FOREIGN KEY (`usuario_identificacion`) REFERENCES `usuarios` (`identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,1,1001),(2,0,1002),(3,1,1003),(4,0,1004),(5,1,1005),(6,0,1006),(7,1,1007),(8,0,1008),(9,1,1009),(10,0,1010),(11,1,1011),(12,0,1012),(13,1,1013),(14,0,1014),(15,1,1015),(16,0,1016),(17,1,1017),(18,0,1018),(19,1,1019),(20,0,1020),(21,1,1021),(22,0,1022),(23,1,1023),(24,0,1024),(25,1,1025),(26,0,1026),(27,1,1027),(28,0,1028),(29,1,1029),(30,0,1030),(31,1,1031),(32,0,1032),(33,1,1033),(34,0,1034),(35,1,1035),(36,0,1036),(37,1,1037),(38,0,1038),(39,1,1039),(40,0,1040),(41,1,1041),(42,0,1042),(43,1,1043),(44,0,1044),(45,1,1045),(46,0,1046),(47,1,1047),(48,0,1048),(49,1,1049),(50,0,1050),(51,1,10101234),(52,1,10101235);
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalleventas`
--

DROP TABLE IF EXISTS `detalleventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalleventas` (
  `idDetalleVenta` int(11) NOT NULL AUTO_INCREMENT,
  `subTotal` float DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `precioUnitario` float DEFAULT NULL,
  `venta_idVenta` int(11) NOT NULL,
  `inventario_codInventario` int(11) NOT NULL,
  PRIMARY KEY (`idDetalleVenta`),
  KEY `fk_detalleventa_venta` (`venta_idVenta`),
  KEY `fk_detalleventa_inventario` (`inventario_codInventario`),
  CONSTRAINT `fk_detalleventa_inventario` FOREIGN KEY (`inventario_codInventario`) REFERENCES `inventarios` (`codInventario`),
  CONSTRAINT `fk_detalleventa_venta` FOREIGN KEY (`venta_idVenta`) REFERENCES `ventas` (`idVenta`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalleventas`
--

LOCK TABLES `detalleventas` WRITE;
/*!40000 ALTER TABLE `detalleventas` DISABLE KEYS */;
INSERT INTO `detalleventas` VALUES (1,30200,2,15100,1,7),(2,45600,3,15200,2,12),(3,61200,4,15300,3,3),(4,77000,5,15400,4,7),(5,15500,1,15500,5,21),(6,31200,2,15600,6,15),(7,47100,3,15700,7,3),(8,63200,4,15800,8,28),(9,79500,5,15900,9,12),(10,32000,2,16000,10,35),(11,16100,1,16100,11,7),(12,48600,3,16200,12,44),(13,65200,4,16300,13,15),(14,82000,5,16400,14,21),(15,33000,2,16500,15,3),(16,33200,2,16600,16,12),(17,50100,3,16700,17,28),(18,67200,4,16800,18,35),(19,84500,5,16900,19,7),(20,17000,1,17000,20,15),(21,34200,2,17100,21,44),(22,51600,3,17200,22,21),(23,69200,4,17300,23,3),(24,87000,5,17400,24,12),(25,35000,2,17500,25,28),(26,35200,2,17600,26,35),(27,53100,3,17700,27,7),(28,71200,4,17800,28,15),(29,89500,5,17900,29,44),(30,18000,1,18000,30,21),(31,36200,2,18100,31,3),(32,54600,3,18200,32,12),(33,73200,4,18300,33,28),(34,92000,5,18400,34,35),(35,37000,2,18500,35,7),(36,37200,2,18600,36,15),(37,56100,3,18700,37,44),(38,75200,4,18800,38,21),(39,94500,5,18900,39,3),(40,38000,2,19000,40,12),(41,38200,2,19100,41,28),(42,57600,3,19200,42,35),(43,77200,4,19300,43,7),(44,97000,5,19400,44,15),(45,39000,2,19500,45,44),(46,39200,2,19600,46,21),(47,59100,3,19700,47,3),(48,79200,4,19800,48,12),(49,99500,5,19900,49,28),(50,40000,2,20000,50,35);
/*!40000 ALTER TABLE `detalleventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `direcciones` (
  `idDireccion` int(11) NOT NULL AUTO_INCREMENT,
  `barrio` varchar(45) DEFAULT NULL,
  `ciudad` varchar(45) DEFAULT NULL,
  `localidad` varchar(45) DEFAULT NULL,
  `direccionCompleta` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idDireccion`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones`
--

LOCK TABLES `direcciones` WRITE;
/*!40000 ALTER TABLE `direcciones` DISABLE KEYS */;
INSERT INTO `direcciones` VALUES (1,'Barrio 1','Bogotá','Localidad 1','Carrera 1 # 11-20'),(2,'Barrio 2','Bogotá','Localidad 2','Carrera 2 # 12-20'),(3,'Barrio 3','Bogotá','Localidad 3','Carrera 3 # 13-20'),(4,'Barrio 4','Bogotá','Localidad 4','Carrera 4 # 14-20'),(5,'Barrio 5','Bogotá','Localidad 5','Carrera 5 # 15-20'),(6,'Barrio 6','Bogotá','Localidad 6','Carrera 6 # 16-20'),(7,'Barrio 7','Bogotá','Localidad 7','Carrera 7 # 17-20'),(8,'Barrio 8','Bogotá','Localidad 8','Carrera 8 # 18-20'),(9,'Barrio 9','Bogotá','Localidad 9','Carrera 9 # 19-20'),(10,'Barrio 10','Bogotá','Localidad 10','Carrera 10 # 20-20'),(11,'Barrio 11','Bogotá','Localidad 11','Carrera 11 # 21-20'),(12,'Barrio 12','Bogotá','Localidad 12','Carrera 12 # 22-20'),(13,'Barrio 13','Bogotá','Localidad 13','Carrera 13 # 23-20'),(14,'Barrio 14','Bogotá','Localidad 14','Carrera 14 # 24-20'),(15,'Barrio 15','Bogotá','Localidad 15','Carrera 15 # 25-20'),(16,'Barrio 16','Bogotá','Localidad 16','Carrera 16 # 26-20'),(17,'Barrio 17','Bogotá','Localidad 17','Carrera 17 # 27-20'),(18,'Barrio 18','Bogotá','Localidad 18','Carrera 18 # 28-20'),(19,'Barrio 19','Bogotá','Localidad 19','Carrera 19 # 29-20'),(20,'Barrio 20','Bogotá','Localidad 20','Carrera 20 # 30-20'),(21,'Barrio 21','Bogotá','Localidad 1','Carrera 21 # 31-20'),(22,'Barrio 22','Bogotá','Localidad 2','Carrera 22 # 32-20'),(23,'Barrio 23','Bogotá','Localidad 3','Carrera 23 # 33-20'),(24,'Barrio 24','Bogotá','Localidad 4','Carrera 24 # 34-20'),(25,'Barrio 25','Bogotá','Localidad 5','Carrera 25 # 35-20'),(26,'Barrio 26','Bogotá','Localidad 6','Carrera 26 # 36-20'),(27,'Barrio 27','Bogotá','Localidad 7','Carrera 27 # 37-20'),(28,'Barrio 28','Bogotá','Localidad 8','Carrera 28 # 38-20'),(29,'Barrio 29','Bogotá','Localidad 9','Carrera 29 # 39-20'),(30,'Barrio 30','Bogotá','Localidad 10','Carrera 30 # 40-20'),(31,'Barrio 31','Bogotá','Localidad 11','Carrera 31 # 41-20'),(32,'Barrio 32','Bogotá','Localidad 12','Carrera 32 # 42-20'),(33,'Barrio 33','Bogotá','Localidad 13','Carrera 33 # 43-20'),(34,'Barrio 34','Bogotá','Localidad 14','Carrera 34 # 44-20'),(35,'Barrio 35','Bogotá','Localidad 15','Carrera 35 # 45-20'),(36,'Barrio 36','Bogotá','Localidad 16','Carrera 36 # 46-20'),(37,'Barrio 37','Bogotá','Localidad 17','Carrera 37 # 47-20'),(38,'Barrio 38','Bogotá','Localidad 18','Carrera 38 # 48-20'),(39,'Barrio 39','Bogotá','Localidad 19','Carrera 39 # 49-20'),(40,'Barrio 40','Bogotá','Localidad 20','Carrera 40 # 50-20'),(41,'Barrio 41','Bogotá','Localidad 1','Carrera 41 # 51-20'),(42,'Barrio 42','Bogotá','Localidad 2','Carrera 42 # 52-20'),(43,'Barrio 43','Bogotá','Localidad 3','Carrera 43 # 53-20'),(44,'Barrio 44','Bogotá','Localidad 4','Carrera 44 # 54-20'),(45,'Barrio 45','Bogotá','Localidad 5','Carrera 45 # 55-20'),(46,'Barrio 46','Bogotá','Localidad 6','Carrera 46 # 56-20'),(47,'Barrio 47','Bogotá','Localidad 7','Carrera 47 # 57-20'),(48,'Barrio 48','Bogotá','Localidad 8','Carrera 48 # 58-20'),(49,'Barrio 49','Bogotá','Localidad 9','Carrera 49 # 59-20'),(50,'Barrio 50','Bogotá','Localidad 10','Carrera 50 # 60-20');
/*!40000 ALTER TABLE `direcciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garantias`
--

DROP TABLE IF EXISTS `garantias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `garantias` (
  `idGarantia` int(11) NOT NULL AUTO_INCREMENT,
  `fechaInicio` date DEFAULT NULL,
  `fechaFin` date DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `observacion` varchar(45) DEFAULT NULL,
  `detalleventa_idDetalleVenta` int(11) NOT NULL,
  PRIMARY KEY (`idGarantia`),
  KEY `fk_garantia_detalleventa` (`detalleventa_idDetalleVenta`),
  CONSTRAINT `fk_garantia_detalleventa` FOREIGN KEY (`detalleventa_idDetalleVenta`) REFERENCES `detalleventas` (`idDetalleVenta`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garantias`
--

LOCK TABLES `garantias` WRITE;
/*!40000 ALTER TABLE `garantias` DISABLE KEYS */;
INSERT INTO `garantias` VALUES (1,'2026-01-01','2027-01-01','Activa','Garantía de fábrica',1),(2,'2026-01-02','2027-01-02','Activa','Garantía de fábrica',2),(3,'2026-01-03','2027-01-03','Activa','Garantía de fábrica',3),(4,'2026-01-04','2027-01-04','Activa','Garantía de fábrica',4),(5,'2026-01-05','2027-01-05','Activa','Garantía de fábrica',5),(6,'2026-01-06','2027-01-06','Activa','Garantía de fábrica',1),(7,'2026-01-07','2027-01-07','Vencida','Garantía vencida',2),(8,'2026-01-08','2027-01-08','Activa','Garantía de fábrica',3),(9,'2026-01-09','2027-01-09','En reclamación','Producto en revisión',4),(10,'2026-01-10','2027-01-10','Activa','Garantía de fábrica',5),(11,'2026-01-11','2027-01-11','Activa','Garantía de fábrica',6),(12,'2026-01-12','2027-01-12','Vencida','Garantía vencida',7),(13,'2026-01-13','2027-01-13','Activa','Garantía de fábrica',8),(14,'2026-01-14','2027-01-14','En reclamación','Producto en revisión',9),(15,'2026-01-15','2027-01-15','Activa','Garantía de fábrica',10),(16,'2026-01-16','2027-01-16','Activa','Garantía de fábrica',11),(17,'2026-01-17','2027-01-17','Vencida','Garantía vencida',12),(18,'2026-01-18','2027-01-18','Activa','Garantía de fábrica',13),(19,'2026-01-19','2027-01-19','En reclamación','Producto en revisión',14),(20,'2026-01-20','2027-01-20','Activa','Garantía de fábrica',15),(21,'2026-01-21','2027-01-21','Activa','Garantía de fábrica',16),(22,'2026-01-22','2027-01-22','Vencida','Garantía vencida',17),(23,'2026-01-23','2027-01-23','Activa','Garantía de fábrica',18),(24,'2026-01-24','2027-01-24','En reclamación','Producto en revisión',19),(25,'2026-01-25','2027-01-25','Activa','Garantía de fábrica',20),(26,'2026-01-26','2027-01-26','Activa','Garantía de fábrica',21),(27,'2026-01-27','2027-01-27','Vencida','Garantía vencida',22),(28,'2026-01-28','2027-01-28','Activa','Garantía de fábrica',23),(29,'2026-01-29','2027-01-29','En reclamación','Producto en revisión',24),(30,'2026-01-30','2027-01-30','Activa','Garantía de fábrica',25),(31,'2025-01-01','2026-01-01','Vencida','Garantía vencida',26),(32,'2025-01-02','2026-01-02','Vencida','Garantía vencida',27),(33,'2025-01-03','2026-01-03','Vencida','Garantía vencida',28),(34,'2025-01-04','2026-01-04','Vencida','Garantía vencida',29),(35,'2025-01-05','2026-01-05','Vencida','Garantía vencida',30),(36,'2026-02-10','2027-02-10','En reclamación','Producto presentado para revisión',31),(37,'2026-02-11','2027-02-11','En reclamación','Producto presentado para revisión',32),(38,'2026-02-12','2027-02-12','En reclamación','Producto presentado para revisión',33),(39,'2026-02-13','2027-02-13','En reclamación','Producto presentado para revisión',34),(40,'2026-02-14','2027-02-14','En reclamación','Producto presentado para revisión',35),(41,'2026-02-15','2027-02-15','Activa','Garantía de fábrica',36),(42,'2026-02-16','2027-02-16','Activa','Garantía de fábrica',37),(43,'2026-02-17','2027-02-17','Vencida','Garantía vencida',38),(44,'2026-02-18','2027-02-18','En reclamación','Producto en revisión',39),(45,'2026-02-19','2027-02-19','Activa','Garantía de fábrica',40),(46,'2026-02-20','2027-02-20','Activa','Garantía de fábrica',1),(47,'2026-02-21','2027-02-21','En reclamación','Producto en revisión',3),(48,'2026-02-22','2027-02-22','Activa','Garantía de fábrica',5),(49,'2026-02-23','2027-02-23','Vencida','Garantía vencida',10),(50,'2026-02-24','2027-02-24','En reclamación','Producto en revisión',15);
/*!40000 ALTER TABLE `garantias` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 trigger validar_garantia
before insert on garantias
for each row
BEGIN

  IF NOT EXISTS (
        SELECT 1 
        FROM detalleventas 
        WHERE idDetalleVenta = NEW.detalleventa_idDetalleVenta
    ) THEN

        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: El detalle de venta especificado no existe.';
    END IF;

    SET NEW.estado = 'En revisión';
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `inventarios`
--

DROP TABLE IF EXISTS `inventarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventarios` (
  `codInventario` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `stock` int(11) NOT NULL,
  `modelo` varchar(45) DEFAULT NULL,
  `unidadMedida_idUnidadMedida` int(11) NOT NULL,
  `marca_idMarca` int(11) NOT NULL,
  `categoria_idCategoria` int(11) NOT NULL,
  `proveedor_idProveedor` int(11) NOT NULL,
  PRIMARY KEY (`codInventario`),
  KEY `fk_inventario_unidad` (`unidadMedida_idUnidadMedida`),
  KEY `fk_inventario_marca` (`marca_idMarca`),
  KEY `fk_inventario_categoria` (`categoria_idCategoria`),
  KEY `fk_inventario_proveedor` (`proveedor_idProveedor`),
  CONSTRAINT `fk_inventario_categoria` FOREIGN KEY (`categoria_idCategoria`) REFERENCES `categorias` (`idCategoria`),
  CONSTRAINT `fk_inventario_marca` FOREIGN KEY (`marca_idMarca`) REFERENCES `marcas` (`idMarca`),
  CONSTRAINT `fk_inventario_proveedor` FOREIGN KEY (`proveedor_idProveedor`) REFERENCES `proveedores` (`idProveedor`),
  CONSTRAINT `fk_inventario_unidad` FOREIGN KEY (`unidadMedida_idUnidadMedida`) REFERENCES `unidadventas` (`idUnidadVenta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventarios`
--

LOCK TABLES `inventarios` WRITE;
/*!40000 ALTER TABLE `inventarios` DISABLE KEYS */;
INSERT INTO `inventarios` VALUES (1,'Taladro percutor 13mm',525,'TP-750',1,12,5,21),(2,'Esmeril angular 4.5 pulgadas',18,'EA-115',2,7,6,35),(3,'Martillo de acero 16 oz',42,'MA-016',1,19,7,12),(4,'Llave ajustable 10 pulgadas',31,'LA-010',1,4,9,47),(5,'Tubo PVC 1 pulgada',65,'PVC-001',2,15,19,8),(6,'Perfil galvanizado 2 metros',37,'PG-002',2,23,17,29),(7,'Pintura blanca 1 galon',28,'PB-001',5,9,26,44),(8,'Cable electrico calibre 12',80,'CE-012',2,31,22,16),(9,'Disco de corte 4.5 pulgadas',54,'DC-045',1,11,12,38),(10,'Alicate universal 8 pulgadas',26,'AU-008',1,18,8,5),(11,'Taladro inalambrico 20V',14,'TI-020',1,12,5,33),(12,'Esmeril de banco 6 pulgadas',11,'EB-006',1,27,6,14),(13,'Martillo de goma',35,'MG-012',1,6,7,41),(14,'Llave de tubo 12 pulgadas',29,'LT-012',1,22,9,9),(15,'Tubo CPVC 3/4 pulgada',72,'CP-034',2,15,19,26),(16,'Perfil estructural 3 metros',24,'PE-003',2,34,17,18),(17,'Pintura gris 1 galon',33,'PG-002',5,9,26,42),(18,'Cable duplex calibre 14',95,'CD-014',2,31,22,7),(19,'Disco diamantado 4.5 pulgadas',21,'DD-045',1,40,13,31),(20,'Alicate de presion 10 pulgadas',17,'AP-010',1,18,8,23),(21,'Taladro industrial 1/2 pulgada',9,'TD-500',1,45,5,4),(22,'Esmeril angular 7 pulgadas',16,'EA-700',1,7,6,36),(23,'Martillo de carpintero',46,'MC-018',1,19,7,12),(24,'Llave combinada 14mm',38,'LC-014',1,4,9,47),(25,'Tubo PVC 2 pulgadas',58,'PVC-002',2,15,19,8),(26,'Perfil metalico U',43,'PMU-003',2,23,17,29),(27,'Pintura azul 1 galon',19,'PA-001',5,9,26,44),(28,'Cable encauchetado 3x12',67,'CE-312',2,31,22,16),(29,'Disco de pulido 4 pulgadas',36,'DP-004',1,11,13,38),(30,'Alicate cortafrio 7 pulgadas',22,'AC-007',1,18,8,5),(31,'Taladro de impacto 20V',13,'TA-020',1,12,5,33),(32,'Esmeril neumatico',8,'EN-100',1,27,6,14),(33,'Martillo de bola',27,'MB-024',1,6,7,41),(34,'Llave inglesa 15 pulgadas',34,'LI-015',1,22,9,9),(35,'Tubo hidraulico 1 pulgada',61,'TH-001',2,15,19,26),(36,'Perfil rectangular 6 metros',18,'PR-006',2,34,17,18),(37,'Pintura anticorrosiva',25,'PAC-001',5,9,28,42),(38,'Cable THHN calibre 10',76,'CT-010',2,31,22,7),(39,'Disco flap 4.5 pulgadas',30,'DF-045',1,40,13,31),(40,'Alicate diagonal 8 pulgadas',20,'AD-008',1,18,8,23),(41,'Taladro de columna',7,'TC-001',1,45,5,4),(42,'Esmeril angular 9 pulgadas',12,'EA-900',1,7,6,36),(43,'Martillo demoledor',10,'MD-150',1,19,7,12),(44,'Llave hexagonal juego',45,'LH-012',1,4,9,47),(45,'Tubo PVC presion 1/2',88,'PV-012',2,15,19,8),(46,'Perfil angular metalico',52,'PAM-002',2,23,17,29),(47,'Pintura negra mate',23,'PNM-001',5,9,27,44),(48,'Cable de extension 20m',41,'CE-020',2,31,22,16),(49,'Disco de corte metal 7 pulgadas',32,'DC-070',1,11,12,38),(50,'Alicate pelacables',15,'APC-009',1,18,8,5);
/*!40000 ALTER TABLE `inventarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 trigger validar_Stock_Antes_de_insertar
 BEFORE INSERT ON inventarios FOR EACH ROW
BEGIN
IF NEW.stock < 0 THEN
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'La cantidad no se puede registrar';
END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `marcas` (
  `idMarca` int(11) NOT NULL AUTO_INCREMENT,
  `nombreMarca` varchar(45) NOT NULL,
  PRIMARY KEY (`idMarca`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas`
--

LOCK TABLES `marcas` WRITE;
/*!40000 ALTER TABLE `marcas` DISABLE KEYS */;
INSERT INTO `marcas` VALUES (1,'Truper Fachada Moderna'),(2,'Stanley Fachada Colonial'),(3,'DeWalt Fachada Minimalista'),(4,'Bosch Fachada Rustica'),(5,'Makita Fachada Industrial'),(6,'Truper Fachada Clasica'),(7,'Stanley Fachada Contemporanea'),(8,'DeWalt Fachada Victoriana'),(9,'Bosch Fachada Nordica'),(10,'Makita Fachada Mediterranea'),(11,'Truper Fachada Art Deco'),(12,'Stanley Fachada Loft'),(13,'DeWalt Fachada Tradicional'),(14,'Bosch Fachada Campestre'),(15,'Makita Fachada Urbana'),(16,'Truper Fachada Gotica'),(17,'Stanley Fachada Barroca'),(18,'DeWalt Fachada Zen'),(19,'Bosch Fachada Ejecutiva'),(20,'Makita Fachada Minimalista Plus'),(21,'Truper Fachada Colonial Sur'),(22,'Stanley Fachada Contemporanea Pro'),(23,'DeWalt Fachada Industrial Loft'),(24,'Bosch Fachada Rustica Chic'),(25,'Makita Fachada Vanguardista'),(26,'Truper Fachada Opal'),(27,'Stanley Fachada Cristal'),(28,'DeWalt Fachada Piedra'),(29,'Bosch Fachada Madera'),(30,'Makita Fachada Concreto'),(31,'Truper Fachada Modular'),(32,'Stanley Fachada Integral'),(33,'DeWalt Fachada Abierta'),(34,'Bosch Fachada Cerrada'),(35,'Makita Fachada Panoramica'),(36,'Truper Fachada Sostenible'),(37,'Stanley Fachada Bioclimatica'),(38,'DeWalt Fachada Inteligente'),(39,'Bosch Fachada Solar'),(40,'Makita Fachada Ecologica'),(41,'Truper Fachada Premium'),(42,'Stanley Fachada Gold'),(43,'DeWalt Fachada Platinum'),(44,'Bosch Fachada Diamond'),(45,'Makita Fachada Master'),(46,'Truper Fachada Elite'),(47,'Stanley Fachada Supreme'),(48,'DeWalt Fachada Royal'),(49,'Bosch Fachada Imperial'),(50,'Makita Fachada Titan');
/*!40000 ALTER TABLE `marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimientos`
--

DROP TABLE IF EXISTS `movimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `movimientos` (
  `idMovimiento` int(11) NOT NULL AUTO_INCREMENT,
  `fechaMovimiento` date DEFAULT NULL,
  `precioUnitario` float DEFAULT NULL,
  `cantidad` int(11) DEFAULT NULL,
  `subtotal` float DEFAULT NULL,
  `tipoMovimiento` varchar(45) DEFAULT NULL,
  `usuario_identificacion` int(11) NOT NULL,
  `inventario_codInventario` int(11) NOT NULL,
  PRIMARY KEY (`idMovimiento`),
  KEY `fk_movimiento_usuario` (`usuario_identificacion`),
  KEY `fk_movimiento_inventario` (`inventario_codInventario`),
  CONSTRAINT `fk_movimiento_inventario` FOREIGN KEY (`inventario_codInventario`) REFERENCES `inventarios` (`codInventario`),
  CONSTRAINT `fk_movimiento_usuario` FOREIGN KEY (`usuario_identificacion`) REFERENCES `usuarios` (`identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimientos`
--

LOCK TABLES `movimientos` WRITE;
/*!40000 ALTER TABLE `movimientos` DISABLE KEYS */;
INSERT INTO `movimientos` VALUES (1,'2026-01-02',15100,2,30200,'Entrada',1001,1),(2,'2026-01-03',15200,4,60800,'Salida',1002,2),(3,'2026-01-04',15300,3,45900,'Entrada',1003,3),(4,'2026-01-05',15400,5,77000,'Salida',1001,4),(5,'2026-01-06',15500,2,31000,'Entrada',1004,5),(6,'2026-01-07',15600,6,93600,'Salida',1002,6),(7,'2026-01-08',15700,3,47100,'Entrada',1003,7),(8,'2026-01-09',15800,4,63200,'Salida',1001,8),(9,'2026-01-10',15900,2,31800,'Entrada',1004,9),(10,'2026-01-11',16000,5,80000,'Salida',1002,10),(11,'2026-01-12',16100,3,48300,'Entrada',1001,1),(12,'2026-01-13',16200,7,113400,'Salida',1003,2),(13,'2026-01-14',16300,2,32600,'Entrada',1004,3),(14,'2026-01-15',16400,4,65600,'Salida',1002,4),(15,'2026-01-16',16500,6,99000,'Entrada',1001,5),(16,'2026-01-17',16600,3,49800,'Salida',1004,6),(17,'2026-01-18',16700,5,83500,'Entrada',1003,7),(18,'2026-01-19',16800,2,33600,'Salida',1002,8),(19,'2026-01-20',16900,4,67600,'Entrada',1001,9),(20,'2026-01-21',17000,3,51000,'Salida',1004,10),(21,'2026-01-22',17100,5,85500,'Entrada',1002,1),(22,'2026-01-23',17200,2,34400,'Salida',1003,2),(23,'2026-01-24',17300,6,103800,'Entrada',1001,3),(24,'2026-01-25',17400,3,52200,'Salida',1004,4),(25,'2026-01-26',17500,4,70000,'Entrada',1002,5),(26,'2026-01-27',17600,2,35200,'Salida',1003,6),(27,'2026-01-28',17700,7,123900,'Entrada',1001,7),(28,'2026-01-29',17800,3,53400,'Salida',1004,8),(29,'2026-01-30',17900,5,89500,'Entrada',1002,9),(30,'2026-01-31',18000,2,36000,'Salida',1003,10),(31,'2026-02-01',18100,4,72400,'Entrada',1001,1),(32,'2026-02-02',18200,6,109200,'Salida',1002,2),(33,'2026-02-03',18300,3,54900,'Entrada',1004,3),(34,'2026-02-04',18400,5,92000,'Salida',1003,4),(35,'2026-02-05',18500,2,37000,'Entrada',1001,5),(36,'2026-02-06',18600,4,74400,'Salida',1004,6),(37,'2026-02-07',18700,6,112200,'Entrada',1002,7),(38,'2026-02-08',18800,3,56400,'Salida',1003,8),(39,'2026-02-09',18900,5,94500,'Entrada',1001,9),(40,'2026-02-10',19000,2,38000,'Salida',1004,10),(41,'2026-02-11',19100,7,133700,'Entrada',1002,1),(42,'2026-02-12',19200,3,57600,'Salida',1003,2),(43,'2026-02-13',19300,4,77200,'Entrada',1001,3),(44,'2026-02-14',19400,6,116400,'Salida',1004,4),(45,'2026-02-15',19500,2,39000,'Entrada',1002,5),(46,'2026-02-16',19600,5,98000,'Salida',1003,6),(47,'2026-02-17',19700,3,59100,'Entrada',1001,7),(48,'2026-02-18',19800,4,79200,'Salida',1004,8),(49,'2026-02-19',19900,6,119400,'Entrada',1002,9),(50,'2026-02-20',20000,2,40000,'Salida',1003,10),(56,'2026-09-12',100000,300,30000000,'Entrada',1001,1),(58,'2026-09-12',100000,300,30000000,'Entrada',1001,1),(60,'2026-09-12',60000,100,6000000,'Entrada',1001,1);
/*!40000 ALTER TABLE `movimientos` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER validar_movimiento BEFORE INSERT ON movimientos FOR EACH ROW BEGIN
IF NEW.cantidad <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La cantidad del movimiento debe ser mayor a cero.';
    END IF;
    IF NEW.precioUnitario < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El precio unitario no puede ser negativo.';
    END IF;
   IF NEW.tipoMovimiento NOT IN ('Entrada', 'Salida') THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El tipo de movimiento solo permite Entrada o Salida.';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 trigger actualizar_stock_antes_Salida
before insert on movimientos 
for each row
BEGIN
declare stock_actual int;
SELECT stock into stock_actual
from inventario
WHERE codInventario = NEW.inventario_codInventario;
IF stock_actual < NEW.cantidad THEN
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'Error: No hay suficiente stock para realizar la salida.';
ELSE
update inventarios
SET stock= stock - NEW.cantidad
WHERE codInventario = NEW.inventario_codInventario;
END IF;
end */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `actualizar_stock_despues_entrada` AFTER INSERT ON `movimientos` FOR EACH ROW BEGIN
IF NEW.tipoMovimiento = 'Entrada' THEN
        UPDATE inventarios
        SET stock = stock + NEW.cantidad
        WHERE codInventario = NEW.inventario_codInventario;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `proveedores` (
  `idProveedor` int(11) NOT NULL AUTO_INCREMENT,
  `tipoProducto` varchar(45) DEFAULT NULL,
  `usuario_identificacion` int(11) NOT NULL,
  PRIMARY KEY (`idProveedor`),
  KEY `fk_proveedor_usuario` (`usuario_identificacion`),
  CONSTRAINT `fk_proveedor_usuario` FOREIGN KEY (`usuario_identificacion`) REFERENCES `usuarios` (`identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'Cemento y agregados',1051),(2,'Herramientas manuales',1052),(3,'Herramientas electricas',1053),(4,'Pinturas',1054),(5,'Tornilleria',1055),(6,'Perfiles metalicos',1056),(7,'Tuberias PVC',1057),(8,'Material electrico',1058),(9,'Elementos de seguridad',1059),(10,'Abrasivos',1060),(11,'Pegantes y adhesivos',1061),(12,'Siliconas',1062),(13,'Lijas',1063),(14,'Brocas',1064),(15,'Discos de corte',1065),(16,'Discos de pulido',1066),(17,'Alambres',1067),(18,'Mallas metalicas',1068),(19,'Angulos metalicos',1069),(20,'Platinas metalicas',1070),(21,'Canales metalicos',1071),(22,'Tejas',1072),(23,'Impermeabilizantes',1073),(24,'Yeso y estuco',1074),(25,'Cal y cemento',1075),(26,'Arena y grava',1076),(27,'Ladrillos',1077),(28,'Bloques',1078),(29,'Madera',1079),(30,'Material de plomeria',1080),(31,'Llaves y griferia',1081),(32,'Valvulas',1082),(33,'Cables electricos',1083),(34,'Interruptores',1084),(35,'Tomacorrientes',1085),(36,'Bombillos',1086),(37,'Linternas',1087),(38,'Guantes de trabajo',1088),(39,'Cascos de seguridad',1089),(40,'Gafas de seguridad',1090),(41,'Protectores auditivos',1091),(42,'Botas de seguridad',1092),(43,'Cintas metricas',1093),(44,'Niveles y flexometros',1094),(45,'Destornilladores',1095),(46,'Llaves y alicates',1096),(47,'Martillos',1097),(48,'Serruchos',1098),(49,'Cuchillas',1099),(50,'Equipos de soldadura',1100),(51,'1',10101235);
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER evitarEliminarProveedor
BEFORE DELETE ON proveedores
FOR EACH ROW
BEGIN

    DECLARE cantidadMovimientos INT;

    -- Buscar cuántos movimientos tiene el proveedor
    SELECT COUNT(*)
    INTO cantidadMovimientos
    FROM movimientos m
    INNER JOIN inventarios i
        ON m.inventario_codInventario = i.codInventario
    WHERE i.proveedor_idProveedor = OLD.idProveedor;

    -- Si tiene movimientos, no permitir eliminarlo
    IF cantidadMovimientos > 0 THEN

        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No se puede eliminar el proveedor porque tiene movimientos registrados';

    END IF;

END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `idRol` int(11) NOT NULL AUTO_INCREMENT,
  `nombreRol` varchar(45) NOT NULL,
  PRIMARY KEY (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Cliente'),(2,'Proveedor'),(3,'Jefe'),(4,'Empleado');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unidadventas`
--

DROP TABLE IF EXISTS `unidadventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `unidadventas` (
  `idUnidadVenta` int(11) NOT NULL AUTO_INCREMENT,
  `nombreUnidadMedida` varchar(45) NOT NULL,
  PRIMARY KEY (`idUnidadVenta`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidadventas`
--

LOCK TABLES `unidadventas` WRITE;
/*!40000 ALTER TABLE `unidadventas` DISABLE KEYS */;
INSERT INTO `unidadventas` VALUES (1,'Unidad'),(2,'Metro'),(5,'Galón'),(6,'Kilogramo'),(7,'Caja'),(8,'Litro'),(9,'Rollo'),(10,'Paquete'),(11,'Bolsa'),(12,'Par');
/*!40000 ALTER TABLE `unidadventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `identificacion` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(45) NOT NULL,
  `apellidos` varchar(45) NOT NULL,
  `correoElectronico` varchar(45) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contrasena` char(64) NOT NULL,
  `rol_idRol` int(11) NOT NULL,
  `direccion_idDireccion` int(11) NOT NULL,
  PRIMARY KEY (`identificacion`),
  KEY `fk_usuario_rol` (`rol_idRol`),
  KEY `fk_usuario_direccion` (`direccion_idDireccion`),
  CONSTRAINT `fk_usuario_direccion` FOREIGN KEY (`direccion_idDireccion`) REFERENCES `direcciones` (`idDireccion`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_idRol`) REFERENCES `roles` (`idRol`)
) ENGINE=InnoDB AUTO_INCREMENT=10101236 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1001,'Carlos','Pérez Gómez','carlos1@solmet.com','3001000001','Clave001',1,1),(1002,'Laura','Rodríguez Martínez','laura2@solmet.com','3001000002','Clave002',1,2),(1003,'Andrés','López Ruiz','andres3@solmet.com','3001000003','Clave003',1,3),(1004,'María','García Torres','maria4@solmet.com','3001000004','Clave004',1,4),(1005,'Juan','Hernández Ramírez','juan5@solmet.com','3001000005','Clave005',1,5),(1006,'Sofía','Castro Moreno','sofia6@solmet.com','3001000006','Clave006',1,6),(1007,'Pedro','Vargas Rojas','pedro7@solmet.com','3001000007','Clave007',1,7),(1008,'Valentina','Díaz Mendoza','valentina8@solmet.com','3001000008','Clave008',1,8),(1009,'Diego','Sánchez Cárdenas','diego9@solmet.com','3001000009','Clave009',1,9),(1010,'Camila','Torres Navarro','camila10@solmet.com','3001000010','Clave010',1,10),(1011,'Luis','Pérez Gómez','luis11@solmet.com','3001000011','Clave011',1,11),(1012,'Daniela','Rodríguez Martínez','daniela12@solmet.com','3001000012','Clave012',1,12),(1013,'Jorge','López Ruiz','jorge13@solmet.com','3001000013','Clave013',1,13),(1014,'Natalia','García Torres','natalia14@solmet.com','3001000014','Clave014',1,14),(1015,'Sebastián','Hernández Ramírez','sebastian15@solmet.com','3001000015','Clave015',1,15),(1016,'Paula','Castro Moreno','paula16@solmet.com','3001000016','Clave016',1,16),(1017,'Ricardo','Vargas Rojas','ricardo17@solmet.com','3001000017','Clave017',1,17),(1018,'Alejandra','Díaz Mendoza','alejandra18@solmet.com','3001000018','Clave018',1,18),(1019,'Felipe','Sánchez Cárdenas','felipe19@solmet.com','3001000019','Clave019',1,19),(1020,'Diana','Torres Navarro','diana20@solmet.com','3001000020','Clave020',1,20),(1021,'Mauricio','Pérez Gómez','mauricio21@solmet.com','3001000021','Clave021',1,21),(1022,'Juliana','Rodríguez Martínez','juliana22@solmet.com','3001000022','Clave022',1,22),(1023,'Óscar','López Ruiz','oscar23@solmet.com','3001000023','Clave023',1,23),(1024,'Carolina','García Torres','carolina24@solmet.com','3001000024','Clave024',1,24),(1025,'Santiago','Hernández Ramírez','santiago25@solmet.com','3001000025','Clave025',1,25),(1026,'Manuela','Castro Moreno','manuela26@solmet.com','3001000026','Clave026',1,26),(1027,'Héctor','Vargas Rojas','hector27@solmet.com','3001000027','Clave027',1,27),(1028,'Gabriela','Díaz Mendoza','gabriela28@solmet.com','3001000028','Clave028',1,28),(1029,'Esteban','Sánchez Cárdenas','esteban29@solmet.com','3001000029','Clave029',1,29),(1030,'Sara','Torres Navarro','sara30@solmet.com','3001000030','Clave030',1,30),(1031,'Wilson','Pérez Gómez','wilson31@solmet.com','3001000031','Clave031',1,31),(1032,'Tatiana','Rodríguez Martínez','tatiana32@solmet.com','3001000032','Clave032',1,32),(1033,'Nicolás','López Ruiz','nicolas33@solmet.com','3001000033','Clave033',1,33),(1034,'Luisa','García Torres','luisa34@solmet.com','3001000034','Clave034',1,34),(1035,'Cristian','Hernández Ramírez','cristian35@solmet.com','3001000035','Clave035',1,35),(1036,'Mónica','Castro Moreno','monica36@solmet.com','3001000036','Clave036',1,36),(1037,'David','Vargas Rojas','david37@solmet.com','3001000037','Clave037',1,37),(1038,'Adriana','Díaz Mendoza','adriana38@solmet.com','3001000038','Clave038',1,38),(1039,'Miguel','Sánchez Cárdenas','miguel39@solmet.com','3001000039','Clave039',1,39),(1040,'Karen','Torres Navarro','karen40@solmet.com','3001000040','Clave040',1,40),(1041,'Jhon','Pérez Gómez','jhon41@solmet.com','3001000041','Clave041',1,41),(1042,'Lorena','Rodríguez Martínez','lorena42@solmet.com','3001000042','Clave042',1,42),(1043,'Fernando','López Ruiz','fernando43@solmet.com','3001000043','Clave043',1,43),(1044,'Andrea','García Torres','andrea44@solmet.com','3001000044','Clave044',1,44),(1045,'Samuel','Hernández Ramírez','samuel45@solmet.com','3001000045','Clave045',1,45),(1046,'Claudia','Castro Moreno','claudia46@solmet.com','3001000046','Clave046',1,46),(1047,'Álvaro','Vargas Rojas','alvaro47@solmet.com','3001000047','Clave047',1,47),(1048,'Viviana','Díaz Mendoza','viviana48@solmet.com','3001000048','Clave048',1,48),(1049,'Mateo','Sánchez Cárdenas','mateo49@solmet.com','3001000049','Clave049',1,49),(1050,'Patricia','Torres Navarro','patricia50@solmet.com','3001000050','Clave050',1,50),(1051,'Carlos','Pérez Gómez','carlos51@solmet.com','3001000051','Clave051',2,1),(1052,'Laura','Rodríguez Martínez','laura52@solmet.com','3001000052','Clave052',2,2),(1053,'Andrés','López Ruiz','andres53@solmet.com','3001000053','Clave053',2,3),(1054,'María','García Torres','maria54@solmet.com','3001000054','Clave054',2,4),(1055,'Juan','Hernández Ramírez','juan55@solmet.com','3001000055','Clave055',2,5),(1056,'Sofía','Castro Moreno','sofia56@solmet.com','3001000056','Clave056',2,6),(1057,'Pedro','Vargas Rojas','pedro57@solmet.com','3001000057','Clave057',2,7),(1058,'Valentina','Díaz Mendoza','valentina58@solmet.com','3001000058','Clave058',2,8),(1059,'Diego','Sánchez Cárdenas','diego59@solmet.com','3001000059','Clave059',2,9),(1060,'Camila','Torres Navarro','camila60@solmet.com','3001000060','Clave060',2,10),(1061,'Luis','Pérez Gómez','luis61@solmet.com','3001000061','Clave061',2,11),(1062,'Daniela','Rodríguez Martínez','daniela62@solmet.com','3001000062','Clave062',2,12),(1063,'Jorge','López Ruiz','jorge63@solmet.com','3001000063','Clave063',2,13),(1064,'Natalia','García Torres','natalia64@solmet.com','3001000064','Clave064',2,14),(1065,'Sebastián','Hernández Ramírez','sebastian65@solmet.com','3001000065','Clave065',2,15),(1066,'Paula','Castro Moreno','paula66@solmet.com','3001000066','Clave066',2,16),(1067,'Ricardo','Vargas Rojas','ricardo67@solmet.com','3001000067','Clave067',2,17),(1068,'Alejandra','Díaz Mendoza','alejandra68@solmet.com','3001000068','Clave068',2,18),(1069,'Felipe','Sánchez Cárdenas','felipe69@solmet.com','3001000069','Clave069',2,19),(1070,'Diana','Torres Navarro','diana70@solmet.com','3001000070','Clave070',2,20),(1071,'Mauricio','Pérez Gómez','mauricio71@solmet.com','3001000071','Clave071',2,21),(1072,'Juliana','Rodríguez Martínez','juliana72@solmet.com','3001000072','Clave072',2,22),(1073,'Óscar','López Ruiz','oscar73@solmet.com','3001000073','Clave073',2,23),(1074,'Carolina','García Torres','carolina74@solmet.com','3001000074','Clave074',2,24),(1075,'Santiago','Hernández Ramírez','santiago75@solmet.com','3001000075','Clave075',2,25),(1076,'Manuela','Castro Moreno','manuela76@solmet.com','3001000076','Clave076',2,26),(1077,'Héctor','Vargas Rojas','hector77@solmet.com','3001000077','Clave077',2,27),(1078,'Gabriela','Díaz Mendoza','gabriela78@solmet.com','3001000078','Clave078',2,28),(1079,'Esteban','Sánchez Cárdenas','esteban79@solmet.com','3001000079','Clave079',2,29),(1080,'Sara','Torres Navarro','sara80@solmet.com','3001000080','Clave080',2,30),(1081,'Wilson','Pérez Gómez','wilson81@solmet.com','3001000081','Clave081',2,31),(1082,'Tatiana','Rodríguez Martínez','tatiana82@solmet.com','3001000082','Clave082',2,32),(1083,'Nicolás','López Ruiz','nicolas83@solmet.com','3001000083','Clave083',2,33),(1084,'Luisa','García Torres','luisa84@solmet.com','3001000084','Clave084',2,34),(1085,'Cristian','Hernández Ramírez','cristian85@solmet.com','3001000085','Clave085',2,35),(1086,'Mónica','Castro Moreno','monica86@solmet.com','3001000086','Clave086',2,36),(1087,'David','Vargas Rojas','david87@solmet.com','3001000087','Clave087',2,37),(1088,'Adriana','Díaz Mendoza','adriana88@solmet.com','3001000088','Clave088',2,38),(1089,'Miguel','Sánchez Cárdenas','miguel89@solmet.com','3001000089','Clave089',2,39),(1090,'Karen','Torres Navarro','karen90@solmet.com','3001000090','Clave090',2,40),(1091,'Jhon','Pérez Gómez','jhon91@solmet.com','3001000091','Clave091',2,41),(1092,'Lorena','Rodríguez Martínez','lorena92@solmet.com','3001000092','Clave092',2,42),(1093,'Fernando','López Ruiz','fernando93@solmet.com','3001000093','Clave093',2,43),(1094,'Andrea','García Torres','andrea94@solmet.com','3001000094','Clave094',2,44),(1095,'Samuel','Hernández Ramírez','samuel95@solmet.com','3001000095','Clave095',2,45),(1096,'Claudia','Castro Moreno','claudia96@solmet.com','3001000096','Clave096',2,46),(1097,'Álvaro','Vargas Rojas','alvaro97@solmet.com','3001000097','Clave097',2,47),(1098,'Viviana','Díaz Mendoza','viviana98@solmet.com','3001000098','Clave098',2,48),(1099,'Mateo','Sánchez Cárdenas','mateo99@solmet.com','3001000099','Clave099',2,49),(1100,'Patricia','Torres Navarro','patricia100@solmet.com','3001000100','Clave100',2,50),(1101,'Roberto','Martínez Silva','roberto1101@solmet.com','3001010101','Clave101',4,49),(1102,'Patricia','Torres Navarro','patricia1102@solmet.com','3001010102','Clave102',3,50),(10101234,'Carlos','Gómez','carlos@mail.com','3001234567','c29fd9aadb3ca3610af4c20fd0056de452048fce6d7ac82ba91146ea8e9b70e2',1,1),(10101235,'luisa','Morales','mor@gmail.com','31731383','3295e484ca99298deaa3081049922c4d2eefcdf9f7e9cd16c469504075485062',1,8888);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ventas` (
  `idVenta` int(11) NOT NULL AUTO_INCREMENT,
  `descuento` float DEFAULT NULL,
  `fechaVenta` date DEFAULT NULL,
  `estado` varchar(45) DEFAULT NULL,
  `totalVenta` float DEFAULT NULL,
  `comprobantePago` varchar(45) DEFAULT NULL,
  `metodoPago` varchar(45) DEFAULT NULL,
  `cliente_idCliente` int(11) NOT NULL,
  PRIMARY KEY (`idVenta`),
  KEY `fk_venta_cliente` (`cliente_idCliente`),
  CONSTRAINT `fk_venta_cliente` FOREIGN KEY (`cliente_idCliente`) REFERENCES `clientes` (`idCliente`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (1,0,'2026-01-03','Pagada',85000,'CP-0001','Efectivo',7),(2,5,'2026-01-04','Pendiente',126350,'CP-0002','Tarjeta',2),(3,0,'2026-01-05','Pagada',47200,'CP-0003','Transferencia',18),(4,10,'2026-01-06','Cancelada',198000,'CP-0004','Tarjeta',35),(5,0,'2026-01-08','Pagada',63500,'CP-0005','Efectivo',11),(6,5,'2026-01-09','Pendiente',142500,'CP-0006','Transferencia',42),(7,0,'2026-01-10','Pagada',91400,'CP-0007','Tarjeta',4),(8,15,'2026-01-12','Pagada',176800,'CP-0008','Tarjeta',26),(9,0,'2026-01-13','Cancelada',52800,'CP-0009','Efectivo',19),(10,5,'2026-01-14','Pagada',109250,'CP-0010','Transferencia',31),(11,0,'2026-01-16','Pendiente',76000,'CP-0011','Tarjeta',8),(12,10,'2026-01-17','Pagada',234000,'CP-0012','Efectivo',45),(13,0,'2026-01-18','Pagada',68400,'CP-0013','Transferencia',13),(14,5,'2026-01-20','Cancelada',157700,'CP-0014','Tarjeta',22),(15,0,'2026-01-21','Pagada',43900,'CP-0015','Efectivo',3),(16,10,'2026-01-22','Pendiente',286500,'CP-0016','Transferencia',37),(17,0,'2026-01-24','Pagada',118000,'CP-0017','Tarjeta',16),(18,5,'2026-01-25','Pagada',93500,'CP-0018','Efectivo',29),(19,0,'2026-01-26','Cancelada',205300,'CP-0019','Tarjeta',48),(20,15,'2026-01-28','Pagada',149600,'CP-0020','Transferencia',6),(21,0,'2026-01-29','Pendiente',57200,'CP-0021','Efectivo',24),(22,5,'2026-01-30','Pagada',132800,'CP-0022','Tarjeta',40),(23,0,'2026-02-01','Pagada',88500,'CP-0023','Transferencia',9),(24,10,'2026-02-02','Cancelada',321000,'CP-0024','Tarjeta',33),(25,0,'2026-02-03','Pagada',46700,'CP-0025','Efectivo',15),(26,5,'2026-02-05','Pendiente',173250,'CP-0026','Transferencia',50),(27,0,'2026-02-06','Pagada',101800,'CP-0027','Tarjeta',21),(28,15,'2026-02-07','Pagada',214600,'CP-0028','Efectivo',5),(29,0,'2026-02-09','Cancelada',73500,'CP-0029','Transferencia',32),(30,5,'2026-02-10','Pagada',156400,'CP-0030','Tarjeta',12),(31,0,'2026-02-11','Pendiente',62800,'CP-0031','Efectivo',27),(32,10,'2026-02-13','Pagada',298500,'CP-0032','Transferencia',44),(33,0,'2026-02-14','Cancelada',84500,'CP-0033','Tarjeta',10),(34,5,'2026-02-15','Pagada',119700,'CP-0034','Efectivo',38),(35,0,'2026-02-17','Pagada',192300,'CP-0035','Transferencia',17),(36,15,'2026-02-18','Pendiente',267800,'CP-0036','Tarjeta',46),(37,0,'2026-02-19','Pagada',55400,'CP-0037','Efectivo',1),(38,5,'2026-02-21','Cancelada',143900,'CP-0038','Transferencia',34),(39,0,'2026-02-22','Pagada',96700,'CP-0039','Tarjeta',23),(40,10,'2026-02-23','Pendiente',225000,'CP-0040','Efectivo',41),(41,0,'2026-02-24','Pagada',68900,'CP-0041','Transferencia',14),(42,5,'2026-02-25','Cancelada',187600,'CP-0042','Tarjeta',30),(43,0,'2026-02-26','Pagada',112500,'CP-0043','Efectivo',7),(44,15,'2026-02-27','Pendiente',305400,'CP-0044','Transferencia',25),(45,0,'2026-02-28','Pagada',79500,'CP-0045','Tarjeta',49),(46,5,'2026-03-01','Cancelada',164800,'CP-0046','Efectivo',20),(47,0,'2026-03-02','Pagada',93400,'CP-0047','Transferencia',36),(48,10,'2026-03-04','Pendiente',248700,'CP-0048','Tarjeta',3),(49,0,'2026-03-05','Pagada',58700,'CP-0049','Efectivo',28),(50,5,'2026-03-06','Cancelada',136500,'CP-0050','Transferencia',43);
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'kronosv2'
--

--
-- Dumping routines for database 'kronosv2'
--
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `CalcularSubtotalDetalle` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `CalcularSubtotalDetalle`(id_detalle INT) RETURNS float
    DETERMINISTIC
BEGIN
    DECLARE subtotal_calculado FLOAT DEFAULT 0;

    SELECT (cantidad * precioUnitario) INTO subtotal_calculado
    FROM detalleventas
    WHERE idDetalleVenta = id_detalle;

    RETURN subtotal_calculado;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `Calcular_valor_total_inventario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `Calcular_valor_total_inventario`(p_codInventario INT
) RETURNS decimal(12,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_stock INT DEFAULT 0;
    DECLARE v_ultimoPrecio DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_valorTotal DECIMAL(12,2) DEFAULT 0.00;

    SELECT COALESCE(stock, 0) INTO v_stock
    FROM inventarios
    WHERE codInventario = p_codInventario;

    SELECT COALESCE(precioUnitario, 0.00) INTO v_ultimoPrecio
    FROM movimientos
    WHERE inventario_codInventario = p_codInventario
    ORDER BY idMovimiento DESC
    LIMIT 1;

    SET v_valorTotal = v_stock * v_ultimoPrecio;
    RETURN v_valorTotal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_calcular_valor_total_inventario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_calcular_valor_total_inventario`(p_codInventario INT
) RETURNS decimal(12,2)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_stock INT DEFAULT 0;
    DECLARE v_ultimoPrecio DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_valorTotal DECIMAL(12,2) DEFAULT 0.00;

    SELECT COALESCE(stock, 0) INTO v_stock
    FROM inventarios
    WHERE codInventario = p_codInventario;

    SELECT COALESCE(precioUnitario, 0.00) INTO v_ultimoPrecio
    FROM movimientos
    WHERE inventario_codInventario = p_codInventario
    ORDER BY idMovimiento DESC
    LIMIT 1;

    SET v_valorTotal = v_stock * v_ultimoPrecio;
    RETURN v_valorTotal;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `fn_obtener_stock_producto` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `fn_obtener_stock_producto`(p_codInventario INT
) RETURNS int(11)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_stock INT DEFAULT 0;

    SELECT COALESCE(stock, 0) INTO v_stock
    FROM inventarios
    WHERE codInventario = p_codInventario;

    RETURN v_stock;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
/*!50003 DROP FUNCTION IF EXISTS `generarHash` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `generarHash`(passwordT VARCHAR(100)
) RETURNS char(64) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN
    DECLARE nuevoSalt VARCHAR(32);
    DECLARE hashG CHAR(64);

    -- Generar un salt diferente
    SET nuevoSalt = MD5(RAND());

    SET hashG = SHA2(CONCAT(passwordT, nuevoSalt), 256);

    RETURN hashG;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `ObtenerEstadoInv` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `ObtenerEstadoInv`(new_stock INT) RETURNS varchar(15) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    DETERMINISTIC
BEGIN declare clasificacion varchar(20); 
IF new_stock = 0 THEN 
SET clasificacion = "Agotado"; 
elseif new_stock BETWEEN 1 AND 10 THEN 
SET clasificacion = "Bajo"; elseif new_stock > 10 THEN 
SET clasificacion = "Disponible"; 
END IF; 
RETURN clasificacion; 
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP FUNCTION IF EXISTS `Obtener_stock_producto` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `Obtener_stock_producto`(p_codInventario INT
) RETURNS int(11)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    DECLARE v_stock INT DEFAULT 0;

    SELECT COALESCE(stock, 0) INTO v_stock
    FROM inventarios
    WHERE codInventario = p_codInventario;

    RETURN v_stock;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `AgregarProductoDetalle` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `AgregarProductoDetalle`(
    IN id_venta INT,
    IN cod_inventario INT,
    IN cantidad_solicitada INT
)
BEGIN
    DECLARE precio_prod FLOAT DEFAULT 0;
    DECLARE stock_actual INT DEFAULT 0;
    DECLARE subtotal_calculado FLOAT DEFAULT 0;

    SELECT i.stock, m.precioUnitario INTO stock_actual, precio_prod
    FROM inventarios i
    INNER JOIN movimientos m ON i.codInventario = m.inventario_codInventario
    WHERE i.codInventario = cod_inventario
    LIMIT 1;

    IF precio_prod IS NULL OR precio_prod = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: No se encontró el precio del producto en los movimientos.';
    
    ELSEIF stock_actual < cantidad_solicitada THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Error: Stock insuficiente para realizar la venta.';
        
    ELSE
        SET subtotal_calculado = CalcularSubtotal(cantidad_solicitada, precio_prod);

        INSERT INTO detalleventas (subTotal, cantidad, precioUnitario, venta_idVenta, inventario_codInventario) 
        VALUES (subtotal_calculado, cantidad_solicitada, precio_prod, id_venta, cod_inventario);
    END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RegistrarEntrada` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarEntrada`(
    IN p_codInventario INT,
    IN p_idProveedor INT,
    IN p_cantidad INT,
    IN p_precioUnitario FLOAT,
    IN p_usuario INT
)
BEGIN

    -- Registrar la entrada en movimientos
    INSERT INTO movimientos (
        fechaMovimiento,
        precioUnitario,
        cantidad,
        subtotal,
        tipoMovimiento,
        usuario_identificacion,
        inventario_codInventario
    )
    VALUES (
        CURDATE(),
        p_precioUnitario,
        p_cantidad,
        p_cantidad * p_precioUnitario,
        'Entrada',
        p_usuario,
        p_codInventario
    );

    -- Aumentar la cantidad disponible del inventario
    UPDATE inventarios
    SET stock = stock + p_cantidad
    WHERE codInventario = p_codInventario;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RegistrarGarantia` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarGarantia`(
    IN id_detalle INT,
    IN observacion_garantia VARCHAR(45))
BEGIN

    INSERT INTO garantias (fechaInicio, fechaFin, estado, observacion, detalleventa_idDetalleVenta)
    
    VALUES (CURDATE(), NULL, 'Activa', observacion_garantia, id_detalle);

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RegistrarSalida` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarSalida`(IN codInv INT, IN UsuarioId INT, IN cantidadI INT, IN precioU DOUBLE)
BEGIN
declare stock_actual int;
SELECT stock into stock_actual
FROM inventarios
WHERE codInventario = codInv;
IF cantidadI > stock_actual THEN
SIGNAL SQLSTATE '45000'
SET MESSAGE_TEXT = 'La cantidad excede el stock actual';
else
UPDATE inventarios 
SET stock = stock - cantidadI
WHERE codInventario = codInv;
end if;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `registrarUsuario` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `registrarUsuario`(
    IN p_nombre VARCHAR(45),
    IN p_apellidos VARCHAR(45),
    IN p_correo VARCHAR(45),
    IN p_telefono VARCHAR(20),
    IN p_contrasena VARCHAR(100),
    IN p_rol_idRol INT,
    IN p_direccion_idDireccion INT,
    IN p_carritoActivo TINYINT(1),
    IN p_tipoProducto VARCHAR(45)
)
BEGIN

    DECLARE nuevoUsuario INT;

    -- Registrar el usuario padre
    INSERT INTO usuarios (
        nombre,
        apellidos,
        correoElectronico,
        telefono,
        contrasena,
        rol_idRol,
        direccion_idDireccion
    )
    VALUES (
        p_nombre,
        p_apellidos,
        p_correo,
        p_telefono,
        generarHash(p_contrasena),
        p_rol_idRol,
        p_direccion_idDireccion
    );

    -- Obtener la identificación generada automáticamente
    SET nuevoUsuario = LAST_INSERT_ID();

    -- Crear cliente si corresponde
    IF p_carritoActivo IS NOT NULL THEN

        INSERT INTO clientes (
            carritoActivo,
            usuario_identificacion
        )
        VALUES (
            p_carritoActivo,
            nuevoUsuario
        );

    END IF;

    -- Crear proveedor si corresponde
    IF p_tipoProducto IS NOT NULL THEN

        INSERT INTO proveedores (
            tipoProducto,
            usuario_identificacion
        )
        VALUES (
            p_tipoProducto,
            nuevoUsuario
        );

    END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ZERO_IN_DATE,NO_ZERO_DATE,NO_ENGINE_SUBSTITUTION' */ ;
/*!50003 DROP PROCEDURE IF EXISTS `RegistrarVenta` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `RegistrarVenta`(
    IN cod_cli INT,
    IN descuentoVenta float,
    IN metPago varchar(45)
)
BEGIN

    INSERT INTO ventas (
        cliente_idCliente, fechaVenta, estado, descuento, totalVenta, comprobantePago, metodoPago)
        
    VALUES (cod_cli, CURDATE(),'Pendiente', descuentoVenta, 0, Null, metPago);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-20 23:48:28
