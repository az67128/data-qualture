--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6 (Ubuntu 10.6-1.pgdg16.04+1)
-- Dumped by pg_dump version 11.1

-- Started on 2019-02-05 23:16:48 MSK

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
-- TOC entry 3966 (class 0 OID 15394776)
-- Dependencies: 392
-- Data for Name: association_type; Type: TABLE DATA; Schema: public; Owner: zmlfmrzvzulfxh
--

COPY public.association_type (association_type_id, association_name) FROM stdin;
1	Responsible
2	Accountable
3	Informed
\.


--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 391
-- Name: association_type_association_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zmlfmrzvzulfxh
--

SELECT pg_catalog.setval('public.association_type_association_type_id_seq', 3, true);


-- Completed on 2019-02-05 23:16:52 MSK

--
-- PostgreSQL database dump complete
--

