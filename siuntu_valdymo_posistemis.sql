-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2026 at 06:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `siuntu_valdymo_posistemis`
--

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id_Category` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id_Category`, `name`) VALUES
(1, 'Paslaugos'),
(2, 'Prekės'),
(3, 'Ilgalaikis turtas');

-- --------------------------------------------------------

--
-- Table structure for table `client_company`
--

CREATE TABLE `client_company` (
  `fk_Clientid_Users` int(11) NOT NULL,
  `fk_Companyid_Company` int(11) NOT NULL,
  `externalClientId` int(11) DEFAULT NULL,
  `deliveryAddress` varchar(255) DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `vat` varchar(255) DEFAULT NULL,
  `bankCode` int(5) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `client_company`
--

INSERT INTO `client_company` (`fk_Clientid_Users`, `fk_Companyid_Company`, `externalClientId`, `deliveryAddress`, `city`, `country`, `vat`, `bankCode`, `createdAt`) VALUES
(2, 1, NULL, 'Studentu g 2A', 'kaunas', 'Lietuva', '1234', 7335, '2026-03-09 12:59:27'),
(3, 1, 1, 'Klientas Nr. 1 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488846005245', 73000, '2026-03-09 13:07:49'),
(4, 1, 2, '', '', '', '', NULL, '2026-03-09 13:07:49'),
(5, 1, 3, '', '', '', '', 73000, '2026-03-09 13:07:49'),
(6, 1, 4, '', '', '', '', NULL, '2026-03-09 13:07:49'),
(7, 1, 5, '', '', '', '', NULL, '2026-03-09 13:07:49'),
(8, 1, 6, 'Klientas Nr. 6 adresas', 'Kauno raj.', 'Lietuvos Respublika', 'LT488846005245', NULL, '2026-03-09 13:07:49'),
(9, 1, 7, 'Klientas Nr. 7 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT343461241', NULL, '2026-03-09 13:07:49'),
(10, 1, 8, 'Klientas Nr. 8 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT385127646', NULL, '2026-03-09 13:07:49'),
(11, 1, 9, 'Klientas Nr. 9 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT212956347', NULL, '2026-03-09 13:07:49'),
(12, 1, 10, NULL, 'Kaunas', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(13, 1, 11, 'Klientas Nr. 11 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488846670', NULL, '2026-03-09 13:07:49'),
(14, 1, 12, 'Klientas Nr. 12 adresas', 'Marijampolė', 'Lietuvos Respublika', 'LT644285044', NULL, '2026-03-09 13:07:49'),
(15, 1, 13, 'Klientas Nr. 13 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488888057443', NULL, '2026-03-09 13:07:49'),
(16, 1, 14, '', 'Kaunas', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(17, 1, 15, '', 'Kaunas', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(18, 1, 16, '', 'Vilnius', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(19, 1, 17, '', 'Vilnius', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(20, 1, 18, 'Klientas Nr. 18 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488846618943', NULL, '2026-03-09 13:07:49'),
(21, 1, 19, '', 'Kaunas', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(22, 1, 20, '', 'Šiauliai', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(23, 1, 21, '', '', '', '', NULL, '2026-03-09 13:07:49'),
(24, 1, 22, 'Klientas Nr. 22 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488841584042', NULL, '2026-03-09 13:07:49'),
(25, 1, 23, 'Klientas Nr. 23 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488848005140', NULL, '2026-03-09 13:07:49'),
(26, 1, 24, 'Klientas Nr. 24 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488880428445', NULL, '2026-03-09 13:07:49'),
(27, 1, 25, 'Klientas Nr. 25 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488844332640', NULL, '2026-03-09 13:07:49'),
(28, 1, 26, 'Klientas Nr. 26 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488884617842', NULL, '2026-03-09 13:07:49'),
(29, 1, 27, 'Klientas Nr. 27 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT488841103845', NULL, '2026-03-09 13:07:49'),
(30, 1, 28, 'Klientas Nr. 28 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT488886452944', NULL, '2026-03-09 13:07:49'),
(31, 1, 29, 'Klientas Nr. 29 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488886356745', NULL, '2026-03-09 13:07:49'),
(32, 1, 30, 'Klientas Nr. 30 adresas', 'Biržai', 'Lietuvos Respublika', 'LT488886025843', NULL, '2026-03-09 13:07:49'),
(33, 1, 31, 'Klientas Nr. 31 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488844447545', NULL, '2026-03-09 13:07:49'),
(34, 1, 32, 'Klientas Nr. 32 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(35, 1, 33, 'Klientas Nr. 33 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT488884078445', NULL, '2026-03-09 13:07:49'),
(36, 1, 34, 'Klientas Nr. 34 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(37, 1, 35, 'Klientas Nr. 35 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT314483147', NULL, '2026-03-09 13:07:49'),
(38, 1, 36, 'Klientas Nr. 36 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488844937247', NULL, '2026-03-09 13:07:49'),
(39, 1, 37, 'Klientas Nr. 37 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT488887031848', NULL, '2026-03-09 13:07:49'),
(40, 1, 38, 'Klientas Nr. 38 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT488887457741', NULL, '2026-03-09 13:07:49'),
(41, 1, 39, 'Klientas Nr. 39 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488844352541', NULL, '2026-03-09 13:07:49'),
(42, 1, 40, 'Klientas Nr. 40 adresas', 'Kaišiadorys', 'Lietuvos Respublika', 'LT600217442', NULL, '2026-03-09 13:07:49'),
(43, 1, 41, 'Klientas Nr. 41 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT229576241', NULL, '2026-03-09 13:07:49'),
(44, 1, 42, '', 'Vilnius', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(45, 1, 43, '', 'Kaunas', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(46, 1, 44, 'Klientas Nr. 44 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488843642049', NULL, '2026-03-09 13:07:49'),
(47, 1, 45, 'Klientas Nr. 45 adresas', 'Raseiniai', 'Lietuvos Respublika', 'LT488846850', NULL, '2026-03-09 13:07:49'),
(48, 1, 46, 'Klientas Nr. 46 adresas', '', 'Maltos Respublika', '', NULL, '2026-03-09 13:07:49'),
(49, 1, 47, 'Klientas Nr. 47 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488846708242', NULL, '2026-03-09 13:07:49'),
(50, 1, 48, 'Klientas Nr. 48 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT488848003842', NULL, '2026-03-09 13:07:49'),
(51, 1, 49, '', 'Kaunas', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(52, 1, 50, 'Klientas Nr. 50 adresas', '', 'Maltos Respublika', '', NULL, '2026-03-09 13:07:49'),
(53, 1, 51, 'Klientas Nr. 51 adresas', '', 'Vokietijos Federacinė Respublika', '', NULL, '2026-03-09 13:07:49'),
(54, 1, 52, 'Klientas Nr. 52 adresas', '', 'Prancūzijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(55, 1, 53, 'Klientas Nr. 53 adresas', '', 'Australija', '', NULL, '2026-03-09 13:07:49'),
(56, 1, 54, 'Klientas Nr. 54 adresas', '', 'Jungt.Didž.Brit. ir Š.Airijos Karalystė', '', NULL, '2026-03-09 13:07:49'),
(57, 1, 55, 'Klientas Nr. 55 adresas', '', 'Vengrijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(58, 1, 56, 'Klientas Nr. 56 adresas', '', 'Airija', '', NULL, '2026-03-09 13:07:49'),
(59, 1, 57, 'Klientas Nr. 57 adresas', '', 'Prancūzijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(60, 1, 58, 'Klientas Nr. 58 adresas', '', 'Airija', '', NULL, '2026-03-09 13:07:49'),
(61, 1, 59, 'Klientas Nr. 59 adresas', '', 'Jungt.Didž.Brit. ir Š.Airijos Karalystė', '', NULL, '2026-03-09 13:07:49'),
(62, 1, 60, 'Klientas Nr. 60 adresas', '', 'Portugalijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(63, 1, 61, 'Klientas Nr. 61 adresas', '', 'Suomijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(64, 1, 62, 'Klientas Nr. 62 adresas', '', 'Ispanijos Karalystė', '', NULL, '2026-03-09 13:07:49'),
(65, 1, 63, 'Klientas Nr. 63 adresas', '', 'Vokietijos Federacinė Respublika', '', NULL, '2026-03-09 13:07:49'),
(66, 1, 64, 'Klientas Nr. 64 adresas', '', 'Jungt.Didž.Brit. ir Š.Airijos Karalystė', '', NULL, '2026-03-09 13:07:49'),
(67, 1, 65, 'Klientas Nr. 65 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488883788047', NULL, '2026-03-09 13:07:49'),
(68, 1, 66, 'Klientas Nr. 66 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT353335241', NULL, '2026-03-09 13:07:49'),
(69, 1, 67, '', '', '', '', NULL, '2026-03-09 13:07:49'),
(70, 1, 68, 'Klientas Nr. 68 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT360429347', NULL, '2026-03-09 13:07:49'),
(71, 1, 69, 'Klientas Nr. 69 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT213717646', NULL, '2026-03-09 13:07:49'),
(72, 1, 70, 'Klientas Nr. 70 adresas', 'Kaunas', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(73, 1, 71, 'Klientas Nr. 71 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT488848994645', NULL, '2026-03-09 13:07:49'),
(74, 1, 72, 'Klientas Nr. 72 adresas', 'Alytus', 'Lietuvos Respublika', 'LT179303945', NULL, '2026-03-09 13:07:49'),
(75, 1, 73, 'Klientas Nr. 73 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT347048749', NULL, '2026-03-09 13:07:49'),
(76, 1, 74, 'Klientas Nr. 74 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(77, 1, 75, 'Klientas Nr. 75 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(78, 1, 76, 'Klientas Nr. 76 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(79, 1, 77, 'Klientas Nr. 77 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(80, 1, 78, 'Klientas Nr. 78 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(81, 1, 79, 'Klientas Nr. 79 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT445273749', NULL, '2026-03-09 13:07:49'),
(82, 1, 80, 'Klientas Nr. 80 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(83, 1, 81, 'Klientas Nr. 81 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(84, 1, 82, 'Klientas Nr. 82 adresas', '', '', '', NULL, '2026-03-09 13:07:49'),
(85, 1, 83, 'Klientas Nr. 83 adresas', '', '', '', NULL, '2026-03-09 13:07:49'),
(86, 1, 84, 'Klientas Nr. 84 adresas', '', '', '', NULL, '2026-03-09 13:07:49'),
(87, 1, 85, 'Klientas Nr. 85 adresas', 'Vilnius', 'Lietuvos Respublika', 'LT488884178448', NULL, '2026-03-09 13:07:49'),
(88, 1, 86, 'Klientas Nr. 86 adresas', '', 'Lietuvos Respublika', 'LT488844611543', NULL, '2026-03-09 13:07:49'),
(89, 1, 87, 'Klientas Nr. 87 adresas', 'Kaunas', 'Lietuvos Respublika', 'LT488882711045', NULL, '2026-03-09 13:07:49'),
(90, 1, 88, 'Klientas Nr. 88 adresas', '', 'Latvijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(91, 1, 89, 'Klientas Nr. 89 adresas', '', '', '', NULL, '2026-03-09 13:07:49'),
(92, 1, 90, 'Klientas Nr. 90 adresas', '', '', '', NULL, '2026-03-09 13:07:49'),
(93, 1, 91, 'Klientas Nr. 91 adresas', '', '', 'LT488846443548', NULL, '2026-03-09 13:07:49'),
(94, 1, 92, 'Klientas Nr. 92 adresas', '', '', '', NULL, '2026-03-09 13:07:49'),
(95, 1, 93, 'Klientas Nr. 93 adresas', '', '', '', NULL, '2026-03-09 13:07:49'),
(96, 1, 94, 'Klientas Nr. 94 adresas', '', '', '', NULL, '2026-03-09 13:07:49'),
(97, 1, 95, 'Klientas Nr. 95 adresas', '', '', 'LT488842709249', NULL, '2026-03-09 13:07:49'),
(98, 1, 96, 'Klientas Nr. 96 adresas', '', 'Italijos Respublika', 'IT80005088752', NULL, '2026-03-09 13:07:49'),
(99, 1, 97, 'Klientas Nr. 97 adresas', '', 'Lietuvos Respublika', 'LT488843784743', NULL, '2026-03-09 13:07:49'),
(100, 1, 98, 'Klientas Nr. 98 adresas', '', 'Lietuvos Respublika', 'LT985229646', NULL, '2026-03-09 13:07:49'),
(101, 1, 99, 'Klientas Nr. 99 adresas', '', 'Prancūzijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(102, 1, 100, 'Klientas Nr. 100 adresas', '', 'Rumunija', '', NULL, '2026-03-09 13:07:49'),
(103, 1, 101, 'Klientas Nr. 101 adresas', '', 'Lietuvos Respublika', 'LT488883596841', NULL, '2026-03-09 13:07:49'),
(104, 1, 102, 'Klientas Nr. 102 adresas', '', 'Lietuvos Respublika', '', NULL, '2026-03-09 13:07:49'),
(105, 1, 103, 'Klientas Nr. 103 adresas', '', 'Latvijos Respublika', 'LV18482940224', NULL, '2026-03-09 13:07:49'),
(106, 1, 104, 'Klientas Nr. 104 adresas', '', 'Lenkijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(107, 1, 105, 'Klientas Nr. 105 adresas', '', 'Lietuvos Respublika', 'LT488882203346', NULL, '2026-03-09 13:07:49'),
(108, 1, 106, 'Klientas Nr. 106 adresas', NULL, 'Prancūzijos Respublika', '', NULL, '2026-03-09 13:07:49'),
(109, 1, 107, 'Klientas Nr. 107 adresas', NULL, NULL, 'Germany', NULL, '2026-03-09 13:07:49'),
(110, 2, NULL, '123', '123', '123', '123', 123, '2026-03-16 11:51:53'),
(114, 1, NULL, 'Vilniaus g. 2', 'Kaunas', 'Lietuva', 'LT7351101', 7300, '2026-04-28 13:49:20');

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `id_Company` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `companyCode` varchar(100) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `creationDate` datetime NOT NULL DEFAULT current_timestamp(),
  `shippingAddress` varchar(255) DEFAULT NULL,
  `shippingStreet` varchar(100) DEFAULT NULL,
  `shippingCity` varchar(100) DEFAULT NULL,
  `shippingPostalCode` varchar(20) DEFAULT NULL,
  `shippingCountry` varchar(10) NOT NULL DEFAULT 'LT',
  `returnAddress` varchar(255) DEFAULT NULL,
  `returnStreet` varchar(100) DEFAULT NULL,
  `returnCity` varchar(100) DEFAULT NULL,
  `returnPostalCode` varchar(20) DEFAULT NULL,
  `returnCountry` varchar(10) NOT NULL DEFAULT 'LT',
  `documentCode` varchar(100) NOT NULL,
  `phoneNumber` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`id_Company`, `name`, `companyCode`, `active`, `creationDate`, `shippingAddress`, `shippingStreet`, `shippingCity`, `shippingPostalCode`, `shippingCountry`, `returnAddress`, `returnStreet`, `returnCity`, `returnPostalCode`, `returnCountry`, `documentCode`, `phoneNumber`, `address`, `email`, `image`) VALUES
(1, 'Demo Company', '4658944', 1, '2026-03-09 10:37:22', NULL, 'Kauno g. 50', 'Kaunas', '51368', 'LT', NULL, NULL, NULL, NULL, 'LT', 'DOC', '+37060000000', 'N/A', 'admin@demo.lt', '/uploads/companies/1/logo.png'),
(2, 'Nauja Įmonė 1', '85496812', 1, '2026-03-09 11:33:29', NULL, NULL, NULL, NULL, 'LT', NULL, NULL, NULL, NULL, 'LT', 'NO', '+37060000000', 'nauja gatve', 'nauja@info.lt', ''),
(3, 'Test Įmonė 2', '123456789', 1, '2026-03-16 18:25:26', NULL, 'Islandijos pr. 5', 'Kaunas', '50312', 'LT', NULL, '123', '123', '123', 'LT', '123', '+3706000000', '', 'imone@info.lt', ''),
(4, 'UAB Varlė', '8556422', 1, '2026-04-28 15:51:41', NULL, 'Partizanų g. 5', 'Kaunas', '52361', 'LT', NULL, NULL, NULL, NULL, 'LT', 'VA', '+3760000000', '', 'varle@info.lt', '/uploads/companies/4/logo.png');

-- --------------------------------------------------------

--
-- Table structure for table `company_integration`
--

CREATE TABLE `company_integration` (
  `id_CompanyIntegration` int(11) NOT NULL,
  `fk_Companyid_Company` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `baseUrl` varchar(500) DEFAULT NULL,
  `encryptedSecrets` text NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dpdToken` varchar(1000) DEFAULT NULL,
  `dpdTokenExpires` datetime DEFAULT NULL,
  `dpdTokenSecretId` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_integration`
--

INSERT INTO `company_integration` (`id_CompanyIntegration`, `fk_Companyid_Company`, `type`, `baseUrl`, `encryptedSecrets`, `enabled`, `updatedAt`, `dpdToken`, `dpdTokenExpires`, `dpdTokenSecretId`) VALUES
(3, 1, 'BUTENT', 'http://94.176.235.151:3069/api/v1', 'ehp0K/rq0L4eUTQ1D4T3hUMJWDPMYV6p18OECMqCInYdjB+w727GZ4aKFiZcW7fkvjsLLC2kWw8q3mhUrgyP+5OwjdVRzh9vMsv8HizrCyW16nW8R8hHv/09rtiScN/Xka+slKHDRHKfDkAYYl1QMttx', 1, '2026-03-16 10:36:01', NULL, NULL, NULL),
(4, 1, 'DPD', 'https://sandbox-esiunta.dpd.lt/api/v1', '4I9si4MdBZOX5FrEfM4B6g1EXTwa6VdmpKa+VE5jqcZwmYEfy/V+KPo+YAwC0pX7LKME0BuQlxdvR4G8LS70OH4KO8q+n3SRoyH5tWJCIV0/y69/J7l1bThQXNBnBhtVmLviaCCDlwsz0gNknsO8AW4jUMV9jwpeeRkyycQOLByqeRpdg4uSUmdNzkY=', 1, '2026-04-28 16:22:20', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjdXN0b21lcl9pZCI6NzA3LCJhZG1pbl9pZCI6bnVsbCwic2lnbmF0dXJlX2lkIjoiY2E0NzM5MTktY2Y1OS00YjY3LTliODAtNzdjZjU1NjMzODQ3Iiwic2lnbmF0dXJlX25hbWUiOiJiYWthbGF1cmFzLWludGVncmF0aW9uIiwiaXNzIjoiYW1iZXItbHQiLCJleHAiOjE3Nzc0Njg5NDl9.72P-cfyFVfaqUA_aWFLxpQnwsIrnPdP3FEC9IjwpmNY', '2026-04-29 12:22:20', 'ca473919-cf59-4b67-9b80-77cf55633847');

-- --------------------------------------------------------

--
-- Table structure for table `company_users`
--

CREATE TABLE `company_users` (
  `fk_Companyid_Company` int(11) NOT NULL,
  `fk_Usersid_Users` int(11) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'CLIENT',
  `position` varchar(255) DEFAULT NULL,
  `startDate` datetime DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_users`
--

INSERT INTO `company_users` (`fk_Companyid_Company`, `fk_Usersid_Users`, `role`, `position`, `startDate`, `active`, `createdAt`) VALUES
(1, 1, 'OWNER', 'ADMIN', '2026-03-09 10:37:22', 1, '2026-03-09 10:37:22'),
(1, 2, 'COURIER', 'COURIER', '2026-03-10 00:00:00', 1, '2026-03-09 12:59:27'),
(1, 3, 'CLIENT', NULL, NULL, 0, '2026-03-09 13:07:49'),
(1, 4, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 5, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 6, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 7, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 8, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 9, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 10, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 11, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 12, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 13, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 14, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 15, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 16, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 17, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 18, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 19, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 20, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 21, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 22, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 23, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 24, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 25, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 26, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 27, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 28, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 29, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 30, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 31, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 32, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 33, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 34, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 35, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 36, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 37, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 38, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 39, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 40, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 41, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 42, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 43, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 44, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 45, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 46, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 47, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 48, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 49, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 50, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 51, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 52, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 53, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 54, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 55, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 56, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 57, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 58, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 59, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 60, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 61, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 62, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 63, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 64, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 65, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 66, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 67, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 68, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 69, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 70, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 71, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 72, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 73, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 74, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 75, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 76, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 77, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 78, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 79, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 80, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 81, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 82, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 83, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 84, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 85, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 86, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 87, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 88, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 89, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 90, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 91, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 92, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 93, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 94, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 95, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 96, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 97, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 98, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 99, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 100, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 101, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 102, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 103, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 104, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 105, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 106, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 107, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 108, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 109, 'CLIENT', NULL, NULL, 1, '2026-03-09 13:07:49'),
(1, 114, 'CLIENT', NULL, NULL, 1, '2026-04-28 13:47:07'),
(2, 1, 'OWNER', 'ADMIN', '2026-03-09 11:33:29', 1, '2026-03-09 13:33:29'),
(2, 110, 'CLIENT', NULL, NULL, 1, '2026-03-16 11:51:53'),
(3, 1, 'OWNER', 'ADMIN', '2026-03-16 18:25:26', 1, '2026-03-16 20:25:26'),
(4, 1, 'OWNER', 'ADMIN', '2026-04-28 15:51:41', 1, '2026-04-28 18:51:41'),
(4, 115, 'COURIER', NULL, NULL, 1, '2026-04-28 18:57:46');

-- --------------------------------------------------------

--
-- Table structure for table `courier`
--

CREATE TABLE `courier` (
  `id_Courier` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `contactPhone` varchar(50) DEFAULT NULL,
  `deliveryTermDays` int(11) DEFAULT NULL,
  `deliveryPrice` double DEFAULT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'CUSTOM',
  `fk_Companyid_Company` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `courier`
--

INSERT INTO `courier` (`id_Courier`, `name`, `contactPhone`, `deliveryTermDays`, `deliveryPrice`, `type`, `fk_Companyid_Company`) VALUES
(1, 'Demo Kurjeris', '123456789', 3, 5, 'CUSTOM', NULL),
(2, 'DPD Paštomatas', NULL, 2, 3.5, 'DPD_PARCEL', NULL),
(3, 'DPD Kurjeris', NULL, 1, 5, 'DPD_HOME', NULL),
(6, 'Varlė Kurjeris', '+37060000000', 3, 4.99, 'CUSTOM', 4);

-- --------------------------------------------------------

--
-- Table structure for table `invoice`
--

CREATE TABLE `invoice` (
  `id_Invoice` int(11) NOT NULL,
  `invoiceNumber` varchar(100) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `dueDate` datetime DEFAULT NULL,
  `total` double NOT NULL DEFAULT 0,
  `vatTotal` double NOT NULL DEFAULT 0,
  `isPaid` tinyint(1) NOT NULL DEFAULT 0,
  `paidAt` datetime DEFAULT NULL,
  `notes` varchar(1000) DEFAULT NULL,
  `fileUrl` varchar(500) DEFAULT NULL COMMENT 'Path to generated PDF invoice',
  `emailSent` tinyint(1) NOT NULL DEFAULT 0,
  `emailSentAt` datetime DEFAULT NULL,
  `fk_Ordersid_Orders` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoice`
--

INSERT INTO `invoice` (`id_Invoice`, `invoiceNumber`, `date`, `dueDate`, `total`, `vatTotal`, `isPaid`, `paidAt`, `notes`, `fileUrl`, `emailSent`, `emailSentAt`, `fk_Ordersid_Orders`) VALUES
(1, 'INV-1-69-20260411', '2026-04-11 11:18:52', '2026-05-11 11:18:52', 418.37, 10.964273039999998, 0, NULL, NULL, '/invoices/69/invoice_69.pdf', 0, NULL, 69),
(10, 'INV-1-70-20260411', '2026-04-11 13:08:22', '2026-05-11 13:08:22', 1048.65, 48.93349335, 0, NULL, NULL, '/invoices/70/invoice_70.pdf', 0, NULL, 70),
(12, 'INV-1-72-20260411', '2026-04-11 15:48:23', '2026-05-11 15:48:23', 714.78, 8.8158, 0, NULL, NULL, '/invoices/72/invoice_72.pdf', 0, NULL, 72),
(14, 'INV-1-73-20260411', '2026-04-11 16:11:35', '2026-05-11 16:11:35', 47.15, 8.1837, 0, NULL, NULL, '/invoices/73/invoice_73.pdf', 0, NULL, 73),
(15, 'INV-1-75-20260416', '2026-04-16 06:06:23', '2026-05-16 06:06:23', 15.72, 2.7279, 0, NULL, NULL, '/invoices/75/invoice_75.pdf', 0, NULL, 75),
(16, 'INV-1-77-20260428', '2026-04-28 11:29:54', '2026-05-28 11:29:54', 587.82, 102.01799999999999, 0, NULL, NULL, '/invoices/77/invoice_77.pdf', 0, NULL, 77),
(17, 'INV-1-78-20260428', '2026-04-28 15:27:08', '2026-05-28 15:27:08', 461.93, 80.1696, 0, NULL, NULL, '/invoices/78/invoice_78.pdf', 0, NULL, 78),
(18, 'INV-1-53-20260429', '2026-04-29 09:53:16', '2026-05-29 09:53:16', 123.99, 21.518700000000003, 0, NULL, NULL, '/invoices/53/invoice_53.pdf', 0, NULL, 53),
(19, 'INV-1-50-20260429', '2026-04-29 09:53:34', '2026-05-29 09:53:34', 507.17, 88.02149999999999, 0, NULL, NULL, '/invoices/50/invoice_50.pdf', 0, NULL, 50),
(20, 'INV-1-51-20260429', '2026-04-29 09:53:59', '2026-05-29 09:53:59', 23.99, 4.1643, 0, NULL, NULL, '/invoices/51/invoice_51.pdf', 0, NULL, 51),
(21, 'INV-1-81-20260429', '2026-04-29 10:38:57', '2026-05-29 10:38:57', 109.32, 18.9735, 0, NULL, NULL, '/invoices/81/invoice_81.pdf', 0, NULL, 81),
(22, 'INV-1-80-20260429', '2026-04-29 10:40:01', '2026-05-29 10:40:01', 110.99, 19.2633, 0, NULL, NULL, '/invoices/80/invoice_80.pdf', 0, NULL, 80),
(23, 'INV-1-79-20260429', '2026-04-29 12:00:32', '2026-05-29 12:00:32', 507.17, 88.02149999999999, 0, NULL, NULL, '/invoices/79/invoice_79.pdf', 0, NULL, 79),
(24, 'INV-1-63-20260429', '2026-04-29 12:02:08', '2026-05-29 12:02:08', 88.98, 15.443399999999999, 0, NULL, NULL, '/invoices/63/invoice_63.pdf', 0, NULL, 63),
(25, 'INV-1-1-20260429', '2026-04-29 12:02:46', '2026-05-29 12:02:46', 48.99, 8.5029, 0, NULL, NULL, '/invoices/1/invoice_1.pdf', 0, NULL, 1),
(26, 'INV-1-62-20260429', '2026-04-29 12:08:43', '2026-05-29 12:08:43', 51.93, 9.0132, 0, NULL, NULL, '/invoices/62/invoice_62.pdf', 0, NULL, 62),
(27, 'INV-1-83-20260429', '2026-04-29 12:26:20', '2026-05-29 12:26:20', 109.4, 18.9861, 0, NULL, NULL, '/invoices/83/invoice_83.pdf', 0, NULL, 83),
(28, 'INV-1-82-20260429', '2026-04-29 12:29:29', '2026-05-29 12:29:29', 24.03, 4.170599999999999, 0, NULL, NULL, '/invoices/82/invoice_82.pdf', 0, NULL, 82),
(29, 'INV-1-88-20260429', '2026-04-29 12:30:15', '2026-05-29 12:30:15', 109.32, 18.9735, 0, NULL, NULL, '/invoices/88/invoice_88.pdf', 0, NULL, 88),
(30, 'INV-1-85-20260429', '2026-04-29 12:31:20', '2026-05-29 12:31:20', 536.04, 93.03209999999999, 0, NULL, NULL, '/invoices/85/invoice_85.pdf', 0, NULL, 85),
(31, 'INV-1-89-20260429', '2026-04-29 14:42:26', '2026-05-29 14:42:26', 137.86, 23.925299999999996, 0, NULL, NULL, '/invoices/89/invoice_89.pdf', 0, NULL, 89);

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `id_Notification` int(11) NOT NULL,
  `theme` varchar(255) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `type` varchar(50) NOT NULL DEFAULT 'INFO' COMMENT 'INFO | ORDER | SHIPMENT | RETURN | INVOICE',
  `referenceId` int(11) DEFAULT NULL COMMENT 'orderId / shipmentId / returnId',
  `referenceType` varchar(50) DEFAULT NULL COMMENT 'ORDER | SHIPMENT | RETURN',
  `emailSent` tinyint(1) NOT NULL DEFAULT 0,
  `fk_Companyid_Company` int(11) DEFAULT NULL COMMENT 'Company whose staff can see this notification in the bell',
  `fk_Usersid_Users` int(11) DEFAULT NULL,
  `visibleToClient` tinyint(1) NOT NULL DEFAULT 1,
  `visibleToCompany` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification`
--

INSERT INTO `notification` (`id_Notification`, `theme`, `content`, `date`, `isRead`, `type`, `referenceId`, `referenceType`, `emailSent`, `fk_Companyid_Company`, `fk_Usersid_Users`, `visibleToClient`, `visibleToCompany`) VALUES
(1, 'Užsakymas vykdomas 🛠️', 'Jūsų užsakymas #69 yra pradėtas vykdyti. Kai tik bus paruoštas, informuosime apie išsiuntimą.', '2026-04-11 11:18:52', 1, 'ORDER', 69, 'ORDER', 1, NULL, 2, 1, 0),
(2, 'Siunta sukurta 📋', 'Jūsų siunta #83 buvo sėkmingai sukurta. Sekimo numeris(-iai): 99991000097572, 99991000097573, 99991000097574.', '2026-04-11 11:21:36', 1, 'SHIPMENT', 83, 'SHIPMENT', 1, NULL, 2, 1, 0),
(3, 'Siunta keliauja pas jus 🚚', 'Jūsų užsakymas keliauja į jūsų namus. Sekimo numeris(-iai): 99991000097572, 99991000097573, 99991000097574.', '2026-04-11 11:24:31', 1, 'SHIPMENT', 83, 'SHIPMENT', 1, NULL, 2, 1, 0),
(4, 'Siunta vežama', 'Jūsų užsakymas keliauja į jūsų namus. Sekimo nr.: 99991000097572, 99991000097573, 99991000097574.', '2026-04-11 11:35:22', 1, 'SHIPMENT', 83, 'SHIPMENT', 1, 1, 2, 1, 0),
(5, 'Siunta vėluoja', 'Siunta #83 vėluoja. Susisiekite su kurjeriu dėl detalių.', '2026-04-11 12:26:36', 1, 'SHIPMENT', 83, 'SHIPMENT', 1, 1, 2, 1, 0),
(6, 'Siunta pristatyta', 'Siunta #83 sėkmingai pristatyta. Ačiū!', '2026-04-11 12:27:37', 1, 'SHIPMENT', 83, 'SHIPMENT', 1, 1, 2, 1, 0),
(7, 'Grąžinimas vertinamas', 'Grąžinimo užklausa #9 šiuo metu peržiūrima.', '2026-04-11 12:30:17', 1, 'RETURN', 9, 'RETURN', 1, 1, 2, 1, 0),
(8, 'Grąžinimo etiketė paruošta', 'Grąžinimo etiketė (#9) paruošta. Prisijunkite ir atsisiųskite.', '2026-04-11 12:30:40', 1, 'RETURN', 9, 'RETURN', 1, 1, 2, 1, 0),
(9, 'Grąžinimas vežamas', 'Grąžinimo siunta #84 pakeliui atgal.', '2026-04-11 12:32:51', 1, 'SHIPMENT', 84, 'SHIPMENT', 0, 1, 2, 1, 0),
(10, 'Grąžinimas pristatytas', 'Grąžinimo siunta #84 sėkmingai pristatyta.', '2026-04-11 12:33:24', 1, 'SHIPMENT', 84, 'SHIPMENT', 0, 1, 2, 1, 0),
(11, 'Užsakymas vykdomas', 'Jūsų užsakymas #70 pradėtas vykdyti.', '2026-04-11 13:08:22', 1, 'ORDER', 70, 'ORDER', 1, NULL, 2, 1, 0),
(12, 'Siunta sukurta', 'Siunta #85 sukurta.', '2026-04-11 13:10:00', 1, 'SHIPMENT', 85, 'SHIPMENT', 1, 1, 2, 1, 1),
(13, 'Siunta vežama', 'Siunta pakeliui.', '2026-04-11 13:12:46', 1, 'SHIPMENT', 85, 'SHIPMENT', 1, 1, 2, 1, 1),
(14, 'Siunta vėluoja', 'Siunta vėluoja.', '2026-04-11 13:13:00', 1, 'SHIPMENT', 85, 'SHIPMENT', 1, 1, 2, 1, 1),
(15, 'Siunta pristatyta', 'Siunta pristatyta.', '2026-04-11 13:13:15', 1, 'SHIPMENT', 85, 'SHIPMENT', 1, 1, 2, 1, 1),
(16, 'Grąžinimas vertinamas', 'Grąžinimas vertinamas.', '2026-04-11 13:15:48', 1, 'RETURN', 10, 'RETURN', 1, NULL, 2, 1, 0),
(17, 'Etiketė paruošta', 'Atsisiųskite etiketę.', '2026-04-11 13:16:13', 1, 'RETURN', 10, 'RETURN', 1, NULL, 2, 1, 0),
(18, 'Grąžinimo siuntos būsena', 'Grąžinimo siunta #86 atnaujinta.', '2026-04-11 13:17:42', 1, 'SHIPMENT', 86, 'SHIPMENT', 0, 1, NULL, 0, 1),
(19, 'Grąžinimo siuntos būsena', 'Grąžinimo siunta #86 atnaujinta.', '2026-04-11 13:18:25', 1, 'SHIPMENT', 86, 'SHIPMENT', 0, 1, NULL, 0, 1),
(20, 'Grąžinimo siuntos būsena', 'Grąžinimo siunta #86 atnaujinta.', '2026-04-11 13:51:28', 1, 'SHIPMENT', 86, 'SHIPMENT', 0, 1, NULL, 0, 1),
(21, 'Užsakymas vykdomas', 'Jūsų užsakymas #71 pradėtas vykdyti.', '2026-04-11 13:52:57', 1, 'ORDER', 71, 'ORDER', 1, NULL, 2, 1, 0),
(22, 'Siunta sukurta', 'Siunta #87 sukurta. Jos būseną galite sekti <a href=\'http://localhost:3000/client\'>čia</a> Sekimo numeris: PKG-1-71-1775915844-6184.', '2026-04-11 13:57:25', 1, 'SHIPMENT', 87, 'SHIPMENT', 0, NULL, 2, 1, 0),
(23, 'Siunta vežama', 'Siunta pakeliui. Jos būseną galite sekti <a href=\'http://localhost:3000/client\'>čia</a>. Sekimo numeris: PKG-1-71-1775915844-6184.', '2026-04-11 13:58:54', 1, 'SHIPMENT', 87, 'SHIPMENT', 1, NULL, 2, 1, 0),
(24, 'Siunta vėluoja', 'Siunta vėluoja. Atsiprašome už nepatogumus, dirbame, kad ji pasiektų jus kuo greičiau.', '2026-04-11 13:59:58', 1, 'SHIPMENT', 87, 'SHIPMENT', 1, NULL, 2, 1, 0),
(25, 'Siunta pristatyta', 'Siunta pristatyta. Ačiū, kad naudojatės mūsų paslaugomis!', '2026-04-11 14:00:21', 1, 'SHIPMENT', 87, 'SHIPMENT', 1, NULL, 2, 1, 0),
(26, 'Grąžinimas vertinamas', 'Grąžinimas #11 vertinamas. Laukiame įvertinimo rezultatų.', '2026-04-11 14:01:29', 1, 'RETURN', 11, 'RETURN', 1, NULL, 2, 1, 0),
(27, 'Etiketė paruošta', 'Atsisiųskite etiketę ir grąžinkite prekę naudodami šią etiketę. Etiketė prisegta prie šio pranešimo.', '2026-04-11 14:02:08', 1, 'RETURN', 11, 'RETURN', 1, NULL, 2, 1, 0),
(28, 'Užsakymas vykdomas', 'Jūsų užsakymas #72 pradėtas vykdyti.', '2026-04-11 15:48:23', 1, 'ORDER', 72, 'ORDER', 1, NULL, 2, 1, 0),
(29, 'Siunta sukurta', 'Siunta #89 sukurta. Jos būseną galite sekti <a href=\'http://localhost:3000/client\'>čia</a> Sekimo numeris: PKG-1-72-1775922540-9910.', '2026-04-11 15:49:00', 1, 'SHIPMENT', 89, 'SHIPMENT', 0, NULL, 2, 1, 0),
(30, 'Siunta vežama', 'Siunta pakeliui. Jos būseną galite sekti <a href=\'http://localhost:3000/client\'>čia</a>. Sekimo numeris: PKG-1-72-1775922540-9910.', '2026-04-11 15:50:11', 1, 'SHIPMENT', 89, 'SHIPMENT', 1, NULL, 2, 1, 0),
(31, 'Siunta pristatyta', 'Siunta pristatyta. Ačiū, kad naudojatės mūsų paslaugomis!', '2026-04-11 15:50:55', 1, 'SHIPMENT', 89, 'SHIPMENT', 1, NULL, 2, 1, 0),
(32, 'Grąžinimas vertinamas', 'Grąžinimas #12 vertinamas. Laukiame įvertinimo rezultatų.', '2026-04-11 15:52:27', 1, 'RETURN', 12, 'RETURN', 1, NULL, 2, 1, 0),
(33, 'Etiketė paruošta', 'Atsisiųskite etiketę ir grąžinkite prekę naudodami šią etiketę. Etiketė prisegta prie šio pranešimo.', '2026-04-11 15:54:20', 1, 'RETURN', 12, 'RETURN', 1, NULL, 2, 1, 0),
(34, 'Grąžinimo siuntos būsena', 'Grąžinimo siunta #90 atnaujinta.', '2026-04-11 15:55:50', 1, 'SHIPMENT', 90, 'SHIPMENT', 0, 1, NULL, 0, 1),
(35, 'Grąžinimo siuntos būsena', 'Grąžinimo siunta #90 atnaujinta.', '2026-04-11 15:56:10', 1, 'SHIPMENT', 90, 'SHIPMENT', 0, 1, NULL, 0, 1),
(36, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-11 16:05:33', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(37, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-11 16:08:23', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(38, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-11 16:09:03', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(39, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-11 16:10:00', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(40, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-11 16:11:35', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(41, 'Užsakymas įvykdytas', 'Užsakymas #73 pristatytas.', '2026-04-11 16:23:06', 1, 'ORDER', 73, 'ORDER', 0, NULL, 2, 1, 0),
(42, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-11 16:24:04', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(43, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-14 12:13:34', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(44, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-14 12:14:49', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(45, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-14 12:22:16', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(46, 'Siunta sukurta', 'Siunta #91 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-73-1776266080-7165<br/>• PKG-1-73-1776266081-9659.', '2026-04-15 15:14:41', 1, 'SHIPMENT', 91, 'SHIPMENT', 0, NULL, 2, 1, 0),
(47, 'Siunta sukurta', 'Siunta #92 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-73-1776266298-4494<br/>• PKG-1-73-1776266298-5110.', '2026-04-15 15:18:18', 1, 'SHIPMENT', 92, 'SHIPMENT', 0, NULL, 2, 1, 0),
(48, 'Siunta sukurta', 'Siunta #93 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-73-1776267114-8804<br/>• PKG-1-73-1776267114-5005.', '2026-04-15 15:31:55', 1, 'SHIPMENT', 93, 'SHIPMENT', 0, NULL, 2, 1, 0),
(49, 'Siunta sukurta', 'Siunta #94 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-73-1776267622-3284.', '2026-04-15 15:40:22', 1, 'SHIPMENT', 94, 'SHIPMENT', 0, NULL, 2, 1, 0),
(50, 'Siunta sukurta', 'Siunta #95 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-75-1776278982-8047.', '2026-04-15 18:49:43', 0, 'SHIPMENT', 95, 'SHIPMENT', 0, NULL, 3, 1, 0),
(51, 'Užsakymas vykdomas', 'Jūsų užsakymas #73 pradėtas vykdyti.', '2026-04-16 05:59:45', 1, 'ORDER', 73, 'ORDER', 1, NULL, 2, 1, 0),
(52, 'Siunta sukurta', 'Siunta #96 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-73-1776319313-6783.', '2026-04-16 06:01:53', 0, 'SHIPMENT', 96, 'SHIPMENT', 0, NULL, 2, 1, 0),
(53, 'Siunta vežama', 'Siunta pakeliui. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-73-1776319313-6783.', '2026-04-16 06:02:30', 1, 'SHIPMENT', 96, 'SHIPMENT', 1, NULL, 2, 1, 0),
(54, 'Grąžinimas vertinamas', 'Grąžinimas #13 vertinamas. Laukiame įvertinimo rezultatų.', '2026-04-16 06:04:08', 0, 'RETURN', 13, 'RETURN', 1, NULL, 2, 1, 0),
(55, 'Etiketė paruošta', 'Atsisiųskite etiketę ir grąžinkite prekę naudodami šią etiketę. Etiketė prisegta prie šio pranešimo.', '2026-04-16 06:04:23', 0, 'RETURN', 13, 'RETURN', 1, NULL, 2, 1, 0),
(56, 'Siunta sukurta', 'Siunta #98 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: 99991000097576.', '2026-04-16 06:05:58', 1, 'SHIPMENT', 98, 'SHIPMENT', 0, NULL, 2, 1, 0),
(57, 'Užsakymas vykdomas', 'Jūsų užsakymas #75 pradėtas vykdyti.', '2026-04-16 06:06:23', 1, 'ORDER', 75, 'ORDER', 1, NULL, 2, 1, 0),
(58, 'Siunta sukurta', 'Siunta #99 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-75-1776319636-7758.', '2026-04-16 06:07:16', 0, 'SHIPMENT', 99, 'SHIPMENT', 0, NULL, 2, 1, 0),
(59, 'Siunta vežama', 'Siunta pakeliui. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-75-1776319636-7758.', '2026-04-16 06:07:24', 0, 'SHIPMENT', 99, 'SHIPMENT', 1, NULL, 2, 1, 0),
(60, 'Grąžinimo siuntos būsena', 'Grąžinimo siunta #81 atnaujinta.', '2026-04-16 06:09:09', 1, 'SHIPMENT', 81, 'SHIPMENT', 0, 1, NULL, 0, 1),
(61, 'Grąžinimo siuntos būsena', 'Grąžinimo siunta #81 atnaujinta.', '2026-04-16 06:09:14', 1, 'SHIPMENT', 81, 'SHIPMENT', 0, 1, NULL, 0, 1),
(62, 'Siunta sukurta', 'Siunta #100 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-77-1777375753-4550<br/>• PKG-1-77-1777375754-4380.', '2026-04-28 11:29:14', 1, 'SHIPMENT', 100, 'SHIPMENT', 0, NULL, 114, 1, 0),
(63, 'Užsakymas vykdomas', 'Jūsų užsakymas #77 pradėtas vykdyti.', '2026-04-28 11:29:54', 0, 'ORDER', 77, 'ORDER', 1, NULL, 114, 1, 0),
(64, 'Siunta vežama', 'Siunta pakeliui. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-77-1777375753-4550<br/>• PKG-1-77-1777375754-4380.', '2026-04-28 13:12:01', 0, 'SHIPMENT', 100, 'SHIPMENT', 1, NULL, 114, 1, 0),
(65, 'Siunta pristatyta', 'Siunta pristatyta. Ačiū, kad naudojatės mūsų paslaugomis!', '2026-04-28 13:13:14', 0, 'SHIPMENT', 100, 'SHIPMENT', 1, NULL, 114, 1, 0),
(66, 'Užsakymas vykdomas', 'Jūsų užsakymas #78 pradėtas vykdyti.', '2026-04-28 15:27:08', 0, 'ORDER', 78, 'ORDER', 1, NULL, 114, 1, 0),
(67, 'Siunta sukurta', 'Siunta #101 sukurta. Jos būseną galite sekti mūsų svetainėje. Sekimo numeris: PKG-1-78-1777390632-6816<br/>• PKG-1-78-1777390632-1468.', '2026-04-28 15:37:12', 0, 'SHIPMENT', 101, 'SHIPMENT', 0, NULL, 114, 1, 0),
(68, 'Grąžinimas vertinamas', 'Grąžinimas #14 vertinamas. Laukiame įvertinimo rezultatų.', '2026-04-28 15:39:12', 0, 'RETURN', 14, 'RETURN', 1, NULL, 114, 1, 0),
(69, 'Etiketė paruošta', 'Atsisiųskite etiketę ir grąžinkite prekę naudodami šią etiketę. Etiketė prisegta prie šio pranešimo.', '2026-04-28 15:42:39', 0, 'RETURN', 14, 'RETURN', 1, NULL, 114, 1, 0),
(70, 'Užsakymas vykdomas', 'Jūsų užsakymas #53 pradėtas vykdyti.', '2026-04-29 09:53:16', 0, 'ORDER', 53, 'ORDER', 1, NULL, 106, 1, 0),
(71, 'Užsakymas vykdomas', 'Jūsų užsakymas #50 pradėtas vykdyti.', '2026-04-29 09:53:34', 0, 'ORDER', 50, 'ORDER', 1, NULL, 103, 1, 0),
(72, 'Užsakymas vykdomas', 'Jūsų užsakymas #51 pradėtas vykdyti.', '2026-04-29 09:53:59', 0, 'ORDER', 51, 'ORDER', 1, NULL, 104, 1, 0),
(73, 'Užsakymas vykdomas', 'Jūsų užsakymas #81 pradėtas vykdyti.', '2026-04-29 10:38:57', 0, 'ORDER', 81, 'ORDER', 1, NULL, 106, 1, 0),
(74, 'Užsakymas vykdomas', 'Jūsų užsakymas #81 pradėtas vykdyti.', '2026-04-29 10:39:37', 0, 'ORDER', 81, 'ORDER', 1, NULL, 106, 1, 0),
(75, 'Užsakymas vykdomas', 'Jūsų užsakymas #80 pradėtas vykdyti.', '2026-04-29 10:40:01', 0, 'ORDER', 80, 'ORDER', 1, NULL, 104, 1, 0),
(76, 'Užsakymas vykdomas', 'Jūsų užsakymas #79 pradėtas vykdyti.', '2026-04-29 12:00:32', 0, 'ORDER', 79, 'ORDER', 1, NULL, 103, 1, 0),
(77, 'Užsakymas vykdomas', 'Jūsų užsakymas #80 pradėtas vykdyti.', '2026-04-29 12:01:17', 0, 'ORDER', 80, 'ORDER', 1, NULL, 104, 1, 0),
(78, 'Užsakymas vykdomas', 'Jūsų užsakymas #63 pradėtas vykdyti.', '2026-04-29 12:02:08', 0, 'ORDER', 63, 'ORDER', 1, NULL, 109, 1, 0),
(79, 'Užsakymas vykdomas', 'Jūsų užsakymas #1 pradėtas vykdyti.', '2026-04-29 12:02:46', 0, 'ORDER', 1, 'ORDER', 1, NULL, 12, 1, 0),
(80, 'Užsakymas vykdomas', 'Jūsų užsakymas #62 pradėtas vykdyti.', '2026-04-29 12:08:43', 0, 'ORDER', 62, 'ORDER', 1, NULL, 108, 1, 0),
(81, 'Užsakymas vykdomas', 'Jūsų užsakymas #83 pradėtas vykdyti.', '2026-04-29 12:26:20', 0, 'ORDER', 83, 'ORDER', 1, NULL, 106, 1, 0),
(82, 'Užsakymas vykdomas', 'Jūsų užsakymas #82 pradėtas vykdyti.', '2026-04-29 12:29:29', 0, 'ORDER', 82, 'ORDER', 1, NULL, 104, 1, 0),
(83, 'Užsakymas vykdomas', 'Jūsų užsakymas #88 pradėtas vykdyti.', '2026-04-29 12:30:15', 0, 'ORDER', 88, 'ORDER', 1, NULL, 106, 1, 0),
(84, 'Užsakymas vykdomas', 'Jūsų užsakymas #85 pradėtas vykdyti.', '2026-04-29 12:31:20', 0, 'ORDER', 85, 'ORDER', 1, NULL, 103, 1, 0),
(85, 'Patvirtinkite pristatymo duomenis', 'Jūsų užsakymas #89 gautas! Prašome patvirtinti pristatymo adresą ir pasirinkti pristatymo būdą paspaudę mygtuką žemiau.', '2026-04-29 13:36:10', 1, 'ORDER', 89, 'ORDER', 1, NULL, 2, 1, 0),
(86, 'Patvirtinkite pristatymo duomenis', 'Jūsų užsakymas #89 gautas! Prašome patvirtinti pristatymo adresą ir pasirinkti pristatymo būdą paspaudę mygtuką žemiau.', '2026-04-29 13:40:01', 0, 'ORDER', 89, 'ORDER', 1, NULL, 2, 1, 0),
(87, 'Patvirtinkite pristatymo duomenis', 'Jūsų užsakymas #89 gautas! Prašome patvirtinti pristatymo adresą ir pasirinkti pristatymo būdą paspaudę mygtuką žemiau.', '2026-04-29 14:42:07', 0, 'ORDER', 89, 'ORDER', 1, NULL, 2, 1, 0),
(88, 'Užsakymas vykdomas', 'Jūsų užsakymas #89 pradėtas vykdyti.', '2026-04-29 14:42:26', 0, 'ORDER', 89, 'ORDER', 1, NULL, 2, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id_Orders` int(11) NOT NULL,
  `OrdersDate` datetime NOT NULL DEFAULT current_timestamp(),
  `totalAmount` double NOT NULL DEFAULT 0,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `deliveryPrice` double DEFAULT NULL,
  `status` int(11) NOT NULL,
  `fk_Clientid_Users` int(11) NOT NULL,
  `externalDocumentId` int(11) DEFAULT NULL,
  `fk_Companyid_Company` int(11) NOT NULL,
  `snapshotDeliveryAddress` varchar(255) DEFAULT NULL,
  `snapshotCity` varchar(100) DEFAULT NULL,
  `snapshotCountry` varchar(100) DEFAULT NULL,
  `snapshotPhone` varchar(50) DEFAULT NULL,
  `snapshotCourierId` int(11) DEFAULT NULL,
  `snapshotDeliveryMethod` varchar(20) DEFAULT NULL COMMENT 'HOME or LOCKER',
  `snapshotLockerId` varchar(100) DEFAULT NULL,
  `snapshotLockerName` varchar(255) DEFAULT NULL,
  `snapshotLockerAddress` varchar(255) DEFAULT NULL,
  `snapshotLat` double DEFAULT NULL,
  `snapshotLng` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id_Orders`, `OrdersDate`, `totalAmount`, `paymentMethod`, `deliveryPrice`, `status`, `fk_Clientid_Users`, `externalDocumentId`, `fk_Companyid_Company`, `snapshotDeliveryAddress`, `snapshotCity`, `snapshotCountry`, `snapshotPhone`, `snapshotCourierId`, `snapshotDeliveryMethod`, `snapshotLockerId`, `snapshotLockerName`, `snapshotLockerAddress`, `snapshotLat`, `snapshotLng`) VALUES
(1, '2023-05-03 00:00:00', 48.99, 'butent', 0, 4, 12, NULL, 1, '', 'Kaunas', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(2, '2023-05-11 00:00:00', 10, 'butent', 0, 4, 13, 6, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, '2023-05-12 00:00:00', 700, 'butent', 0, 4, 14, 7, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, '2023-05-12 00:00:00', 5710.06, 'butent', 0, 4, 15, 8, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, '2023-05-15 00:00:00', 1368.5, 'butent', 0, 4, 16, 9, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, '2023-05-17 00:00:00', 2212.92, 'butent', 0, 4, 15, 10, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, '2023-05-17 00:00:00', 30, 'butent', 0, 4, 17, 11, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, '2023-05-19 00:00:00', 19, 'butent', 0, 4, 18, 12, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, '2023-05-19 00:00:00', 189.97, 'butent', 0, 4, 19, 13, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, '2023-05-30 00:00:00', 40, 'butent', 0, 4, 20, 14, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, '2023-05-30 00:00:00', 20, 'butent', 0, 4, 21, 15, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, '2023-05-30 00:00:00', 53, 'butent', 0, 4, 22, 16, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, '2023-06-01 00:00:00', 60, 'butent', 0, 4, 24, 17, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, '2023-06-02 00:00:00', 20, 'butent', 0, 4, 34, 29, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, '2023-06-07 00:00:00', 45, 'butent', 0, 4, 35, 30, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(16, '2023-06-09 00:00:00', 70, 'butent', 0, 4, 36, 31, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(17, '2023-06-16 00:00:00', 65, 'butent', 0, 4, 44, 45, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(18, '2023-06-13 00:00:00', 10, 'butent', 0, 4, 45, 46, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(19, '2023-06-02 00:00:00', 701.8, 'butent', 0, 4, 46, 47, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(20, '2023-06-30 00:00:00', 70, 'butent', 0, 4, 47, 48, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(21, '2023-06-22 00:00:00', 17, 'butent', 0, 4, 48, 49, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(22, '2023-07-10 00:00:00', 20, 'butent', 0, 4, 49, 50, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(23, '2023-07-14 00:00:00', 1300, 'butent', 0, 4, 51, 52, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(24, '2023-06-22 00:00:00', 19.99, 'butent', 0, 4, 52, 53, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(25, '2023-06-23 00:00:00', 30, 'butent', 0, 4, 53, 54, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(26, '2023-06-23 00:00:00', 50, 'butent', 0, 4, 54, 55, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(27, '2023-06-24 00:00:00', 16.5, 'butent', 0, 4, 55, 56, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(28, '2023-06-26 00:00:00', 84.3, 'butent', 0, 4, 56, 57, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(29, '2023-06-26 00:00:00', 59, 'butent', 0, 4, 57, 58, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(30, '2023-06-26 00:00:00', 21, 'butent', 0, 4, 58, 59, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(31, '2023-06-26 00:00:00', 13, 'butent', 0, 4, 59, 60, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(32, '2023-06-27 00:00:00', 14, 'butent', 0, 4, 60, 61, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(33, '2023-06-27 00:00:00', 20.5, 'butent', 0, 4, 61, 62, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, '2023-06-28 00:00:00', 15, 'butent', 0, 4, 62, 63, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, '2023-06-28 00:00:00', 49, 'butent', 0, 4, 63, 64, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(36, '2023-06-29 00:00:00', 22, 'butent', 0, 4, 64, 65, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(37, '2023-06-28 00:00:00', 20, 'butent', 0, 4, 65, 66, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(38, '2023-06-30 00:00:00', 12.89, 'butent', 0, 4, 66, 67, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(39, '2023-07-21 00:00:00', 65, 'butent', 0, 4, 76, 98, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(40, '2023-07-20 00:00:00', 50, 'butent', 0, 4, 77, 101, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(41, '2023-07-21 00:00:00', 400, 'butent', 0, 4, 78, 103, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(42, '2023-07-21 00:00:00', 170, 'butent', 0, 4, 79, 104, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(43, '2023-07-21 00:00:00', 20, 'butent', 0, 4, 80, 105, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(44, '2023-07-27 00:00:00', 13, 'butent', 0, 4, 82, 111, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(45, '2023-07-27 00:00:00', 650, 'butent', 0, 4, 83, 112, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(46, '2023-07-31 00:00:00', 17, 'butent', 0, 4, 84, 113, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(47, '2023-07-31 00:00:00', 17, 'butent', 0, 4, 91, 133, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(48, '2023-08-21 00:00:00', 58, 'butent', 0, 4, 95, 137, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(49, '2025-11-03 00:00:00', 123.99, 'butent', 0, 4, 102, 146, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(50, '2025-11-03 00:00:00', 507.17, 'butent', 0, 4, 103, NULL, 1, 'Klientas Nr. 101 adresas gal', 'Kaunas', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(51, '2025-11-03 00:00:00', 23.99, 'butent', 0, 4, 104, NULL, 1, 'Klientas Nr. 102 adresas', 'taip', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(52, '2025-11-03 00:00:00', 105.36, 'butent', 0, 4, 105, 149, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(53, '2025-11-03 00:00:00', 123.99, 'butent', 0, 4, 106, NULL, 1, 'Klientas Nr. 104 adresasadfadf', 'adg', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(54, '2025-11-03 00:00:00', 23.18, 'butent', 0, 4, 107, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(55, '2025-11-03 00:00:00', 51.93, 'butent', 0, 4, 108, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(56, '2025-11-03 00:00:00', 38.99, 'butent', 0, 3, 109, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(58, '2026-03-09 00:00:00', 36.28, '2123', 5, 3, 2, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(59, '2026-03-12 00:00:00', 121, 'butent', 0, 3, 102, 154, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(60, '2026-03-16 00:00:00', 14.52, '123', 0, 4, 110, NULL, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(61, '2025-11-03 00:00:00', 23.18, 'butent', 0, 4, 107, 151, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(62, '2025-11-03 00:00:00', 51.93, 'butent', 0, 4, 108, NULL, 1, 'Klientas Nr. 106 adresas', '', 'Prancūzijos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(63, '2025-11-03 00:00:00', 88.98, 'butent', 0, 4, 109, NULL, 1, 'Klientas Nr. 107 adresas', '', '', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(64, '2026-04-01 00:00:00', 14.51, '', 0, 3, 12, NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(65, '2026-04-01 00:00:00', 186.23, '', 0, 3, 12, NULL, 1, 'Klientas 10 adresas', 'kaunas', 'lietuva', '123', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, '2026-04-02 00:00:00', 181.42, '', 0, 3, 12, NULL, 1, '123', 'Kaunas', 'Lietuvos Respublika', '+37063850850', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(67, '2026-04-03 00:00:00', 580.44, '', 0, 3, 12, NULL, 1, '123', 'Kaunas', 'Lietuvos Respublika', '+37063850850', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(68, '2026-04-07 00:00:00', 157.19, '', 0, 3, 12, NULL, 1, '123', 'Kaunas', 'Lietuvos Respublika', '+37063850850', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(69, '2026-04-11 00:00:00', 418.37, '', 0, 3, 2, NULL, 1, 'Studentu g 2A', 'kaunas', 'Lietuva', '+37063850850', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(70, '2026-04-11 00:00:00', 1048.65, '', 0, 3, 2, NULL, 1, 'Studentu g 2A', 'kaunas', 'Lietuva', '+37063850850', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(72, '2026-04-11 00:00:00', 714.78, '', 0, 3, 2, NULL, 1, 'Studentu g 2A', 'kaunas', 'Lietuva', '+37063850850', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(73, '2026-04-11 00:00:00', 47.15, '', 0, 5, 2, NULL, 1, 'Studentu g 2A', 'kaunas', 'Lietuva', '+37063850850', NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(75, '2026-04-15 00:00:00', 15.72, '', 0, 5, 2, NULL, 1, 'Studentu g 2A', 'kaunas', 'Lietuva', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(77, '2026-04-28 00:00:00', 587.82, '', 0, 3, 114, NULL, 1, 'Vilniaus g. 2', 'Kaunas', 'Lietuva', '+37060000000', NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(78, '2026-04-28 00:00:00', 461.93, '', 0, 4, 114, NULL, 1, 'Vilniaus g. 2', 'Kaunas', 'Lietuva', '+37060000000', NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(79, '2025-11-03 00:00:00', 507.17, 'butent', 0, 4, 103, NULL, 1, 'Klientas Nr. 101 adresas', '', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(80, '2025-11-03 00:00:00', 100.88, 'butent', 0, 4, 104, NULL, 1, 'Klientas Nr. 102 adresas', '', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(81, '2025-11-03 00:00:00', 109.32, 'butent', 0, 4, 106, NULL, 1, 'Klientas Nr. 104 adresas', '', 'Lenkijos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(82, '2025-11-03 00:00:00', 23.99, 'butent', 0, 4, 104, 148, 1, 'Klientas Nr. 102 adresas', '', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(83, '2025-11-03 00:00:00', 109.4, 'butent', 0, 4, 106, NULL, 1, 'Klientas Nr. 104 adresas', '', 'Lenkijos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(84, '2023-05-03 00:00:00', 49, 'butent', 0, 4, 12, 5, 1, NULL, 'Kaunas', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(85, '2025-11-03 00:00:00', 507.18, 'butent', 0, 4, 103, 147, 1, 'Klientas Nr. 101 adresas', '', 'Lietuvos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(86, '2025-11-03 00:00:00', 38.35, 'butent', 0, 4, 109, 153, 1, 'Klientas Nr. 107 adresas', '', '', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(87, '2025-11-03 00:00:00', 51.51, 'butent', 0, 4, 108, 152, 1, 'Klientas Nr. 106 adresas', NULL, 'Prancūzijos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(88, '2025-11-03 00:00:00', 108.1, 'butent', 0, 4, 106, 150, 1, 'Klientas Nr. 104 adresas', '', 'Lenkijos Respublika', NULL, NULL, 'HOME', NULL, NULL, NULL, NULL, NULL),
(89, '2026-04-29 00:00:00', 137.86, '', 0, 4, 2, NULL, 1, 'Studentu g 2A', 'kaunas', 'Lietuva', '+3706000000', 1, 'HOME', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ordersproduct`
--

CREATE TABLE `ordersproduct` (
  `id_OrdersProduct` int(11) NOT NULL,
  `quantity` double NOT NULL,
  `unitPrice` double NOT NULL,
  `vatValue` double NOT NULL,
  `fk_Ordersid_Orders` int(11) NOT NULL,
  `fk_Productid_Product` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ordersproduct`
--

INSERT INTO `ordersproduct` (`id_OrdersProduct`, `quantity`, `unitPrice`, `vatValue`, `fk_Ordersid_Orders`, `fk_Productid_Product`) VALUES
(2, 1, 8.264, 1.74, 2, 18),
(3, 1, 578.51, 121.49, 3, 18),
(4, 1.08, 180, 37.8, 4, 19),
(5, 8.455, 270, 56.7, 4, 20),
(6, 8.303, 270, 56.7, 4, 21),
(7, 43, 20.93, 4.4, 5, 7),
(8, 33, 7, 1.47, 5, 3),
(9, 0.263, 1450, 304.5, 6, 22),
(10, 0.073, 1170, 245.7, 6, 22),
(11, 0.704, 1100, 231, 6, 23),
(12, 0.653, 900, 189, 6, 24),
(13, 1, 24.79, 5.21, 7, 11),
(14, 1, 15.7, 3.3, 8, 5),
(15, 10, 15.7, 3.3, 9, 8),
(16, 1, 33.06, 6.94, 10, 5),
(17, 1, 16.53, 3.47, 11, 10),
(18, 1, 43.8, 9.2, 12, 5),
(19, 1, 49.59, 10.41, 13, 3),
(20, 1, 16.53, 3.47, 14, 3),
(21, 1, 37.19, 7.81, 15, 11),
(22, 1, 57.85, 12.15, 16, 10),
(23, 1, 53.72, 11.28, 17, 11),
(24, 1, 8.265, 1.74, 18, 3),
(25, 4, 145, 30.45, 19, 35),
(26, 1, 57.85, 12.15, 20, 8),
(27, 1, 14.05, 2.95, 21, 10),
(28, 1, 16.53, 3.47, 22, 5),
(29, 1, 1074.38, 225.62, 23, 10),
(30, 1, 16.52, 3.47, 24, 5),
(31, 1, 24.79, 5.21, 25, 3),
(32, 1, 41.32, 8.68, 26, 3),
(33, 1, 13.64, 2.86, 27, 10),
(34, 1, 69.67, 14.63, 28, 5),
(35, 1, 48.76, 10.24, 29, 3),
(36, 1, 17.355, 3.64, 30, 8),
(37, 1, 10.74, 2.26, 31, 9),
(38, 1, 11.57, 2.43, 32, 3),
(39, 1, 16.94, 3.56, 33, 8),
(40, 1, 12.4, 2.6, 34, 3),
(41, 1, 40.496, 8.5, 35, 8),
(42, 1, 18.18, 3.82, 36, 3),
(43, 1, 16.53, 3.47, 37, 10),
(44, 1, 10.65, 2.24, 38, 3),
(45, 1, 53.72, 11.28, 39, 10),
(46, 1, 41.32, 8.68, 40, 10),
(47, 3, 110.193, 23.14, 41, 8),
(48, 5, 11.57, 2.43, 42, 3),
(49, 3, 27.548, 5.79, 42, 40),
(50, 2, 8.264, 1.74, 43, 40),
(51, 1, 10.74, 2.26, 44, 10),
(52, 1, 537.19, 112.81, 45, 10),
(53, 1, 14.05, 2.95, 46, 40),
(54, 1, 14.05, 2.95, 47, 40),
(55, 1, 47.93, 10.07, 48, 40),
(56, 1, 81.82, 17.18, 49, 41),
(57, 1, 20.65, 4.34, 49, 42),
(62, 1, 82.64, 17.35, 52, 41),
(63, 1, 22.72, 4.77, 52, 42),
(85, 5, 20, 4.2, 59, 26),
(86, 1, 12, 2.52, 60, 46),
(95, 1, 16.52, 3.47, 61, 41),
(96, 1, 2.64, 0.55, 61, 42),
(103, 1, 20.66, 4.3386, 56, 41),
(104, 1, 11.56, 2.4276, 56, 42),
(105, 1, 28.88, 6.0648, 55, 41),
(106, 1, 14.04, 2.9484, 55, 42),
(107, 1, 16.52, 3.4692, 54, 41),
(108, 1, 2.64, 0.5544, 54, 42),
(109, 1, 14.99, 3.1479, 58, 44),
(110, 1, 14.99, 3.1479, 58, 44),
(116, 1, 11.99, 2.5179, 64, 2),
(118, 1, 19.99, 4.1979, 65, 9),
(119, 6, 16.99, 3.5678999999999994, 65, 6),
(120, 2, 15.99, 3.3579, 65, 5),
(121, 2, 14.99, 3.1479, 66, 4),
(122, 5, 23.99, 5.0379, 66, 13),
(123, 10, 11.99, 2.5179, 67, 1),
(124, 10, 12.99, 2.7279, 67, 2),
(125, 10, 22.99, 4.8279, 67, 12),
(126, 1, 14.99, 3.1479, 68, 4),
(127, 5, 13.99, 2.9379, 68, 3),
(128, 3, 14.99, 3.1479, 68, 6),
(132, 15, 11.99, 2.5179, 69, 1),
(133, 2, 19.99, 4.1979, 69, 9),
(134, 7, 17.99, 3.7778999999999994, 69, 7),
(150, 10, 14.99, 3.1479, 70, 4),
(151, 13, 32.99, 6.9279, 70, 22),
(152, 12, 23.99, 5.0379, 70, 13),
(155, 12, 12.99, 2.7279, 72, 2),
(156, 15, 28.99, 6.087899999999999, 72, 18),
(177, 3, 12.99, 2.7279, 73, 4),
(179, 1, 12.99, 2.7279, 75, 2),
(183, 5, 11.99, 2.5179, 77, 1),
(184, 13, 27.99, 5.8778999999999995, 77, 17),
(185, 2, 30.99, 6.507899999999999, 77, 20),
(186, 14, 12.99, 2.7279, 78, 2),
(187, 8, 15.99, 3.3579, 78, 5),
(188, 2, 35.99, 7.5579, 78, 25),
(189, 3, 12.12, 2.5452, 53, 42),
(190, 1, 49.59, 10.4139, 53, 41),
(191, 1, 16.52, 3.4692, 53, 42),
(192, 1, 413.21, 86.77409999999999, 50, 41),
(193, 1, 5.94, 1.2474, 50, 42),
(194, 1, 16.12, 3.3852, 51, 3),
(195, 1, 3.71, 0.7791, 51, 42),
(209, 2, 12.12, 2.5452, 81, 42),
(210, 1, 49.59, 10.4139, 81, 41),
(211, 1, 16.52, 3.4692, 81, 42),
(234, 1, 413.21, 86.77409999999999, 79, 2),
(235, 1, 5.94, 1.2474, 79, 42),
(236, 2, 36.12, 7.5851999999999995, 80, 1),
(237, 3, 3.71, 0.7791, 80, 42),
(238, 3, 20.66, 4.3386, 63, 2),
(239, 1, 11.56, 2.4276, 63, 42),
(240, 1, 40.49, 8.5029, 1, 1),
(241, 1, 40.49, 8.5, 84, 18),
(244, 1, 20.66, 4.34, 86, 41),
(245, 1, 11.56, 2.43, 86, 42),
(246, 1, 28.88, 6.0648, 62, 1),
(247, 1, 14.04, 2.9484, 62, 42),
(248, 1, 28.88, 6.06, 87, 41),
(249, 1, 14.04, 2.95, 87, 42),
(250, 2, 12.15, 2.5515, 83, 42),
(251, 1, 49.59, 10.4139, 83, 41),
(252, 1, 16.52, 3.4692, 83, 42),
(258, 1, 16.12, 3.39, 82, 41),
(259, 1, 3.71, 0.78, 82, 42),
(263, 2, 12.12, 2.55, 88, 42),
(264, 1, 49.59, 10.41, 88, 41),
(265, 1, 16.52, 3.47, 88, 42),
(268, 1, 413.21, 86.77, 85, 41),
(269, 1, 5.94, 1.25, 85, 42),
(279, 1, 13.99, 2.9379, 89, 3),
(280, 4, 15.99, 3.3579, 89, 5),
(281, 2, 17.99, 3.7778999999999994, 89, 7);

-- --------------------------------------------------------

--
-- Table structure for table `orderstatus`
--

CREATE TABLE `orderstatus` (
  `id_OrderStatus` int(11) NOT NULL,
  `name` char(21) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderstatus`
--

INSERT INTO `orderstatus` (`id_OrderStatus`, `name`) VALUES
(1, 'Awaiting confirmation'),
(2, 'Cancelled'),
(3, 'Completed'),
(4, 'In progress'),
(5, 'Sent');

-- --------------------------------------------------------

--
-- Table structure for table `package`
--

CREATE TABLE `package` (
  `id_Package` int(11) NOT NULL,
  `creationDate` datetime NOT NULL DEFAULT current_timestamp(),
  `labelFile` varchar(500) DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `fk_Shipmentid_Shipment` int(11) NOT NULL,
  `trackingNumber` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `package`
--

INSERT INTO `package` (`id_Package`, `creationDate`, `labelFile`, `weight`, `fk_Shipmentid_Shipment`, `trackingNumber`) VALUES
(59, '2026-03-27 10:52:20', '/labels/70/label_1.pdf', 12, 70, '99991000000040'),
(60, '2026-03-27 10:52:20', '/labels/70/label_2.pdf', 12, 70, '99991000000041'),
(61, '2026-03-27 10:53:04', '/labels/71/label_1.pdf', 12, 71, 'PKG-1-59-1774608784-1811'),
(62, '2026-03-27 10:53:04', '/labels/71/label_2.pdf', 12, 71, 'PKG-1-59-1774608784-3942'),
(63, '2026-04-01 12:34:29', '/labels/72/label_1.pdf', 12, 72, 'PKG-1-64-1775046868-4176'),
(64, '2026-04-01 13:20:08', '/labels/75/label_1.pdf', 12, 75, '99991000000042'),
(65, '2026-04-01 13:20:08', '/labels/75/label_2.pdf', 13, 75, '99991000000043'),
(66, '2026-04-02 05:56:24', '/labels/76/label_1.pdf', 15, 76, '99991000000044'),
(67, '2026-04-02 05:56:24', '/labels/76/label_2.pdf', 12, 76, '99991000000045'),
(68, '2026-04-03 08:09:05', '/labels/77/label_1.pdf', 12, 77, '99991000000046'),
(69, '2026-04-03 08:09:05', '/labels/77/label_2.pdf', 18, 77, '99991000000047'),
(70, '2026-04-03 08:09:05', '/labels/77/label_3.pdf', 20, 77, '99991000000048'),
(71, '2026-04-07 08:07:26', '/labels/78/label_1.pdf', 15, 78, '99991000000049'),
(72, '2026-04-07 08:07:26', '/labels/78/label_2.pdf', 12, 78, '99991000097508'),
(76, '2026-04-08 15:31:10', '/labels/81/label_1.pdf', 1, 81, 'RET-1-7-1775662270-3473'),
(77, '2026-04-09 08:37:27', '/labels/82/label_1.pdf', 1, 82, '99991000097571'),
(78, '2026-04-11 11:21:36', '/labels/83/label_1.pdf', 15, 83, '99991000097572'),
(79, '2026-04-11 11:21:36', '/labels/83/label_2.pdf', 13, 83, '99991000097573'),
(80, '2026-04-11 11:21:36', '/labels/83/label_3.pdf', 16, 83, '99991000097574'),
(81, '2026-04-11 12:30:40', '/labels/84/label_1.pdf', 1, 84, 'RET-1-9-1775910640-5384'),
(82, '2026-04-11 12:30:40', '/labels/84/label_2.pdf', 1, 84, 'RET-1-9-1775910640-4530'),
(83, '2026-04-11 13:10:00', '/labels/85/label_1.pdf', 20, 85, 'PKG-1-70-1775913000-9634'),
(84, '2026-04-11 13:10:00', '/labels/85/label_2.pdf', 14, 85, 'PKG-1-70-1775913000-2208'),
(85, '2026-04-11 13:10:00', '/labels/85/label_3.pdf', 22, 85, 'PKG-1-70-1775913000-8018'),
(86, '2026-04-11 13:16:13', '/labels/86/label_1.pdf', 1, 86, 'RET-1-10-1775913373-5530'),
(92, '2026-04-11 15:49:00', '/labels/89/label_1.pdf', 12, 89, 'PKG-1-72-1775922540-9910'),
(93, '2026-04-11 15:49:00', '/labels/89/label_2.pdf', 13, 89, 'PKG-1-72-1775922540-8871'),
(94, '2026-04-11 15:54:20', '/labels/90/label_1.pdf', 1, 90, 'RET-1-12-1775922860-1400'),
(95, '2026-04-11 15:54:20', '/labels/90/label_2.pdf', 1, 90, 'RET-1-12-1775922860-8343'),
(104, '2026-04-16 06:01:53', '/labels/96/label_1.pdf', 12, 96, 'PKG-1-73-1776319313-6783'),
(105, '2026-04-16 06:04:23', '/labels/97/label_1.pdf', 1, 97, '99991000097575'),
(107, '2026-04-16 06:07:16', '/labels/99/label_1.pdf', 12, 99, 'PKG-1-75-1776319636-7758'),
(108, '2026-04-28 11:29:14', '/labels/100/label_1.pdf', 12, 100, 'PKG-1-77-1777375753-4550'),
(109, '2026-04-28 11:29:14', '/labels/100/label_2.pdf', 15, 100, 'PKG-1-77-1777375754-4380'),
(110, '2026-04-28 15:37:12', '/labels/101/label_1.pdf', 12, 101, 'PKG-1-78-1777390632-6816'),
(111, '2026-04-28 15:37:12', '/labels/101/label_2.pdf', 15, 101, 'PKG-1-78-1777390632-1468'),
(112, '2026-04-28 15:42:39', '/labels/102/label_1.pdf', 1, 102, '99991000097577'),
(113, '2026-04-28 15:42:39', '/labels/102/label_2.pdf', 1, 102, '99991000097578');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id_Product` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `currency` varchar(15) DEFAULT NULL,
  `canTheProductBeProductReturned` tinyint(1) NOT NULL DEFAULT 0,
  `countableItem` tinyint(1) NOT NULL DEFAULT 0,
  `unit` varchar(6) NOT NULL DEFAULT 'vnt',
  `shipping_mode` varchar(255) DEFAULT NULL,
  `vat` tinyint(1) NOT NULL DEFAULT 1,
  `creationDate` datetime DEFAULT current_timestamp(),
  `externalCode` int(11) DEFAULT NULL,
  `fk_Companyid_Company` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id_Product`, `name`, `description`, `price`, `currency`, `canTheProductBeProductReturned`, `countableItem`, `unit`, `shipping_mode`, `vat`, `creationDate`, `externalCode`, `fk_Companyid_Company`) VALUES
(1, 'Prekė Nr. 1', 'asdasdas', 11.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2019-10-22 16:07:00', 1, 1),
(2, 'Prekė Nr. 2', NULL, 12.99, 'EUR', 1, 1, 'vnt', NULL, 1, '2019-10-22 16:10:00', 2, 1),
(3, 'Prekė Nr. 3', NULL, 13.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:08:00', 3, 1),
(4, 'Prekė Nr. 4', NULL, 14.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:09:00', 4, 1),
(5, 'Prekė Nr. 5', NULL, 15.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:10:00', 5, 1),
(6, 'Prekė Nr. 6', NULL, 16.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:10:00', 6, 1),
(7, 'Prekė Nr. 7', NULL, 17.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:10:00', 7, 1),
(8, 'Prekė Nr. 8', NULL, 18.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:14:00', 8, 1),
(9, 'Prekė Nr. 9', NULL, 19.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:15:00', 9, 1),
(10, 'Prekė Nr. 10', NULL, 20.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:15:00', 10, 1),
(11, 'Prekė Nr. 11', NULL, 21.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:15:00', 11, 1),
(12, 'Prekė Nr. 12', 'adadfd', 22.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 19:16:00', 12, 1),
(13, 'Prekė Nr. 13', NULL, 23.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-06-10 20:23:00', 13, 1),
(14, 'Prekė Nr. 14', NULL, 24.99, 'EUR', 1, 1, 'vnt', NULL, 1, '2023-06-10 20:32:00', 14, 1),
(15, 'Prekė Nr. 15', 'asdasd', 25.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:23:00', 15, 1),
(16, 'Prekė Nr. 16', '123', 26.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:24:00', 16, 1),
(17, 'Prekė Nr. 17', NULL, 27.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:24:00', 17, 1),
(18, 'Prekė Nr. 18', NULL, 28.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:33:00', 18, 1),
(19, 'Prekė Nr. 19', NULL, 29.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:41:00', 19, 1),
(20, 'Prekė Nr. 20', NULL, 30.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:45:00', 20, 1),
(21, 'Prekė Nr. 21', NULL, 31.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:46:00', 21, 1),
(22, 'Prekė Nr. 22', NULL, 32.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:54:00', 22, 1),
(23, 'Prekė Nr. 23', NULL, 33.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:55:00', 23, 1),
(24, 'Prekė Nr. 24', NULL, 34.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-10 21:55:00', 24, 1),
(25, 'Prekė Nr. 25', NULL, 35.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-06-21 07:29:00', 25, 1),
(26, 'Prekė Nr. 26', NULL, 36.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-06-21 07:45:00', 26, 1),
(27, 'Prekė Nr. 27', NULL, 37.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-06-21 19:32:00', 27, 1),
(28, 'Prekė Nr. 28', NULL, 38.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-06-21 19:42:00', 28, 1),
(29, 'Prekė Nr. 29', NULL, 39.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-06-21 19:53:00', 29, 1),
(30, 'Prekė Nr. 30', NULL, 40.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-06-21 19:58:00', 30, 1),
(31, 'Prekė Nr. 31', NULL, 41.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-07-02 21:24:00', 31, 1),
(32, 'Prekė Nr. 32', NULL, 42.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-07-10 21:23:00', 32, 1),
(33, 'Prekė Nr. 33', NULL, 43.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-07-10 21:28:00', 33, 1),
(34, 'Prekė Nr. 34', NULL, 44.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-07-10 21:46:00', 34, 1),
(35, 'Prekė Nr. 35', NULL, 45.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-07-13 22:33:00', 35, 1),
(36, 'Prekė Nr. 36', NULL, 46.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-07-17 20:02:00', 36, 1),
(37, 'Prekė Nr. 37', NULL, 47.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-07-19 21:27:00', 37, 1),
(38, 'Prekė Nr. 38', NULL, 48.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-07-19 21:37:00', 38, 1),
(39, 'Prekė Nr. 39', NULL, 49.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-07-19 21:38:00', 39, 1),
(40, 'Prekė Nr. 40', NULL, 50.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2023-07-21 18:03:00', 40, 1),
(41, 'Prekė Nr. 41', NULL, 51.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-08-17 12:07:00', 41, 1),
(42, 'Prekė Nr. 42', NULL, 52.99, 'EUR', 0, 0, 'vnt', NULL, 1, '2023-08-17 12:07:00', 42, 1),
(44, '123', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 123, NULL, 1, 1, 'vnt', NULL, 1, '2026-03-09 13:25:24', NULL, 1),
(45, 'Automobilis VW', NULL, 63.99, 'EUR', 1, 0, 'vnt', NULL, 1, '2026-03-13 12:43:41', 43, 1),
(46, '123', '123', 12, NULL, 1, 1, 'vnt', NULL, 1, '2026-03-16 09:51:05', NULL, 2);

-- --------------------------------------------------------

--
-- Table structure for table `productcategory`
--

CREATE TABLE `productcategory` (
  `fk_Productid_Product` int(11) NOT NULL,
  `fk_Categoryid_Category` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productcategory`
--

INSERT INTO `productcategory` (`fk_Productid_Product`, `fk_Categoryid_Category`) VALUES
(1, 1),
(13, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(30, 1),
(31, 1),
(32, 1),
(34, 1),
(38, 1),
(39, 1),
(41, 1),
(42, 1),
(44, 1),
(46, 1),
(2, 2),
(3, 2),
(4, 2),
(5, 2),
(6, 2),
(7, 2),
(8, 2),
(9, 2),
(10, 2),
(11, 2),
(12, 2),
(14, 2),
(15, 2),
(16, 2),
(17, 2),
(18, 2),
(19, 2),
(20, 2),
(21, 2),
(22, 2),
(23, 2),
(24, 2),
(29, 2),
(33, 2),
(35, 2),
(36, 2),
(37, 2),
(40, 2),
(45, 3);

-- --------------------------------------------------------

--
-- Table structure for table `productgroup`
--

CREATE TABLE `productgroup` (
  `id_ProductGroup` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productgroup`
--

INSERT INTO `productgroup` (`id_ProductGroup`, `name`) VALUES
(1, 'Gaunamos paslaugos'),
(2, 'Prekės skirtos perparduoti'),
(3, 'Prekės be skaičiuojamo likučio'),
(4, 'Kuras'),
(5, 'Inventorius'),
(6, 'Transporto priemonės');

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id_ProductImage` int(11) NOT NULL,
  `fk_Productid_Product` int(11) NOT NULL,
  `url` varchar(500) NOT NULL,
  `isPrimary` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `sortOrder` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id_ProductImage`, `fk_Productid_Product`, `url`, `isPrimary`, `createdAt`, `sortOrder`) VALUES
(3, 44, '/uploads/products/44/b580a7c27d0146cdbb4cec25539781a6.jpg', 1, '2026-03-09 15:25:24', 0),
(4, 44, '/uploads/products/44/29ec13b4432c45e094d9eba8677c3f10.jpg', 0, '2026-03-09 15:25:24', 1),
(5, 44, '/uploads/products/44/0ee48a4b7c66494cbded200434dfb0ad.jpg', 0, '2026-03-10 16:13:35', 2),
(6, 44, '/uploads/products/44/d442eeae51054e1cbdfefceb2ae7d56a.jpg', 0, '2026-03-10 16:13:35', 3),
(7, 44, '/uploads/products/44/ab478f4d18f7458aa4bc41e75ff83673.jpg', 0, '2026-03-10 16:13:35', 4),
(8, 44, '/uploads/products/44/9f622efb0c8245eca71027fae2f43e0f.jpg', 0, '2026-03-10 16:13:35', 5),
(9, 44, '/uploads/products/44/4f138cdcfbb543e8b8975e3f69a5737b.jpg', 0, '2026-03-10 16:20:36', 6),
(10, 44, '/uploads/products/44/443ef893d1644b29b80ec1616fc76aa5.jpg', 0, '2026-03-10 16:20:36', 7),
(11, 44, '/uploads/products/44/19df31fa35b145509e5b61c77f7e0fe0.jpg', 0, '2026-03-10 16:20:36', 8),
(12, 44, '/uploads/products/44/ba94edb1be5b4a059fb9f36d9bf35996.jpg', 0, '2026-03-10 16:20:36', 9),
(15, 1, '/uploads/products/1/089004e913384fbebdb1631434e8b0c8.jpg', 1, '2026-04-29 12:51:56', 0),
(16, 15, '/uploads/products/15/4f3d1c511bce418fb27db49c23d29b3c.jpg', 1, '2026-04-29 12:52:17', 0),
(17, 12, '/uploads/products/12/dda0f6a20d73434e93bdadd9a10ea611.jpg', 1, '2026-04-29 12:52:42', 0),
(18, 16, '/uploads/products/16/456dfc29194d4b889dfe5a48c27ecc9c.jpg', 1, '2026-04-29 13:40:49', 0),
(19, 45, '/uploads/products/45/90b52b762315434da9e48bdf4bb60df9.jpg', 1, '2026-04-29 15:14:07', 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_productgroup`
--

CREATE TABLE `product_productgroup` (
  `fk_Productid_Product` int(11) NOT NULL,
  `fk_ProductGroupId_ProductGroup` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_productgroup`
--

INSERT INTO `product_productgroup` (`fk_Productid_Product`, `fk_ProductGroupId_ProductGroup`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 3),
(5, 3),
(6, 3),
(7, 3),
(8, 3),
(9, 3),
(10, 3),
(11, 3),
(12, 3),
(13, 1),
(14, 4),
(15, 5),
(16, 5),
(17, 5),
(18, 3),
(19, 3),
(20, 3),
(21, 3),
(22, 3),
(23, 3),
(24, 3),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 5),
(30, 1),
(31, 1),
(32, 1),
(33, 5),
(34, 1),
(35, 3),
(36, 5),
(37, 5),
(38, 1),
(39, 1),
(40, 3),
(41, 1),
(42, 1),
(44, 1),
(45, 6),
(46, 2);

-- --------------------------------------------------------

--
-- Table structure for table `product_returns`
--

CREATE TABLE `product_returns` (
  `id_Returns` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp(),
  `fk_ReturnStatusTypeid_ReturnStatusType` int(11) NOT NULL,
  `fk_Clientid_Users` int(11) NOT NULL,
  `fk_Adminid_Users` int(11) DEFAULT NULL,
  `fk_Companyid_Company` int(11) NOT NULL,
  `fk_ordersid_orders` int(11) DEFAULT NULL,
  `returnMethod` varchar(30) NOT NULL DEFAULT 'CUSTOM',
  `returnCourierId` int(11) DEFAULT NULL,
  `employeeNote` varchar(1000) DEFAULT NULL,
  `clientNote` varchar(1000) DEFAULT NULL,
  `returnStreet` varchar(255) DEFAULT NULL,
  `returnCity` varchar(100) DEFAULT NULL,
  `returnPostalCode` varchar(20) DEFAULT NULL,
  `returnCountry` varchar(100) DEFAULT NULL,
  `fk_Courierid_Courier` int(11) DEFAULT NULL,
  `returnLockerId` varchar(100) DEFAULT NULL,
  `returnLockerName` varchar(200) DEFAULT NULL,
  `returnLockerAddress` varchar(300) DEFAULT NULL,
  `returnLat` double DEFAULT NULL,
  `returnLng` double DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_returns`
--

INSERT INTO `product_returns` (`id_Returns`, `date`, `fk_ReturnStatusTypeid_ReturnStatusType`, `fk_Clientid_Users`, `fk_Adminid_Users`, `fk_Companyid_Company`, `fk_ordersid_orders`, `returnMethod`, `returnCourierId`, `employeeNote`, `clientNote`, `returnStreet`, `returnCity`, `returnPostalCode`, `returnCountry`, `fk_Courierid_Courier`, `returnLockerId`, `returnLockerName`, `returnLockerAddress`, `returnLat`, `returnLng`) VALUES
(7, '2026-04-08 15:30:25', 7, 12, 1, 1, 68, 'CUSTOM', NULL, 'Yes to some', 'Negerai', '123', 'Kaunas', 'LT-50121', 'LIETUVOS RESPUBLIKA', NULL, NULL, NULL, NULL, NULL, NULL),
(8, '2026-04-09 08:34:10', 7, 12, 1, 1, 67, 'DPD', NULL, 'Pateikta', 'Nepatiko', NULL, 'VILNIUS', '09131', 'LIETUVOS RESPUBLIKA', 2, 'LT90003', 'Žirmūnų RIMI DPD paštomatas 003', 'ŽIRMŪNŲ G. 64, VILNIUS', 54.71196, 25.30082),
(9, '2026-04-11 12:29:04', 7, 2, 1, 1, 69, 'CUSTOM', NULL, 'Viskas gerai', 'Nepatiko preke', 'Studentu g 2A', 'Kaunas', 'LT-50121', 'LIETUVA', NULL, NULL, NULL, NULL, NULL, NULL),
(10, '2026-04-11 13:14:42', 7, 2, 1, 1, 70, 'CUSTOM', NULL, 'Matosi kad vienas gerai kitas negerai', 'Labai viskas gerai tik netiko dyžiai del to ir grąžinu vinis tai va tiek žinių', 'Studentu g 2A', 'Kaunas', 'LT-50121', 'LIETUVA', NULL, NULL, NULL, NULL, NULL, NULL),
(12, '2026-04-11 15:52:04', 7, 2, 1, 1, 72, 'CUSTOM', NULL, 'yes yes yes', 'Man patiko', 'Studentu g 2A', 'kaunas', 'LT-50121', 'LIETUVA', NULL, NULL, NULL, NULL, NULL, NULL),
(13, '2026-04-16 06:03:54', 7, 2, 1, 1, 73, 'DPD', NULL, 'viskas gerai', 'asdasd', NULL, 'VILNIUS', '09131', 'LIETUVA', 2, 'LT90003', 'Žirmūnų RIMI DPD paštomatas 003', 'ŽIRMŪNŲ G. 64, VILNIUS', 54.71196, 25.30082),
(14, '2026-04-28 13:23:27', 7, 114, 1, 1, 77, 'DPD', NULL, 'Prekės atitiko grąžinimo reikalavimus', NULL, NULL, 'VILNIUS', '12110', 'LIETUVA', 2, 'LT90002', 'PC DomusPro DPD paštomatas 002', 'UKMERGĖS G. 308, VILNIUS', 54.73997, 25.22529);

-- --------------------------------------------------------

--
-- Table structure for table `return_item`
--

CREATE TABLE `return_item` (
  `id_ReturnItem` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `reasonId` int(11) DEFAULT NULL,
  `evaluationComment` varchar(1000) DEFAULT NULL,
  `evaluation` tinyint(1) DEFAULT NULL,
  `evaluationDate` date DEFAULT NULL,
  `returnSubTotal` double NOT NULL DEFAULT 0,
  `imageUrls` text DEFAULT NULL,
  `fk_Returnsid_Returns` int(11) NOT NULL,
  `fk_OrdersProductid_OrdersProduct` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_item`
--

INSERT INTO `return_item` (`id_ReturnItem`, `quantity`, `reason`, `reasonId`, `evaluationComment`, `evaluation`, `evaluationDate`, `returnSubTotal`, `imageUrls`, `fk_Returnsid_Returns`, `fk_OrdersProductid_OrdersProduct`) VALUES
(11, 3, '', 1, 'No', 0, '2026-04-08', 44.97, '[\"/uploads/returns/7/759ef8f968b4455baee99a66e77420b0.png\"]', 7, 128),
(12, 1, '', 6, 'Yes', 1, '2026-04-08', 14.99, '[\"/uploads/returns/7/4bd0824aa22944be8d8869e11be5d70e.jpg\"]', 7, 126),
(13, 2, '', 2, 'Ne', 0, '2026-04-09', 25.98, '[\"/uploads/returns/8/ce87e789ea224e34a26eb57badb155d4.jpg\"]', 8, 124),
(14, 2, '', 3, 'Taip', 1, '2026-04-09', 45.98, '[\"/uploads/returns/8/019400b25d9c42ccb6dcee0e6a005f71.jpg\"]', 8, 125),
(15, 2, '', 6, 'Viskas good', 1, '2026-04-11', 39.98, '[\"/uploads/returns/9/677b5dbb2b7248778482c6c9531a5166.jpg\"]', 9, 133),
(16, 3, '', 3, 'viskas good', 1, '2026-04-11', 53.97, '[\"/uploads/returns/9/135b981f23e54db7bc2247bae9c5ba61.jpg\"]', 9, 134),
(17, 4, '', 2, 'Gerai', 1, '2026-04-11', 59.96, '[\"/uploads/returns/10/36b93e3c9b4a49d8bf2a3b6dd5ce8f76.jpg\"]', 10, 150),
(18, 4, '', 3, 'Negerai', 0, '2026-04-11', 131.96, '[\"/uploads/returns/10/4e3f9f4a2a4a4e748253e313d781d3b8.jpg\"]', 10, 151),
(21, 3, '', 2, 'yes yes', 1, '2026-04-11', 38.97, '[\"/uploads/returns/12/97eb0bb150b342b489498317f42d32cf.jpg\"]', 12, 155),
(22, 4, '', 2, 'yes', 1, '2026-04-11', 115.96, '[\"/uploads/returns/12/8066e2cbe42d4cabbe6e33e2e829c781.jpg\"]', 12, 156),
(23, 1, NULL, 2, 'primtas', 1, '2026-04-16', 12.99, '[\"/uploads/returns/13/1bc3e2d24808421ab38ec2124b84b1ab.jpg\"]', 13, 177),
(24, 7, NULL, 1, 'Priimtas, nes daiktas buvo pažeistas', 1, '2026-04-28', 195.92999999999998, '[\"/uploads/returns/14/5b007765b38a486ca731459beb458237.png\"]', 14, 184),
(25, 1, NULL, 3, 'Priimtas, nes klientui netiko dydis', 1, '2026-04-28', 30.99, '[\"/uploads/returns/14/e9c1aca7ef53494181e2add815c62c3c.jpg\"]', 14, 185);

-- --------------------------------------------------------

--
-- Table structure for table `return_reason`
--

CREATE TABLE `return_reason` (
  `id_ReturnReason` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_reason`
--

INSERT INTO `return_reason` (`id_ReturnReason`, `name`) VALUES
(1, 'Pažeistas'),
(2, 'Neatitinka aprašymo'),
(3, 'Netinkamas dydis'),
(4, 'Apsigalvojau'),
(5, 'Bloga kokybė'),
(6, 'Neveikia');

-- --------------------------------------------------------

--
-- Table structure for table `return_status_type`
--

CREATE TABLE `return_status_type` (
  `id_ReturnStatusType` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_status_type`
--

INSERT INTO `return_status_type` (`id_ReturnStatusType`, `name`) VALUES
(6, 'Atmestas'),
(7, 'Etiketės paruoštos'),
(3, 'Gauta'),
(5, 'Patvirtintas'),
(1, 'Sukurtas'),
(4, 'Užbaigta'),
(2, 'Vertinamas');

-- --------------------------------------------------------

--
-- Table structure for table `shipment`
--

CREATE TABLE `shipment` (
  `id_Shipment` int(11) NOT NULL,
  `trackingNumber` varchar(100) DEFAULT NULL,
  `shippingDate` datetime DEFAULT NULL,
  `estimatedDeliveryDate` datetime DEFAULT NULL,
  `DeliveryLat` double DEFAULT NULL,
  `DeliveryLng` double DEFAULT NULL,
  `fk_Courierid_Courier` int(11) DEFAULT NULL,
  `fk_Ordersid_Orders` int(11) NOT NULL,
  `fk_Companyid_Company` int(11) NOT NULL,
  `providerShipmentId` varchar(36) DEFAULT NULL,
  `providerLockerId` varchar(20) DEFAULT NULL,
  `providerParcelNumber` varchar(500) DEFAULT NULL,
  `fk_Returnsid_Returns` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipment`
--

INSERT INTO `shipment` (`id_Shipment`, `trackingNumber`, `shippingDate`, `estimatedDeliveryDate`, `DeliveryLat`, `DeliveryLng`, `fk_Courierid_Courier`, `fk_Ordersid_Orders`, `fk_Companyid_Company`, `providerShipmentId`, `providerLockerId`, `providerParcelNumber`, `fk_Returnsid_Returns`) VALUES
(70, '10ebe2cc-3cec-4c27-8dff-efdc407cc49d', '2026-03-27 00:00:00', '2026-03-28 00:00:00', NULL, NULL, 3, 58, 1, '10ebe2cc-3cec-4c27-8dff-efdc407cc49d', NULL, '99991000000040,99991000000041', NULL),
(71, 'PKG-1-59-1774608784-1811', '2026-03-27 00:00:00', '2026-03-29 00:00:00', NULL, NULL, NULL, 59, 1, NULL, NULL, NULL, NULL),
(72, 'PKG-1-64-1775046868-4176', '2026-04-01 00:00:00', '2026-04-04 00:00:00', NULL, NULL, NULL, 64, 1, NULL, NULL, NULL, NULL),
(75, '1613b19c-a5e4-4e93-bcca-ac2c1b1e3437', '2026-04-01 00:00:00', '2026-04-03 00:00:00', 54.73997, 25.22529, 2, 65, 1, '1613b19c-a5e4-4e93-bcca-ac2c1b1e3437', 'LT90002', '99991000000042,99991000000043', NULL),
(76, '7b68f415-78d0-4202-a7a8-343d6fe2b7b2', '2026-04-02 00:00:00', '2026-04-04 00:00:00', 54.70976, 25.18713, 2, 66, 1, '7b68f415-78d0-4202-a7a8-343d6fe2b7b2', 'LT90001', '99991000000044,99991000000045', NULL),
(77, '75f80962-d229-4adf-9061-d7cfcf215614', '2026-04-03 00:00:00', '2026-04-05 00:00:00', 54.73997, 25.22529, 2, 67, 1, '75f80962-d229-4adf-9061-d7cfcf215614', 'LT90002', '99991000000046,99991000000047,99991000000048', NULL),
(78, '2d2859b1-9e64-4843-b873-e4a5e2cb1c8e', '2026-04-07 00:00:00', '2026-04-09 00:00:00', 54.71196, 25.30082, 2, 68, 1, '2d2859b1-9e64-4843-b873-e4a5e2cb1c8e', 'LT90003', '99991000000049,99991000097508', NULL),
(81, 'RET-1-7-1775662270-3473', '2026-04-08 15:31:10', '2026-04-11 15:31:10', NULL, NULL, NULL, 68, 1, NULL, NULL, NULL, 7),
(82, '7114baae-810f-485d-99ab-ccc1a09cd981', '2026-04-09 08:37:26', '2026-04-11 08:37:26', 54.71196, 25.30082, 2, 67, 1, '7114baae-810f-485d-99ab-ccc1a09cd981', 'LT90003', '99991000097571', 8),
(83, '058f3363-9b87-4a1f-af8b-bcbd1bd621a9', '2026-04-11 00:00:00', '2026-04-13 00:00:00', 54.911634, 23.947007, 2, 69, 1, '058f3363-9b87-4a1f-af8b-bcbd1bd621a9', 'LT90141', '99991000097572,99991000097573,99991000097574', NULL),
(84, 'RET-1-9-1775910640-5384', '2026-04-11 12:30:40', '2026-04-14 12:30:40', NULL, NULL, NULL, 69, 1, NULL, NULL, NULL, 9),
(85, 'PKG-1-70-1775913000-9634', '2026-04-11 00:00:00', '2026-04-14 00:00:00', NULL, NULL, NULL, 70, 1, NULL, NULL, NULL, NULL),
(86, 'RET-1-10-1775913373-5530', '2026-04-11 13:16:13', '2026-04-14 13:16:13', NULL, NULL, NULL, 70, 1, NULL, NULL, NULL, 10),
(89, 'PKG-1-72-1775922540-9910', '2026-04-11 00:00:00', '2026-04-14 00:00:00', NULL, NULL, NULL, 72, 1, NULL, NULL, NULL, NULL),
(90, 'RET-1-12-1775922860-1400', '2026-04-11 15:54:20', '2026-04-14 15:54:20', NULL, NULL, NULL, 72, 1, NULL, NULL, NULL, 12),
(96, 'PKG-1-73-1776319313-6783', '2026-04-16 00:00:00', '2026-04-19 00:00:00', NULL, NULL, NULL, 73, 1, NULL, NULL, NULL, NULL),
(97, 'c348d4e9-f889-4153-9207-8dd0a3ad049b', '2026-04-16 06:04:22', '2026-04-18 06:04:22', 54.71196, 25.30082, 2, 73, 1, 'c348d4e9-f889-4153-9207-8dd0a3ad049b', 'LT90003', '99991000097575', 13),
(99, 'PKG-1-75-1776319636-7758', '2026-04-16 00:00:00', '2026-04-19 00:00:00', NULL, NULL, NULL, 75, 1, NULL, NULL, NULL, NULL),
(100, 'PKG-1-77-1777375753-4550', '2026-04-28 00:00:00', '2026-05-01 00:00:00', NULL, NULL, 1, 77, 1, NULL, NULL, NULL, NULL),
(101, 'PKG-1-78-1777390632-6816', '2026-04-28 00:00:00', '2026-05-01 00:00:00', NULL, NULL, 1, 78, 1, NULL, NULL, NULL, NULL),
(102, '8019ae65-8d16-4967-9af1-a60a1d296d80', '2026-04-28 15:42:38', '2026-04-30 15:42:38', 54.73997, 25.22529, 2, 77, 1, '8019ae65-8d16-4967-9af1-a60a1d296d80', 'LT90002', '99991000097577,99991000097578', 14);

-- --------------------------------------------------------

--
-- Table structure for table `shipment_status`
--

CREATE TABLE `shipment_status` (
  `id_ShipmentStatus` int(11) NOT NULL,
  `fk_Shipmentid_Shipment` int(11) NOT NULL,
  `fk_ShipmentStatusTypeid_ShipmentStatusType` int(11) NOT NULL,
  `date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipment_status`
--

INSERT INTO `shipment_status` (`id_ShipmentStatus`, `fk_Shipmentid_Shipment`, `fk_ShipmentStatusTypeid_ShipmentStatusType`, `date`) VALUES
(50, 70, 1, '2026-03-27 10:52:18'),
(51, 71, 1, '2026-03-27 10:53:04'),
(52, 71, 2, '2026-03-27 12:08:46'),
(53, 71, 4, '2026-03-27 12:08:56'),
(54, 71, 3, '2026-03-27 12:09:21'),
(55, 70, 2, '2026-03-27 12:09:39'),
(56, 72, 1, '2026-04-01 12:34:28'),
(57, 72, 2, '2026-04-01 12:35:56'),
(58, 72, 3, '2026-04-01 12:36:00'),
(59, 75, 1, '2026-04-01 13:20:06'),
(60, 75, 2, '2026-04-01 13:20:24'),
(61, 75, 3, '2026-04-01 13:20:28'),
(62, 70, 3, '2026-04-02 05:54:59'),
(63, 76, 1, '2026-04-02 05:56:22'),
(64, 76, 2, '2026-04-02 05:56:50'),
(65, 76, 3, '2026-04-02 05:56:53'),
(66, 77, 1, '2026-04-03 08:09:03'),
(67, 77, 2, '2026-04-03 08:09:20'),
(68, 77, 3, '2026-04-03 08:09:23'),
(69, 78, 1, '2026-04-07 08:07:25'),
(70, 78, 2, '2026-04-07 08:07:39'),
(71, 78, 3, '2026-04-07 08:07:41'),
(74, 81, 5, '2026-04-08 15:31:10'),
(75, 82, 5, '2026-04-09 08:37:26'),
(76, 82, 6, '2026-04-09 08:38:26'),
(77, 82, 7, '2026-04-09 08:38:54'),
(78, 83, 1, '2026-04-11 11:21:35'),
(79, 83, 2, '2026-04-11 11:24:31'),
(80, 83, 2, '2026-04-11 11:35:22'),
(81, 83, 4, '2026-04-11 12:26:36'),
(82, 83, 3, '2026-04-11 12:27:37'),
(83, 84, 5, '2026-04-11 12:30:40'),
(84, 84, 6, '2026-04-11 12:32:51'),
(85, 84, 7, '2026-04-11 12:33:24'),
(86, 85, 1, '2026-04-11 13:10:00'),
(87, 85, 2, '2026-04-11 13:12:46'),
(88, 85, 4, '2026-04-11 13:13:00'),
(89, 85, 3, '2026-04-11 13:13:15'),
(90, 86, 5, '2026-04-11 13:16:13'),
(91, 86, 6, '2026-04-11 13:17:42'),
(92, 86, 8, '2026-04-11 13:18:25'),
(93, 86, 7, '2026-04-11 13:51:28'),
(99, 89, 1, '2026-04-11 15:49:00'),
(100, 89, 2, '2026-04-11 15:50:11'),
(101, 89, 3, '2026-04-11 15:50:55'),
(102, 90, 5, '2026-04-11 15:54:20'),
(103, 90, 6, '2026-04-11 15:55:50'),
(104, 90, 7, '2026-04-11 15:56:10'),
(110, 96, 1, '2026-04-16 06:01:53'),
(111, 96, 2, '2026-04-16 06:02:30'),
(112, 97, 5, '2026-04-16 06:04:22'),
(114, 99, 1, '2026-04-16 06:07:16'),
(115, 99, 2, '2026-04-16 06:07:24'),
(116, 81, 6, '2026-04-16 06:09:09'),
(117, 81, 7, '2026-04-16 06:09:14'),
(118, 100, 1, '2026-04-28 11:29:13'),
(119, 100, 2, '2026-04-28 13:12:01'),
(120, 100, 3, '2026-04-28 13:13:14'),
(121, 101, 1, '2026-04-28 15:37:12'),
(122, 102, 5, '2026-04-28 15:42:38');

-- --------------------------------------------------------

--
-- Table structure for table `shipment_status_type`
--

CREATE TABLE `shipment_status_type` (
  `id_ShipmentStatusType` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shipment_status_type`
--

INSERT INTO `shipment_status_type` (`id_ShipmentStatusType`, `name`) VALUES
(7, 'Grąžinimas pristatytas'),
(5, 'Grąžinimas sukurtas'),
(8, 'Grąžinimas vėluoja'),
(6, 'Grąžinimas vežamas'),
(3, 'Pristatyta'),
(1, 'Sukurta'),
(4, 'Vėluoja'),
(2, 'Vežama');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_Users` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `creationDate` datetime NOT NULL DEFAULT current_timestamp(),
  `googleId` varchar(255) DEFAULT NULL,
  `authProvider` varchar(50) NOT NULL DEFAULT 'LOCAL',
  `fk_Companyid_Company` int(11) DEFAULT NULL,
  `isMasterAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `resetToken` varchar(128) DEFAULT NULL,
  `resetTokenExpiry` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_Users`, `name`, `surname`, `email`, `password`, `phoneNumber`, `image`, `creationDate`, `googleId`, `authProvider`, `fk_Companyid_Company`, `isMasterAdmin`, `resetToken`, `resetTokenExpiry`) VALUES
(1, 'Master', 'Admin', 'admin@test.lt', '$2a$11$d6OpHmk/PLgBt7WMVX8.euh.HfILtOhsEDibBD760ecb7xznkVHQK', NULL, '', '2026-03-09 10:37:22', NULL, 'LOCAL', 1, 1, NULL, NULL),
(2, 'Ignas', 'Makackas', 'ignasmakackas@gmail.com', '$2a$11$gQ4HdcxIo7EE3890aukwF.E35Ee/gec9hmVpN8cTzBBnloR4uATmi', '+3706000000', '', '2026-03-09 12:59:27', NULL, 'LOCAL', 1, 0, '6pQIgYzGF1rRXDBO32xsu-VyS6Dxp9qOTITwNJwXmE0', '2026-04-28 08:01:52'),
(3, 'Klientas Nr. 1', 'Klientas', 'butent-c1-client1@local', '$2a$11$d6OpHmk/PLgBt7WMVX8.euh.HfILtOhsEDibBD760ecb7xznkVHQK', NULL, '', '2026-03-09 13:07:36', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(4, 'Klientas Nr. 2', 'Klientas', 'butent-c1-client2@local', '$2a$11$OdXIbt55I3SM2EOoHHTP6evap/rK/glEqXUfkP99P2L8ST1wWhTUi', NULL, '', '2026-03-09 13:07:37', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(5, 'Klientas Nr. 3', 'Klientas', 'butent-c1-client3@local', '$2a$11$KtnK4Yjh43yqQBkahjj4nOp24geYCEZzGuOTr.pMQVBZCZMDFFMSK', NULL, '', '2026-03-09 13:07:37', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(6, 'Klientas Nr. 4', 'Klientas', 'butent-c1-client4@local', '$2a$11$XJEuNA4mz9uoMYTUTFvoM.ZaWPeuafoypk.XfjgMdZNBz9je7q852', NULL, '', '2026-03-09 13:07:37', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(7, 'Klientas Nr. 5', 'Klientas', 'butent-c1-client5@local', '$2a$11$SFlG2gYbNdJgjjad9I3j4O8AC6zoIUYxrxxoIKaeofbZciTNh1biK', NULL, '', '2026-03-09 13:07:37', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(8, 'Klientas Nr. 6', 'Klientas', 'butent-c1-client6@local', '$2a$11$ClMAGqlLLJre04dtuWVei.m2PWJHvxI6kf7o23ueUiv45EM7vz89q', NULL, '', '2026-03-09 13:07:37', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(9, 'Klientas Nr. 7', 'Klientas', 'butent-c1-client7@local', '$2a$11$zQvdOw5J927//kjYVzX/r.5z6COGFvKFk80xzCfGQ59f78rmcWh52', NULL, '', '2026-03-09 13:07:37', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(10, 'Klientas Nr. 8', 'Klientas', 'butent-c1-client8@local', '$2a$11$Om.uUofCiE674rt3pkWF3OXTp3LyaXf27Ro2kTPyNOoujIbfQQ4EW', NULL, '', '2026-03-09 13:07:37', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(11, 'Klientas Nr. 9', 'Klientas', 'butent-c1-client9@local', '$2a$11$n/Cf0R9WmTuYOR4SMhVguOkXE.e79fD61ElaN6Q0oRjcCVJgS7BEy', NULL, '', '2026-03-09 13:07:37', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(12, 'Klientas Nr. 10', 'Klientas', 'butent-c1-client10@local.lt', '$2a$11$PfxKD5THEWlOwwT2dVPA2Oway2.zhVfeA8SjxSUPo9Mxd9NVYsT/C', '+37063850850', '', '2026-03-09 13:07:37', NULL, 'LOCAL', 1, 0, NULL, NULL),
(13, 'Klientas Nr. 11', 'Klientas', 'butent-c1-client11@local', '$2a$11$f6WP.Skkl16dxhRop9h8TefU8s4X/rq0EF4P8K3972AqkvRSUUaFK', NULL, '', '2026-03-09 13:07:38', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(14, 'Klientas Nr. 12', 'Klientas', 'butent-c1-client12@local', '$2a$11$qzAZTZev4/IQ0FvhNHkXZul2IOON5rCzi0RDsPUE2Gw58F3h2qrwC', NULL, '', '2026-03-09 13:07:38', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(15, 'Klientas Nr. 13', 'Klientas', 'butent-c1-client13@local', '$2a$11$SCGrOiF88eHOAFBtvaYgsuFgQwAz4hotBzktZMgOKtDFjPQWK9MMS', NULL, '', '2026-03-09 13:07:38', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(16, 'Klientas Nr. 14', 'Klientas', 'butent-c1-client14@local', '$2a$11$5ThNCtzB1TwqFCHajDAbM.mkkUqnbQCWpqOn5u3w6y6OXAwanzt06', NULL, '', '2026-03-09 13:07:38', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(17, 'Klientas Nr. 15', 'Klientas', 'butent-c1-client15@local', '$2a$11$6GT0sO6193LLmcgAO8wWUuCMcbSUF75sKzyYhS5RL39HKBqiExcj2', NULL, '', '2026-03-09 13:07:38', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(18, 'Klientas Nr. 16', 'Klientas', 'butent-c1-client16@local', '$2a$11$pMpKzrwG.6Bpm5SMM9Nc0.RPKAP0C0XjomzgezeKnbX/uJ1.ptFkG', NULL, '', '2026-03-09 13:07:38', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(19, 'Klientas Nr. 17', 'Klientas', 'butent-c1-client17@local', '$2a$11$TKiRuxZPIzq7uMtfEg5f1unDKmgknHUE5Qnw61ygWtqc9ivvIIbUe', NULL, '', '2026-03-09 13:07:38', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(20, 'Klientas Nr. 18', 'Klientas', 'butent-c1-client18@local.lt', '$2a$11$PhtiUL6GXbrLn0mRIdYVqOXAHjgyfsbYwZQGfX7JTEEAsSzY/2O9y', '+35555555', '', '2026-03-09 13:07:38', NULL, 'LOCAL', 1, 0, NULL, NULL),
(21, 'Klientas Nr. 19', 'Klientas', 'butent-c1-client19@local', '$2a$11$CGfIAMIFCsRvPbum81HgDuPRkXmAeFI.U5T0.CN2BNHUCNaIS4NQC', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(22, 'Klientas Nr. 20', 'Klientas', 'butent-c1-client20@local', '$2a$11$5IQ6bQOvrd4RdGxOQ5VTVeV7xGK2BGQcpuySi3h3aUxIkH1fIPflS', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(23, 'Klientas Nr. 21', 'Klientas', 'butent-c1-client21@local', '$2a$11$V7pcKy/uSm9FLj5Zz4E3te/xXsOjMz.y5KcYonVfdoZvDxd/llTDS', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(24, 'Klientas Nr. 22', 'Klientas', 'butent-c1-client22@local', '$2a$11$j3bxh1OpqWJGKqy7OgI8JuK.7zCB9q5mdPJS3OO3Q4b9b5XtP3Y1S', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(25, 'Klientas Nr. 23', 'Klientas', 'butent-c1-client23@local', '$2a$11$Y3NYfnTRPi3/AmAGM6Q2RenHWEZ54UguVa0Hpe2H2HXk3esICORx2', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(26, 'Klientas Nr. 24', 'Klientas', 'butent-c1-client24@local', '$2a$11$yqFDa9ih05lrznzrgqt8m.JweqXnCq5dTMndSX5RIRP/ibg0zIdXW', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(27, 'Klientas Nr. 25', 'Klientas', 'butent-c1-client25@local', '$2a$11$VGHCuz49A2AGmCIPPdjTF.Xbrc7bPt8LTPc3FDxzPN9/nzAkcFIT.', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(28, 'Klientas Nr. 26', 'Klientas', 'butent-c1-client26@local', '$2a$11$npnZmXQKVzg5FltqJEG/aeBSVpk.5bgFB/fnvt//U5mMo9FkwQiie', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(29, 'Klientas Nr. 27', 'Klientas', 'butent-c1-client27@local', '$2a$11$a.J8sPFmtQevv7yQynYGGOeSfrUrRSkAnx92CBOUK7i1JfPimqi0q', NULL, '', '2026-03-09 13:07:39', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(30, 'Klientas Nr. 28', 'Klientas', 'butent-c1-client28@local', '$2a$11$HsqhjuewPzwaPfqyN2G/FuWAlVT.O4AVHWljPnDU2FUgBUabwNbn.', NULL, '', '2026-03-09 13:07:40', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(31, 'Klientas Nr. 29', 'Klientas', 'butent-c1-client29@local', '$2a$11$KrsurF5aOUYY5l4bILcM2uPIQX6DbweXmPXXyhQ1/HingWT6W.grK', NULL, '', '2026-03-09 13:07:40', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(32, 'Klientas Nr. 30', 'Klientas', 'butent-c1-client30@local', '$2a$11$sMiUL5KBtdqYBf1ZQnQdYeh9DnhKyZs6vfZRPgOvNtRhKD.2z5wuu', NULL, '', '2026-03-09 13:07:40', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(33, 'Klientas Nr. 31', 'Klientas', 'butent-c1-client31@local', '$2a$11$pBeMsBt4hIBBkGIvDUlBzugswUF5enf78zkZBCZOdC1Ifsc2MgMmy', NULL, '', '2026-03-09 13:07:40', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(34, 'Klientas Nr. 32', 'Klientas', 'butent-c1-client32@local', '$2a$11$95ruHTm8Y0Wri0j7ipUunuFaKZX//7r3itXE3KYb38.X.YxO6WNli', NULL, '', '2026-03-09 13:07:40', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(35, 'Klientas Nr. 33', 'Klientas', 'butent-c1-client33@local', '$2a$11$QGNI/40k8aq2lXFoiq/.m.GbEO6e8qXa5RecovkxDs2TIHa5XSmpi', NULL, '', '2026-03-09 13:07:40', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(36, 'Klientas Nr. 34', 'Klientas', 'butent-c1-client34@local', '$2a$11$zlZxeK.5jH.aSIvu9rN5xeM6U/KVjKVNDoM/i6c04kciq/HehmhLG', NULL, '', '2026-03-09 13:07:40', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(37, 'Klientas Nr. 35', 'Klientas', 'butent-c1-client35@local', '$2a$11$eY0InO5VsPXdYWkumUdX0O6SFCnXqRi7uJW3bvEdiexB1EvIbNV42', NULL, '', '2026-03-09 13:07:40', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(38, 'Klientas Nr. 36', 'Klientas', 'butent-c1-client36@local', '$2a$11$A4wwPbdvXoW8KY7b56EP4.eSnpsodbayjhsUrbysC1XBW9yw5sHva', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(39, 'Klientas Nr. 37', 'Klientas', 'butent-c1-client37@local', '$2a$11$mu7ZfEmPHh6QsTR/5idTn.ipeLZw.FmHMY4nJJwKdZnmf8NHTbeIC', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(40, 'Klientas Nr. 38', 'Klientas', 'butent-c1-client38@local', '$2a$11$J1.bciSchbZXGSkv4MDh5.6k5Tl.spcs7.XtQpDGgqu5mki4BEslq', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(41, 'Klientas Nr. 39', 'Klientas', 'butent-c1-client39@local', '$2a$11$6oHz19ShETkHbj0ipfptj.yilSV5WX6nMKikbFWJoPzcW/yrOFxm2', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(42, 'Klientas Nr. 40', 'Klientas', 'butent-c1-client40@local', '$2a$11$EF0lyfL7DmsGkSPjs6cKOeyrm8Fnh.3.CBFJUKqOmhCAgKK0Rx0rm', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(43, 'Klientas Nr. 41', 'Klientas', 'butent-c1-client41@local', '$2a$11$3owhMPhI7c8Cmt..qYcwh..EyHfLx2o2gNthOOchAY2QXdwKIuPyS', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(44, 'Klientas Nr. 42', 'Klientas', 'butent-c1-client42@local', '$2a$11$XTd7I3V4lTIXMbbZHv5NHuvXF5yJDoVMYux5bGMx0ti6iMAXn3TfS', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(45, 'Klientas Nr. 43', 'Klientas', 'butent-c1-client43@local', '$2a$11$at8M61gPjIoxq9vOvA9O7usO8h7F1EM/E9kaRUCGig4wHzWNT1E6y', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(46, 'Klientas Nr. 44', 'Klientas', 'butent-c1-client44@local', '$2a$11$hyIhZ0.1YqWoJ3Z/LP45PODF70BXwdsIjmjrBOY3Qeuk2STQeponC', NULL, '', '2026-03-09 13:07:41', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(47, 'Klientas Nr. 45', 'Klientas', 'butent-c1-client45@local', '$2a$11$ACu0tQwZaEJ/sBr4LHhoC.hPJN5JqwXqpF7LfPoYUXwqvFzQ7d7tu', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(48, 'Klientas Nr. 46', 'Klientas', 'butent-c1-client46@local', '$2a$11$.YXSrO0XsdTfHnyphwnBy.Nvj91hgFlxvQqVRUCFmeIIy84EKTaR.', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(49, 'Klientas Nr. 47', 'Klientas', 'butent-c1-client47@local', '$2a$11$r/fGXEwuIVlb4wd11V5xTupDlAi0tqatR7A8VkZfdEzM7zrgcguR.', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(50, 'Klientas Nr. 48', 'Klientas', 'butent-c1-client48@local', '$2a$11$oenkWtcHEUVDhuApw2hOvOugQtq2FZr3yt5obCZndE87.S7ZpuFN.', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(51, 'Klientas Nr. 49', 'Klientas', 'butent-c1-client49@local', '$2a$11$wM/XwqAnZGS6YJudb6HSreDRBnpZZLihFwcwc9H3qcab.8udwM92W', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(52, 'Klientas Nr. 50', 'Klientas', 'butent-c1-client50@local', '$2a$11$l9Q/FkuRpEzNxr.xVycDa.XVrXGiJVDhqN0aSRqt7MHU2yF46TYQO', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(53, 'Klientas Nr. 51', 'Klientas', 'butent-c1-client51@local', '$2a$11$DAHojiT3p2p5COzOmZWSQuexnkJZOhkh0mHLc0mlJtCcVt05hfxzu', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(54, 'Klientas Nr. 52', 'Klientas', 'butent-c1-client52@local', '$2a$11$UetaQZq5.6sYU4gWzzTmKeeGJdY490J2JUD/q2vyUAegTSOCCuw0K', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(55, 'Klientas Nr. 53', 'Klientas', 'butent-c1-client53@local', '$2a$11$4pLS.BHylsA3L0IFMAP/L.Z.kthA/hyWVOO5GTdtclDRgeyuxJ7UK', NULL, '', '2026-03-09 13:07:42', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(56, 'Klientas Nr. 54', 'Klientas', 'butent-c1-client54@local', '$2a$11$0eZgwZXzjpsuwhJNfJ63Cudy8ltPbLk2CIYWRGEtfTV3yrPgNfZvy', NULL, '', '2026-03-09 13:07:43', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(57, 'Klientas Nr. 55', 'Klientas', 'butent-c1-client55@local', '$2a$11$KZJEi.Qez28ucWu.sGRFa.OZxB9NCMg6sefEn0ENe8clqDHkX.KEK', NULL, '', '2026-03-09 13:07:43', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(58, 'Klientas Nr. 56', 'Klientas', 'butent-c1-client56@local', '$2a$11$fxdtnnckZYxF6y9p5ozSu.pWb3Fnf5I16FZly.yOHi0GSqqz4z..i', NULL, '', '2026-03-09 13:07:43', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(59, 'Klientas Nr. 57', 'Klientas', 'butent-c1-client57@local', '$2a$11$.Z4meW2XAjIkRg3YhwxE2.IHzwI6/JPWc4bldq4ntUWg6HMwy.Zo.', NULL, '', '2026-03-09 13:07:43', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(60, 'Klientas Nr. 58', 'Klientas', 'butent-c1-client58@local', '$2a$11$jGTBd7ZovZDS2g3GVoBpS.dOgsExC.Gfy/lHzZ9vDa4w8KdLye5Yy', NULL, '', '2026-03-09 13:07:43', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(61, 'Klientas Nr. 59', 'Klientas', 'butent-c1-client59@local', '$2a$11$hcCk3ElbCuziYXkjqhH/pO1UwdpQgYmlArNMMkwmatxS93NgoSwe6', NULL, '', '2026-03-09 13:07:43', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(62, 'Klientas Nr. 60', 'Klientas', 'butent-c1-client60@local', '$2a$11$ZBuq1Gpjhu6ctNxaqyLShuUf/F/dn1BMtnluXubl347ufbHgwNEN2', NULL, '', '2026-03-09 13:07:43', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(63, 'Klientas Nr. 61', 'Klientas', 'butent-c1-client61@local', '$2a$11$xB7WjUu5Z8QjfoL8Rxc3pu0D1RZByERQVNqMNtrMPkRTPsfqP9sZq', NULL, '', '2026-03-09 13:07:43', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(64, 'Klientas Nr. 62', 'Klientas', 'butent-c1-client62@local', '$2a$11$.yFpt38F79Ki46CbyhUcye7jWKiZ9OBrQSFIiC8.VwOU4pSVl/XV.', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(65, 'Klientas Nr. 63', 'Klientas', 'butent-c1-client63@local', '$2a$11$asMuwUqi7z7h3WSFIFtEPuAlAuumwXAvehWSHCskZiURV0Q4NdcXu', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(66, 'Klientas Nr. 64', 'Klientas', 'butent-c1-client64@local', '$2a$11$AimfR8CIgNYAQBBEJXKpveOUEz2UFljA6bSfZjgnb72i4zp1g6dt6', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(67, 'Klientas Nr. 65', 'Klientas', 'butent-c1-client65@local', '$2a$11$4YkEnHe9uYKsNyWy1thy4ecHxgrjRKY9UHM5IOIsIXn.QLA40AHSO', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(68, 'Klientas Nr. 66', 'Klientas', 'butent-c1-client66@local', '$2a$11$KS6ylVhKhJomPskhN4hbYesXipBvHoPWiYhnK3DYJJH8pOGvmtqwm', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(69, 'Klientas Nr. 67', 'Klientas', 'butent-c1-client67@local', '$2a$11$9.WTTRZGuajl1gOBal.ioeTaDoJ.F6Q/tjAIazWNt2GFlWdTh8U2G', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(70, 'Klientas Nr. 68', 'Klientas', 'butent-c1-client68@local', '$2a$11$oxqrcyp1..GNsI7SOWYrCestCMiVsBhahVuN0eR8zVeLg1FqUCjVC', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(71, 'Klientas Nr. 69', 'Klientas', 'butent-c1-client69@local', '$2a$11$s9efPPhy.p2oXNwc2TTa4uvlUXfdRss1GZhQ0aHOT3wxK4GaPCBq6', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(72, 'Klientas Nr. 70', 'Klientas', 'butent-c1-client70@local', '$2a$11$RcgMWgzDBPNMkQSQdRAcC..vPpolEpd0m5fojUt7yYlp6V/yKHb4W', NULL, '', '2026-03-09 13:07:44', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(73, 'Klientas Nr. 71', 'Klientas', 'butent-c1-client71@local', '$2a$11$q0.2bN68AuOw0XTElnuSG.ue6Am5rbqGz5bufuraOR13lNh4vM0j6', NULL, '', '2026-03-09 13:07:45', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(74, 'Klientas Nr. 72', 'Klientas', 'butent-c1-client72@local', '$2a$11$SCdw7FbXkyVqhP3J3DJZiu8PmNFwA5kRN6EL18R5qPyzlMzxvSdA2', NULL, '', '2026-03-09 13:07:45', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(75, 'Klientas Nr. 73', 'Klientas', 'butent-c1-client73@local', '$2a$11$pmO1o5FSTIcFBa1t2DixKOhPZblhBG4plBE6SP0r7tajvmMPBvst6', NULL, '', '2026-03-09 13:07:45', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(76, 'Klientas Nr. 74', 'Klientas', 'butent-c1-client74@local', '$2a$11$4nnWwXvnTopNtw8y.wUZIuEfgqs23rVaBEUHXy.f9nZNL3297hZt6', NULL, '', '2026-03-09 13:07:45', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(77, 'Klientas Nr. 75', 'Klientas', 'butent-c1-client75@local', '$2a$11$BFesw0LvEgy8z8x/GAwoAOKMS0fpx/whAvT3ga4AU.9pufvLs.FIu', NULL, '', '2026-03-09 13:07:45', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(78, 'Klientas Nr. 76', 'Klientas', 'butent-c1-client76@local', '$2a$11$l5EaSL9FbCcH9M.CZpbQqu/86fCxHOAFsFhlG1LwEj2EZhSBRVbAC', NULL, '', '2026-03-09 13:07:45', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(79, 'Klientas Nr. 77', 'Klientas', 'butent-c1-client77@local', '$2a$11$B9X6SeAxevfg.HQena43Ge7KbMqT7Z6v5EFztDJWS3l3HpQY9Dmj2', NULL, '', '2026-03-09 13:07:45', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(80, 'Klientas Nr. 78', 'Klientas', 'butent-c1-client78@local', '$2a$11$7jELShwjMDJY5zmR3J0e1.hjwMGB2hj1IykxK.fmp7bUcD52eIugm', NULL, '', '2026-03-09 13:07:45', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(81, 'Klientas Nr. 79', 'Klientas', 'butent-c1-client79@local', '$2a$11$gZD7N2NUzc283Ffgxb4E5.QhO1iqAUoAuEgbObGzgt5rD4Uzqk2cu', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(82, 'Klientas Nr. 80', 'Klientas', 'butent-c1-client80@local', '$2a$11$0Vj65C32KD3NRmPGrOGdmuE8kRrs6YOb2S5vXjcDjEHr7wT4jUwZG', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(83, 'Klientas Nr. 81', 'Klientas', 'butent-c1-client81@local', '$2a$11$oAWO7lRmP29pCUO4JWiQDOy0FTqzjng9DSTj.n6cAPtccPqVDA0na', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(84, 'Klientas Nr. 82', 'Klientas', 'butent-c1-client82@local', '$2a$11$2wESu6sOaD5SwnCkxYlsfOgRC64kSJbNtyGYX8TiVD8ZiT.AraJYS', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(85, 'Klientas Nr. 83', 'Klientas', 'butent-c1-client83@local', '$2a$11$zl7Gx9RHmqIBjkRPWdtSjuxMK2vvJ6qZ7uZh5UW.9yUHxwUH6DWvK', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(86, 'Klientas Nr. 84', 'Klientas', 'butent-c1-client84@local', '$2a$11$.lGJy/QdsMuaDhlxmXBvUeUBGWYDC5eDcLP7jH0/Pw7WlW0B8QiM2', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(87, 'Klientas Nr. 85', 'Klientas', 'butent-c1-client85@local', '$2a$11$8qMB22mCOAhZBGvwuMshD.L9NQLcrCOPp98TjqxWkAWc4Hf7kQnKu', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(88, 'Klientas Nr. 86', 'Klientas', 'butent-c1-client86@local', '$2a$11$FYTo6mg8oeqJXfoDwvmIxeb58B8NZi2asamc7MdBef3t1CiwpzrJK', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(89, 'Klientas Nr. 87', 'Klientas', 'butent-c1-client87@local', '$2a$11$r9IJNC1bOQWbSwC6U4LN.uMKWThTGHQ4OL4f5TXGR6Snj49DHgnW.', NULL, '', '2026-03-09 13:07:46', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(90, 'Klientas Nr. 88', 'Klientas', 'butent-c1-client88@local', '$2a$11$hiRZ8ACabiYxQ7ic5tL7i.UYRTXc6U5pLwR0BHUjK1EdpOiEKkQJu', NULL, '', '2026-03-09 13:07:47', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(91, 'Klientas Nr. 89', 'Klientas', 'butent-c1-client89@local', '$2a$11$T2gnJs8zeDG7Ev.fiql4iu9Pn0YUiiyph48MMZkVvVnn2dPqZ/fHq', NULL, '', '2026-03-09 13:07:47', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(92, 'Klientas Nr. 90', 'Klientas', 'butent-c1-client90@local', '$2a$11$90UM97DYWwDm.JEAWoWuMer0jmWEzIYaVweZi75Rz15tt6i8TKUC6', NULL, '', '2026-03-09 13:07:47', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(93, 'Klientas Nr. 91', 'Klientas', 'butent-c1-client91@local', '$2a$11$P0hUdJwniZePQVeWKszNE./kzoYMSJAL34sutDR9myf2BmODgwGSm', NULL, '', '2026-03-09 13:07:47', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(94, 'Klientas Nr. 92', 'Klientas', 'butent-c1-client92@local', '$2a$11$Fq0FSUfsjXy7nfBvRJCPUu6evTTaPA3O2bEeUP1hlQRAFqK5DoIVq', NULL, '', '2026-03-09 13:07:47', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(95, 'Klientas Nr. 93', 'Klientas', 'butent-c1-client93@local', '$2a$11$vxwMlJwyPM3gdAfDkepNBuLey9/.RhEM2p3AVNwybhrbnVhGVdNFO', NULL, '', '2026-03-09 13:07:47', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(96, 'Klientas Nr. 94', 'Klientas', 'butent-c1-client94@local', '$2a$11$Ryg2/gsE408D3caIT2qC/Oo05vBpr2/rLIOaevFbkvABgL/V3hEIe', NULL, '', '2026-03-09 13:07:47', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(97, 'Klientas Nr. 95', 'Klientas', 'butent-c1-client95@local', '$2a$11$BW1Niy7f0.9qnMQZO5rz1eiS.MBbTcUhaZ1Ep6AHIu5FToCFsfJ8q', NULL, '', '2026-03-09 13:07:47', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(98, 'Klientas Nr. 96', 'Klientas', 'butent-c1-client96@local', '$2a$11$vozMkiIuN3BFOZPQQoWIYu3QaNNhqx6neePRmDQJ0rluOf10DVPe.', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(99, 'Klientas Nr. 97', 'Klientas', 'butent-c1-client97@local', '$2a$11$ubJGFIQc8zARAzou/DjE8.CSF6dQdg5vQKPEt6L8FvJQzva5pmJPO', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(100, 'Klientas Nr. 98', 'Klientas', 'butent-c1-client98@local', '$2a$11$EKVcqOW4YMmPtYOyKU1sQOnillTTFNSyLMWt5ls5M8bpl4F.U5T0e', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(101, 'Klientas Nr. 99', 'Klientas', 'butent-c1-client99@local', '$2a$11$.2VKvlyVb3NsQogoKL9XnOPaTi6iWx/HisZ26ChVRpYc54frQArZW', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(102, 'Klientas Nr. 100', 'Klientas', 'butent-c1-client100@local', '$2a$11$Hlj6mfVBlhUV82SLr5zq8OxgHnUyW6CJejmYcn.SLOH2/8N3pVf1O', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(103, 'Klientas Nr. 101', 'Klientas', 'butent-c1-client101@local', '$2a$11$9TRmLiBOJAoD2UslYKsl0.Ff8DlF1ZlAh3BVzxR12qcYhvzzn3e7W', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(104, 'Klientas Nr. 102', 'Klientas', 'butent-c1-client102@local', '$2a$11$9DHL1KZkSKY1FkBzKytdOuT96vZ3b49CgM0GbnfLqwFjmo1mOxDhe', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(105, 'Klientas Nr. 103', 'Klientas', 'butent-c1-client103@local', '$2a$11$tbVV2N9MZnYXNuygDjz7IuRJbZKORqyldxmRCZ1eTfDAGDmN1SyOW', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(106, 'Klientas Nr. 104', 'Klientas', 'butent-c1-client104@local', '$2a$11$kBHSkFhOvQn7ld0Qkt.q1.C/HQcXhsIvjL1g3.C.5R.gMQPqwOQBa', NULL, '', '2026-03-09 13:07:48', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(107, 'Klientas Nr. 105', 'Klientas', 'butent-c1-client105@local', '$2a$11$gOB1Fc.5fZz6pfO2KOP6S.ZQEqkCnnhSB1VPXjjXZz.SXUnZi4VQe', NULL, '', '2026-03-09 13:07:49', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(108, 'Klientas Nr. 106 naujas', 'Klientas bandymas', 'butent-c1-client106@local.lt', '$2a$11$VWD5lPjRlMt9FzzwRXaxde4L.slpN9hN9p3YXYHu6rgJnpprDszbu', '+36666600000000', '', '2026-03-09 13:07:49', NULL, 'LOCAL', 1, 0, NULL, NULL),
(109, 'Klientas Nr. 107 a', 'Klientas b', 'butent-c1-client107@local.lt', '$2a$11$3fR4A/zZ.meHjBiJjlbQzuqBaC6aSo1kdnirJaDBtpZP7hd5ntFMa', '+370600000000', '', '2026-03-09 13:07:49', NULL, 'LOCAL', 1, 0, NULL, NULL),
(110, '123', '123', '123@123', NULL, '123', NULL, '2026-03-16 11:51:53', NULL, 'LOCAL', 2, 0, NULL, NULL),
(111, 'Ignas', 'Unknown', 'ignasmakackas@gmail.com', '$2a$11$LUXf78nKambGEluwG2MaWe2O08uDDs9r9/KunWOlwO0vwK2u3AzOu', '', NULL, '2026-04-13 11:18:19', '116952766965985229002', 'GOOGLE', NULL, 0, NULL, NULL),
(114, 'Naujas', 'Naudotojas', 'naujas@test.lt', '$2a$11$Pud9rPTMpXGq86YXRDh3luH6Z4rB6X6JVh8OPmIiiCv3AgyWmLJNa', '+37060000000', NULL, '2026-04-23 16:05:17', NULL, 'LOCAL', NULL, 0, NULL, NULL),
(115, 'Netikras', 'Naudotojas', 'Netikras@test.lt', NULL, '+37060000000', NULL, '2026-04-28 18:57:46', NULL, 'LOCAL', 4, 0, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id_Category`);

--
-- Indexes for table `client_company`
--
ALTER TABLE `client_company`
  ADD PRIMARY KEY (`fk_Clientid_Users`,`fk_Companyid_Company`),
  ADD UNIQUE KEY `UX_client_company_externalClientId` (`fk_Companyid_Company`,`externalClientId`),
  ADD KEY `IX_client_company_company` (`fk_Companyid_Company`);

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`id_Company`),
  ADD UNIQUE KEY `UQ_company_code` (`companyCode`);

--
-- Indexes for table `company_integration`
--
ALTER TABLE `company_integration`
  ADD PRIMARY KEY (`id_CompanyIntegration`),
  ADD UNIQUE KEY `UX_company_integration` (`fk_Companyid_Company`,`type`);

--
-- Indexes for table `company_users`
--
ALTER TABLE `company_users`
  ADD PRIMARY KEY (`fk_Companyid_Company`,`fk_Usersid_Users`),
  ADD KEY `IX_company_users_user` (`fk_Usersid_Users`);

--
-- Indexes for table `courier`
--
ALTER TABLE `courier`
  ADD PRIMARY KEY (`id_Courier`),
  ADD KEY `IX_courier_name` (`name`),
  ADD KEY `FK_courier_company` (`fk_Companyid_Company`);

--
-- Indexes for table `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`id_Invoice`),
  ADD UNIQUE KEY `UQ_invoice_order` (`fk_Ordersid_Orders`),
  ADD KEY `IX_invoice_date` (`date`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id_Notification`),
  ADD KEY `IX_notification_user` (`fk_Usersid_Users`),
  ADD KEY `IX_notification_date` (`date`),
  ADD KEY `IX_notification_company` (`fk_Companyid_Company`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id_Orders`),
  ADD UNIQUE KEY `UX_orders_company_externalDocumentId` (`fk_Companyid_Company`,`externalDocumentId`),
  ADD KEY `IX_orders_status` (`status`),
  ADD KEY `IX_orders_client` (`fk_Clientid_Users`),
  ADD KEY `IX_orders_company` (`fk_Companyid_Company`),
  ADD KEY `fk_orders_courier` (`snapshotCourierId`);

--
-- Indexes for table `ordersproduct`
--
ALTER TABLE `ordersproduct`
  ADD PRIMARY KEY (`id_OrdersProduct`),
  ADD KEY `IX_op_order` (`fk_Ordersid_Orders`),
  ADD KEY `IX_op_product` (`fk_Productid_Product`);

--
-- Indexes for table `orderstatus`
--
ALTER TABLE `orderstatus`
  ADD PRIMARY KEY (`id_OrderStatus`);

--
-- Indexes for table `package`
--
ALTER TABLE `package`
  ADD PRIMARY KEY (`id_Package`),
  ADD UNIQUE KEY `UQ_package_trackingNumber` (`trackingNumber`),
  ADD KEY `IX_package_shipment` (`fk_Shipmentid_Shipment`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id_Product`),
  ADD UNIQUE KEY `UX_product_company_externalCode` (`fk_Companyid_Company`,`externalCode`),
  ADD KEY `IX_product_company` (`fk_Companyid_Company`);

--
-- Indexes for table `productcategory`
--
ALTER TABLE `productcategory`
  ADD PRIMARY KEY (`fk_Categoryid_Category`,`fk_Productid_Product`),
  ADD KEY `IX_productcategory_product` (`fk_Productid_Product`);

--
-- Indexes for table `productgroup`
--
ALTER TABLE `productgroup`
  ADD PRIMARY KEY (`id_ProductGroup`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id_ProductImage`),
  ADD KEY `IX_product_images_product` (`fk_Productid_Product`),
  ADD KEY `IX_product_images_isPrimary` (`isPrimary`),
  ADD KEY `IX_product_images_sortOrder` (`fk_Productid_Product`,`sortOrder`);

--
-- Indexes for table `product_productgroup`
--
ALTER TABLE `product_productgroup`
  ADD PRIMARY KEY (`fk_Productid_Product`,`fk_ProductGroupId_ProductGroup`),
  ADD KEY `idx_ppg_productGroupId` (`fk_ProductGroupId_ProductGroup`);

--
-- Indexes for table `product_returns`
--
ALTER TABLE `product_returns`
  ADD PRIMARY KEY (`id_Returns`),
  ADD KEY `IX_returns_company` (`fk_Companyid_Company`),
  ADD KEY `IX_returns_client` (`fk_Clientid_Users`),
  ADD KEY `IX_returns_admin` (`fk_Adminid_Users`),
  ADD KEY `IX_returns_status` (`fk_ReturnStatusTypeid_ReturnStatusType`),
  ADD KEY `FK_returns_orders` (`fk_ordersid_orders`),
  ADD KEY `FK_returns_courier` (`returnCourierId`),
  ADD KEY `fk_return_courier` (`fk_Courierid_Courier`);

--
-- Indexes for table `return_item`
--
ALTER TABLE `return_item`
  ADD PRIMARY KEY (`id_ReturnItem`),
  ADD KEY `IX_ri_return` (`fk_Returnsid_Returns`),
  ADD KEY `IX_ri_ordersproduct` (`fk_OrdersProductid_OrdersProduct`),
  ADD KEY `IX_ri_reason` (`reasonId`);

--
-- Indexes for table `return_reason`
--
ALTER TABLE `return_reason`
  ADD PRIMARY KEY (`id_ReturnReason`);

--
-- Indexes for table `return_status_type`
--
ALTER TABLE `return_status_type`
  ADD PRIMARY KEY (`id_ReturnStatusType`),
  ADD UNIQUE KEY `UQ_return_status_type_name` (`name`);

--
-- Indexes for table `shipment`
--
ALTER TABLE `shipment`
  ADD PRIMARY KEY (`id_Shipment`),
  ADD KEY `IX_shipment_courier` (`fk_Courierid_Courier`),
  ADD KEY `IX_shipment_order` (`fk_Ordersid_Orders`),
  ADD KEY `IX_shipment_company` (`fk_Companyid_Company`),
  ADD KEY `fk_shipment_return` (`fk_Returnsid_Returns`);

--
-- Indexes for table `shipment_status`
--
ALTER TABLE `shipment_status`
  ADD PRIMARY KEY (`id_ShipmentStatus`),
  ADD KEY `IX_ss_shipment` (`fk_Shipmentid_Shipment`),
  ADD KEY `IX_ss_type` (`fk_ShipmentStatusTypeid_ShipmentStatusType`),
  ADD KEY `IX_ss_date` (`date`);

--
-- Indexes for table `shipment_status_type`
--
ALTER TABLE `shipment_status_type`
  ADD PRIMARY KEY (`id_ShipmentStatusType`),
  ADD UNIQUE KEY `UQ_shipment_status_type_name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_Users`),
  ADD KEY `IX_users_company` (`fk_Companyid_Company`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id_Category` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `id_Company` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `company_integration`
--
ALTER TABLE `company_integration`
  MODIFY `id_CompanyIntegration` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `courier`
--
ALTER TABLE `courier`
  MODIFY `id_Courier` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `invoice`
--
ALTER TABLE `invoice`
  MODIFY `id_Invoice` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `id_Notification` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id_Orders` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=90;

--
-- AUTO_INCREMENT for table `ordersproduct`
--
ALTER TABLE `ordersproduct`
  MODIFY `id_OrdersProduct` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=282;

--
-- AUTO_INCREMENT for table `orderstatus`
--
ALTER TABLE `orderstatus`
  MODIFY `id_OrderStatus` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `package`
--
ALTER TABLE `package`
  MODIFY `id_Package` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=114;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id_Product` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `productgroup`
--
ALTER TABLE `productgroup`
  MODIFY `id_ProductGroup` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id_ProductImage` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `product_returns`
--
ALTER TABLE `product_returns`
  MODIFY `id_Returns` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `return_item`
--
ALTER TABLE `return_item`
  MODIFY `id_ReturnItem` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `return_reason`
--
ALTER TABLE `return_reason`
  MODIFY `id_ReturnReason` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `return_status_type`
--
ALTER TABLE `return_status_type`
  MODIFY `id_ReturnStatusType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `shipment`
--
ALTER TABLE `shipment`
  MODIFY `id_Shipment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `shipment_status`
--
ALTER TABLE `shipment_status`
  MODIFY `id_ShipmentStatus` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- AUTO_INCREMENT for table `shipment_status_type`
--
ALTER TABLE `shipment_status_type`
  MODIFY `id_ShipmentStatusType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id_Users` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `client_company`
--
ALTER TABLE `client_company`
  ADD CONSTRAINT `FK_client_company_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_client_company_user` FOREIGN KEY (`fk_Clientid_Users`) REFERENCES `users` (`id_Users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `company_integration`
--
ALTER TABLE `company_integration`
  ADD CONSTRAINT `FK_company_integration_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `company_users`
--
ALTER TABLE `company_users`
  ADD CONSTRAINT `FK_company_users_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_company_users_users` FOREIGN KEY (`fk_Usersid_Users`) REFERENCES `users` (`id_Users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `courier`
--
ALTER TABLE `courier`
  ADD CONSTRAINT `FK_courier_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `FK_invoice_order` FOREIGN KEY (`fk_Ordersid_Orders`) REFERENCES `orders` (`id_Orders`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `FK_notification_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_notification_user` FOREIGN KEY (`fk_Usersid_Users`) REFERENCES `users` (`id_Users`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `FK_orders_client` FOREIGN KEY (`fk_Clientid_Users`) REFERENCES `users` (`id_Users`),
  ADD CONSTRAINT `FK_orders_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_orders_status` FOREIGN KEY (`status`) REFERENCES `orderstatus` (`id_OrderStatus`),
  ADD CONSTRAINT `fk_orders_courier` FOREIGN KEY (`snapshotCourierId`) REFERENCES `courier` (`id_Courier`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `ordersproduct`
--
ALTER TABLE `ordersproduct`
  ADD CONSTRAINT `FK_op_orders` FOREIGN KEY (`fk_Ordersid_Orders`) REFERENCES `orders` (`id_Orders`),
  ADD CONSTRAINT `FK_op_product` FOREIGN KEY (`fk_Productid_Product`) REFERENCES `product` (`id_Product`);

--
-- Constraints for table `package`
--
ALTER TABLE `package`
  ADD CONSTRAINT `FK_package_shipment` FOREIGN KEY (`fk_Shipmentid_Shipment`) REFERENCES `shipment` (`id_Shipment`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `FK_product_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON UPDATE CASCADE;

--
-- Constraints for table `productcategory`
--
ALTER TABLE `productcategory`
  ADD CONSTRAINT `FK_productcategory_category` FOREIGN KEY (`fk_Categoryid_Category`) REFERENCES `category` (`id_Category`),
  ADD CONSTRAINT `FK_productcategory_product` FOREIGN KEY (`fk_Productid_Product`) REFERENCES `product` (`id_Product`);

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `FK_product_images_product` FOREIGN KEY (`fk_Productid_Product`) REFERENCES `product` (`id_Product`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_productgroup`
--
ALTER TABLE `product_productgroup`
  ADD CONSTRAINT `fk_ppg_product` FOREIGN KEY (`fk_Productid_Product`) REFERENCES `product` (`id_Product`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_ppg_productgroup` FOREIGN KEY (`fk_ProductGroupId_ProductGroup`) REFERENCES `productgroup` (`id_ProductGroup`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_returns`
--
ALTER TABLE `product_returns`
  ADD CONSTRAINT `FK_returns_admin` FOREIGN KEY (`fk_Adminid_Users`) REFERENCES `users` (`id_Users`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_returns_client` FOREIGN KEY (`fk_Clientid_Users`) REFERENCES `users` (`id_Users`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_returns_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_returns_courier` FOREIGN KEY (`returnCourierId`) REFERENCES `courier` (`id_Courier`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_returns_orders` FOREIGN KEY (`fk_ordersid_orders`) REFERENCES `orders` (`id_Orders`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_returns_status_type` FOREIGN KEY (`fk_ReturnStatusTypeid_ReturnStatusType`) REFERENCES `return_status_type` (`id_ReturnStatusType`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_product_returns_courier` FOREIGN KEY (`returnCourierId`) REFERENCES `courier` (`id_Courier`),
  ADD CONSTRAINT `fk_product_returns_order` FOREIGN KEY (`fk_ordersid_orders`) REFERENCES `orders` (`id_Orders`),
  ADD CONSTRAINT `fk_return_courier` FOREIGN KEY (`fk_Courierid_Courier`) REFERENCES `courier` (`id_Courier`) ON DELETE SET NULL;

--
-- Constraints for table `return_item`
--
ALTER TABLE `return_item`
  ADD CONSTRAINT `FK_ri_ordersproduct` FOREIGN KEY (`fk_OrdersProductid_OrdersProduct`) REFERENCES `ordersproduct` (`id_OrdersProduct`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_ri_reason` FOREIGN KEY (`reasonId`) REFERENCES `return_reason` (`id_ReturnReason`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_ri_returns` FOREIGN KEY (`fk_Returnsid_Returns`) REFERENCES `product_returns` (`id_Returns`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `shipment`
--
ALTER TABLE `shipment`
  ADD CONSTRAINT `FK_shipment_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_shipment_courier` FOREIGN KEY (`fk_Courierid_Courier`) REFERENCES `courier` (`id_Courier`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_shipment_orders` FOREIGN KEY (`fk_Ordersid_Orders`) REFERENCES `orders` (`id_Orders`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_shipment_return` FOREIGN KEY (`fk_Returnsid_Returns`) REFERENCES `product_returns` (`id_Returns`) ON DELETE SET NULL;

--
-- Constraints for table `shipment_status`
--
ALTER TABLE `shipment_status`
  ADD CONSTRAINT `FK_ss_shipment` FOREIGN KEY (`fk_Shipmentid_Shipment`) REFERENCES `shipment` (`id_Shipment`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_ss_type` FOREIGN KEY (`fk_ShipmentStatusTypeid_ShipmentStatusType`) REFERENCES `shipment_status_type` (`id_ShipmentStatusType`) ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `FK_users_company` FOREIGN KEY (`fk_Companyid_Company`) REFERENCES `company` (`id_Company`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
