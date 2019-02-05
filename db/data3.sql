--
-- PostgreSQL database dump
--

-- Dumped from database version 10.6 (Ubuntu 10.6-1.pgdg16.04+1)
-- Dumped by pg_dump version 11.1

-- Started on 2019-02-05 23:18:42 MSK

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
-- TOC entry 3966 (class 0 OID 11261443)
-- Dependencies: 375
-- Data for Name: query_status; Type: TABLE DATA; Schema: public; Owner: zmlfmrzvzulfxh
--

COPY public.query_status (query_status_id, query_status) FROM stdin;
1	Production
2	Development
3	Disabled
\.


--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 374
-- Name: query_status_query_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: zmlfmrzvzulfxh
--

SELECT pg_catalog.setval('public.query_status_query_status_id_seq', 3, true);


-- Completed on 2019-02-05 23:18:47 MSK

--
-- PostgreSQL database dump complete
--

