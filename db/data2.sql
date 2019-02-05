--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6 (Ubuntu 10.6-1.pgdg16.04+1)
-- Dumped by pg_dump version 11.1

-- Started on 2019-02-05 23:17:38 MSK

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 3966 (class 0 OID 11261550)
-- Dependencies: 377
-- Data for Name: connection_type; Type: TABLE DATA; Schema: public; Owner: zmlfmrzvzulfxh
--

COPY public.connection_type (connection_type_id, connection_name, config_example) FROM stdin;
3	Postgres	{\n    "host":"11.111.11.111",\n    "user": "user",\n    "database": "db",\n    "password": "pass",\n    "port": 5432\n}
4	MSSQL	{\n    "user": "user",\n    "password": "pass",\n    "server": "some.host.com", \n    "database": "db"\n}
5	Oracle	{\n    "user" : "hr", \n    "password" : "welcome", \n    "connectString" : "localhost/XE"\n}
\.


--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 376
-- Name: connection_type_connection_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zmlfmrzvzulfxh
--

SELECT pg_catalog.setval('public.connection_type_connection_type_id_seq', 37, true);


-- Completed on 2019-02-05 23:17:43 MSK

--
-- PostgreSQL database dump complete
--

